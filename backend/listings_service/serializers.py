from rest_framework import serializers
from django.db.models import Q
from .models import Listing, Region, Department, Municipality

class PublishListingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Listing
        fields = [
            'accomodationid',
            'municipality',
            'title',
            'description',
            'bedrooms',
            'bathrooms',
            'locationdesc',
            'addresstext',
            'propertytype',
            'pricepernight',
            'maxguests',
        ]
        read_only_fields = ['accomodationid']
        extra_kwargs = {
            'pricepernight': {'min_value': 0},
            'bedrooms': {'min_value': 1},
            'bathrooms': {'min_value': 1},
            'maxguests': {'min_value': 1},
        }

    def validate_title(self, value):
        return value.strip()

    def validate_description(self, value):
        return value.strip()

    def validate_locationdesc(self, value):
        return value.strip()

    def validate_addresstext(self, value):
        return value.strip()

    def validate(self, attrs):
        if attrs['maxguests'] < attrs['bedrooms']:
            raise serializers.ValidationError({
                'maxguests': 'El máximo de huéspedes no puede ser menor que la cantidad de habitaciones.'
            })

        if attrs['title'].lower() == attrs['description'].lower():
            raise serializers.ValidationError({
                'description': 'La descripción no debe ser igual al título.'
            })

        request = self.context.get('request')
        owner = getattr(request, 'user', None)

        if owner and owner.is_authenticated:
            duplicated = Listing.objects.filter(
                owner=owner,
                municipality=attrs['municipality'],
                title__iexact=attrs['title'].strip(),
                addresstext__iexact=attrs['addresstext'].strip(),
            ).exists()

            if duplicated:
                raise serializers.ValidationError({
                    'non_field_errors': [
                        'Ya existe una publicación con el mismo usuario, municipio, título y dirección.'
                    ]
                })

        return attrs
    
class RegionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Region
        fields = ['regionid', 'name']

class DepartmentSerializer(serializers.ModelSerializer):
    region = RegionSerializer(read_only=True)

    class Meta:
        model = Department
        fields = ['departmentid', 'name', 'region']

class MunicipalitySerializer(serializers.ModelSerializer):
    department = DepartmentSerializer(read_only=True)

    class Meta:
        model = Municipality
        fields = ['municipalityid', 'name', 'department']

class ListingSerializer(serializers.ModelSerializer):
    municipality = MunicipalitySerializer(read_only=True)

    class Meta:
        model = Listing
        fields = '__all__'
        read_only_fields = ['accomodationid']



class ListingFilterSerializer(serializers.Serializer):
    keyword = serializers.CharField(required=False, allow_blank=False)
    region_id = serializers.PrimaryKeyRelatedField(
        queryset=Region.objects.all(),
        source='region',
        required=False
    )
    department_id = serializers.PrimaryKeyRelatedField(
        queryset=Department.objects.all(),
        source='department',
        required=False
    )
    municipality_id = serializers.PrimaryKeyRelatedField(
        queryset=Municipality.objects.all(),
        source='municipality',
        required=False
    )
    propertytype = serializers.ChoiceField(
        choices=Listing.PropertyType.choices,
        required=False
    )
    min_price = serializers.IntegerField(required=False, min_value=0)
    max_price = serializers.IntegerField(required=False, min_value=0)
    bedrooms = serializers.IntegerField(required=False, min_value=1)
    bathrooms = serializers.IntegerField(required=False, min_value=1)
    maxguests = serializers.IntegerField(required=False, min_value=1)

    def validate_keyword(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError('La palabra clave no puede estar vacía.')
        return value

    def validate(self, attrs):
        min_price = attrs.get('min_price')
        max_price = attrs.get('max_price')

        if min_price is not None and max_price is not None and min_price > max_price:
            raise serializers.ValidationError({
                'min_price': 'El precio mínimo no puede ser mayor que el precio máximo.',
                'max_price': 'El precio máximo no puede ser menor que el precio mínimo.'
            })

        region = attrs.get('region')
        department = attrs.get('department')
        municipality = attrs.get('municipality')

        if department and region and department.region_id != region.regionid:
            raise serializers.ValidationError({
                'department_id': 'El departamento no pertenece a la región seleccionada.'
            })

        if municipality and department and municipality.department_id != department.departmentid:
            raise serializers.ValidationError({
                'municipality_id': 'El municipio no pertenece al departamento seleccionado.'
            })

        return attrs
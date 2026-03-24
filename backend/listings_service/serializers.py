from rest_framework import serializers
from .models import Listing

class ListingSerializer(serializers.ModelSerializer):

    class Meta:
        model = Listing
        fields = '__all__'
        read_only_fields = ['accomodationid']

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
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView

from users_service.serializers import UserRegisterSerializer
from .models import Municipality, Listing
from .serializers import ListingSerializer, PublishListingSerializer


class ListingListView(generics.ListAPIView):
    serializer_class = ListingSerializer

    def get_queryset(self):
        qs = (
            Listing.objects
            .select_related("owner", "municipality")
            .prefetch_related("images", "ratings__guest")
            .all()
        )

        municipality_name = self.request.query_params.get("municipality")

        if municipality_name:
            try:
                municipality = Municipality.objects.get(name=municipality_name)
                qs = qs.filter(municipality=municipality.municipalityid)
            except Municipality.DoesNotExist:
                return Listing.objects.none()
            except Municipality.MultipleObjectsReturned:
                return Listing.objects.none()

        return qs


class ListingDetailView(generics.RetrieveAPIView):
    serializer_class = ListingSerializer
    lookup_field = "pk"

    def get_queryset(self):
        return (
            Listing.objects
            .select_related("owner", "municipality")
            .prefetch_related("images", "ratings__guest")
            .all()
        )


class PublishProperty(APIView):
    def post(self, request):
        property_data = request.data.copy()

        city_name = property_data.pop("city", None)

        if not city_name:
            return Response(
                {"city": ["This field is required."]},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            city = Municipality.objects.get(name=city_name)
        except Municipality.DoesNotExist:
            return Response(
                {"city": ["Municipality could not be found."]},
                status=status.HTTP_400_BAD_REQUEST,
            )
        except Municipality.MultipleObjectsReturned:
            return Response(
                {"city": ["Multiple municipalities found with this name."]},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = PublishListingSerializer(data=property_data)

        if serializer.is_valid():
            serializer.save(owner=request.user, municipality=city)

            serializeruser = UserRegisterSerializer()
            serializeruser.update_host_status(is_host=True, user=request.user)

            return Response(
                {"message": "Property created successfully."},
                status=status.HTTP_201_CREATED,
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
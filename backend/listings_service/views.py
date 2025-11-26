from rest_framework import generics

from .models import Listing
from .serializers import ListingSerializer, ListingCreateSerializer  # si tienes uno para POST

class ListingListView(generics.ListAPIView):
    
    serializer_class = ListingSerializer

    # select_related to INNER JOIN the user model
    #queryset = Listing.objects.select_related('user').all()

    def get_queryset(self):
        qs = super().get_queryset()
        municipality = self.request.query_params.get('municipality')

        if municipality:
            try:
                municipality_id = int(municipality)
                qs = qs.filter(idmunicipality=municipality_id)
            except ValueError:

                return qs.none()

        return qs

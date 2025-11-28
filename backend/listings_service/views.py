from rest_framework import generics

from .models import Municipality, Listing
from .serializers import ListingSerializer #, ListingCreateSerializer  # si tienes uno para POST

class ListingListView(generics.ListAPIView):
    
    serializer_class = ListingSerializer

    # select_related to INNER JOIN the user model
    #queryset = Listing.objects.select_related('user').all()

    def get_queryset(self):
        qs = Listing.objects.all()
        nameMunicipality = self.request.query_params.get('municipality')

        m = Municipality.objects.get(name=nameMunicipality)

        #municipality_id = m.idmunicipality
        #department_id = m.iddepartment
        #region_id = m.idregion
        
        try:
            #municipality_id = int(municipality_id)
            #department_id = int(department_id)
            #region_id = int(region_id)
            qs = qs.filter(
                #idmunicipality=municipality_id,
                #iddepartment=department_id,
                #idregion=region_id
                idmunicipality=m.idmunicipality,
                iddepartment=m.iddepartment,
                idregion=m.idregion
            )
        except ValueError:
            # Left to insert some log
            print('Error!!!!')
            return qs.none()

        return qs

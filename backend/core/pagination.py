from rest_framework.pagination import PageNumberPagination

class ListingPagination(PageNumberPagination):
    page_size = 20  # cantidad por página
    max_page_size = 50
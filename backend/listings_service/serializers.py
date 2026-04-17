from django.db.models import Avg
from rest_framework import serializers

from .models import Listing, ListingImage
from rating_service.serializers import RatingSerializer


class ListingImageSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()
    thumbnail_url = serializers.SerializerMethodField()

    class Meta:
        model = ListingImage
        fields = ["id", "image_url", "thumbnail_url", "is_main"]

    def get_image_url(self, obj):
        request = self.context.get("request")
        if obj.image:
            return request.build_absolute_uri(obj.image.url)
        return None

    def get_thumbnail_url(self, obj):
        request = self.context.get("request")
        if obj.thumbnail:
            return request.build_absolute_uri(obj.thumbnail.url)
        return None


class ListingSerializer(serializers.ModelSerializer):
    images = ListingImageSerializer(many=True, read_only=True)
    owner_name = serializers.CharField(source="owner.username", read_only=True)
    reviews = RatingSerializer(source="ratings", many=True, read_only=True)
    reviews_count = serializers.SerializerMethodField()
    average_rating = serializers.SerializerMethodField()
    share_path = serializers.SerializerMethodField()

    class Meta:
        model = Listing
        fields = [
            "accomodationid",
            "owner",
            "owner_name",
            "municipality",
            "title",
            "description",
            "bedrooms",
            "bathrooms",
            "locationdesc",
            "addresstext",
            "propertytype",
            "pricepernight",
            "maxguests",
            "images",
            "reviews",
            "reviews_count",
            "average_rating",
            "share_path",
        ]
        read_only_fields = ["accomodationid"]

    def get_reviews_count(self, obj):
        return obj.ratings.count()

    def get_average_rating(self, obj):
        avg = obj.ratings.aggregate(avg=Avg("rating"))["avg"]
        return round(avg, 1) if avg is not None else None

    def get_share_path(self, obj):
        return f"/listings/{obj.accomodationid}"


class PublishListingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Listing
        exclude = ["owner", "municipality"]
        read_only_fields = ["accomodationid"]
        extra_kwargs = {
            "pricepernight": {"min_value": 0},
            "bedrooms": {"min_value": 1},
            "bathrooms": {"min_value": 1},
        }
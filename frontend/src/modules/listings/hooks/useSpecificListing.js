import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useApiState } from "../../../services/api/useApiState";
import { getContactHost, getSpecificListing } from "../services/listingsService";

export default function useSpecificListing() {
  const { id } = useParams();
  const [listing, setListing] = useState(null);

  const {
    loading,
    setLoading,
    error,
    setError,
  } = useApiState();

  useEffect(() => {
    fetchSpecificListing(id);
  }, [id]);

  async function fetchSpecificListing(listingId) {
    setLoading(true);
    setError(null);
    setListing(null);

    try {
      const data = await getSpecificListing(listingId);
      const contactHostData = await getContactHost(data.owner);

      if (!data) {
        setError("NOT_AVAILABLE");
        return;
      }

      const statusValue = (
        data.status ||
        data.listingstatus ||
        data.publication_status ||
        ""
      )
        .toString()
        .toUpperCase();

      if (
        statusValue &&
        statusValue !== "PUBLISHED" &&
        statusValue !== "AVAILABLE"
      ) {
        setError("NOT_AVAILABLE");
        return;
      }

      const mappedImages = data.images.map((img) => img.image_url || img);

      const mappedReviews =
        data.reviews?.map((review) => ({
          id: review.ratingid,
          guestName: review.guest_name || "Anonymous Guest",
          rating: review.rating,
          comment: review.comment,
          createdAt: review.created_at,
        })) || [];

      setListing({
        id: data.accomodationid,
        title: data.title || "Untitled property",
        location:
          data.locationdesc ||
          data.addresstext ||
          data.municipality_name ||
          "Location not available",
        price: data.pricepernight || 0,
        rating: data.average_rating ?? null,
        reviewsCount: data.reviews_count ?? 0,
        reviews: mappedReviews,
        host: {
          name: data.owner_name || "Host",
          avatar: (data.owner_name || "H")[0].toUpperCase(),
          isSuperhost: data.is_superhost ?? false,
          contact: contactHostData.email,
        },
        description: data.description || "No description available.",
        images: mappedImages,
        amenities: data.amenities || [],
        highlights: data.highlights || [],
        lat: data.exactlocation.lat ?? null,
        lng: data.exactlocation.lng ??  null,
        sharePath: data.share_path || `/listings/${data.accomodationid}`,
      });
    } catch (err) {
      const status = err?.response?.status;

      if (status === 404) {
        setError("NOT_FOUND");
      } else if (status === 400 || status === 403 || status === 410) {
        setError("NOT_AVAILABLE");
      } else {
        setError("SERVER_ERROR");
      }
    } finally {
      setLoading(false);
    }
  }

  return {
    listing,
    loading,
    error,
    retry: () => fetchSpecificListing(id),
  };
}
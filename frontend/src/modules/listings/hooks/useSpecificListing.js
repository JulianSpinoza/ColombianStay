import { useEffect, useState } from "react";
import { useApiState } from "../../../services/api/useApiState";
import { useParams } from "react-router-dom";
import { getSpecificListing } from "../services/listingsService";

export default function useSpecificListing() {
    
    const { id } = useParams();
    const [listing, setListing] = useState(null);
    const {
        loading,
        setLoading,
        error,
        setError,
        handleError,
    } = useApiState();

    useEffect(() => {
        fetchSpecificListing(id)
    }, [id])

    async function fetchSpecificListing(id) {
        setError(null);
        setLoading(true);
        try {
            const listing = await getSpecificListing(id);

            // This mapping should be retreive by the backend serializer
            const mapped = {
                id: listing.accomodationid,
                title: listing.title,
                location: listing.locationdesc || listing.addresstext || "",
                price: listing.pricepernight,
                rating: listing.rating || 4.8,
                reviews: listing.reviews || 0,
                host: { name: listing.owner?.username || "Host", avatar: (listing.owner?.username || "H")[0] || "H", isSuperhost: false },
                description: listing.description,
                images: ["https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop"],
                amenities: [],
                highlights: [],
            };

            setListing(mapped);
        } catch (err) {
            handleError(err)
        } finally {
            setLoading(false);
        }
    }

    return {
        listing,
        loading,
        error
    }

}
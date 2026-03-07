import { useEffect, useState } from "react";
import { useApiState } from "../../../services/api/useApiState";
import { useLocation } from "react-router-dom";
import { getGuestReservations, getHostReservations } from "../services/bookingService";

export default function useReservations(perspective) {

    const [reservations, setReservations] = useState([]);
    const {
        loading,
        setLoading,
        error,
        setError,
        handleError,
    } = useApiState();

    useEffect(() => {
        fetchReservations({});
    },[]);

    async function fetchReservations(filterQuery) {
        setError(null);
        setLoading(true);

        try {
            if(perspective === "guest"){
                const guestReservations = await getGuestReservations(filterQuery)
                // This format should be establish for the backend serializer
                const formatted = guestReservations.map((booking) => ({
                    id: booking.bookingid,
                    property: {
                        id: booking.listing_id,
                        title: booking.listing_title,
                        location: booking.listing_location,
                        image: booking.listing_image,
                    },
                    start_date: booking.check_in_date,
                    end_date: booking.check_out_date,
                    status: booking.status,
                    total_price: booking.total_price,
                    created_at: booking.created_at,
                }))
                setReservations(formatted);
            } else if (perspective === "host") {
                const hostReservations = await getHostReservations(filterQuery);
                // This format should be establish for the backend serializer
                const formatted = hostReservations.map((booking) => ({
                    id: booking.bookingid,
                    property: {
                        id: booking.listing_id,
                        title: booking.listing_title,
                        location: booking.listing_location,
                        image: booking.listing_image,
                    },
                    guest: {
                        id: booking.guest,
                        name: booking.guest_name,
                        email: booking.guest_email,
                        avatar: booking.guest_avatar,
                    },
                    start_date: booking.check_in_date,
                    end_date: booking.check_out_date,
                    status: booking.status,
                    total_price: booking.total_price,
                    created_at: booking.created_at,
                }))
                setReservations(formatted);
            } else {
                throw Error("The use of the hook of reservations need to determinate the perspective as a parameter. Determine host or guest.")
            }

        } catch (err) {
            handleError(err)
        } finally {
            setLoading(false);
        }
    }

    return {
        reservations,
        loading,
        error,
        fetchReservations
    };

}
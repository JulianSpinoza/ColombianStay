import { useEffect, useState } from "react";
import { useApiState } from "../../../services/api/useApiState";
import {
  getGuestReservations,
  getHostReservations,
} from "../services/bookingService";

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
    fetchReservations();
  }, []);

  const normalizeStatus = (booking) => {
    return (
      booking.status ||
      booking.actual_status?.toLowerCase() ||
      "pending"
    );
  };

  async function fetchReservations(filterQuery = {}) {
    setError(null);
    setLoading(true);

    try {
      if (perspective === "guest") {
        const guestReservations = await getGuestReservations(filterQuery);

        const formatted = guestReservations.map((booking) => ({
          id: booking.booking_id || booking.bookingid || booking.id,
          property: {
            id: booking.listing_id,
            title: booking.listing_title,
            location: booking.listing_location,
            image: booking.listing_image,
          },
          start_date: booking.check_in_date,
          end_date: booking.check_out_date,
          status: normalizeStatus(booking),
          total_price: booking.total_price,
          created_at: booking.created_at,
          updated_at: booking.updated_at,
        }));

        setReservations(formatted);
      } else if (perspective === "host") {
        const hostReservations = await getHostReservations(filterQuery);

        const formatted = hostReservations.map((booking) => ({
          id: booking.booking_id || booking.bookingid || booking.id,
          property: {
            id: booking.listing_id,
            title: booking.listing_title,
            location: booking.listing_location,
            image: booking.listing_image,
          },
          guest: {
            id: booking.guest_id || booking.guest,
            name: booking.guest_name,
            email: booking.guest_email,
            avatar: booking.guest_avatar,
          },
          start_date: booking.check_in_date,
          end_date: booking.check_out_date,
          status: normalizeStatus(booking),
          total_price: booking.total_price,
          created_at: booking.created_at,
          updated_at: booking.updated_at,
        }));

        setReservations(formatted);
      } else {
        throw new Error(
          "The use of the hook of reservations needs to determine the perspective as a parameter. Use 'host' or 'guest'."
        );
      }
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  }


  return {
    reservations,
    loading,
    error,
    setError,
    fetchReservations,
  };
}
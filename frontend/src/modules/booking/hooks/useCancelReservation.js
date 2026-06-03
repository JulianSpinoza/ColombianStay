import { useApiState } from "../../../services/api/useApiState";
import { cancelReservationAsGuest, cancelReservationAsHost } from "../services/bookingService";

export default function useCancelReservation(perspective){

    const {
        loading: cancelLoading,
        setLoading: setCancelLoading,
        error: cancelError,
        setError: setCancelError,
        handleError: handleCancelError,
      } = useApiState();

    async function cancelReservation(reservationId, cancellationReason) {
        setCancelError(null);
        setCancelLoading(true);

        try {
            if (perspective === "guest") {
                await cancelReservationAsGuest(reservationId, cancellationReason);
            } else if (perspective === "host") {
                await cancelReservationAsHost(reservationId, cancellationReason);
            } else {
                throw new Error(
                "The use of the hook of reservations needs to determine the perspective as a parameter. Use 'host' or 'guest'."
                );
            }

        } catch(err) {
            handleCancelError(err);
        } finally {
            if (!cancelError) fetchReservations
            setCancelLoading(false);
        }

    }
    
    return {
        cancelReservation,
        cancelLoading,
        cancelError,
    };
    
}
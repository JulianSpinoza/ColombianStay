import { useState } from "react";
import { useApiState } from "../../../services/api/useApiState";
import { bookAProperty } from "../services/bookingService";
import useBookingPreInfo from "./useBookingPreInfo";

export default function useBookingProcess(values_booking, initial_unavailibity, validateError){

    const formattedValues = {
        check_in: values_booking.check_in?.toISOString().split("T")[0],
        check_out: values_booking.check_out?.toISOString().split("T")[0],
        guests: values_booking.guests,
        listing: values_booking.listing
    }

    const [resultOfBooking,setResultOfBooking] = useState();
    const [success, setSuccess] = useState(false);
    const {
        loading: bookingLoading,
        setLoading,
        error: bookingError,
        setError,
        handleError,
    } = useApiState();
    const {
        totalPrice,
        unavailablesDates,
        loading:preInfoLoading,
        error:preInfoError,
    } = useBookingPreInfo(formattedValues, initial_unavailibity, validateError);

    async function postBooking() {
        
        setError(null);
        setLoading(true);

        try {

            const reservationData = {
                property_id: formattedValues.listing,
                check_in_date: formattedValues.check_in,
                check_out_date: formattedValues.check_out,
                number_of_guests: formattedValues.guests,
            };

            const result_booking = await bookAProperty(reservationData);
            setResultOfBooking(result_booking)
        } catch (err) {
            handleError(err)
        } finally {
            setSuccess(true);
            setLoading(false);
        }

    }

    return {
        resultOfBooking,
        success,
        bookingLoading,
        bookingError,
        postBooking,
        totalPrice,
        unavailablesDates,
        preInfoLoading,
        preInfoError
    }

}
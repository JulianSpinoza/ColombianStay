import { useEffect, useState } from "react";
import { useApiState } from "../../../services/api/useApiState";
import { getBookingPreInfo } from "../services/bookingService";
import { eachDayOfInterval, parseISO } from "date-fns";

export default function useBookingPreInfo(values_booking, initial_unavailibity, validateError) {
    
    const [totalPrice, setTotalPrice] = useState();
    const [unavailablesDates, setUnavailablesDates] = useState(initial_unavailibity);
    const {
        loading,
        setLoading,
        error,
        setError,
        handleError,
    } = useApiState();

    const values_instances = Object.values(values_booking);

    useEffect(() => {
        if(values_instances.some(
            value => (
                value === undefined
            )
        )) return

        if(!validateError()) {
            setTotalPrice(null)
            return
        }
        
        fetchPreInfo(values_booking);
        
    },values_instances);

    async function fetchPreInfo(reservationQuery) {

        setError(null);
        setLoading(true);

        try {
            const pre_information = await getBookingPreInfo(reservationQuery);
            setTotalPrice(pre_information.total_price)
            const fechasTransformadas = pre_information.unavailables_dates.flatMap((interval) => {
                return eachDayOfInterval({
                    start: parseISO(interval.start),
                    end: parseISO(interval.end)
                });
            });
            setUnavailablesDates(fechasTransformadas)
        } catch (err) {
            handleError(err)
        } finally {
            setLoading(false);
        }
        
    }

    return {
        totalPrice,
        unavailablesDates,
        loading,
        error,
    }

}
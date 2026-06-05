import { useEffect, useState } from "react";
import { useApiState } from "../../../services/api/useApiState";
import { getBookedDates, getBookingTotalPrice } from "../services/bookingService";
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
        fetchUnavaliablesDates(values_booking.listing)
    }, [])

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
        
        fetchTotalPrice(values_booking);
        fetchUnavaliablesDates(values_booking.listing)
    },values_instances);

    async function fetchTotalPrice(reservationQuery) {

        setError(null);
        setLoading(true);

        try {
            const totalPriceCalculation = await getBookingTotalPrice(reservationQuery);
            setTotalPrice(totalPriceCalculation.total_price)
        } catch (err) {
            handleError(err)
        } finally {
            setLoading(false);
        }
        
    }

    async function fetchUnavaliablesDates(listingId) {

        setError(null);
        setLoading(true);

        try {
            const unavailablesDates = await getBookedDates(listingId)
            const fechasTransformadas = unavailablesDates.flatMap((interval) => {
                return eachDayOfInterval({
                    start: parseISO(interval.check_in_date),
                    end: parseISO(interval.check_out_date)
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
        fetchUnavaliablesDates,
        loading,
        error,
    }

}
import { useEffect, useState } from "react";
import { useApiState } from "../../../services/api/useApiState";
import { getTotalPrice } from "../services/bookingService";

export default function useTotalPrice(values_booking) {
    
    const [totalPrice, setTotalPrice] = useState();
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
        fetchTotalPrice(values_booking);
    },values_instances);

    async function fetchTotalPrice(reservationQuery) {

        setError(null);
        setLoading(true);

        try {
            const total_price = await getTotalPrice(reservationQuery);
            setTotalPrice(total_price)
        } catch (err) {
            handleError(err)
        } finally {
            setLoading(false);
        }
        
    }

    return {
        totalPrice,
        loading,
        error,
    }

}
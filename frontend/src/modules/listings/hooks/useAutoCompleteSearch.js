import { useEffect, useState } from "react";
import { useApiState } from "../../../services/api/useApiState";
import { getLocationTerms } from "../services/listingsService";

export default function useAutoCompleteSearch() {

    const [options, setOptions] = useState();
    const {
        loading,
        setLoading,
        error,
        setError,
        handleError,
    } = useApiState();

    useEffect(() => {
        fetchLocationTerms()
    }, [])

    async function fetchLocationTerms() {
        setError(null);
        setLoading(true);
        try {
            const data = await getLocationTerms();
            const formattedData = data.map(({id, name_of_location, type}) => ({
                id: id,
                name_option: name_of_location,
                option_classification: type,
            }));
            setOptions(formattedData);
        } catch (err) {
            handleError(err)
        } finally {
            setLoading(false);
        }
    }

    return {
        options,
        loading,
        error,
    };

}
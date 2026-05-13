import { useCallback, useState } from "react";
import { useApiState } from "../../../services/api/useApiState";
import { getDepartmentList, getMunicipalityList, getRegionList } from "../services/listingsService";

export default function useLocationClassification() {

    const [options, setOptions] = useState([]);
    const {
        loading,
        setLoading,
        error,
        setError,
        handleError,
    } = useApiState();

    const fetchRegionOptions = useCallback(
        async () => {
            setError(null);
            setLoading(true);
            try {
                const data = await getRegionList();
                const formattedData = data.map(({regionid, name}) => ({
                    id: regionid,
                    name_option: name,
                }));
                setOptions(formattedData);
            } catch (err) {
                handleError(err)
            } finally {
                setLoading(false);
            }
        }
    );

    const fetchDepartmentOptions = useCallback(
        async (id) => {
            setError(null);
            setLoading(true);
            try {
                const data = await getDepartmentList(id);
                const formattedData = data.map(({departmentid, name}) => ({
                    id: departmentid,
                    name_option: name,
                }));
                setOptions(formattedData);
            } catch (err) {
                handleError(err)
            } finally {
                setLoading(false);
            }
        }
    );

    const fetchMunicipalityOptions = useCallback(
        async (id) => {
            setError(null);
            setLoading(true);
            try {
                const data = await getMunicipalityList(id);
                const formattedData = data.map(({municipalityid, name, boundary=undefined}) => ({
                    id: municipalityid,
                    name_option: name,
                    boundary: boundary
                }));
                setOptions(formattedData);
            } catch (err) {
                handleError(err)
            } finally {
                setLoading(false);
            }
        }
    );

    return {
        options,
        loading,
        error,
        fetchRegionOptions,
        fetchDepartmentOptions,
        fetchMunicipalityOptions,
    }

}
import { useApiState } from "../../../services/api/useApiState";
import { useState, useEffect } from "react"
import { getPersonalInfo, updatePersonalInfo } from "../services/usersService";

export default function usePersonalInfo () {

    const [userProfile, setUserProfile] = useState(null);

    const {
        loading,
        setLoading,
        error,
        setError,
        handleError,
    } = useApiState();

    useEffect(() => {
        fetchPersonalInfo()
    }, [])

    async function fetchPersonalInfo() {
        setLoading(true);
        setError(null);
    
        try {
          const data = await getPersonalInfo();
          setUserProfile(data)
        } catch (err) {
          handleError(err)
        } finally {
          setLoading(false);
        }
      }

    async function updatePersonalInformation(newData) {
        setLoading(true);
        setError(null);

        const formData = new FormData();

        Object.entries(newData).forEach(([key,value]) =>{
            formData.append(key, value);
        })

        try {
            const response = await updatePersonalInfo(formData);
        } catch (err) {
            handleError(err)
        } finally {
            setLoading(false);
            if (!error) {
                fetchPersonalInfo();
            }
        }

        
    }

    return {
        userProfile,
        loading,
        error,
        fetchPersonalInfo,
        updatePersonalInformation,
    }
}
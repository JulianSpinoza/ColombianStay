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

    async function updatePersonalInfo(newData) {
        setLoading(true);
        setError(null);

        const formatted = {
            username: newData.username,
            first_name:newData.first_name,
            last_name:newData.last_name,
            email:newData.email,
            phone_number:newData.phone,
            profile_picture:newData.profile_picture,
        }

        const formData = new FormData();

        Object.entries(formatted).forEach(([key,value]) =>{
            formData.append(key, value);
        })

        try {
            const response = await updatePersonalInfo(formData);
            console.log(response);
        } catch (err) {
            handleError(err)
        } finally {
            setLoading(false);
            if (!error) {
                setIsEditing(false);
                fetchPersonalInfo();
            }
        }

        
    }

    return {
        userProfile,
        loading,
        error,
        updatePersonalInfo,
    }
}
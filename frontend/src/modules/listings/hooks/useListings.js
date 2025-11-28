import { useEffect, useState } from "react";
import { getListings } from "../services/listingsService";
import { useApiState } from "./useApiState";

export default function useListings() {
  const [listings, setListings] = useState([]);
  const [queryCached,setQueryCached] = useState(null)
  const {
    loading,
    setLoading,
    error,
    setError,
    handleError,
  } = useApiState();

  // Initial set up
  useEffect(() => {
    fetchListings({})
  }, [])

  async function fetchListings(searchQuery) {
    if(JSON.stringify(queryCached) !== JSON.stringify(searchQuery)){
      setError(null);
      setLoading(true);
      setListings([]);
      try {
        const data = await getListings(searchQuery);
        setListings(data);
      } catch (err) {
        handleError(err)
      } finally {
        setQueryCached(searchQuery);
        setLoading(false);
      }
    }
 
  }


  return {
    listings,
    fetchListings,
    loading,
    error
  };
}
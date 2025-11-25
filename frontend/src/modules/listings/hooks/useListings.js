import { useState } from "react";
import { getListings } from "../services/listingsService";
import { useApiState } from "./useApiState";

export default function useListings() {
  const [listings, setListings] = useState([]);

  const {
    loading,
    setLoading,
    error,
    handleError,
  } = useApiState();

  async function fetchListings(searchQuery) {
    setLoading(true);
    try {
      const data = await getListings(searchQuery);
      setListings(data);
    } catch (err) {
      handleError(err)
    } finally {
      setLoading(false);
    }
  }


  return {
    listings,
    fetchListings,
    loading,
    error
  };
}
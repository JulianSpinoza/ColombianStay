import { useCallback, useRef, useState } from "react";
import { getListings } from "../services/listingsService";
import { useApiState } from "../../../services/api/useApiState";

export default function useListings() {
  const [listings, setListings] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const lastQueryRef = useRef(null);

  const {
    loading,
    setLoading,
    error,
    setError,
    handleError,
  } = useApiState();

  const fetchListings = useCallback(
    async (searchQuery = {}) => {
      const currentQuery = JSON.stringify(searchQuery);
      const previousQuery = JSON.stringify(lastQueryRef.current);

      if (currentQuery === previousQuery) {
        return;
      }

      setError(null);
      setLoading(true);
      setListings([]);
      setSuggestions([]);

      try {
        const data = await getListings(searchQuery);

        setListings(data?.results || []);
        setSuggestions(data?.suggestions || []);
        lastQueryRef.current = searchQuery;
      } catch (err) {
        setListings([]);
        setSuggestions([]);
        handleError(err);
      } finally {
        setLoading(false);
      }
    },
    [handleError, setError, setLoading]
  );

  return {
    listings,
    suggestions,
    loading,
    error,
    fetchListings,
  };
}
import { useCallback, useRef, useState } from "react";
import { getFilteredListings, getListings } from "../services/listingsService";
import { useApiState } from "../../../services/api/useApiState";
import usePagination from "./usePagination";

export default function useListings() {
  const [listings, setListings] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const lastQueryRef = useRef(null);

  const {
    page,
    totalPages,
    setTotalPages,
    changePage,
  } = usePagination();

  const {
    loading,
    setLoading,
    error,
    setError,
    handleError,
  } = useApiState();

  const fetchListings = useCallback(
    async (searchQuery) => {
      const currentQuery = JSON.stringify(searchQuery);
      const previousQuery = JSON.stringify(lastQueryRef.current);

      if(searchQuery) {
        delete currentQuery.page;
      }

      if (currentQuery === previousQuery) {
        return;
      }
  
      setError(null);
      setLoading(true);
      setListings([]);
      setSuggestions([]);

      try {
        if(searchQuery) {
          const data = await getFilteredListings(searchQuery);
          setListings(data.results);
          setSuggestions(data.suggestions);
          setTotalPages(data.total_pages);
        } else {
          const data = await getListings();
          setListings(data);
          setTotalPages(data.total_pages);
          lastQueryRef.current = null;
        }
      } catch (err) {
        handleError(err)
      } finally {
        lastQueryRef.current = searchQuery;
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
    page,
    totalPages,
    changePage,
  };
}
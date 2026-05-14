import { useRef, useState } from "react";
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

  const fetchListings =
    async (searchQuery) => {

      const currentQuery = JSON.stringify(searchQuery);
      const previousQuery = lastQueryRef.current;
  
      setError(null);
      setLoading(true);

      try {
        if(searchQuery) {
          const data = await getFilteredListings(searchQuery);
          setListings(data.results);
          setSuggestions(data.suggestions);
          setTotalPages(data.total_pages);
        } else {
          const data = await getListings();
          setListings(data.results);
          setTotalPages(data.total_pages);
          lastQueryRef.current = null;
        }
      } catch (err) {
        setListings([]);
        setSuggestions([]);
        handleError(err);
      } finally {
        lastQueryRef.current = currentQuery;
        setLoading(false);
      }
    }
  ;
 
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
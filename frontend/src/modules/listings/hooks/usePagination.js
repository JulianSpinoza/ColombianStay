import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

export default function usePagination() {
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchParams, setSearchParams] = useSearchParams();

    useEffect(() => {
        const pageParam = searchParams.get('page');
        const pageNumber = pageParam ? parseInt(pageParam, 10) : 1;
        setPage(pageNumber);
    },[searchParams])

    const changePage = useCallback (
        (newPage) => {
          setPage(newPage);
          setSearchParams(prev => {
            prev.set("page", newPage);
            return prev;
          });
        },
        []
    );

    return {
        page,
        totalPages,
        setTotalPages,
        changePage,
    };

}
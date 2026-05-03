import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

export default function usePagination() {
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchParams, setSearchParams] = useSearchParams();

    useEffect(() => {
        const pageParam = searchParams.get('page');
        const pageNumber = pageParam ? parseInt(pageParam, 10) : 1;
        changePage(pageNumber);
    },[searchParams.toString()])

    const changePage = 
        (newPage) => {
            setPage(newPage);
            setSearchParams((prev) => {
                const params = new URLSearchParams(prev);
                params.set("page", newPage);
                return params;
            },);
        }

    return {
        page,
        totalPages,
        setTotalPages,
        changePage,
    };

}
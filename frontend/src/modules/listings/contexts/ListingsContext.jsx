import { createContext, useContext } from "react";
import { useListings } from "../hooks/useListings";

const ListingContext = createContext();

export const ListingProvider = ({children}) => {

    const contextValue = useListings();

    return(
        <ListingContext.Provider value={contextValue}>
            {children}
        </ListingContext.Provider>
    );
};

export function useListingsContext() {
  return useContext(ListingContext);
}
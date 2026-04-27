import "./ListingsPage.css";
import ListingCard from "../../components/ListingCard/ListingCard";
import { useListingsContext } from "../../contexts/ListingsContext.jsx";
import {  useNavigate, useSearchParams } from "react-router-dom";
import ApiState from "../../../../global/components/ApiState/ApiState.jsx";
import { useEffect } from "react";

export default function ListingsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const { 
    listings,
    suggestions, 
    loading,
    error,
    fetchListings
  } = useListingsContext();

  useEffect(()=> {
    fetchListings(Object.fromEntries(searchParams));
  },[searchParams.toString()])

  const handleListingClick = (listing) => {
    navigate(`/listings/${listing.accomodationid || listing.id}`);
  };

  const hasMainResults = listings.length > 0;
  const hasSuggestions = suggestions?.length > 0 || false;


  if (loading) {
    return (
      <ApiState type='loading'/>
    );
  }

  if (error) {
    return (
      <ApiState type='error' onRetry={() => fetchListings()}/>
    );
  }

  if(!loading && !error && !hasMainResults && hasSuggestions) {
    return (
      <div className="listings-page">
        <div className="listings-page-container">
          <ApiState 
            type='empty'  
            message="No encontramos alojamientos con esos filtros"
          />
          <section className="suggestions-section">
            <h2 className="section-title">Suggested properties</h2>
            <div className="listings-grid">
              {suggestions.map((listing) => (
                <div
                  key={listing.accomodationid || listing.id}
                  onClick={() => handleListingClick(listing)}
                  className="cursor-pointer"
                >
                  <ListingCard listing={listing} />
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    );
  }


  return (
    <div className="listings-page">
      <div className="listings-page-container">
        
        {!hasMainResults && hasSuggestions && (
          <div className="results-message">
            <h2 className="section-title">No exact matches found</h2>
            <p className="section-subtitle">
              Here are some suggested properties you may like.
            </p>
          </div>
        )}
          <section className="results-section">

            {/* Listings Grid */}
            <div className="listings-grid">
              {listings.map((listing) => (
                <div
                  key={listing.accomodationid || listing.id}
                  onClick={() => handleListingClick(listing)}
                  className="cursor-pointer"
                >
                  <ListingCard listing={listing} />
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
  );
}

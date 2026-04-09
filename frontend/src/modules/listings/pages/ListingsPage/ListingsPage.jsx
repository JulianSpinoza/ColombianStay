import "./ListingsPage.css";
import ListingCard from "../../components/ListingCard/ListingCard";
import { useListingsContext } from "../../contexts/ListingsContext.jsx";
import {  useNavigate } from "react-router-dom";
import ApiState from "../../../../global/components/ApiState/ApiState.jsx";

export default function ListingsPage() {
  const navigate = useNavigate();

  const { 
    listings, 
    loading,
    error,
    fetchListings
  } = useListingsContext();


  const handleListingClick = (listing) => {
    navigate(`/listings/${listing.accomodationid || listing.id}`);
  };


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

  if(!loading && !error && listings.length === 0) {
    return (
      <ApiState 
        type='empty'  
        message="No encontramos alojamientos con esos filtros"
      />
    );
  }


  return (
    <main className="home-hero">
      <div className="w-full">
        
        {/* Main Content */}
        <div className="home-main py-8">

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
        </div>
      </div>
    </main>
  );
}

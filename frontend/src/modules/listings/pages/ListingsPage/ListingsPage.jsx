import "./ListingsPage.css";
import ListingCard from "../../components/ListingCard/ListingCard";
import { useListingsContext } from "../../contexts/ListingsContext.jsx";
import {  useNavigate } from "react-router-dom";

export default function ListingsPage() {
  const navigate = useNavigate();

  const { 
    listings, 
    loading,
    error 
  } = useListingsContext();


  const handleListingClick = (listing) => {
    navigate(`/listings/${listing.accomodationid || listing.id}`);
  };

  return (
    <main className="home-hero">
      <div className="w-full">
        
        {/* Main Content */}
        <div className="home-main py-8">
          {/* LOADING */}
          {loading && (
            <div className="flex justify-center items-center py-12">
              <p className="text-gray-600">Loading properties...</p>
            </div>
          )}

          {/* ERROR */}
          {error && (
            <div className="text-center py-12">
              <p style={{ color: "red" }}>{error}</p>
            </div>
          )}

          {/* EMPTY STATE */}
          {!loading && !error && listings.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-600">No properties available.</p>
            </div>
          )}
          
          {/* Listings Grid */}
          {!loading && !error && (
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
          )}
        </div>
      </div>
    </main>
  );
}

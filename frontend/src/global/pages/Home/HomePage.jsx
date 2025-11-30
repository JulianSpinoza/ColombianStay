import "./HomePage.css";
import React, { useState } from "react";
import Navbar from "../../components/Navbar/Navbar.jsx";
import CategoryBar from "../../components/CategoryBar/CategoryBar.jsx";
import ListingCard from "../../../modules/listings/components/ListingCard/ListingCard.jsx";
import useListings from "../../../modules/listings/hooks/useListings.js";

const HomePage = ({ user, onLogout, onLoginClick, onSignupClick }) => {
  const [selectedListing, setSelectedListing] = useState(null);

  const { 
      listings,
      fetchListings, 
      loading,
      error 
    } = useListings();

  const handleSearch = (query) => {
    fetchListings(query);
  };

  const handleListingClick = (listing) => {
    setSelectedListing(listing);
    console.log("Selected listing:", listing);
    // Later: Navigate to detail page or show modal
  };

  return (
    <div className="w-full min-h-screen bg-white">
      {/* Navbar */}
      <Navbar 
        user={user} 
        onLogout={onLogout} 
        onLoginClick={onLoginClick} 
        onSignupClick={onSignupClick} 
        handleQuery={handleSearch}
      />

      {/* Category Bar */}
      <CategoryBar />

      {/* Main Content */}
      <main className="home-hero py-8">
        <div className="home-main">
          {/* Welcome Message */}
          {user && (
            <div className="mb-8 p-4" style={{ background: 'rgba(102,126,234,0.06)', border: '1px solid rgba(102,126,234,0.12)', borderRadius: '8px' }}>
              <p style={{ color: 'var(--primary-600)' }}>
                Welcome, <strong>{user.firstName}</strong>! Explore our amazing properties in Colombia.
              </p>
            </div>
          )}

          {/* LOADING */}
          {loading && <p>Cargando...</p>}

          {/* ERROR */}
          {error && <p style={{ color: "red" }}>{error}</p>}

          {/* LISTADO */}
          {!loading && !error && listings.length === 0 && (
            <p>No hay resultados.</p>
          )}

          {/* Listings Grid */}
          <div className="listings-grid">
            {listings.map((listing) => (
              <ListingCard
                key={listing.id}
                listing={listing}
                onCardClick={handleListingClick}
              />
            ))}
          </div>
        </div>

        {/* Optional: Selected Listing Info (for development) */}
        {selectedListing && (
          <div className="fixed bottom-8 right-8 bg-white border-2 border-gray-900 rounded-lg p-4 max-w-xs shadow-lg">
            <p className="text-sm text-gray-600">Selected Listing:</p>
            <p className="font-semibold text-gray-900">{selectedListing.title}</p>
            <p className="text-xs text-gray-500 mt-1">{selectedListing.location}</p>
          </div>
        )}
      </main>

      {/* Footer Spacing */}
      <div className="h-16"></div>
    </div>
  );
};

export default HomePage;

import "./ListingsPage.css";
import ListingCard from "../../components/ListingCard/ListingCard";
import { useListingsContext } from "../../contexts/ListingsContext.jsx";
import { useState } from "react";

export default function ListingsPage() {

  const [selectedListing, setSelectedListing] = useState(null);

  const { 
    listings, 
    loading,
    error 
  } = useListingsContext();

  const handleListingClick = (listing) => {
    setSelectedListing(listing);
  };

  return (
    <main className="home-hero py-8">
        <div className="home-main">
          {/* Welcome Message */}
          {/*user && (
            <div className="mb-8 p-4" style={{ background: 'rgba(102,126,234,0.06)', border: '1px solid rgba(102,126,234,0.12)', borderRadius: '8px' }}>
              <p style={{ color: 'var(--primary-600)' }}>
                Welcome, <strong>{user.firstName}</strong>! Explore our amazing properties in Colombia.
              </p>
            </div>
          )*/}

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
                key={listing.accomodationid}
                listing={listing}
                onCardClick={handleListingClick}
              />
            ))}
          </div>
        </div>
      </main>
  );
}

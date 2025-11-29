import React, { useState } from "react";
import Navbar from "../Navbar/Navbar.jsx";
import CategoryBar from "../CategoryBar/CategoryBar.jsx";
import ListingCard from "../ListingCard/ListingCard.jsx";
import "./HomePage.css";

const HomePage = ({ user, onLogout, onLoginClick, onSignupClick }) => {
  const [selectedListing, setSelectedListing] = useState(null);

  const sampleListings = [
    {
      id: 1,
      title: "Apartamento en Bogotá",
      location: "Bogotá, Colombia",
      distance: "2 km away",
      dates: "Nov 24-29",
      price: 224400,
      currency: "COP",
      rating: 4.88,
      reviewCount: 125,
      image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=500&h=500&fit=crop",
      isSuperhost: true,
    },
    {
      id: 2,
      title: "Habitación en Bogotá",
      location: "La Candelaria, Bogotá",
      distance: "1.5 km away",
      dates: "Nov 24-29",
      price: 128481,
      currency: "COP",
      rating: 4.92,
      reviewCount: 98,
      image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=500&h=500&fit=crop",
      isSuperhost: true,
    },
    {
      id: 3,
      title: "Casa de huéspedes en Bogotá",
      location: "Usaquén, Bogotá",
      distance: "3 km away",
      dates: "Nov 24-29",
      price: 148140,
      currency: "COP",
      rating: 4.82,
      reviewCount: 156,
      image: "https://images.unsplash.com/photo-1493857671505-72967e2e2760?w=500&h=500&fit=crop",
      isSuperhost: false,
    },
    {
      id: 4,
      title: "Loft moderno en Chapinero",
      location: "Chapinero, Bogotá",
      distance: "1 km away",
      dates: "Nov 24-29",
      price: 195000,
      currency: "COP",
      rating: 4.95,
      reviewCount: 243,
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&h=500&fit=crop",
      isSuperhost: true,
    },
    {
      id: 5,
      title: "Estudio acogedora en San Alejo",
      location: "San Alejo, Bogotá",
      distance: "2.5 km away",
      dates: "Nov 25-30",
      price: 156000,
      currency: "COP",
      rating: 4.78,
      reviewCount: 87,
      image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500&h=500&fit=crop",
      isSuperhost: false,
    },
    {
      id: 6,
      title: "Casa colonial en La Candelaria",
      location: "La Candelaria, Bogotá",
      distance: "1.8 km away",
      dates: "Nov 26-Dec 1",
      price: 285000,
      currency: "COP",
      rating: 4.91,
      reviewCount: 312,
      image: "https://images.unsplash.com/photo-1570129477492-45ac003008bc?w=500&h=500&fit=crop",
      isSuperhost: true,
    },
    {
      id: 7,
      title: "Penthouse con vista en Rosales",
      location: "Rosales, Bogotá",
      distance: "4 km away",
      dates: "Nov 24-29",
      price: 380000,
      currency: "COP",
      rating: 4.97,
      reviewCount: 189,
      image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=500&h=500&fit=crop",
      isSuperhost: true,
    },
    {
      id: 8,
      title: "Apartamento acogedora en Teusaquillo",
      location: "Teusaquillo, Bogotá",
      distance: "2.2 km away",
      dates: "Nov 27-Dec 2",
      price: 132000,
      currency: "COP",
      rating: 4.85,
      reviewCount: 76,
      image: "https://images.unsplash.com/photo-1501876725169-7ac5390b67f6?w=500&h=500&fit=crop",
      isSuperhost: false,
    },
  ];

  const handleListingClick = (listing) => {
    setSelectedListing(listing);
    console.log("Selected listing:", listing);
    // Later: Navigate to detail page or show modal
  };

  return (
    <div className="w-full min-h-screen bg-white">
      {/* Navbar */}
      <Navbar user={user} onLogout={onLogout} onLoginClick={onLoginClick} onSignupClick={onSignupClick} />

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

          {/* Listings Grid */}
          <div className="listings-grid">
            {sampleListings.map((listing) => (
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

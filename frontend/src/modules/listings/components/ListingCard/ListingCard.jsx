import React, { useState } from "react";
import "./ListingCard.css";

const ListingCard = ({ listing, onCardClick }) => {
  const [isWishlisted, setIsWishlisted] = useState(false);

  // Provide default mock data if certain props aren't passed
  const defaultListing = {
    title: listing.title,
    location: listing.municipality,
    distance: "2 km away",
    dates: "Nov 24-29",
    price: listing.pricepernight,
    currency: "COP",
    rating: 4.88,
    reviewCount: 125,
    image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=500&h=500&fit=crop",
    isSuperhost: true,
  };

  //const card = listing || defaultListing;
  const card = defaultListing;

  const handleWishlistToggle = (e) => {
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
  };

  const handleCardClick = () => {
    if (onCardClick) {
      onCardClick(card);
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className="card"
    >
      {/* Image Container */}
      <div className="card-image-container">
        <img
          src={card.image}
          alt={card.title}
          className="card-image"
        />

        {card.isSuperhost && (
          <div className="superhost-badge">
            <span>⭐ Superhost</span>
          </div>
        )}

        <button
          onClick={handleWishlistToggle}
          className="wishlist-button"
        >
          {isWishlisted ? (
            <svg
              className="wishlist-icon active"
              viewBox="0 0 24 24"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          ) : (
            <svg
              className="wishlist-icon"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          )}
        </button>
      </div>

      {/* Content */}
      <div className="card-content">
        <div className="card-header">
          <h3 className="card-title">{card.title}</h3>

          <div className="card-rating">
            <span>{card.rating}</span>
            <svg viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </div>
        </div>

        <p className="card-subtext">{card.municipality}</p>
        <p className="card-subtext">
          {card.distance} • {card.dates}
        </p>

        <p className="card-price">
          ${card.price.toLocaleString()} {card.currency}
          <span> per night</span>
        </p>
      </div>
    </div>
  );
};

export default ListingCard;

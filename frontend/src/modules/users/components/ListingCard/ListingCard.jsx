import React, { useState } from "react";

const ListingCard = ({ listing, onCardClick }) => {
  const [isWishlisted, setIsWishlisted] = useState(false);

  // Provide default mock data if props aren't passed
  const defaultListing = {
    id: 1,
    title: "Cozy Apartment in Bogotá",
    location: "Bogotá, Colombia",
    distance: "2 km away",
    dates: "Nov 24-29",
    price: 224400,
    currency: "COP",
    rating: 4.88,
    reviewCount: 125,
    image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=500&h=500&fit=crop",
    isSuperhost: true,
  };

  const card = listing || defaultListing;

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
      className="group cursor-pointer pb-6 transition-transform duration-200 hover:scale-105 card-wrap"
    >
      {/* Image Container */}
      <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-gray-200 mb-3">
        {/* Image */}
        <img
          src={card.image}
          alt={card.title}
          className="w-full h-full object-cover group-hover:opacity-80 transition-opacity duration-200"
        />

        {/* Superhost Badge */}
        {card.isSuperhost && (
          <div className="absolute top-3 left-3 bg-white rounded-full px-3 py-1 shadow-sm">
            <span className="text-xs font-semibold text-gray-900">⭐ Superhost</span>
          </div>
        )}

        {/* Wishlist Button */}
        <button
          onClick={handleWishlistToggle}
          className="absolute top-3 right-3 p-2 rounded-full bg-white/80 hover:bg-white shadow-sm transition-all duration-200"
        >
          {isWishlisted ? (
            <svg
              className="w-6 h-6 text-red-500 fill-current"
              viewBox="0 0 24 24"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          ) : (
            <svg
              className="w-6 h-6 text-gray-700"
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
      <div className="space-y-1">
        {/* Title and Location */}
        <div className="flex justify-between items-start">
          <h3 className="text-sm font-semibold text-gray-900 line-clamp-2">
            {card.title}
          </h3>
          {/* Rating */}
          <div className="flex items-center gap-1 ml-2">
            <span className="text-xs font-semibold text-gray-900">
              {card.rating}
            </span>
            <svg
              className="w-4 h-4 text-yellow-400 fill-current"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </div>
        </div>

        {/* Location and Dates */}
        <p className="text-xs text-gray-600">{card.location}</p>
        <p className="text-xs text-gray-600">
          {card.distance} • {card.dates}
        </p>

        {/* Price */}
        <div>
          <p className="text-sm font-semibold" style={{ color: 'var(--primary-600)' }}>
            ${card.price.toLocaleString()} {card.currency}
            <span className="font-normal text-gray-600"> per night</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ListingCard;

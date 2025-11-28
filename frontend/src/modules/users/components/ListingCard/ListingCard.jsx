import React from "react";

export default function ListingCard({ image, title, price, rating }) {
  return (
    <div className="listing-card">
      <div className="image-container">
        <img src={image} alt={title} />
        <button className="favorite-btn">♥</button>
      </div>

      <h3 className="listing-title">{title}</h3>
      <p className="price">{price}</p>
      <p className="rating">⭐ {rating}</p>
    </div>
  );
}

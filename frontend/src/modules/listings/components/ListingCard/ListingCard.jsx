// ListingCard.jsx
import { useState } from "react";
import "./ListingCard.css";

export default function ListingCard({ listing }) {
  const { title, city, pricePerNight, images } = listing;

  const [currentIndex, setCurrentIndex] = useState(0);

  function nextImage() {
    setCurrentIndex((prev) =>
      prev === images.length - 1 ? 0 : prev + 1
    );
  }

  function prevImage() {
    setCurrentIndex((prev) =>
      prev === 0 ? images.length - 1 : prev - 1
    );
  }

  return (
    <div className="listing-card">

      {/* Carrusel */}
      {/*<div className="carousel-container">
        <img
          src={images[currentIndex]}
          alt={title}
          className="carousel-image"
        />

        <button className="carousel-btn left" onClick={prevImage}>
          ‹
        </button>
        <button className="carousel-btn right" onClick={nextImage}>
          ›
        </button>
      </div>*/}

      {/* Info */}
      <div className="listing-info">
        <h3 className="listing-title">{title}</h3>
        <p className="listing-city">{city}</p>
        <p className="listing-price">${pricePerNight} / noche</p>
      </div>

    </div>
  );
}

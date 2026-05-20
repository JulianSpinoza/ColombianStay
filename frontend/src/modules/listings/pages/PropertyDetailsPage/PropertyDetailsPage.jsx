import { useState } from "react";
import { Outlet } from "react-router-dom";
import BookingWidget from "../../../booking/components/BookingWidget/BookingWidget.jsx";
import BackToResultsButton from "../../components/BackToResultsButton/BackToResultsButton.jsx";
import MapSection from "../../components/MapSection/MapSection.jsx";
import useSpecificListing from "../../hooks/useSpecificListing.js";
import ApiState from "../../../../global/components/ApiState/ApiState.jsx";
import "./PropertyDetailsPage.css";
import HostContactModal from "../../components/ContactHostModal/HostContactModal.jsx";

const PropertyDetailsPage = () => {
  const { listing, loading, error, retry } = useSpecificListing();
  const [copied, setCopied] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [openContactModal, setOpenContactModal] = useState(false);

  if (loading) {
    return (
      <ApiState type='loading'/>
    );
  }

  if (error) {
    return (
      <ApiState type='error'/>
    );
  }

  if (!error && !listing) {
    return (
      <ApiState 
        type='empty'  
        message="La propiedad no fue encontrada."
      />
    );
  }

  const images = listing.images || [];
  const currentImage = images[currentImageIndex] || images[0];
  const shareableLink = `${window.location.origin}${listing.sharePath}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareableLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (copyError) {
      console.error("Could not copy the shareable link:", copyError);
    }
  };

  const handleContactHost = () => {
    setOpenContactModal(true);
  }

  const goPrev = () => {
    if (images.length <= 1) return;
    setCurrentImageIndex((prev) =>
      prev === 0 ? images.length - 1 : prev - 1
    );
  };

  const goNext = () => {
    if (images.length <= 1) return;
    setCurrentImageIndex((prev) =>
      prev === images.length - 1 ? 0 : prev + 1
    );
  };

  return (
    <div className="property-page">
      <div className="hero-section">
        <div className="hero-container">
          <div className="carousel-wrapper">
            <div className="carousel-main">
              <img
                src={currentImage}
                alt={`${listing.title} ${currentImageIndex + 1}`}
                className="carousel-image"
              />

              {images.length > 1 && (
                <>
                  <button
                    className="carousel-button prev"
                    onClick={goPrev}
                    type="button"
                    aria-label="Previous image"
                  >
                    ‹
                  </button>

                  <button
                    className="carousel-button next"
                    onClick={goNext}
                    type="button"
                    aria-label="Next image"
                  >
                    ›
                  </button>
                </>
              )}
            </div>

            {images.length > 1 && (
              <div className="carousel-thumbnails">
                {images.map((image, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className={`thumbnail-button ${
                      idx === currentImageIndex ? "active" : ""
                    }`}
                    onClick={() => setCurrentImageIndex(idx)}
                    aria-label={`View image ${idx + 1}`}
                  >
                    <img
                      src={image}
                      alt={`${listing.title} thumbnail ${idx + 1}`}
                      className="thumbnail-image"
                    />
                  </button>
                ))}
              </div>
            )}

            <div className="mobile-image-count">
              📷 {images.length} photo{images.length !== 1 ? "s" : ""}
            </div>
          </div>
        </div>
      </div>

      <div className="content-container">
        <div className="content-grid">
          <div className="left-column">
            <div className="section header-section">
              <h1 className="property-title">{listing.title}</h1>
              <div className="property-meta">
                <span>📍 {listing.location}</span>
                <span>
                  ⭐ {listing.rating ?? "New"} · {listing.reviewsCount ?? 0}{" "}
                  review{listing.reviewsCount === 1 ? "" : "s"}
                </span>
              </div>
            </div>

            <div className="section share-section">
              <h2>Share this listing</h2>
              <div className="share-box">
                <input
                  type="text"
                  value={shareableLink}
                  readOnly
                  className="share-input"
                  onFocus={(e) => e.target.select()}
                />
                <button
                  type="button"
                  className="share-button"
                  onClick={handleCopyLink}
                >
                  {copied ? "Copied!" : "Copy link"}
                </button>
              </div>
            </div>

            <div className="section host-section">
              <div className="host-info">
                <div className="host-avatar">{listing.host.avatar}</div>
                <div>
                  <p className="host-name">Hosted by {listing.host.name}</p>
                  {listing.host.isSuperhost && (
                    <p className="superhost">🏆 Superhost</p>
                  )}
                </div>
              </div>
                
              {listing.host.contact && (
                <button 
                  className="contact-button" 
                  type="button"
                  onClick={handleContactHost}
                >
                  Contact Host
                </button>
              )}
            </div>

            {listing.highlights.length > 0 && (
              <div className="section">
                <h2>About this property</h2>
                <ul className="highlight-list">
                  {listing.highlights.map((highlight, idx) => (
                    <li key={idx} className="highlight-item">
                      <span className="check">✓</span>
                      <span>{highlight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="section">
              <h2>Description</h2>
              <p className="description-text">{listing.description}</p>
            </div>

            {listing.amenities.length > 0 && (
              <div className="section">
                <h2>Amenities</h2>
                <div className="amenities-grid">
                  {listing.amenities.map((amenity, idx) => (
                    <div key={idx} className="amenity-card">
                      <span className="amenity-icon">{amenity.icon || "•"}</span>
                      <span className="amenity-name">
                        {amenity.name || amenity}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {listing.lat != null && listing.lng != null && (
              <div className="section map-section">
                <h2>Location</h2>
                <MapSection
                  lat={listing.lat}
                  lng={listing.lng}
                  title={listing.title}
                  address={listing.location}
                />
              </div>
            )}

            {listing.reviewsCount > 0 && (
              <div className="section">
                <h2>Reviews ({listing.reviewsCount})</h2>
                <div className="reviews-list">
                  {listing.reviews.map((review) => (
                    <div key={review.id} className="review-card">
                      <div className="review-header">
                        <div>
                          <p className="review-guest">{review.guestName}</p>
                          <p className="review-date">
                            {review.createdAt
                              ? new Date(review.createdAt).toLocaleDateString(
                                  "es-CO"
                                )
                              : ""}
                          </p>
                        </div>

                        <div className="review-rating">
                          <span className="review-stars">
                            {"⭐".repeat(review.rating)}
                          </span>
                          <span className="review-rating-number">
                            {review.rating}/5
                          </span>
                        </div>
                      </div>

                      {review.comment && (
                        <p className="review-comment">{review.comment}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="right-column">
            <BookingWidget
              propertyId={listing.id}
              pricePerNight={listing.price}
              rating={listing.rating}
              reviews={listing.reviews}
              initial_unavailibity={[]}
            />
          </div>
        </div>
      </div>

      <HostContactModal
        isOpen={openContactModal}
        onClose={() => setOpenContactModal(false)}
        hostName={listing.host.name}
        email={listing.host.contact}
        avatarUrl={null}
      />

      <Outlet />
    </div>
  );
};

export default PropertyDetailsPage;
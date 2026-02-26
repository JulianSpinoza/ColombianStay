import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import BookingWidget from "../../../booking/components/BookingWidget/BookingWidget.jsx";
import { useAuthContext } from "../../../users/contexts/AuthContext.jsx";
import { LISTINGS_ENDPOINTS } from "../../../../services/api/endpoints.js";
import "./PropertyDetailsPage.css";

/**
 * PropertyDetailsPage
 * Airbnb-style property details view with:
 * - Hero image grid (1 large left + 4 small right)
 * - Property info and amenities
 * - Sticky booking widget placeholder
 */
const PropertyDetailsPage = () => {
  const { id } = useParams();
  const [property, setProperty] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { axiosInstance } = useAuthContext();

  // Fetch property from backend
  useEffect(() => {
    let mounted = true;
    const fetchProperty = async () => {
      setIsLoading(true);
      try {
        if (!axiosInstance) {
          // fallback: mock for dev
          setProperty({ id: parseInt(id) || 1, title: "Property not loaded", location: "", price: 0, rating: 0, reviews: 0, host: { name: "", avatar: "" }, description: "", images: ["https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&h=300&fit=crop"], amenities: [], highlights: [] });
          setIsLoading(false);
          return;
        }

        const res = await axiosInstance.get(LISTINGS_ENDPOINTS.DETAIL(id));
        if (!mounted) return;
        // Map backend listing to frontend property shape
        const listing = res.data;
        const mapped = {
          id: listing.accomodationid,
          title: listing.title,
          location: listing.locationdesc || listing.addresstext || "",
          price: listing.pricepernight,
          rating: listing.rating || 4.8,
          reviews: listing.reviews || 0,
          host: { name: listing.owner?.username || "Host", avatar: (listing.owner?.username || "H")[0] || "H", isSuperhost: false },
          description: listing.description,
          images: ["https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop"],
          amenities: [],
          highlights: [],
        };
        setProperty(mapped);
      } catch (err) {
        console.error("Error fetching property:", err);
        setProperty(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProperty();

    return () => {
      mounted = false;
    };
  }, [id, axiosInstance]);

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-content">
          <div className="spinner"></div>
          <p className="loading-text">Loading property details...</p>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="loading-container">
        <div className="loading-content">
          <p className="not-found-text">Property not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="property-page">
      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-container">
          <div className="image-grid">
            <div className="main-image">
              <img
                src={property.images[0]}
                alt={property.title}
                className="property-image"
              />
            </div>

            {property.images.slice(1, 5).map((image, idx) => (
              <div key={idx} className="secondary-image">
                <img
                  src={image}
                  alt={`${property.title} ${idx + 2}`}
                  className="property-image clickable"
                />
              </div>
            ))}
          </div>

          <div className="mobile-image-count">
            📷 {property.images.length} photos
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="content-container">
        <div className="content-grid">
          <div className="left-column">
            <div className="section header-section">
              <h1 className="property-title">{property.title}</h1>
              <div className="property-meta">
                <span>📍 {property.location}</span>
                <span>⭐ {property.rating} · {property.reviews} reviews</span>
              </div>
            </div>

            <div className="section host-section">
              <div className="host-info">
                <div className="host-avatar">
                  {property.host.avatar}
                </div>
                <div>
                  <p className="host-name">
                    Hosted by {property.host.name}
                  </p>
                  {property.host.isSuperhost && (
                    <p className="superhost">🏆 Superhost</p>
                  )}
                </div>
              </div>
              <button className="contact-button">
                Contact Host
              </button>
            </div>

            <div className="section">
              <h2>About this property</h2>
              <ul className="highlight-list">
                {property.highlights.map((highlight, idx) => (
                  <li key={idx} className="highlight-item">
                    <span className="check">✓</span>
                    <span>{highlight}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="section">
              <h2>Description</h2>
              <p className="description-text">
                {property.description}
              </p>
            </div>

            <div className="section">
              <h2>Amenities</h2>
              <div className="amenities-grid">
                {property.amenities.map((amenity, idx) => (
                  <div key={idx} className="amenity-card">
                    <span className="amenity-icon">
                      {amenity.icon}
                    </span>
                    <span className="amenity-name">
                      {amenity.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="section">
              <h2>Reviews ({property.reviews})</h2>
              <p className="reviews-placeholder">
                Review section coming soon - {property.reviews} guests loved this property
              </p>
            </div>
          </div>

          <div className="right-column">
            <BookingWidget
              propertyId={property.id}
              pricePerNight={property.price}
              rating={property.rating}
              reviews={property.reviews}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetailsPage;

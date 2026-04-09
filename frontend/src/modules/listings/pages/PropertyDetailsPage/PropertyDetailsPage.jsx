import BookingWidget from "../../../booking/components/BookingWidget/BookingWidget.jsx";
import "./PropertyDetailsPage.css";
import useSpecificListing from "../../hooks/useSpecificListing.js";
import ApiState from "../../../../global/components/ApiState/ApiState.jsx";

/**
 * PropertyDetailsPage
 * Details view with:
 * - Hero image grid (1 large left + 4 small right)
 * - Property info and amenities
 * - Sticky booking widget placeholder
 */
const PropertyDetailsPage = () => {

  const { listing, loading, error } = useSpecificListing()
  
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

  return (
    <div className="property-page">
      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-container">
          <div className="image-grid">
            <div className="main-image">
              <img
                src={listing.images[0]}
                alt={listing.title}
                className="property-image"
              />
            </div>

            {listing.images.slice(1, 5).map((image, idx) => (
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
            📷 {listing.images.length} photos
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="content-container">
        <div className="content-grid">
          <div className="left-column">
            <div className="section header-section">
              <h1 className="property-title">{listing.title}</h1>
              <div className="property-meta">
                <span>📍 {listing.location}</span>
                <span>⭐ {listing.rating} · {listing.reviews} reviews</span>
              </div>
            </div>

            <div className="section host-section">
              <div className="host-info">
                <div className="host-avatar">
                  {listing.host.avatar}
                </div>
                <div>
                  <p className="host-name">
                    Hosted by {listing.host.name}
                  </p>
                  {listing.host.isSuperhost && (
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
                {listing.highlights.map((highlight, idx) => (
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
                {listing.description}
              </p>
            </div>

            <div className="section">
              <h2>Amenities</h2>
              <div className="amenities-grid">
                {listing.amenities.map((amenity, idx) => (
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
              <h2>Reviews ({listing.reviews})</h2>
              <p className="reviews-placeholder">
                Review section coming soon - {listing.reviews} guests loved this property
              </p>
            </div>
          </div>

          <div className="right-column">
            <BookingWidget
              propertyId={listing.id}
              pricePerNight={listing.price}
              rating={listing.rating}
              reviews={listing.reviews}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetailsPage;

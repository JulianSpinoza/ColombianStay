import BookingWidget from "../../../booking/components/BookingWidget/BookingWidget.jsx";
import "./PropertyDetailsPage.css";
import useSpecificListing from "../../hooks/useSpecificListing.js";
// 1. Importamos tu componente de galería de la HU42 (Verifica que la ruta sea correcta según tus carpetas)
import PhotosGallery from "../../components/PhotosGallery/PhotosGallery.jsx";

/**
 * PropertyDetailsPage
 * Details view with:
 * - Interactive Photos Gallery (HU42 integration)
 * - Property info and amenities
 * - Sticky booking widget placeholder
 */
const PropertyDetailsPage = () => {

  const { listing, loading, error } = useSpecificListing()
  
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-content">
          <div className="spinner"></div>
          <p className="loading-text">Loading property details...</p>
        </div>
      </div>
    );
  }

  if (!listing) {
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
      
      {/* 2. HERO SECTION REEMPLAZADA POR TU GALERÍA (HU42) */}
      <div className="hero-section">
         {/* Le pasamos las imágenes del backend, o un array vacío si no hay para que actúe tu fallback */}
         <PhotosGallery images={listing.images || []} />
      </div>

      {/* Main Content - Esto queda intacto para conservar el layout del equipo */}
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

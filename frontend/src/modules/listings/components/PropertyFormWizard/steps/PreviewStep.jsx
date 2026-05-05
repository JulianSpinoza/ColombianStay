import React from "react";

const PreviewStep = ({ formData }) => {
  return (
    <div className="form-step">
      <div className="form-step-header">
        <h2>Preview your listing</h2>
        <p>Review all details before publishing your property.</p>
      </div>

      <div className="preview-section">
        <h3 className="preview-title">{formData.title}</h3>
        <p className="preview-description">{formData.description}</p>
      </div>

      <div className="preview-section">
        <h4 className="preview-section-title">Property details</h4>
        <div className="preview-grid">
          <div className="preview-card">
            <span className="preview-label">Property type</span>
            <span className="preview-value">{formData.propertytype}</span>
          </div>
          <div className="preview-card">
            <span className="preview-label">Bedrooms</span>
            <span className="preview-value">{formData.bedrooms}</span>
          </div>
          <div className="preview-card">
            <span className="preview-label">Bathrooms</span>
            <span className="preview-value">{formData.bathrooms}</span>
          </div>
          <div className="preview-card">
            <span className="preview-label">Max guests</span>
            <span className="preview-value">{formData.maxguests}</span>
          </div>
        </div>
      </div>

      <div className="preview-section">
        <h4 className="preview-section-title">Pricing and location</h4>
        <div className="preview-grid">
          <div className="preview-card">
            <span className="preview-label">Nightly price</span>
            <span className="preview-value">COP {formData.pricepernight}</span>
          </div>
          <div className="preview-card">
            <span className="preview-label">City</span>
            <span className="preview-value">{formData.city}</span>
          </div>
          <div className="preview-card preview-card-wide">
            <span className="preview-label">Full address</span>
            <span className="preview-value">{formData.addresstext}</span>
          </div>
          <div className="preview-card preview-card-wide">
            <span className="preview-label">Location description</span>
            <span className="preview-value">{formData.locationdesc}</span>
          </div>
        </div>
      </div>

      <div className="preview-section">
        <h4 className="preview-section-title">Photos</h4>
        {formData.photos.length > 0 ? (
          <div className="preview-photo-grid">
            {formData.photos.map((photo, index) => (
              <div key={photo.id} className="preview-photo-card">
                <img
                  src={photo.previewUrl}
                  alt={`Preview ${index + 1}`}
                  className="preview-photo"
                />
              </div>
            ))}
          </div>
        ) : (
          <p className="preview-empty">No photos added.</p>
        )}
      </div>

      <div className="preview-section">
        <h4 className="preview-section-title">Availability</h4>
        {formData.availability?.length > 0 ? (
          <div className="availability-list">
            {formData.availability.map((interval, index) => (
              <div
                key={`${interval.startDate}-${interval.endDate}-${index}`}
                className="availability-item"
              >
                <span>
                  {interval.startDate} → {interval.endDate}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="preview-empty">No availability added.</p>
        )}
      </div>
    </div>
  );
};

export default PreviewStep;
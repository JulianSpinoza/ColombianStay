import React from "react";

const PropertyDetails = ({ formData, onInputChange }) => {
  return (
    <div className="form-step">
      <div className="form-step-header">
        <h2>Tell us about your property</h2>
        <p>Add a title and description that highlight your property's best features</p>
      </div>

      <div className="form-group">
        <label className="form-label">Property Type</label>
        <select
          value={formData.propertytype}
          onChange={(e) => onInputChange("propertytype", e.target.value)}
          className="form-input"
        >
          <option value="apartment">Apartment</option>
          <option value="house">House</option>
          <option value="villa">Villa</option>
          <option value="cabin">Cabin</option>
          <option value="studio">Studio</option>
          <option value="room">Room</option>
        </select>
      </div>

      <div className="form-group">
        <label className="form-label">Title *</label>
        <input
          type="text"
          placeholder="e.g., Cozy apartment in Bogotá with amazing views"
          maxLength={50}
          value={formData.title}
          onChange={(e) => onInputChange("title", e.target.value)}
          className="form-input"
          required
        />
        <p className="form-helper">{formData.title.length}/50 characters</p>
      </div>

      <div className="form-group">
        <label className="form-label">Description *</label>
        <textarea
          placeholder="Describe your property, what makes it special, nearby attractions, etc."
          maxLength={500}
          value={formData.description}
          onChange={(e) => onInputChange("description", e.target.value)}
          className="form-textarea"
          rows={5}
          required
        />
        <p className="form-helper">{formData.description.length}/500 characters</p>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Bedrooms</label>
          <input
            type="number"
            min={1}
            max={10}
            value={formData.bedrooms}
            onChange={(e) => onInputChange("bedrooms", parseInt(e.target.value))}
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Bathrooms</label>
          <input
            type="number"
            min={1}
            max={10}
            value={formData.bathrooms}
            onChange={(e) => onInputChange("bathrooms", parseInt(e.target.value))}
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Max Guests</label>
          <input
            type="number"
            min={1}
            max={20}
            value={formData.maxguests}
            onChange={(e) => onInputChange("maxguests", parseInt(e.target.value))}
            className="form-input"
          />
        </div>
      </div>
    </div>
  );
};

export default PropertyDetails;

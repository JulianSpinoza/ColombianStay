import React from "react";

const PricingLocation = ({ formData, onInputChange }) => {
  return (
    <div className="form-step">
      <div className="form-step-header">
        <h2>Set your pricing and location</h2>
        <p>Help guests find your property and set competitive pricing</p>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Nightly Price *</label>
          <div className="price-input-wrapper">
            <span className="price-currency">{formData.currency}</span>
            <input
              type="number"
              placeholder="0"
              min={0}
              value={formData.price}
              onChange={(e) => onInputChange("price", e.target.value)}
              className="form-input price-input"
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Currency</label>
          <select
            value={formData.currency}
            onChange={(e) => onInputChange("currency", e.target.value)}
            className="form-input"
          >
            <option value="COP">COP (Colombian Peso)</option>
            <option value="USD">USD (US Dollar)</option>
            <option value="EUR">EUR (Euro)</option>
          </select>
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">City *</label>
        <select
          value={formData.city}
          onChange={(e) => onInputChange("city", e.target.value)}
          className="form-input"
          required
        >
          <option value="">Select a city</option>
          <option value="Bogotá">Bogotá</option>
          <option value="Medellín">Medellín</option>
          <option value="Cali">Cali</option>
          <option value="Cartagena">Cartagena</option>
          <option value="Santa Marta">Santa Marta</option>
          <option value="Barranquilla">Barranquilla</option>
          <option value="Other">Other</option>
        </select>
      </div>

      <div className="form-group">
        <label className="form-label">Full Address *</label>
        <input
          type="text"
          placeholder="e.g., Cra 7 No. 28-45, Bogotá"
          value={formData.address}
          onChange={(e) => onInputChange("address", e.target.value)}
          className="form-input"
          required
        />
      </div>

      <div className="form-group">
        <label className="form-label">Location Description</label>
        <input
          type="text"
          placeholder="e.g., La Candelaria neighborhood, close to museums"
          value={formData.location}
          onChange={(e) => onInputChange("location", e.target.value)}
          className="form-input"
        />
      </div>

      <div className="pricing-info">
        <div className="info-box">
          <h4>💡 Pro Tip</h4>
          <p>
            Properties with photos and detailed descriptions get 30% more bookings.
            Add high-quality photos in the next step!
          </p>
        </div>
      </div>
    </div>
  );
};

export default PricingLocation;

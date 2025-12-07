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
            <span className="price-currency">COP</span>
            <input
              type="number"
              placeholder={0}
              min={0}
              value={formData.pricepernight}
              onChange={(e) => onInputChange("pricepernight", parseInt(e.target.value))}
              className="form-input price-input"
              required
            />
          </div>
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
          <option value="" disabled hidden>Select a city</option>
          <option value="Bogotá">Bogotá</option>
          <option value="Medellín">Medellín</option>
          <option value="Cali">Cali</option>
          <option value="Cartagena">Cartagena</option>
          <option value="Santa Marta">Santa Marta</option>
          <option value="Barranquilla">Barranquilla</option>
          <option value="Soledad">Soledad</option>
          <option value="Puerto Colombia">Puerto Colombia</option>
          <option value="Montería">Montería</option>
          <option value="Sincelejo">Sincelejo</option>
          <option value="Riohacha">Riohacha</option>
          <option value="Zipaquirá">Zipaquirá</option>
          <option value="La Calera">La Calera</option>
          <option value="Envigado">Envigado</option>
          <option value="Guatapé">Guatapé</option>
          <option value="Bucaramanga">Bucaramanga</option>
          <option value="San Gil">San Gil</option>
          <option value="Tunja">Tunja</option>
          <option value="Villa de Leyva">Villa de Leyva</option>
          <option value="Pereira">Pereira</option>
          <option value="Armenia">Armenia</option>
          <option value="Manizales">Manizales</option>
          <option value="Buenaventura">Buenaventura</option>
          <option value="Palmira">Palmira</option>
          <option value="Quibdó">Quibdó</option>
          <option value="Villavicencio">Villavicencio</option>
          <option value="Arauca">Arauca</option>
          <option value="Florencia">Florencia</option>
          <option value="Leticia">Leticia</option>
          <option value="San Andrés">San Andrés</option>
          <option value="Providencia">Providencia</option>
        </select>
      </div>

      <div className="form-group">
        <label className="form-label">Full Address *</label>
        <input
          type="text"
          placeholder="e.g., Cra 7 No. 28-45, Bogotá"
          value={formData.addresstext}
          onChange={(e) => onInputChange("addresstext", e.target.value)}
          className="form-input"
          required
        />
      </div>

      <div className="form-group">
        <label className="form-label">Location Description</label>
        <input
          type="text"
          placeholder="e.g., La Candelaria neighborhood, close to museums"
          value={formData.locationdesc}
          onChange={(e) => onInputChange("locationdesc", e.target.value)}
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

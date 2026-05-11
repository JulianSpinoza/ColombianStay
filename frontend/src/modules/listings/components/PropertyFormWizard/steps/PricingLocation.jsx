import React, { useEffect, useState } from "react";
import useLocationClassification from "../../../hooks/useLocationClassification";

const PricingLocation = ({ formData, onInputChange }) => {

  const [regionId, setRegionId] = useState();
  const [departmentId, setDepartmentId] = useState();

  const {
    options: regionOptions,
    loading: regionLoading,
    error: regionError,
    fetchRegionOptions,
  } = useLocationClassification();

  const {
    options: departmentOptions,
    loading: departmentLoading,
    error: departmentError,
    fetchDepartmentOptions,
  } = useLocationClassification();

  const {
    options: municipalityOptions,
    loading: municipalityLoading,
    error: municipalityError,
    fetchMunicipalityOptions,
  } = useLocationClassification();

  useEffect(() => {
    fetchRegionOptions();
  },[])

  useEffect(() => {

    if(!regionId) return

    fetchDepartmentOptions(regionId);
  },[regionId])

  useEffect(() => {

    if(!departmentId) return

    fetchMunicipalityOptions(departmentId);
  },[departmentId])

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
              type="text"
              inputMode="numeric"
              placeholder="Enter nightly price"
              value={formData.pricepernight}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "");
                onInputChange("pricepernight", value === "" ? "" : parseInt(value, 10));
              }}
              className="form-input price-input"
              required
            />
          </div>
        </div>
      </div>

      {!regionLoading && !regionError &&  (
        <div className="form-group">
          <label className="form-label">Region *</label>
          <select
            value={regionId || ""}
            onChange={(e) => setRegionId(e.target.value)}
            className="form-input"
            required
          >
            <option value="" disabled hidden>Select a region</option>
            {regionOptions?.map((option) => (
              <option key={option.id} value={option.id}>{option.name_option}</option>
            ))}   
          </select>
        </div>
      )}

      {!departmentLoading && !departmentError && regionId &&  (
        <div className="form-group">
          <label className="form-label">Department *</label>
          <select
            value={departmentId || ""}
            onChange={(e) => setDepartmentId(e.target.value)}
            className="form-input"
            required
          >
            <option value="" disabled hidden>Select a department</option>
            {departmentOptions?.map((option) => (
              <option key={option.id} value={option.id}>{option.name_option}</option>
            ))}   
          </select>
        </div>
      )}

      {!municipalityError && !municipalityLoading && departmentId &&  (
        <div className="form-group">
          <label className="form-label">Municipality *</label>
          <select
            value={formData.city || ""}
            onChange={(e) => onInputChange("city", parseInt(e.target.value,10))}
            className="form-input"
            required
          >
            <option value="" disabled hidden>Select a city</option>
            {municipalityOptions?.map((option) => (
              <option key={option.id} value={option.id}>{option.name_option}</option>
            ))} 
          </select>
        </div>
      )}

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
          required
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
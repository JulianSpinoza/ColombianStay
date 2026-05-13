import React, { useEffect, useState } from "react";
import useLocationClassification from "../../../hooks/useLocationClassification";
import MapPointSelection from "../../MapSection/MapPointSelection";

const PricingLocation = ({ formData, onInputChange }) => {

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

    if(!formData.region) return

    fetchDepartmentOptions(formData.region.id);
  },[formData.region])

  useEffect(() => {

    if(!formData.department) return
    
    fetchMunicipalityOptions(formData.department.id);
  },[formData.department])

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
            value={formData.region?.id || ""}
            onChange={(e) => {
              onInputChange(
                "region",  
                regionOptions.find(
                  region => region.id == parseInt(e.target.value,10)
                )
              )
              onInputChange("department",undefined)
              onInputChange("city",undefined)
            }}
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

      {!departmentLoading && !departmentError && formData.region &&  (
        <div className="form-group">
          <label className="form-label">Department *</label>
          <select
            value={formData.department?.id || ""}
            onChange={(e) => {
              onInputChange(
                "department",  
                departmentOptions.find(
                  department => department.id == parseInt(e.target.value,10)
                )
              )
              onInputChange("city",undefined)
            }}
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

      {!municipalityError && !municipalityLoading && formData.department &&  (
        <div className="form-group">
          <label className="form-label">Municipality *</label>
          <select
            value={formData.city?.id || ""}
            onChange={(e) => {
              onInputChange(
                "city",  
                municipalityOptions.find(
                  municipality => municipality.id == parseInt(e.target.value,10)
                )
              )
              onInputChange("location_lat",undefined)
              onInputChange("location_lng",undefined)
            }}
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

      {formData.city && (
        <div className="form-group">
          <label className="form-label">Select location</label>
          <MapPointSelection 
            value={(formData.location_lat && formData.location_lng) ? [formData.location_lat,formData.location_lng] : undefined}
            onChange={onInputChange}
            boundary={formData.city?.boundary}
            />
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
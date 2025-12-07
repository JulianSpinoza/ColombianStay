import React, { useState } from "react";
import ProgressBar from "./ProgressBar.jsx";
import PropertyDetails from "./steps/PropertyDetails.jsx";
import PricingLocation from "./steps/PricingLocation.jsx";
import PhotoUpload from "./steps/PhotoUpload.jsx";
import "./PropertyFormWizard.css";

const PropertyFormWizard = ({ onPublish }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Step 1
    title: "",
    description: "",
    propertytype: "apartment",
    bedrooms: 1,
    bathrooms: 1,
    maxguests: 2,
    // Step 2
    pricepernight: 0,
    locationdesc: "",
    addresstext: "",
    city: "",
    // Step 3
    photos: [],
  });

  const totalSteps = 3;

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handlePhotosChange = (photos) => {
    setFormData((prev) => ({
      ...prev,
      photos,
    }));
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Para probar sin fotos
    delete formData.photos;
    onPublish(formData);
  };

  return (
    <div className="wizard-container">
      <div className="wizard-header">
        <h1 className="wizard-title">Become a Host</h1>
        <p className="wizard-subtitle">
          List your property and start earning with ColombianStay
        </p>
      </div>

      <ProgressBar currentStep={currentStep} totalSteps={totalSteps} />

      <form onSubmit={handleSubmit} className="wizard-form">
        {/* Step 1: Property Details */}
        {currentStep === 1 && (
          <PropertyDetails formData={formData} onInputChange={handleInputChange} />
        )}

        {/* Step 2: Pricing and Location */}
        {currentStep === 2 && (
          <PricingLocation formData={formData} onInputChange={handleInputChange} />
        )}

        {/* Step 3: Photo Upload */}
        {currentStep === 3 && (
          <PhotoUpload formData={formData} onPhotosChange={handlePhotosChange} />
        )}

        {/* Navigation Buttons */}
        <div className="wizard-navigation">
          <button
            type="button"
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="btn-secondary"
          >
            ← Previous
          </button>

          {currentStep === totalSteps ? (
            <button key="btn-submit" type="submit" className="btn-primary">
              Publish Property ✓
            </button>
          ) : (
            <button key="btn-next" type="button" onClick={handleNext} className="btn-primary">
              Next →
            </button>
          )}
        </div>
      </form>

      {/* Step Indicator Text */}
      <div className="wizard-step-info">
        <p>
          Step {currentStep} of {totalSteps}
        </p>
      </div>
    </div>
  );
};

export default PropertyFormWizard;

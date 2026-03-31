import React, { useState, useRef } from "react";
import ProgressBar from "./ProgressBar.jsx";
import PropertyDetails from "./steps/PropertyDetails.jsx";
import PricingLocation from "./steps/PricingLocation.jsx";
import PhotoUpload from "./steps/PhotoUpload.jsx";
import "./PropertyFormWizard.css";

const PropertyFormWizard = ({ onPublish }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const formRef = useRef(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    propertytype: "apartment",
    bedrooms: 1,
    bathrooms: 1,
    maxguests: 2,
    pricepernight: 0,
    locationdesc: "",
    addresstext: "",
    city: "",
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
    // valida solo los inputs visibles del paso actual
    if (formRef.current && !formRef.current.reportValidity()) {
      return;
    }

    // validación extra para fotos si tu uploader no usa input file nativo
    if (currentStep === 3 && formData.photos.length === 0) {
      alert("Debes subir al menos una foto.");
      return;
    }

    if (currentStep < totalSteps) {
      setCurrentStep((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (formRef.current && !formRef.current.reportValidity()) {
      return;
    }

    if (formData.photos.length === 0) {
      alert("Debes subir al menos una foto.");
      return;
    }

    const { photos, ...payload } = formData;
    onPublish(payload);
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

      <form ref={formRef} onSubmit={handleSubmit} className="wizard-form">
        {currentStep === 1 && (
          <PropertyDetails
            formData={formData}
            onInputChange={handleInputChange}
          />
        )}

        {currentStep === 2 && (
          <PricingLocation
            formData={formData}
            onInputChange={handleInputChange}
          />
        )}

        {currentStep === 3 && (
          <PhotoUpload
            formData={formData}
            onPhotosChange={handlePhotosChange}
          />
        )}

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
            <button type="submit" className="btn-primary">
              Publish Property ✓
            </button>
          ) : (
            <button
              type="button"
              onClick={handleNext}
              className="btn-primary"
            >
              Next →
            </button>
          )}
        </div>
      </form>

      <div className="wizard-step-info">
        <p>
          Step {currentStep} of {totalSteps}
        </p>
      </div>
    </div>
  );
};

export default PropertyFormWizard;
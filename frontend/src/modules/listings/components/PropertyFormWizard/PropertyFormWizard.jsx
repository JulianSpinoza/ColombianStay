import React, { useState, useRef } from "react";
import ProgressBar from "./ProgressBar.jsx";
import PropertyDetails from "./steps/PropertyDetails.jsx";
import PricingLocation from "./steps/PricingLocation.jsx";
import PhotoUpload from "./steps/PhotoUpload.jsx";
import Availability from "./steps/Availability.jsx";
import PreviewStep from "./steps/PreviewStep.jsx";
import "./PropertyFormWizard.css";

const PropertyFormWizard = ({ onPublish }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const formRef = useRef(null);

  const [errors, setErrors] = useState({});
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishError, setPublishError] = useState("");
  const [published, setPublished] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    propertytype: "apartment",
    bedrooms: 0,
    bathrooms: 0,
    maxguests: 0,
    pricepernight: 0,
    locationdesc: "",
    addresstext: "",
    city: "",
    photos: [],
    availability: [],
  });

  const totalSteps = 5;

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [field]: "",
    }));
  };
  
  const validateCurrentStep = () => {
    if (currentStep === 1) {
      if (formData.title.trim() === "") {
        alert("The title cannot be empty.");
        return false;
      }

      if (formData.description.trim() === "") {
        alert("The description cannot be empty.");
        return false;
      }

      if (formData.bedrooms === "" || Number(formData.bedrooms) < 1) {
        alert("You must enter a valid number of bedrooms.");
        return false;
      }

      if (formData.bathrooms === "" || Number(formData.bathrooms) < 1) {
        alert("You must enter a valid number of bathrooms.");
        return false;
      }

      if (formData.maxguests === "" || Number(formData.maxguests) < 1) {
        alert("You must enter a valid number of guests.");
        return false;
      }
    }

    if (currentStep === 2) {
      if (formData.city.trim() === "") {
        alert("You must select a city.");
        return false;
      }

      if (formData.addresstext.trim() === "") {
        alert("The address cannot be empty.");
        return false;
      }

      if (formData.locationdesc.trim() === "") {
        alert("The location description cannot be empty.");
        return false;
      }

      if (formData.pricepernight === "" || Number(formData.pricepernight) < 1) {
        alert("You must enter a valid price.");
        return false;
      }
    }

    if (currentStep === 3) {
      const newErrors = {};

      if (formData.photos.length < 3) {
        newErrors.photos = "You must upload at least 3 photos.";
      }

      setErrors((prev) => ({
        ...prev,
        ...newErrors,
      }));

      return Object.keys(newErrors).length === 0;
    }

    if (currentStep === 4) {
      const newErrors = {};

      if (!formData.availability || formData.availability.length === 0) {
        newErrors.availability = "You must add at least one availability interval.";
      }

      setErrors((prev) => ({
        ...prev,
        ...newErrors,
      }));

      return Object.keys(newErrors).length === 0;
    }

    return true;
};
  
  const handleNext = () => {
    if (formRef.current && !formRef.current.reportValidity()) {
      return;
    }

    if (!validateCurrentStep()) {
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

const handleSubmit = async (e) => {
  e.preventDefault();

  if (formRef.current && !formRef.current.reportValidity()) {
    return;
  }

  if (!validateCurrentStep()) {
    return;
  }

  setPublishError("");
  setIsPublishing(true);

  try {
    await Promise.resolve(onPublish(formData));
    setPublished(true);
  } catch (error) {
    setPublishError(
      error?.message || "An error occurred while publishing your property. Please try again."
    );
  } finally {
    setIsPublishing(false);
  }
};

if (published) {
  return (
    <div className="wizard-container">
      <div className="wizard-header">
        <h1 className="wizard-title">Property published successfully</h1>
        <p className="wizard-subtitle">
          Your listing is now live on ColombianStay.
        </p>
      </div>
    </div>
  );
}

return (
    <div className="wizard-container">
      <div className="wizard-header">
        <h1 className="wizard-title">Become a Host</h1>
        <p className="wizard-subtitle">
          List your property and start earning with ColombianStay
        </p>
      </div>

      <ProgressBar currentStep={currentStep} totalSteps={totalSteps} />
      {publishError && (
        <div className="publish-error">
          <p>{publishError}</p>
        </div>
        )}

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
            onInputChange={handleInputChange}
            error={errors.photos}
          />
        )}

        {currentStep === 4 && (
          <Availability
            formData={formData}
            onInputChange={handleInputChange}
            error={errors.availability}
         />
        )}

        {currentStep === 5 && (
          <PreviewStep
            formData={formData}
          />
        )}

        <div className="wizard-navigation">
          <button
            type="button"
            onClick={handlePrevious}
            disabled={currentStep === 1 || isPublishing}
            className="btn-secondary"
          >
            ← Previous
          </button>

          {currentStep === totalSteps ? (
            <button
              type="submit"
              key="publish"
              className="btn-primary"
              disabled={isPublishing}
            >
              {isPublishing ? "Publishing..." : "Publish Property ✓"}
            </button>

          ) : (
            <button
              type="button"
              key="next"
              onClick={handleNext}
              className="btn-primary"
              disabled={isPublishing}
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
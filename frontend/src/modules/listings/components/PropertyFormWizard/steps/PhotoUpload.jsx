import React from "react";
import ImageLoader from "./ImageLoader.jsx";

const PhotoUpload = ({ formData, onInputChange, error }) => {
  return (
    <div className="form-step">
      <div className="form-step-header">
        <h2>Add photos of your property</h2>
        <p>
          Show guests your space clearly. Use good quality images and upload at least 3.
        </p>
      </div>

      <ImageLoader
        images={formData.photos}
        onChange={(files) => onInputChange("photos", files)}
        minImages={3}
        maxImages={10}
        maxSizeMB={10}
        error={error}
      />
    </div>
  );
};

export default PhotoUpload;

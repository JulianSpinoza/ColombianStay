import React, { useState } from "react";

const PhotoUpload = ({ formData, onPhotosChange }) => {
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = [...e.dataTransfer.files];
    if (files && files.length > 0) {
      handleFiles(files);
    }
  };

  const handleChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles([...e.target.files]);
    }
  };

  const handleFiles = (files) => {
    const imageFiles = files.filter((file) => file.type.startsWith("image/"));

    const newPhotos = imageFiles.map((file) => ({
      id: Math.random(),
      file,
      preview: URL.createObjectURL(file),
      name: file.name,
    }));

    // Limit to 10 photos
    const updatedPhotos = [...formData.photos, ...newPhotos].slice(0, 10);
    onPhotosChange(updatedPhotos);
  };

  const removePhoto = (id) => {
    const updatedPhotos = formData.photos.filter((photo) => photo.id !== id);
    onPhotosChange(updatedPhotos);
  };

  const movePhotoUp = (index) => {
    if (index > 0) {
      const newPhotos = [...formData.photos];
      [newPhotos[index], newPhotos[index - 1]] = [newPhotos[index - 1], newPhotos[index]];
      onPhotosChange(newPhotos);
    }
  };

  const movePhotoDown = (index) => {
    if (index < formData.photos.length - 1) {
      const newPhotos = [...formData.photos];
      [newPhotos[index], newPhotos[index + 1]] = [newPhotos[index + 1], newPhotos[index]];
      onPhotosChange(newPhotos);
    }
  };

  return (
    <div className="form-step">
      <div className="form-step-header">
        <h2>Add photos of your property</h2>
        <p>High-quality photos help guests imagine their stay. Upload at least 3 photos.</p>
      </div>

      {/* Drag & Drop Zone */}
      <div
        className={`drag-drop-zone ${dragActive ? "active" : ""}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="drag-drop-content">
          <svg
            className="drag-drop-icon"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 4v16m8-8H4"
            />
          </svg>
          <h3>Drag photos here</h3>
          <p>or click to select from your computer</p>
          <p className="drag-drop-hint">
            PNG, JPG up to 10 photos (Max 10MB each)
          </p>
        </div>
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleChange}
          className="drag-drop-input"
          id="photo-input"
        />
      </div>

      {/* Photos Count */}
      <div className="photos-count">
        <p>
          {formData.photos.length} / 10 photos uploaded
          {formData.photos.length < 3 && (
            <span className="count-warning"> (Minimum 3 required)</span>
          )}
        </p>
      </div>

      {/* Photos Grid */}
      {formData.photos.length > 0 && (
        <div className="photos-grid">
          {formData.photos.map((photo, index) => (
            <div key={photo.id} className="photo-item">
              <div className="photo-image-wrapper">
                <img src={photo.preview} alt={`Property ${index + 1}`} />
                {index === 0 && <div className="photo-badge">Cover Photo</div>}
              </div>

              <div className="photo-actions">
                <button
                  type="button"
                  onClick={() => movePhotoUp(index)}
                  disabled={index === 0}
                  className="photo-btn photo-btn-up"
                  title="Move up"
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => movePhotoDown(index)}
                  disabled={index === formData.photos.length - 1}
                  className="photo-btn photo-btn-down"
                  title="Move down"
                >
                  ↓
                </button>
                <button
                  type="button"
                  onClick={() => removePhoto(photo.id)}
                  className="photo-btn photo-btn-delete"
                  title="Delete"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Info Box */}
      <div className="photos-info">
        <div className="info-box">
          <h4>📸 Photo Tips</h4>
          <ul>
            <li>Use natural lighting and clear photos</li>
            <li>Include bedroom, bathroom, kitchen, and common areas</li>
            <li>The first photo will be your cover photo</li>
            <li>Avoid blurry or cluttered images</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PhotoUpload;

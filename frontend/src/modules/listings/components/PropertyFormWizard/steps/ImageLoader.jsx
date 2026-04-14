import React, { useState } from "react";

const ImageLoader = ({
  images = [],
  onChange,
  minImages = 3,
  maxImages = 10,
  maxSizeMB = 10,
  acceptedTypes = ["image/jpeg", "image/png", "image/webp"],
  error = "",
}) => {
  const [localErrors, setLocalErrors] = useState([]);
  const [isDragging, setIsDragging] = useState(false);

  const processFiles = (incomingFiles) => {
    const selectedFiles = Array.from(incomingFiles || []);
    const nextErrors = [];
    const validImages = [];

    const availableSlots = maxImages - images.length;

    if (availableSlots <= 0) {
      setLocalErrors([`You can only upload up to ${maxImages} images.`]);
      return;
    }

    const filesToProcess = selectedFiles.slice(0, availableSlots);

    if (selectedFiles.length > availableSlots) {
      nextErrors.push(`You can only upload up to ${maxImages} images.`);
    }

    filesToProcess.forEach((file) => {
      if (!acceptedTypes.includes(file.type)) {
        nextErrors.push(`${file.name}: unsupported format.`);
        return;
      }

      if (file.size > maxSizeMB * 1024 * 1024) {
        nextErrors.push(
          `${file.name}: exceeds the maximum size of ${maxSizeMB} MB.`
        );
        return;
      }

      const isDuplicate = images.some(
        (existingImage) =>
          existingImage.file.name === file.name &&
          existingImage.file.size === file.size &&
          existingImage.file.lastModified === file.lastModified
      );

      if (isDuplicate) {
        nextErrors.push(`${file.name}: this image was already added.`);
        return;
      }

      validImages.push({
        id: `${file.name}-${file.lastModified}-${file.size}`,
        file,
        name: file.name,
        previewUrl: URL.createObjectURL(file),
      });
    });

    setLocalErrors(nextErrors);

    if (validImages.length > 0) {
      onChange([...images, ...validImages]);
    }
  };

  const handleFilesChange = (event) => {
    processFiles(event.target.files);
    event.target.value = "";
  };

  const handleDragEnter = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(true);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
    processFiles(event.dataTransfer.files);
  };

  const handleRemoveImage = (indexToRemove) => {
    const imageToRemove = images[indexToRemove];

    if (imageToRemove?.previewUrl) {
      URL.revokeObjectURL(imageToRemove.previewUrl);
    }

    const updatedImages = images.filter((_, index) => index !== indexToRemove);
    setLocalErrors([]);
    onChange(updatedImages);
  };

  return (
    <div className="image-loader">
      <label
        className={`upload-box ${isDragging ? "drag-active" : ""}`}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept={acceptedTypes.join(",")}
          multiple
          onChange={handleFilesChange}
          className="hidden-file-input"
        />

        <span className="upload-box-title">＋</span>
        <strong>Drag photos here</strong>
        <span className="upload-box-text">
          or click to select from your computer
        </span>
        <span className="upload-box-text">
          PNG, JPG or WEBP · maximum {maxSizeMB} MB per image
        </span>
        <span className="upload-box-text">
          Upload at least {minImages} photos
        </span>
      </label>

      {localErrors.length > 0 && (
        <div className="error-box">
          {localErrors.map((item, index) => (
            <p key={index} className="field-error">
              {item}
            </p>
          ))}
        </div>
      )}

      {error && <p className="field-error">{error}</p>}

      {images.length > 0 && (
        <div className="image-grid">
          {images.map((image, index) => (
            <div className="image-card" key={image.id}>
              <img
                src={image.previewUrl}
                alt={`Preview ${index + 1}`}
                className="image-preview"
              />
              <div className="image-card-footer">
                <span className="image-name">{image.name}</span>
                <button
                  type="button"
                  className="remove-image-button"
                  onClick={() => handleRemoveImage(index)}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="helper-text">
        {images.length} / {maxImages} images uploaded
      </p>
    </div>
  );
};

export default ImageLoader;
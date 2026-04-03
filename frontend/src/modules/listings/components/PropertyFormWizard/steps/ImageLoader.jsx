import React, { useEffect, useMemo, useState } from "react";

const ImageLoader = ({
  images = [],
  onChange,
  minImages = 3,
  maxImages = 10,
  maxSizeMB = 5,
  acceptedTypes = ["image/jpeg", "image/png", "image/webp"],
  error = "",
}) => {
  const [localErrors, setLocalErrors] = useState([]);

  const previews = useMemo(() => {
    return images.map((file, index) => ({
      id: `${file.name}-${index}`,
      name: file.name,
      url: URL.createObjectURL(file),
    }));
  }, [images]);

  useEffect(() => {
    return () => {
      previews.forEach((preview) => URL.revokeObjectURL(preview.url));
    };
  }, [previews]);

  const handleFilesChange = (event) => {
    const selectedFiles = Array.from(event.target.files || []);
    const nextErrors = [];
    const validFiles = [];

    const availableSlots = maxImages - images.length;

    if (availableSlots <= 0) {
      setLocalErrors([`Solo puedes subir hasta ${maxImages} imágenes.`]);
      event.target.value = "";
      return;
    }

    const filesToProcess = selectedFiles.slice(0, availableSlots);

    if (selectedFiles.length > availableSlots) {
      nextErrors.push(`Solo puedes subir hasta ${maxImages} imágenes.`);
    }

    filesToProcess.forEach((file) => {
      if (!acceptedTypes.includes(file.type)) {
        nextErrors.push(`${file.name}: formato no permitido.`);
        return;
      }

      if (file.size > maxSizeMB * 1024 * 1024) {
        nextErrors.push(`${file.name}: supera el tamaño máximo de ${maxSizeMB} MB.`);
        return;
      }

      validFiles.push(file);
    });

    setLocalErrors(nextErrors);

    if (validFiles.length > 0) {
      onChange([...images, ...validFiles]);
    }

    event.target.value = "";
  };

  const handleRemoveImage = (indexToRemove) => {
    const updatedImages = images.filter((_, index) => index !== indexToRemove);
    onChange(updatedImages);
  };

  return (
    <div className="image-loader">
      <label className="upload-box">
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp"
          multiple
          onChange={handleFilesChange}
          className="hidden-file-input"
        />
        <span className="upload-box-title">Upload photos</span>
        <span className="upload-box-text">
          PNG, JPG o WEBP · máximo {maxSizeMB} MB por imagen
        </span>
        <span className="upload-box-text">
          Debes subir al menos {minImages} fotos
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
          {previews.map((preview, index) => (
            <div className="image-card" key={preview.id}>
              <img
                src={preview.url}
                alt={`Preview ${index + 1}`}
                className="image-preview"
              />
              <div className="image-card-footer">
                <span className="image-name">{preview.name}</span>
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
        {images.length} / {maxImages} imágenes cargadas
      </p>
    </div>
  );
};

export default ImageLoader;
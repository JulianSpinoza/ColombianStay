import React, { useState, useEffect } from "react";
import "./EditProfileForm.css"

/**
 * EditProfileForm
 * Props:
 * - initialData: { username, email, first_name, last_name }
 * - onSave(formData) -> Promise
 * - onCancel() -> void
 */
const EditProfileForm = ({ initialData = {}, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    profile_picture: null,
    profilePreview: initialData.profile_picture || "",
    username: initialData.username || "",
    email: initialData.email || "",
    phone: initialData.phone || "",
    first_name: initialData.first_name || "",
    last_name: initialData.last_name || "",
  });

  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState("");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
  const handleBeforeUnload = (event) => {
    if (hasUnsavedChanges) {
      event.preventDefault();
      event.returnValue = "";
    }
  };

  window.addEventListener(
    "beforeunload",
    handleBeforeUnload
  );

  return () => {
    window.removeEventListener(
      "beforeunload",
      handleBeforeUnload
    );
  };
}, [hasUnsavedChanges]);

  const validate = () => {
    const newErrors = {};

    if (!formData.username.trim()) newErrors.username = "Username is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
    if (!/^\d{10}$/.test(formData.phone)) {
      newErrors.phone = "Phone number must contain 10 digits";
    if (!formData.first_name.trim()) newErrors.first_name = "First name is required";
    if (!formData.last_name.trim()) newErrors.last_name = "Last name is required";
}

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Solo letras para nombre y apellido
    if (
      (name === "first_name" || name === "last_name") &&
      !/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]*$/.test(value)
    ) {
      return;
    }

    // Solo números para teléfono
    if (
      name === "phone" &&
      !/^\d*$/.test(value)
    ) {
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setHasUnsavedChanges(true);

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setErrors((prev) => ({
        ...prev,
        profile_picture: "Image must be smaller than 2MB",
      }));
      return;
    }

    const preview = URL.createObjectURL(file);
    setFormData((prev) => ({
      ...prev,
      profile_picture: file,
      profilePreview: preview,
    }));

    setErrors((prev) => ({
      ...prev,
      profile_picture: "",
    }));

    setHasUnsavedChanges(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSavedMessage("");

    if (!validate()) return;

    setIsSaving(true);
    try {
      if (onSave) await onSave(formData);
      setSavedMessage("✓ Profile updated successfully!");
      setTimeout(() => setSavedMessage(""), 3000);
      setHasUnsavedChanges(false);
    } catch (err) {
      setErrors({ form: err.message || "Failed to save profile" });
    } finally {
      setIsSaving(false);
    }
  };

  const inputClass = (hasError) =>
    `form-input ${hasError ? "input-error" : "input-normal"}`;

  return (
    <form onSubmit={handleSubmit} className="profile-form">
      <div className="form-card">
        <h2 className="form-title">Edit Profile</h2>

        <div className="profile-picture-section">
          <img
            src={
              formData.profilePreview ||
              "https://placehold.co/100x100?text=User"
            }
            alt="Profile Preview"
            className="profile-preview"
          />

          <div className="profile-picture-input">
            <label className="form-label">
              Profile Picture
            </label>

            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              disabled={isSaving}
            />

            <small>
              Maximum size: 2MB
            </small>

            {errors.profile_picture && (
              <p className="field-error">
                {errors.profile_picture}
              </p>
            )}
          </div>
        </div>

        {/* Form errors */}
        {errors.form && (
          <div className="alert alert-error">
            {errors.form}
          </div>
        )}

        {/* Success message */}
        {savedMessage && (
          <div className="alert alert-success">
            {savedMessage}
          </div>
        )}

        {/* Username */}
        <div className="form-group">
          <label className="form-label">Username</label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            disabled={isSaving}
            className={inputClass(errors.username)}
            placeholder="Enter username"
          />
          {errors.username && (
            <p className="field-error">{errors.username}</p>
          )}
        </div>

        {/* Phone */}
        <div className="form-group">
          <label className="form-label">Phone Number</label>

          <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              disabled={isSaving}
              className={inputClass(errors.phone)}
              placeholder="Enter phone number"
              maxLength={10}
              onKeyDown={(e) => {
                const allowedKeys = [
                  "Backspace",
                  "Delete",
                  "ArrowLeft",
                  "ArrowRight",
                  "Tab",
                ];

                if (
                  !allowedKeys.includes(e.key) &&
                  !/^\d$/.test(e.key)
                ) {
                  e.preventDefault();
                }
              }}
            />

          {errors.phone && (
            <p className="field-error">{errors.phone}</p>
          )}
        </div>

        {/* Email */}
        <div className="form-group">
          <label className="form-label">Email</label>

          <input
            type="email"
            name="email"
            value={formData.email}
            disabled
            className="form-input input-disabled"
          />
        </div>

        {/* First & Last name */}
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">First Name</label>
            <input
              type="text"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              disabled={isSaving}
              className={inputClass(errors.first_name)}
              placeholder="First name"
            />
            {errors.first_name && (
              <p className="field-error">{errors.first_name}</p>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Last Name</label>
            <input
              type="text"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              disabled={isSaving}
              className={inputClass(errors.last_name)}
              placeholder="Last name"
            />
            {errors.last_name && (
              <p className="field-error">{errors.last_name}</p>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="form-actions">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSaving}
          className="btn btn-secondary"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={isSaving}
          className="btn btn-primary"
        >
          {isSaving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </form>
  );
};

export default EditProfileForm;

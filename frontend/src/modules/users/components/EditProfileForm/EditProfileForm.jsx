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
    username: initialData.username || "",
    email: initialData.email || "",
    first_name: initialData.first_name || "",
    last_name: initialData.last_name || "",
  });

  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState("");

  useEffect(() => {
    setFormData({
      username: initialData.username || "",
      email: initialData.email || "",
      first_name: initialData.first_name || "",
      last_name: initialData.last_name || "",
    });
  }, [initialData]);

  const validateEmail = (email) => {
    return /\S+@\S+\.\S+/.test(email);
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.username.trim()) newErrors.username = "Username is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (formData.email && !validateEmail(formData.email)) {
      newErrors.email = "Invalid email format";
    }
    if (!formData.first_name.trim()) newErrors.first_name = "First name is required";
    if (!formData.last_name.trim()) newErrors.last_name = "Last name is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field when user starts typing
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
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

        {/* Email */}
        <div className="form-group">
          <label className="form-label">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            disabled={isSaving}
            className={inputClass(errors.email)}
            placeholder="Enter email"
          />
          {errors.email && (
            <p className="field-error">{errors.email}</p>
          )}
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

import React, { useState, useEffect } from "react";

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

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Edit Profile</h2>

        {/* Form errors */}
        {errors.form && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {errors.form}
          </div>
        )}

        {/* Success message */}
        {savedMessage && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
            {savedMessage}
          </div>
        )}

        {/* Username */}
        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            disabled={isSaving}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition ${
              errors.username
                ? "border-red-300 focus:ring-red-400"
                : "border-gray-300 focus:ring-indigo-400"
            }`}
            placeholder="Enter username"
          />
          {errors.username && (
            <p className="mt-1 text-sm text-red-600">{errors.username}</p>
          )}
        </div>

        {/* Email */}
        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            disabled={isSaving}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition ${
              errors.email
                ? "border-red-300 focus:ring-red-400"
                : "border-gray-300 focus:ring-indigo-400"
            }`}
            placeholder="Enter email"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
          )}
        </div>

        {/* First Name */}
        <div className="grid grid-cols-2 gap-4 mb-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
            <input
              type="text"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              disabled={isSaving}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition ${
                errors.first_name
                  ? "border-red-300 focus:ring-red-400"
                  : "border-gray-300 focus:ring-indigo-400"
              }`}
              placeholder="First name"
            />
            {errors.first_name && (
              <p className="mt-1 text-sm text-red-600">{errors.first_name}</p>
            )}
          </div>

          {/* Last Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
            <input
              type="text"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              disabled={isSaving}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition ${
                errors.last_name
                  ? "border-red-300 focus:ring-red-400"
                  : "border-gray-300 focus:ring-indigo-400"
              }`}
              placeholder="Last name"
            />
            {errors.last_name && (
              <p className="mt-1 text-sm text-red-600">{errors.last_name}</p>
            )}
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-3 justify-end">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSaving}
          className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSaving}
          className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-lg hover:from-indigo-700 hover:to-purple-700 transition disabled:opacity-50"
        >
          {isSaving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </form>
  );
};

export default EditProfileForm;

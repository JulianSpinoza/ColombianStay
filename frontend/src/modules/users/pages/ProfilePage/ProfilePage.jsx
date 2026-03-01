import React, { useState } from "react";
import { useAuthContext } from "../../contexts/AuthContext";
import EditProfileForm from "../../components/EditProfileForm/EditProfileForm";
import "./ProfilePage.css"

/**
 * ProfilePage
 * Displays user profile info and allows editing via EditProfileForm
 */
const ProfilePage = () => {
  const { state } = useAuthContext();
  const [isEditing, setIsEditing] = useState(false);

  const user = state.user || {};

  const handleSaveProfile = async (formData) => {
    // TODO: Call backend API to update user
    // const response = await updateUserProfile(formData);
    console.log("Profile update (mock):", formData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  return (
    <div className="profile-page">
      <div className="profile-container">
        {/* Header */}
        <div className="profile-header">
          <h1 className="profile-title">My Profile</h1>
        </div>

        {!isEditing ? (
          <div className="profile-grid">
            {/* Profile card */}
            <div className="profile-card-wrapper">
              <div className="profile-card">
                <div className="avatar-wrapper">
                  <div className="avatar">
                    {(user.username).charAt(0).toUpperCase()}
                  </div>
                </div>

                <h2 className="username">{user.username}</h2>
                <p className="email">{user.email}</p>

                {user.is_host && (
                  <div className="verified-wrapper">
                    <span className="verified-badge">✓ Verified Host</span>
                  </div>
                )}

                <button
                  onClick={() => setIsEditing(true)}
                  className="edit-button"
                >
                  Edit Profile
                </button>
              </div>
            </div>

            {/* Profile details */}
            <div className="profile-details-wrapper">
              <div className="profile-details">
                <section>
                  <h3 className="section-title">Personal Information</h3>
                  <div className="info-grid">
                    <div>
                      <p className="label">First Name</p>
                      <p className="value">{user.first_name || "—"}</p>
                    </div>
                    <div>
                      <p className="label">Last Name</p>
                      <p className="value">{user.last_name || "—"}</p>
                    </div>
                  </div>
                </section>

                <hr />

                <section>
                  <h3 className="section-title">Contact Information</h3>
                  <p className="label">Email Address</p>
                  <p className="value">{user.email}</p>
                </section>

                <hr />

                <section>
                  <h3 className="section-title">Account Status</h3>
                  <div className="status">
                    <span className="status-dot" />
                    <p>Active</p>
                  </div>
                </section>
              </div>
            </div>
          </div>
        ) : (
          <div className="edit-form-wrapper">
            <EditProfileForm
              initialData={{
                username: user.username || "",
                email: user.email || "",
                first_name: user.first_name || "",
                last_name: user.last_name || "",
              }}
              onSave={handleSaveProfile}
              onCancel={handleCancel}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;

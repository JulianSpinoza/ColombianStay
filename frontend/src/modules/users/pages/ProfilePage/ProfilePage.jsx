import React, { useEffect, useState } from "react";
import { useAuthContext } from "../../contexts/AuthContext";
import EditProfileForm from "../../components/EditProfileForm/EditProfileForm";
import "./ProfilePage.css"
import { getPersonalInfo } from "../../services/usersService";

/**
 * ProfilePage
 * Displays user profile info and allows editing via EditProfileForm
 */
const ProfilePage = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [userProfile, setUserProfile] = useState(null)

  useEffect(() => {
    fetchPersonalInfo()
  }, [])

  async function fetchPersonalInfo() {
    try {
      const data = await getPersonalInfo();
      setUserProfile(data)
    } catch (err) {
      console.log(err)
    }
  }

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
                    {/*(userProfile?.username).charAt(0).toUpperCase()*/}
                  </div>
                </div>

                <h2 className="username">{userProfile?.username}</h2>
                <p className="email">{userProfile?.email}</p>

                {userProfile?.is_host && (
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
                      <p className="value">{userProfile?.first_name || "—"}</p>
                    </div>
                    <div>
                      <p className="label">Last Name</p>
                      <p className="value">{userProfile?.last_name || "—"}</p>
                    </div>
                  </div>
                </section>

                <hr />

                <section>
                  <h3 className="section-title">Contact Information</h3>
                  <p className="label">Email Address</p>
                  <p className="value">{userProfile?.email}</p>
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
                username: userProfile?.username || "",
                email: userProfile?.email || "",
                first_name: userProfile?.first_name || "",
                last_name: userProfile?.last_name || "",
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

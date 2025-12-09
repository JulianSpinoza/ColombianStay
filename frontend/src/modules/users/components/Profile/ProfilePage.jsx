import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../../contexts/AuthContext";
import EditProfileForm from "./EditProfileForm";

/**
 * ProfilePage
 * Displays user profile info and allows editing via EditProfileForm
 */
const ProfilePage = () => {
  const { state } = useAuthContext();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);

  if (!state.isAuthenticated) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <p className="text-gray-600">Please log in to view your profile.</p>
        <button
          onClick={() => navigate("/login")}
          className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          Go to Login
        </button>
      </div>
    );
  }

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
    <div className="w-full min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/")}
            className="text-indigo-600 hover:text-indigo-700 font-medium mb-4 flex items-center gap-1"
          >
            ← Back to Home
          </button>
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
        </div>

        {!isEditing ? (
          // View mode: Show profile info
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile card */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-center mb-4">
                  <div className="w-20 h-20 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                    {(user.username || "U").charAt(0).toUpperCase()}
                  </div>
                </div>
                <h2 className="text-xl font-semibold text-gray-900 text-center">{user.username}</h2>
                <p className="text-sm text-gray-600 text-center mt-1">{user.email}</p>

                {user.is_host && (
                  <div className="mt-4 inline-block w-full">
                    <span className="inline-block px-3 py-1 bg-indigo-100 text-indigo-700 text-xs font-medium rounded-full">
                      ✓ Verified Host
                    </span>
                  </div>
                )}

                <button
                  onClick={() => setIsEditing(true)}
                  className="w-full mt-6 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-lg hover:from-indigo-700 hover:to-purple-700 transition"
                >
                  Edit Profile
                </button>
              </div>
            </div>

            {/* Profile details */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">First Name</p>
                      <p className="text-base font-medium text-gray-900">
                        {user.first_name || "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Last Name</p>
                      <p className="text-base font-medium text-gray-900">
                        {user.last_name || "—"}
                      </p>
                    </div>
                  </div>
                </div>

                <hr className="border-gray-200" />

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Email Address</p>
                    <p className="text-base font-medium text-gray-900">{user.email}</p>
                  </div>
                </div>

                <hr className="border-gray-200" />

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Status</h3>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <p className="text-sm text-gray-700">Active</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Edit mode: Show form
          <div className="lg:max-w-2xl">
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

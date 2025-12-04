import React from "react";
import PropertyFormWizard from "../PropertyFormWizard/PropertyFormWizard.jsx";
import "../PropertyFormWizard/PropertyFormWizard.css";

const BecomeHostPage = ({ user, onLogout, onBack }) => {
  if (!user) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">You must be logged in to become a host.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-white">
      {/* Simple Header with Back/User Info */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button 
              onClick={onBack}
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              ← Back to Home
            </button>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-900">{user.firstName}</span>
            <button
              onClick={onLogout}
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Wizard Component */}
      <PropertyFormWizard />
    </div>
  );
};

export default BecomeHostPage;

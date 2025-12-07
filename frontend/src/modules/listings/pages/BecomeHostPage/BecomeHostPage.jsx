import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../../../users/contexts/AuthContext.jsx";
import PropertyFormWizard from "../../components/PropertyFormWizard/PropertyFormWizard.jsx";
import { publishProperty } from "../../services/listingsService.js";
const BecomeHostPage = () => {
  
  const { state , dispatch, axiosInstance } = useAuthContext();
  const navigate = useNavigate()

  const onBack = () => {
    navigate("/")
  } 

  const onLogout = () => {
    navigate("/");

    // Removing JWT Auth from localStorage
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");

    // Update context to Logout
    dispatch({
        type: "LOGOUT",
      })
  }
  
  const publish = async (property) => {
    try {
      await publishProperty(property, axiosInstance);
    } catch (error) {
      console.log(error);
    } finally {
      // Some loading left
      navigate("/");
    }
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
            <span className="text-sm font-medium text-gray-900">{state.user.username}</span>
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
      <PropertyFormWizard onPublish={publish}/>
    </div>
  );
};

export default BecomeHostPage;

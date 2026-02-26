import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../../../users/contexts/AuthContext.jsx";
import PropertyFormWizard from "../../components/PropertyFormWizard/PropertyFormWizard.jsx";
import { publishProperty } from "../../services/listingsService.js";

export default function PublishListing() {
  
  const { axiosInstance } = useAuthContext();
  const navigate = useNavigate()

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
      {/* Wizard Component */}
      <PropertyFormWizard onPublish={publish}/>
    </div>
  );
};

import "./HomePage.css";
import React, { useState } from "react";
import Navbar from "../../components/Navbar/Navbar.jsx";
import CategoryBar from "../../components/CategoryBar/CategoryBar.jsx";
import MainContent from "./MainContent.jsx";
import { ListingProvider } from "../../../modules/listings/contexts/ListingsContext.jsx";

const HomePage = ({ onLogout, onLoginClick, onSignupClick }) => {

  const [actualContent, setActualContent] = useState('listingsPage');

  return (
    <div className="w-full min-h-screen bg-white">
      <ListingProvider>

        <Navbar 
          onLogout={onLogout} 
          onLoginClick={onLoginClick} 
          onSignupClick={onSignupClick} 
        />

        <CategoryBar />

        <MainContent activeContent={actualContent}/>  
      </ListingProvider>

      {/* Footer Spacing */}
      <div className="h-16"></div>
    </div>
  );
};

export default HomePage;

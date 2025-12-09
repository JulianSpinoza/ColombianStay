import "./HomePage.css";
import React, { useState } from "react";
import Navbar from "../../components/Navbar/Navbar.jsx";
import CategoryBar from "../../components/CategoryBar/CategoryBar.jsx";
import { ListingProvider } from "../../../modules/listings/contexts/ListingsContext.jsx";
import { Outlet, Routes, Route } from "react-router-dom";
import ListingsPage from "../../../modules/listings/pages/ListingsPage/ListingsPage";

const HomePage = () => {
  
  const [actualContent, setActualContent] = useState('listingsPage');

  return (
    <div className="w-full min-h-screen bg-white">
      <ListingProvider>

        <Navbar />

        <CategoryBar />

        {/* Main Content */}
        <Routes>
          <Route index element={<ListingsPage/>}/>
        </Routes>

        
        {/* Internal Modals fro Login and Signup */}
        <Outlet/>
      
      </ListingProvider>

      {/* Footer Spacing */}
      <div className="h-16"></div>
    </div>
  );
};

export default HomePage;

import React, { useState } from "react";
import HomePage from "./global/pages/Home/HomePage.jsx";
import Login from "./modules/users/components/Login/Login.jsx";
import Signup from "./modules/users/components/Signup/Signup.jsx";
import BecomeHostPage from "./modules/users/components/BecomeHost/BecomeHostPage.jsx";
import "./App.css"
import { AuthProvider } from "./modules/users/contexts/AuthContext.jsx";

function App() {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [currentPage, setCurrentPage] = useState("home"); // "home" | "become-host"

  const handleLogout = () => {
    setUser(null);
    setCurrentPage("home");
  };

  const handleNavigate = (page) => {
    if (page === "become-host") {
      if (!user) {
        setShowLoginModal(true);
      } else {
        setCurrentPage("become-host");
      }
    } else {
      setCurrentPage("home");
    }
  }
  
  const handleLoginClick = () => {
    setShowLoginModal(true);
  };

  const handleSignupClick = () => {
    setShowSignupModal(true);
  };

  return (
    <div className="w-full">
      <AuthProvider>
        {currentPage === "home" && (
          <HomePage 
            onLoginClick={handleLoginClick}
            onSignupClick={handleSignupClick}
            onBecomeHost={() => handleNavigate("become-host")}
          />
        )}
        {currentPage === "become-host" && user && (
          <BecomeHostPage
            user={user}
            onLogout={handleLogout}
            onBack={() => handleNavigate("home")}
          />
        )}
        {showLoginModal && (
          <Login onClose={handleLoginClick}/>
        )}
        {showSignupModal && (
          <Signup onClose={handleSignupClick} />
        )}
      </AuthProvider>
    </div>
  );
}

export default App

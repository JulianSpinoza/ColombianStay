import React, { useState } from "react";
import HomePage from "./global/pages/Home/HomePage.jsx";
import Login from "./modules/users/components/Login/Login.jsx";
import Signup from "./modules/users/components/Signup/Signup.jsx";
import BecomeHostPage from "./modules/users/components/BecomeHost/BecomeHostPage.jsx";
import "./App.css"

function App() {
  const [user, setUser] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [currentPage, setCurrentPage] = useState("home"); // "home" | "become-host"

  const handleLogin = (userData) => {
    setUser(userData);
    setShowLoginModal(false);
  };

  const handleRegister = (userData) => {
    setUser(userData);
    setShowSignupModal(false);
  };

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
  };

  return (
    <div className="w-full">
      {currentPage === "home" && (
        <HomePage 
          user={user} 
          onLogout={handleLogout}
          onLoginClick={() => setShowLoginModal(true)}
          onSignupClick={() => setShowSignupModal(true)}
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
        <Login 
          onLogin={handleLogin}
          onClose={() => setShowLoginModal(false)}
        />
      )}
      {showSignupModal && (
        <Signup onRegister={handleRegister} onClose={() => setShowSignupModal(false)} />
      )}
    </div>
  );
}

export default App


import React, { useState } from "react";
import HomePage from "./modules/users/components/Home/HomePage.jsx";
import Login from "./modules/users/components/Login/Login.jsx";
import Signup from "./modules/users/components/Signup/Signup.jsx";
import "./App.css"

function App() {
  const [user, setUser] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);

  const handleLogin = (userData) => {
    setUser(userData);
    setShowLoginModal(false);
  };

  const handleRegister = (userData) => {
    // After successful registration, treat as logged in
    setUser(userData);
    setShowSignupModal(false);
  };

  const handleLogout = () => {
    setUser(null);
  };

  const handleLoginClick = () => {
    setShowLoginModal(true);
  };

  const handleSignupClick = () => {
    setShowSignupModal(true);
  };

  return (
    <div className="w-full">
      <HomePage 
        user={user} 
        onLogout={handleLogout}
        onLoginClick={handleLoginClick}
        onSignupClick={handleSignupClick}
      />
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


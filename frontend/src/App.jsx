import React, { useState } from "react";
import HomePage from "./global/pages/Home/HomePage.jsx";
import Login from "./modules/users/components/Login/Login.jsx";
import Signup from "./modules/users/components/Signup/Signup.jsx";
import "./App.css"
import { AuthProvider } from "./modules/users/contexts/AuthContext.jsx";

function App() {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);

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
      <AuthProvider>
        <HomePage 
          onLogout={handleLogout}
          onLoginClick={handleLoginClick}
          onSignupClick={handleSignupClick}
        />
        {showLoginModal && (
          <Login onClose={() => setShowLoginModal(false)}/>
        )}
        {showSignupModal && (
          <Signup onClose={() => setShowSignupModal(false)} />
        )}
      </AuthProvider>
    </div>
  );
}

export default App


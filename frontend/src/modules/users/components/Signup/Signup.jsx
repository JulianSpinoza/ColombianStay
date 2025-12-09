import React, { useState } from "react";
import './Signup.css'
import { registerUser } from "../../services/usersService";
import { useNavigate } from "react-router-dom";

const Signup = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate()

  const onClose = () => {
    navigate("/")
  } 

  const validateEmail = (e) => {
    // simple regex
    return /\S+@\S+\.\S+/.test(e);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (!username.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      setError("Please fill all fields");
      setIsLoading(false);
      return;
    }

    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    try {
      
      const userData = {
        username,
        password,
        email,
        firstName: username.charAt(0).toUpperCase() + username.slice(1),
        is_host: false,
      };

      await registerUser(userData);

    } catch (error) {
      setError("Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
    onClose();
  };

  return (
    <div className="signup-overlay" onClick={onClose}>
      <div className="signup-container" onClick={(e) => e.stopPropagation()}>
        <button className="close-button" onClick={onClose} aria-label="Close">✕</button>
        <div className="signup-wrapper">
          <form className="form" onSubmit={handleSubmit}>
            <div className="title">Create an account</div>

            {error && <div className="error-message">{error}</div>}

            <input
              className="input"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isLoading}
            />

            <input
              className="input"
              placeholder="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />

            <input
              className="input"
              placeholder="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
            />

            <input
              className="input"
              placeholder="Confirm password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={isLoading}
            />

            <button className="button-confirm" type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Sign up"}
            </button>

            <button type="button" className="button-cancel" onClick={onClose}>
              Cancel
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Signup;

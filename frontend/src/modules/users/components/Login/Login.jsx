import React, { useState } from "react";
import './Login.css'

function Login({ onLogin, onClose }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Validation
    if (!username.trim() || !password.trim()) {
      setError("Please enter both username and password");
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      setIsLoading(false);
      return;
    }

    try {
      // TODO: Replace with actual API call
      // const response = await httpClient.post("users/login/", {
      //   username,
      //   password,
      // });

      // Simulate API call with mock authentication
      await new Promise(resolve => setTimeout(resolve, 500));

      // Mock successful login
      const userData = {
        id: 1,
        username: username,
        email: `${username}@colombianstay.com`,
        firstName: username.charAt(0).toUpperCase() + username.slice(1),
        isAuthenticated: true,
      };

      onLogin(userData);
    } catch (err) {
      setError(err.response?.data?.detail || "Invalid credentials. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-overlay" onClick={onClose}>
      <div className="login-container" onClick={(e) => e.stopPropagation()}>
        <button
          className="close-button"
          onClick={onClose}
          type="button"
          aria-label="Close modal"
        >
          ✕
        </button>
        <div className="login-wrapper">
          <form className="form" onSubmit={handleSubmit}>
          <div className="title">
            Welcome,<br />
            <span>sign up to continue</span>
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <input
            className="input"
            name="username"
            placeholder="Username"
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={isLoading}
          />

          <input
            className="input"
            name="password"
            placeholder="Password"
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
          />

          <button
            className="button-confirm"
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? "Loading..." : "Let's go"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="button-cancel"
          >
            Cancel
          </button>
        </form>
      </div>
    </div>
    </div>
  );
}

export default Login
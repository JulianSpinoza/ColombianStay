import React, { useContext, useState } from "react";
import './Login.css'
import { useAuthContext } from "../../contexts/AuthContext";
import { loginUser } from "../../services/usersService";
import { jwtDecode } from "jwt-decode";

function Login({ onClose }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { dispatch } = useAuthContext();

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
      const credentials = {
        username: username,
        password: password
      };

      const JWTToken = await loginUser(credentials);

      const access = JWTToken.access;
      const refresh = JWTToken.refresh;
      const user = jwtDecode(access);

      localStorage.setItem("access", access);
      localStorage.setItem("refresh", refresh);

      dispatch({
        type: "LOGIN",
        payload: { access, refresh, user }
      });

    } catch (err) {
      setError(err.response?.data?.detail || "Invalid credentials. Please try again.");
    } finally {
      setIsLoading(false);
      onClose();
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
import React, { useState } from "react";
import './SignupModal.css'
import { registerUser, loginUser } from "../../services/usersService";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import { useApiState } from "../../../../services/api/useApiState";
import { useAuthContext } from "../../contexts/AuthContext";

const SignupModal = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const { dispatch } = useAuthContext();

  const {
    loading,
    setLoading,
    error,
    setError,
    handleError,
  } = useApiState();

  const [formerror, setFormError] = useState("");
  const navigate = useNavigate()

  const onClose = () => {
    navigate(-1);
  } 

  const validateEmail = (e) => {
    // simple regex
    return /\S+@\S+\.\S+/.test(e);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setLoading(true);

    if (!username.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      setFormError("Please fill all fields");
      setLoading(false);
      return;
    }

    if (!validateEmail(email)) {
      setFormError("Please enter a valid email address");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setFormError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setFormError("Passwords do not match");
      setLoading(false);
      return;
    }
    
    setError(null);

    try {
      
      const userData = {
        username,
        email,
        password,
        first_name:firstName,
        last_name: lastName,
        phone_number: phoneNumber,
        is_host: false,
      };

      await registerUser(userData);

    } catch (err) {
      setFormError("Registration failed. Please try again.");
      handleError(err)
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
      handleError(err);
    } finally {
      setLoading(false);
      if (!error) onClose();
    }
    
  };

  return (
    <div className="signup-overlay" onClick={onClose}>
      <div className="signup-container" onClick={(e) => e.stopPropagation()}>
        <button className="close-button" onClick={onClose} aria-label="Close">✕</button>
        <div className="signup-wrapper">
          <form className="form" onSubmit={handleSubmit}>
            <div className="title">Create an account</div>

            {formerror && <div className="error-message">{formerror}</div>}

            <input
              className="input"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
              required
            />

            <input
              className="input"
              placeholder="First Name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              disabled={loading}
              required
            />

            <input
              className="input"
              placeholder="Last Name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              disabled={loading}
              required
            />

            <div className="input-container">
              <span> +57 </span>
              <input
                className="input"
                type="tel"
                pattern="3[0-9]{9}"
                title="El número debe tener 10 dígitos y empezar con 3"
                required
                placeholder="Phone"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                disabled={loading}
              />
            </div>
            

            <input
              className="input"
              placeholder="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
            />

            <input
              className="input"
              placeholder="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
            />

            <input
              className="input"
              placeholder="Confirm password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
              required
            />

            <button className="button-confirm" type="submit" disabled={loading}>
              {loading ? "Creating..." : "Sign up"}
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

export default SignupModal;

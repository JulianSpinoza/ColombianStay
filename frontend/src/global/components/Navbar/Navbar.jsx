import { useState } from "react";
import { useAuthContext } from "../../../modules/users/contexts/AuthContext.jsx";
import { useLocation, useNavigate } from "react-router-dom";
import './Navbar.css'

const Navbar = ({children}) => {

  const location = useLocation();

  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const navigate = useNavigate()

  // Context about the active user
  const { state, dispatch } = useAuthContext();

  const handleLogout = () => {
    setIsProfileMenuOpen(false);

    // Timeout 0 avoiding asynchrony for the Auth Reducer
    setTimeout(() => {
      navigate("/");
    }, 0);

    // Removing JWT Auth from localStorage
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");

    // Update context to Logout
    dispatch({
        type: "LOGOUT",
      })
  };

  const handleLoginClick = () => {
    setIsProfileMenuOpen(false);
    console.log(location.pathname);
    navigate("/login", { state: { backgroundLocation: location } });
  };

  const handleSignupClick = () => {
    setIsProfileMenuOpen(false);
    navigate("/register", { state: { backgroundLocation: location } });
  };

  const handlePublishListing = () => {
    setIsProfileMenuOpen(false);
    navigate("/publish-listing");
  };

  const handleHostReservations = () => {
    setIsProfileMenuOpen(false);
    navigate("/host/reservations");
  };

  const handleProfileClick = () => {
    setIsProfileMenuOpen(false);
    navigate("/user/my-profile", { state : { selectedOption: "profile" }});
  };

  const handleUserReservations = () => {
    setIsProfileMenuOpen(false);
    navigate("/user/my-reservations", { state : { selectedOption: "reservations" }});
  }

  const handleHome = () => {
    navigate("/");
  }

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-content">
          
          {/* Logo */}
          <div className="navbar-logo" onClick={handleHome}>
            <div className="logo-wrapper">
              <div className="logo-icon">
                <span className="logo-emoji">🏠</span>
              </div>
              <span className="logo-text">ColombianStay</span>
            </div>
          </div>

          {/* Content in between */}
          <div className="content-in-between">
            {children}
          </div>

          {/* Right Menu */}
          <div className="navbar-actions">

            {state.isAuthenticated && (
              <button
                onClick={handlePublishListing}
                className="btn-host"
              >
                Become a host
              </button>
            )}

            {/* Profile Menu */}
            <div className="profile-menu">
              <button
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="profile-button"
              >
                <svg className="icon-sm" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.5 1.5H.5v2h10V1.5zM.5 6.5h10v2H.5v-2zm0 5h10v2H.5v-2z" />
                </svg>
                <svg className="icon-md" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>

              {isProfileMenuOpen && (
                <div className="dropdown-menu">
                  {state.isAuthenticated ? (
                    <>
                      <div className="dropdown-header">
                        <p>{state.user.username}</p>
                      </div>

                      <button onClick={handleProfileClick} className="dropdown-item">
                        My Profile
                      </button>
                      <button onClick={handleHostReservations} className="dropdown-item">
                        My Listings Reservations
                      </button>
                      <button onClick={handleUserReservations} className="dropdown-item">
                        My Guest Reservations
                      </button>

                      <hr />

                      <button onClick={handleLogout} className="dropdown-item">
                        Log out
                      </button>
                    </>
                  ) : (
                    <>
                      <button onClick={handleLoginClick} className="dropdown-item">
                        Log in
                      </button>
                      <button onClick={handleSignupClick} className="dropdown-item">
                        Sign up
                      </button>
                      
                    </>
                  )}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

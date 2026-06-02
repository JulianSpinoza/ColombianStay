import { useLocation, useNavigate } from "react-router-dom";
import "./UserSideBar.css";
import { useAuthContext } from "../../contexts/AuthContext";

export default function UserSideBar()  {
  const navigate = useNavigate();
  const location = useLocation();

  const selected = location.state?.selectedOption;

  const { state } = useAuthContext();
  const user = state.user;

  const handleNavigate = (key, path) => {
    navigate(path ,{ state : { selectedOption: key }});
  };

  return (
    <div className="sidebar-container">
            
        {/* Foto y nombre */}
        <div className="profile-section" onClick={() => handleNavigate("profile", "/user/my-profile")}>
                <div className="avatar-container">
                    <div className="avatar-circle">
                        {(user.username).charAt(0).toUpperCase()}
                    </div>
                </div>
            <p className="profile-name">{user.username}</p>
        </div>

        {/* Opciones */}
        <div className="menu-section">
            <button
            className={selected === "profile" ? "menu-item selected" : "menu-item"}
            onClick={() => handleNavigate("profile", "/user/my-profile")}
            >
            My profile
            </button>

            <p className="menu-label">As guest</p>

            <button
            className={selected === "reservations" ? "menu-item selected" : "menu-item"}
            onClick={() => handleNavigate("reservations", "/user/my-reservations")}
            >
            Reservations
            </button>

            {user.is_host && (
                <>
                    <p className="menu-label">As host</p>

                    <button
                    className={
                        selected === "accomodations" ? "menu-item selected" : "menu-item"
                    }
                    onClick={() =>
                        handleNavigate("accomodations", "/user/host/reservations")
                    }
                    >
                    My accomodations reservations
                    </button>

                </>
            )}

        </div>

        {/* Footer */}
        <div className="sidebar-footer">
            <p>ColombianStay © 2026</p>
        </div>
        </div>
    );
};
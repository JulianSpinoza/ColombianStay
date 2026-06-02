import { useLocation, useNavigate } from "react-router-dom";
import "./UserSideBar.css";
import usePersonalInfo from "../../hooks/usePersonalInfo";

export default function UserSideBar()  {
  const navigate = useNavigate();
  const location = useLocation();

  const pathname = location.pathname;

  const selected =
    pathname === "/user/my-profile"
      ? "profile"
      : pathname === "/user/my-reservations"
      ? "reservations"
      : pathname === "/user/historic-reservations"
      ? "historic"
      : pathname === "/host/public-information"
      ? "publicInfo"
      : pathname === "/host/my-accommodations"
      ? "accommodations"
       : "";

    const handleNavigate = (path) => {
        navigate(path);
    };

    const {
        userProfile,
        loading,
        error,
    } = usePersonalInfo();

  return (
    <div className="sidebar-container">
            
        {/* Foto y nombre */}
        <div className="profile-section" onClick={() => handleNavigate("/user/my-profile")}>
                <div className="avatar-container">
                    <div className="avatar-circle">
                        {userProfile?.profile_picture ? (
                            <img
                                src={
                                userProfile?.profile_picture
                                }
                                alt="Profile Picture"
                                className="profile-preview"
                            />
                            ) : userProfile?.username && (
                            (userProfile?.username).charAt(0).toUpperCase()
                        )}
                    </div>
                </div>
            <p className="profile-name">{userProfile?.username}</p>
        </div>

        {/* Opciones */}
        <div className="menu-section">
            <button
                className={selected === "profile" ? "menu-item selected" : "menu-item"}
                onClick={() => handleNavigate("/user/my-profile")}
            >
                My profile
            </button>

            <p className="menu-label">As guest</p>

            <button
                className={selected === "reservations" ? "menu-item selected" : "menu-item"}
                onClick={() => handleNavigate("/user/my-reservations")}
            >
                Reservations
            </button>

            <button
                className={selected === "historic" ? "menu-item selected" : "menu-item"}
                onClick={() => handleNavigate("/user/historic-reservations")}
            >
                Historic reservations
            </button>

            <p className="menu-label">As host</p>

            <button
                className={selected === "publicInfo" ? "menu-item selected" : "menu-item"}
                onClick={() => handleNavigate("/host/public-information")}
            >
                Public information
            </button>

            <button
                className={selected === "accommodations" ? "menu-item selected" : "menu-item"}
                onClick={() => handleNavigate("/host/my-accommodations")}
            >
                My accommodations
            </button>
        </div>

        {/* Footer */}
        <div className="sidebar-footer">
            <p>ColombianStay © 2026</p>
        </div>
        </div>
    );
};
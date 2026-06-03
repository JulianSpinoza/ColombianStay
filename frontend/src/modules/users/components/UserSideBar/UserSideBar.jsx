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
      : pathname === "/user/host/reservations"
      ? "accomodations-reservations"
      //: pathname === "/user/my-accommodations"
      //? "my-accommodations"
      //: pathname === "/user/my-accommodations/*"
      //? "my-accommodations"
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

            {userProfile?.is_host && (
                <>
                    <p className="menu-label">As host</p>

                    {/*<button
                    className={
                        selected === "my-accommodations" ? "menu-item selected" : "menu-item"
                    }
                    onClick={() =>
                        handleNavigate("/user/my-accommodations")
                    }
                    >
                    My own accomodations
                    </button>*/}

                    <button
                    className={
                        selected === "accomodations-reservations" ? "menu-item selected" : "menu-item"
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
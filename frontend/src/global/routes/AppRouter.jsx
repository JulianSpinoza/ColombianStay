import { Routes, useLocation, Route } from "react-router-dom";
import LoginModal from "../../modules/users/components/Login/LoginModal";
import ListingsRoutes from "../../modules/listings/ListingsRoutes";
import SignupModal from "../../modules/users/components/Signup/SignupModal";
import UsersRoutes from "../../modules/users/UsersRoutes";

export default function AppRouter() {
    const location = useLocation();
    const backgroundLocation = location.state?.backgroundLocation;

    return (
        <>
            {/* Rutas principales */}
            <Routes location={backgroundLocation || location}>
                {/* Rutas por servicio (dominio) */}
                <Route path="/*" element={<ListingsRoutes />} />
                <Route path="/user/*" element= {<UsersRoutes/>}/>
                {/* Rutas de globales */}
                <Route path="/login" element={<LoginModal />} />

            </Routes>

            {/* Rutas modales */}
            {backgroundLocation && (
                <Routes>
                    <Route path="/login" element={<LoginModal />} />
                    <Route path="/register" element={<SignupModal />} />
                </Routes>
            )}
        </>
    );
}
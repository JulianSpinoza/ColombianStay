import { Route, Routes } from "react-router-dom";
import ProfilePage from "./components/Profile/ProfilePage";
import UsersLayout from "./UsersLayout";
import PrivateRoute from "../../global/routes/PrivateRoute";
import UserReservationsDashboard from "./pages/UserReservationsDashboard/UserReservationsDashboard";

// Rutas del servicio Users

export default function UsersRoutes () {
    return (
        <Routes>
            <Route element={<UsersLayout/>}>
                {/* Rutas publicas*/ }
                
                {/* Rutas Privadas*/ }
                <Route element={<PrivateRoute/>}>
                    <Route path="my-profile" element={<ProfilePage/>}/>
                    <Route path="my-reservations" element={<UserReservationsDashboard/>} />
                </Route>
            </Route>
        </Routes>
    );
}
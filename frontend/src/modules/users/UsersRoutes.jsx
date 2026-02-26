import { Route, Routes } from "react-router-dom";
import ProfilePage from "./pages/ProfilePage/ProfilePage";
import PersonalUsersLayout from "./layout/PersonalUsersLayout";
import PrivateRoute from "../../global/routes/PrivateRoute";
import UserReservationsDashboard from "./pages/UserReservationsDashboard/UserReservationsDashboard";

// Rutas del servicio Users

export default function UsersRoutes () {
    return (
        <Routes>
            {/* Rutas publicas*/ }
                
            {/* Rutas Privadas*/ }
            <Route element={<PrivateRoute/>}>
                <Route element={<PersonalUsersLayout/>}>
                    <Route path="my-profile" element={<ProfilePage/>}/>
                    <Route path="my-reservations" element={<UserReservationsDashboard/>} />
                </Route>
            </Route>
        </Routes>
    );
}
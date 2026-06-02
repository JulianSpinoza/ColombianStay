import { Route, Routes } from "react-router-dom";
import ProfilePage from "./pages/ProfilePage/ProfilePage";
import PersonalUsersLayout from "./layout/PersonalUsersLayout";
import PrivateRoute from "../../global/routes/PrivateRoute";
import UserReservationsDashboard from "../booking/pages/UserReservationsDashboard/UserReservationsDashboard";
import HostRoute from "../../global/routes/HostRoute";
import HostReservationsDashboard from "../booking/pages/HostReservationsDashboard/HostReservationsDashboard";

import HistoricReservationsPage from "./pages/HistoricReservationsPage/HistoricReservationsPage";
import PublicInformationPage from "./pages/PublicInformationPage/PublicInformationPage";
import MyAccommodationsPage from "./pages/MyAccommodationsPage/MyAccommodationsPage";

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
                    <Route path="historic-reservations" element={<HistoricReservationsPage/>} />
                    <Route path="public-information" element={<PublicInformationPage/>} />
                    <Route path="my-accommodations" element={<MyAccommodationsPage/>} />
                </Route>
            </Route>
        </Routes>
    );
}
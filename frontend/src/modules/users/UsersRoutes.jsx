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
import OwnAccommodationsList from "../listings/pages/AccommodationDetailsPage/OwnAccommodationsList";
import OwnAccommodationDetail from "../listings/pages/AccommodationDetailsPage/OwnAccommodationDetail";


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
                    <Route element={<HostRoute/>}>
                        <Route path="host/reservations" element={<HostReservationsDashboard/>}/>
                        <Route path="historic-reservations" element={<HistoricReservationsPage/>} />
                        <Route path="public-information" element={<PublicInformationPage/>} />
                        <Route path="my-accommodations" element={<OwnAccommodationsList/>} /> 
                        <Route path= "my-accommodation/:id" element={<OwnAccommodationDetail />} />
                    </Route>
                </Route>
            </Route>
        </Routes>
    );
}
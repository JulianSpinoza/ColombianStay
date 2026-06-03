import { Route, Routes } from "react-router-dom";
import ProfilePage from "./pages/ProfilePage/ProfilePage";
import PersonalUsersLayout from "./layout/PersonalUsersLayout";
import PrivateRoute from "../../global/routes/PrivateRoute";
import UserReservationsDashboard from "../booking/pages/UserReservationsDashboard/UserReservationsDashboard";
import OwnAccommodationDetail from "../listings/pages/AccommodationDetailsPage/OwnAccommodationDetail";
import OwnAccommodationsList from "../listings/pages/AccommodationDetailsPage/OwnAccommodationsList";

// Rutas del servicio Users

export default function UsersRoutes () {
    return (
        <Routes>
            {/* Rutas publicas*/ }
                    
            {/* Rutas Privadas*/ }
                <Route element={<PrivateRoute/>}>
                <Route element={<PersonalUsersLayout/>}>
                     
                    {/* 2. RUTA DE LA LISTA COMPLETA */}
                    <Route path="my-accommodations" element={<OwnAccommodationsList />} /> 
                    <Route path= "my-accommodation/:id" element={<OwnAccommodationDetail />} />
                    <Route path="my-profile" element={<ProfilePage/>}/>
                    <Route path="my-reservations" element={<UserReservationsDashboard/>} />
                </Route>
            </Route>
        </Routes>
    );
}
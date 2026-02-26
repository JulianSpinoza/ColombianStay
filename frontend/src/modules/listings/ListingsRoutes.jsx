import { Route, Routes } from "react-router-dom";
import ListingsLayout from "./ListingsLayout";
import ListingsPage from "./pages/ListingsPage/ListingsPage";
import { ListingProvider } from "./contexts/ListingsContext";
import PropertyDetailsPage from "./pages/PropertyDetailsPage/PropertyDetailsPage";
import PrivateRoute from "../../global/routes/PrivateRoute";
import PublishListing from "./pages/PublishListingPage/PublishListingPage";
import ReservationConfirmation from "./pages/ReservationConfirmation/ReservationConfirmation";

// Rutas del servicio Listing

export default function ListingsRoutes () {
    return (
        <ListingProvider>
            <Routes>
                <Route element={<ListingsLayout />}>
                    {/* Rutas publicas*/ }
                    <Route index element={<ListingsPage />} />
                    <Route path="listings/:id" element={<PropertyDetailsPage />} />
                    {/* Rutas Privadas*/ }
                    <Route element={<PrivateRoute/>}>
                        <Route path="publish-listing" element={<PublishListing/>}/>
                        {/* Creo que esta es global */}
                        <Route path="reservation-confirmation" element={<ReservationConfirmation/>}/>
                    </Route>
                </Route>
            </Routes>
        </ListingProvider>
    );
}
import AccommodationDetailsPage from "./pages/AccommodationDetailsPage/AccommodationDetailsPage";
import { Route, Routes } from "react-router-dom";
import ListingsPage from "./pages/ListingsPage/ListingsPage";
import { ListingProvider } from "./contexts/ListingsContext";
import PropertyDetailsPage from "./pages/PropertyDetailsPage/PropertyDetailsPage";
import PrivateRoute from "../../global/routes/PrivateRoute";
import PublishListing from "./pages/PublishListingPage/PublishListingPage";
import ReservationConfirmation from "../booking/pages/ReservationConfirmation/ReservationConfirmation";
import ListingsLayout from "./layout/ListingsLayout";

// Rutas del servicio Listing

export default function ListingsRoutes () {
    return (
        <ListingProvider>
           <Routes>
                <Route element={<ListingsLayout />}>
                {/* Rutas públicas */}
                <Route index element={<ListingsPage />} />
                {/* NUEVA PÁGINA (HU41) */}
                {/* Se coloca 'accommodation' para que no choque con las otras*/}
                <Route path="accommodation/:id" element={<AccommodationDetailsPage />} />
                
                {/* Esta es la que ya estaba*/}
                <Route path="listings/:id" element={<PropertyDetailsPage />} />

                {/* Rutas Privadas */}
                <Route element={<PrivateRoute/>}>
                    <Route path="publish-listing" element={<PublishListing/>}/>
                    <Route path="reservation-confirmation" element={<ReservationConfirmation/>}/>
                </Route>
                </Route>
           </Routes>
        </ListingProvider>
    );
}

// Cuestionar el scope del ListingProvider
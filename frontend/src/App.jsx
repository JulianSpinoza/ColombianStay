import HomePage from "./global/pages/Home/HomePage.jsx";
import Login from "./modules/users/components/Login/Login.jsx";
import Signup from "./modules/users/components/Signup/Signup.jsx";
import BecomeHostPage from "./modules/listings/pages/BecomeHostPage/BecomeHostPage.jsx";
import HostRatingsPage from "./modules/listings/pages/HostRatingsPage/HostRatingsPage.jsx";
import PropertyManager from "./modules/listings/components/PropertyManager/PropertyManager.jsx";
import ProfilePage from "./modules/users/components/Profile/ProfilePage.jsx";
import PropertyDetailsPage from "./modules/listings/pages/PropertyDetailsPage/PropertyDetailsPage.jsx";
import ReservationConfirmation from "./modules/listings/pages/ReservationConfirmation/ReservationConfirmation.jsx";
import HostReservationsDashboard from "./modules/listings/pages/HostReservationsDashboard/HostReservationsDashboard.jsx";
import UserReservationsDashboard from "./modules/users/pages/UserReservationsDashboard/UserReservationsDashboard.jsx";
import "./App.css"
import { AuthProvider } from "./modules/users/contexts/AuthContext.jsx";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import PrivateRoute from "./global/routes/PrivateRoute.jsx";

function App() {
  return (
    <div className="w-full">
      <AuthProvider>
        <BrowserRouter>
          <Routes>

            {/* Rutas públicas */}
            <Route path="*" element={<HomePage />}>
              <Route path="login" element={<Login />} />
              <Route path="register" element={<Signup />} />
            </Route>
            
            {/* Rutas protegidas */}
            <Route
              path="/become-host"
              element={
                <PrivateRoute>
                  <BecomeHostPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/host-ratings"
              element={
                <PrivateRoute>
                  <HostRatingsPage />
                </PrivateRoute>
              }
            />
            {/* Rutas (temporarily public for testing) */}
            <Route path="/become-host-test" element={<BecomeHostPage />} />

            {/* Host-only availability/price manager (now public for tests) */}
            <Route path="/host/availability" element={<PropertyManager />} />

            {/* User profile (now public for tests) */}
            <Route path="/profile" element={<ProfilePage />} />

            {/* Listing detail (now public for tests) */}
            <Route path="/listings/:id" element={<PropertyDetailsPage />} />

            {/* Reservation confirmation (now public for tests) */}
            <Route path="/reservation-confirmation" element={<ReservationConfirmation />} />

            {/* Host reservations dashboard (now public for tests) */}
            <Route path="/host/reservations" element={<HostReservationsDashboard />} />

            {/* User reservations dashboard (now public for tests) */}
            <Route path="/my-reservations" element={<UserReservationsDashboard />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </div>
  );
}

export default App

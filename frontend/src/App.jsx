import HostRatingsPage from "./modules/listings/pages/HostRatingsPage/HostRatingsPage.jsx";
import PropertyManager from "./modules/listings/components/PropertyManager/PropertyManager.jsx";
import HostReservationsDashboard from "./modules/listings/pages/HostReservationsDashboard/HostReservationsDashboard.jsx";
import "./App.css"
import { BrowserRouter, Routes, Route } from "react-router-dom";
import PrivateRoute from "./global/routes/PrivateRoute.jsx";
import AppRouter from "./global/routes/AppRouter.jsx";

function App() {

  return (
    <div className="w-full">
      
        <BrowserRouter>
          <AppRouter/>
        
          <Routes>

            {/* Rutas protegidas */}
            <Route
              path="/host-ratings"
              element={

                  <HostRatingsPage />

              }
            />
            {/* Host-only availability/price manager (now public for tests) */}
            <Route path="/host/availability" element={
              <PropertyManager />
            }/>

            {/* Host reservations dashboard (now public for tests) */}
            <Route path="/host/reservations" element={<HostReservationsDashboard />} />

          </Routes>
        </BrowserRouter>
    </div>
  );
}

export default App

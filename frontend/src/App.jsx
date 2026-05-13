import HostRatingsPage from "./modules/ratings/pages/HostRatingsPage/HostRatingsPage.jsx";
import PropertyManager from "./modules/listings/components/PropertyManager/PropertyManager.jsx";
import "./App.css"
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppRouter from "./global/routes/AppRouter.jsx";
import HostReservationsDashboard from "./modules/booking/pages/HostReservationsDashboard/HostReservationsDashboard.jsx";

function App() {

  return (
    <div className="w-full">
      
        <BrowserRouter>
          <AppRouter/>
        
          <Routes>

            {/* Rutas protegidas  */}
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

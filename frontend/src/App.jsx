import HomePage from "./global/pages/Home/HomePage.jsx";
import Login from "./modules/users/components/Login/Login.jsx";
import Signup from "./modules/users/components/Signup/Signup.jsx";
import BecomeHostPage from "./modules/listings/pages/BecomeHostPage/BecomeHostPage.jsx";
import PropertyManager from "./modules/listings/components/PropertyManager/PropertyManager.jsx";
import ProfilePage from "./modules/users/components/Profile/ProfilePage.jsx";
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
            {/* Host-only availability/price manager */}
            <Route
              path="/host/availability"
              element={
                <PrivateRoute requireHost={true}>
                  <PropertyManager />
                </PrivateRoute>
              }
            />

            {/* User profile (authenticated only) */}
            <Route
              path="/profile"
              element={
                <PrivateRoute>
                  <ProfilePage />
                </PrivateRoute>
              }
            />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </div>
  );
}

export default App

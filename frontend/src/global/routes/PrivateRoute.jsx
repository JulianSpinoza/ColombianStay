import { Navigate, Outlet } from "react-router-dom";
import { useAuthContext } from "../../modules/users/contexts/AuthContext";

export default function PrivateRoute() {
  const { state } = useAuthContext();

  if (!state.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet/>;
}
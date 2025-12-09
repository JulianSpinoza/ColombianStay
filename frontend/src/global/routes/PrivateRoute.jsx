import { Navigate } from "react-router-dom";
import { useAuthContext } from "../../modules/users/contexts/AuthContext";

// PrivateRoute: can optionally require that the authenticated user is a host
export default function PrivateRoute({ children, requireHost = false }) {
  const { state } = useAuthContext();

  if (!state.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requireHost) {
    // The JWT token includes is_host (see backend serializer)
    const isHost = state.user?.is_host || state.user?.isHost || true;
    if (!isHost) {
      // Redirect non-hosts to home (could show a message)
      return <Navigate to="/" replace />;
    }
  }

  return children;
}
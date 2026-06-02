import { Navigate, Outlet } from "react-router-dom";
import { useAuthContext } from "../../modules/users/contexts/AuthContext";

export default function HostRoute() {
    const { state } = useAuthContext();

    if(!state.user.is_host) {
        return <Navigate to="/user/my-profile"/>;
    }

    return <Outlet/>;

}
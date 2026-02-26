import { Outlet } from "react-router-dom";
import UserSideBar from "../components/UserSideBar/UserSideBar";
import "./PersonalUsersLayout.css"
import Navbar from "../../../global/components/Navbar/Navbar";

export default function PersonalUsersLayout () {
    return (
        <div className="general-layout">
            <Navbar/>
            <div className="main-layout">
                <UserSideBar/>
                <main>
                    <Outlet/>
                </main>
            </div>
        </div>
    );
}
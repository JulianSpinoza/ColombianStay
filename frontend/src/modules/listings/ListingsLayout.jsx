import { Outlet } from "react-router-dom";
import Navbar from "../../global/components/Navbar/Navbar";

export default function ListingsLayout () {
    return (
        <>
            <Navbar />

            {/*<CategoryBar />*/}

            {/* Main Content */}
            <main>
                <Outlet/>
            </main>
        </>
    );
}
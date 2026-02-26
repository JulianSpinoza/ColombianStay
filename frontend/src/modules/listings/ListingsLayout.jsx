import { Outlet, useLocation } from "react-router-dom";
import Navbar from "../../global/components/Navbar/Navbar";
import MainListingsSearch from "./components/MainListingsSearch/MainListingsSearch";

export default function ListingsLayout () {

    const location = useLocation()

    const inTheMainListings = location.pathname == "/" || location.pathname == "/listings/*";

    return (
        <>
            <Navbar>
                {(inTheMainListings) && (
                    <MainListingsSearch/>
                )}  
            </Navbar>

            {/*<CategoryBar />*/}

            {/* Main Content */}
            <main>
                <Outlet/>
            </main>
        </>

        
    );
}
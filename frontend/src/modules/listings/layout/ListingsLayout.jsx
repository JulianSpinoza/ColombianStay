import { Outlet, useLocation } from "react-router-dom";
import Navbar from "../../../global/components/Navbar/Navbar";
import MainListingsSearch from "../components/MainListingsSearch/MainListingsSearch";

export default function ListingsLayout () {

    const location = useLocation()

    const inTheMainListings = location.pathname == "/";

    return (
        <>
            <Navbar>
                <MainListingsSearch data_testid="search-listing"/>
            </Navbar>

            {/*<CategoryBar />*/}

            {/* Main Content */}
            <main>
                <Outlet/>
            </main>
        </>

        
    );
}
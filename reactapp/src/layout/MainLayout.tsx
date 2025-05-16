import Header from "../components/Header";
import Footer from "../components/Footer";
import Nominate from "../pages/Nominate";
import { Outlet } from 'react-router-dom';
import Update from "../pages/Update";

const MainLayout = () => {
   return ( 
    <>
        <div className="bg-[#333333] px-4">
            <Header />
            <Nominate/>
            <Update/>
            <main>
                <Outlet />
            </main>
            <Footer />
        </div>

    </>
   )
}


export default MainLayout;
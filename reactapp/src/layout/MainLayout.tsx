import Header from "../components/Header";
import Footer from "../components/Footer";
import Nominate from "../pages/Nominate";
import { Outlet, useLocation } from 'react-router-dom';
// import Update from "../pages/Update";
import Rank from "../pages/Rank";

const MainLayout = () => {
    // hook useLocation() để lấy thông tin URL hiện tại
    const location = useLocation();  
    // kiểm tra xem URL có bắt đầu bằng '/film/' hay không  
    const isFilmDetail = location.pathname.startsWith('/film/');
   return ( 
    <>
        <div className="bg-[#333333] px-4">
            <Header />
            {!isFilmDetail && (
                <>
                    <Nominate />
                    {/* <Update /> */}
                    <Rank/>
                </>
            )}
            <main>
                <Outlet />
            </main>
            <Footer />
        </div>

    </>
   )
}


export default MainLayout;
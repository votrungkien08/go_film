import Header from "../components/Header";
import Footer from "../components/Footer";
import Nominate from "../pages/Nominate";
import { Outlet, useLocation } from 'react-router-dom';
import Update from "../pages/Update";
import Rank from "../pages/Rank";
import Chatbot from '../Chatbot';
import AdvancedFilter from "../components/ui/AdvancedFilter";

const MainLayout = () => {
    // hook useLocation() để lấy thông tin URL hiện tại
    const location = useLocation();
    // kiểm tra xem URL có bắt đầu bằng '/film/' hay không  
    const isFilmDetail = location.pathname.startsWith('/film/');
    // kiểm tra xem có đang ở trang danh sách phim hay không
    const isFilmList = location.pathname === '/films';

    return (
        <>
            <div className=" px-4">
                <Header />
                <div className="w-full flex justify-end items-center mt-4">
                    <div className="min-w-[280px] max-w-[400px] w-full">
                        <AdvancedFilter />
                    </div>
                </div>

                {!isFilmDetail && !isFilmList && (
                    <div className="-mt-2">
                        <Nominate />
                        <Update />
                        <Rank />
                    </div>
                )}

                <main>
                    <Outlet />
                </main>
                <Footer />
                <Chatbot />
            </div>
        </>
    )
}

export default MainLayout;
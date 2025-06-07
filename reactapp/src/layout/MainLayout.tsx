import Header from "../components/Header";
import Footer from "../components/Footer";
import Nominate from "../pages/Nominate";
import { Outlet, useLocation } from 'react-router-dom';
import Update from "../pages/Update";
import Rank from "../pages/Rank";
import Chatbot from '../Chatbot';

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
                {!isFilmDetail && !isFilmList && (
                    <>
                        <Nominate />
                        <Update />
                        <Rank />
                    </>
                )}
                <main>
                    <Outlet />
                </main>
                <Footer />
                <Chatbot />
            </div>

        </>
    )

    //    return (
    //         <>
    //             <div className="bg-[#333333] px-4">
    //                 <Header />
    //                 {/* Chỉ hiển thị Nominate và Rank khi không phải trang chi tiết phim và không phải trang danh sách phim */}
    //                 {!isFilmDetail && !isFilmList && (
    //                     <>
    //                         <Nominate />
    //                         {/* <Update /> */}
    //                         <Rank />
    //                     </>
    //                 )}
    //                 <main>
    //                     <Outlet />
    //                 </main>
    //                 <Footer />
    //             </div>
    //         </>
    //     )
}

export default MainLayout;
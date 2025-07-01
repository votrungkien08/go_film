// import Header from "../components/Header";
// import Footer from "../components/Footer";
// import Nominate from "../pages/Nominate";
// import { Outlet, useLocation } from 'react-router-dom';
// import Update from "../pages/Update";
// import Rank from "../pages/Rank";

// const MainLayout = () => {
//     // hook useLocation() để lấy thông tin URL hiện tại
//     const location = useLocation();
//     // kiểm tra xem URL có bắt đầu bằng '/film/' hay không  
//     const isFilmDetail = location.pathname.startsWith('/film/');
//     // kiểm tra xem có đang ở trang danh sách phim hay không
//     const isFilmList = location.pathname === '/films';
//     const isHistories = location.pathname === '/histories';

//    return ( 
//     <>
//         <div className=" px-4">
//             <Header />
//             {!isFilmDetail && !isFilmList && !isHistories &&(
//                 <>
//                     <Nominate />
//                     <Update />
//                     <Rank/>
//                 </>
//             )}
//             <main>
//                 <Outlet />
//             </main>
//             <Footer />
//         </div>

//     </>
//    )

// //    return (
// //         <>
// //             <div className="bg-[#333333] px-4">
// //                 <Header />
// //                 {/* Chỉ hiển thị Nominate và Rank khi không phải trang chi tiết phim và không phải trang danh sách phim */}
// //                 {!isFilmDetail && !isFilmList && (
// //                     <>
// //                         <Nominate />
// //                         {/* <Update /> */}
// //                         <Rank />
// //                     </>
// //                 )}
// //                 <main>
// //                     <Outlet />
// //                 </main>
// //                 <Footer />
// //             </div>
// //         </>
// //     )
// }

// export default MainLayout;


// import { motion, scale, useInView } from 'framer-motion';
// import Header from "../components/Header";
// import Footer from "../components/Footer";
// import Nominate from "../pages/Nominate";
// import { Outlet, useLocation } from 'react-router-dom';
// import Update from "../pages/Update";
// import Rank from "../pages/Rank";
// import { useRef } from 'react';

// const MainLayout = () => {
//   const location = useLocation();
//   const isFilmDetail = location.pathname.startsWith('/film/');
//   const isFilmList = location.pathname === '/films';
//   const isHistories = location.pathname === '/histories';

//   // Variants cho từng thành phần
//   const nominateVariants = {
//     hidden: { opacity: 0, x: -100, scale: 0.9 },
//     visible: { opacity: 1, x: 0, scale: 1, transition: { duration: 0.6,ease: 'easeOut'  } },
//   };
//     const updatedVariants = {
//     hidden: { opacity: 0, x: 100, scale: 0.9 },
//     visible: { opacity: 1, x: 0, scale: 1, transition: { duration: 0.6,ease: 'easeOut'  } },
//   };

//   const rankVariants = {
//     hidden: { opacity: 0, y: 100, scale: 0.9 },
//     visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.6,ease: 'easeOut'  } },
//   };

//   const childVariants = {
//     hidden: { opacity: 0, y: 20, scale: 0.9 },
//     visible: { opacity: 1, y: 0, scale: 1,transition: { duration: 0.6,ease: 'easeOut'  } },
//   };

//   // Refs cho từng thành phần
//   const nominateRef = useRef(null);
//   const rankRef = useRef(null);
//   const updateRef = useRef(null);
//   const outletRef = useRef(null);
//   const footerRef = useRef(null);

//   // InView cho từng thành phần
//   const isNominateInView = useInView(nominateRef, { once: false });
//   const isRankInView = useInView(rankRef, { once: false });
//   const isUpdateInView = useInView(updateRef, { once: false });
//   const isOutletInView = useInView(outletRef, { once: false });
//   const isFooterInView = useInView(footerRef, { once: false });

//   return (
//     <div className="px-4 overflow-hidden">

//         <Header />
//         {!isFilmDetail && !isFilmList && !isHistories && (
//         <>
//           <motion.div
//             ref={nominateRef}
//             variants={nominateVariants}
//             initial="hidden"
//             animate={isNominateInView ? "visible" : "hidden"}
//           >
//             <Nominate />
//           </motion.div>
//           <motion.div
//             ref={updateRef}
//             variants={updatedVariants}
//             initial="hidden"
//             animate={isUpdateInView ? "visible" : "hidden"}
//           >
//             <Update />
//           </motion.div>
//           <motion.div
//             ref={rankRef}
//             variants={rankVariants}
//             initial="hidden"
//             animate={isRankInView ? "visible" : "hidden"}
//           >
//             <Rank />
//           </motion.div>
//         </>
//         )}
//         <main>
//             <motion.div
//             ref={outletRef}
//             variants={childVariants}
//             initial="hidden"
//             animate={isOutletInView ? "visible" : "hidden"}
//             >
//             <Outlet />
//             </motion.div>
//         </main>
//         <motion.div
//         ref={footerRef}
//         variants={childVariants}
//         initial="hidden"
//         animate={isFooterInView ? "visible" : "hidden"}
//         >
//             <Footer />
//         </motion.div>
//     </div>
//   );
// };

// export default MainLayout;

import { motion, useInView } from 'framer-motion';
import Header from "../components/Header";
import Footer from "../components/Footer";
import Nominate from "../pages/Nominate";
import { Outlet, useLocation } from 'react-router-dom';
import Update from "../pages/Update";
import Rank from "../pages/Rank";
import { useRef, useState, useEffect, use } from 'react';
import LoadingOverlay from "../components/LoadingOverlay";
import ParticleRing from "../components/ParticleRing";
import Chatbot from '../Chatbot';
import AdvancedFilter from "../components/ui/AdvancedFilter";

const MainLayout = () => {
  const location = useLocation();
  const isFilmDetail = location.pathname.startsWith('/film/');
  const isFilmList = location.pathname === '/films';
  const isHistories = location.pathname === '/histories';
  const isFavorites = location.pathname === '/favorites';
    const location = useLocation();
    const isFilmDetail = location.pathname.startsWith('/film/');
    const isFilmList = location.pathname === '/films';
    const isHistories = location.pathname === '/histories';


    const [isLoading, setIsLoading] = useState(true);

    const nominateVariants = {
        hidden: { opacity: 0, x: -100, scale: 0.9 },
        visible: { opacity: 1, x: 0, scale: 1, transition: { duration: 0.6, ease: 'easeOut' } },
    };
    const updatedVariants = {
        hidden: { opacity: 0, x: 100, scale: 0.9 },
        visible: { opacity: 1, x: 0, scale: 1, transition: { duration: 0.6, ease: 'easeOut' } },
    };
    const rankVariants = {
        hidden: { opacity: 0, y: 100, scale: 0.9 },
        visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.6, ease: 'easeOut' } },
    };
    const childVariants = {
        hidden: { opacity: 0, y: 20, scale: 0.9 },
        visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.6, ease: 'easeOut' } },
    };

    const nominateRef = useRef(null);
    const rankRef = useRef(null);
    const updateRef = useRef(null);
    const outletRef = useRef(null);
    const footerRef = useRef(null);

    return (
        <div className="relative min-h-screen flex flex-col">

            {isLoading && <LoadingOverlay onLoadingComplete={() => setIsLoading(false)} />}

            {!isLoading && (
                <>
                    {/* <div className="absolute top-0 left-0 w-full h-screen z-0 pointer-events-none">
            <ParticleRing />
          </div> */}
          <div className="px-4  overflow-hidden">
            <Header />
            <div className="w-full flex justify-end items-center mt-4">
                <div className="min-w-[280px] max-w-[400px] w-full">
                    <AdvancedFilter />
                </div>
            </div>
            {!isFilmDetail && !isFilmList && !isHistories && !isFavorites &&(
              <>
                <motion.div
                  ref={nominateRef}
                  variants={nominateVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: false, amount: 0.3 }} 
                >
                  <Nominate />
                </motion.div>
                <motion.div
                  ref={updateRef}
                  variants={updatedVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: false, amount: 0.3 }} 
                >
                  <Update />
                </motion.div>
                <motion.div
                  ref={rankRef}
                  variants={rankVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: false, amount: 0.3 }} 
                >
                  <Rank />
                </motion.div>
              </>
            )}
            <main className="flex-1">
              <motion.div
                  ref={outletRef}
                  variants={childVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: false, amount: 0.3 }} 
              >
                <Outlet />
              </motion.div>
            </main>
            <motion.div
                  ref={footerRef}
                  variants={childVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: false, amount: 0.3 }} 
            >
              <Footer />
              <Chatbot />

            </motion.div>
          </div>
        </>
                    

            )}
        </div>
    );
};


export default MainLayout;
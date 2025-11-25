import { motion } from "framer-motion";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Outlet, useLocation } from "react-router-dom";
import { useRef } from "react";
import AdvancedFilter from "@/components/ui/AdvancedFilter";
import { lazy, Suspense } from "react";
const Rank = lazy(() => import("@/pages/Rank"));
const Update = lazy(() => import("@/pages/Update"));
const Nominate = lazy(() => import("@/pages/Nominate"));
const Theater = lazy(() => import("@/pages/Theater"));
const MainLayout = () => {
    const location = useLocation();
    const isInfomationFilm = location.pathname.startsWith("/film/");
    const isDetailFilm = location.pathname.startsWith("/watch-film/");
    const isFilmList =
        location.pathname === "/filter";
        
    const isHistories = location.pathname === "/histories";
    const isFavorites = location.pathname === "/favorites";

    const nominateVariants = {
        hidden: { opacity: 0, x: -100, scale: 0.9 },
        visible: {
            opacity: 1,
            x: 0,
            scale: 1,
            transition: { duration: 0.6, ease: "easeOut" },
        },
    };
    const updatedVariants = {
        hidden: { opacity: 0, x: 100, scale: 0.9 },
        visible: {
            opacity: 1,
            x: 0,
            scale: 1,
            transition: { duration: 0.6, ease: "easeOut" },
        },
    };
    const rankVariants = {
        hidden: { opacity: 0, y: 100, scale: 0.9 },
        visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: { duration: 0.6, ease: "easeOut" },
        },
    };
    const nominateRef = useRef(null);
    const rankRef = useRef(null);
    const updateRef = useRef(null);

    return (
        <div className="relative min-h-screen flex flex-col">
            <>
                <div className="px-4 overflow-hidden">
                    <Header />
                    <div className="w-full flex justify-end items-center mt-4">
                        <div className="min-w-[280px] max-w-[400px] w-full">
                            <AdvancedFilter />
                        </div>
                    </div>
                    {!isDetailFilm &&
                        !isInfomationFilm &&
                        !isFilmList &&
                        !isHistories &&
                        !isFavorites && (
                            <>
                                <motion.div
                                    ref={nominateRef}
                                    variants={nominateVariants}
                                    initial="hidden"
                                    whileInView="visible"
                                    viewport={{ once: false, amount: 0.3 }}
                                >
                                    <Suspense fallback={<div>Loading...</div>}>
                                        <Nominate />
                                    </Suspense>
                                </motion.div>
                                <motion.div
                                    ref={updateRef}
                                    variants={updatedVariants}
                                    initial="hidden"
                                    whileInView="visible"
                                    viewport={{ once: false, amount: 0.3 }}
                                >
                                    <Suspense fallback={<div>Loading...</div>}>
                                        <Update />
                                    </Suspense>
                                </motion.div>
                                <motion.div
                                    ref={rankRef}
                                    variants={rankVariants}
                                    initial="hidden"
                                    whileInView="visible"
                                    viewport={{ once: false, amount: 0.3 }}
                                >
                                    <Suspense fallback={<div>Loading...</div>}>
                                        <Rank />
                                    </Suspense>
                                </motion.div>
                                <motion.div
                                    ref={rankRef}
                                    variants={rankVariants}
                                    initial="hidden"
                                    whileInView="visible"
                                    viewport={{ once: false, amount: 0.3 }}
                                >
                                    <Suspense fallback={<div>Loading...</div>}>
                                        <Theater />
                                    </Suspense>
                                </motion.div>
                            </>
                        )}
                    <main className="flex-1">
                        <Outlet />
                    </main>
                    <Footer />
                </div>
            </>
        </div>
    );
};

export default MainLayout;

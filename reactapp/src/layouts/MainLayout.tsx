

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
            {!isFilmDetail && !isFilmList && !isHistories && !isFavorites && (
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


            </motion.div>
            <Chatbot />
          </div>
        </>
      )}
    </div>
  );
};


export default MainLayout;

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { motion, scale } from 'framer-motion';
import {useFavoriteList } from '../hooks/useFavoriteList';
import { useNavigate } from 'react-router-dom';
// Mở rộng interface để chứa thông tin phim

const Favorites = () => {
    const {favoriteFilms, loading} = useFavoriteList();
    console.log("favoriteFilms",favoriteFilms);
    const variants = {
        hidden:{ opacity:0,y:100, scale:0.8, transition: { duration: 0.5 } },
        visible: {opacity:1,y:0, scale:1, transition: { duration: 0.5 } },
    }

    if (loading) {
        return (
            <div className="flex flex-col py-60 items-center justify-center ">
                <h1 className="text-4xl font-bold mb-4">Phim yêu thích</h1>
                <p className="text-lg">Đang tải...</p>
            </div>
        );
    }

    if (!favoriteFilms.length) {
        return (
            <div className="flex flex-col py-60 items-center justify-center ">
                <h1 className="text-4xl font-bold mb-4">Phim yêu thích</h1>
                <p className="text-lg">Bạn chưa có phim yêu thích nào.</p>
            </div>
        );
    }

    return ( 
        <motion.div 
            variants={variants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="grid grid-cols-12 gap-4 min-h-[1000px] py-20">
            <div className='col-span-1'></div>
            <div className='col-span-10'>
                <h1 className="text-4xl font-bold mb-8">Phim yêu thích</h1>
                <div className="grid grid-cols-10 gap-4">
                    {favoriteFilms.map((favorite) => (
                        <motion.div whileHover={{ scale: 1.2 }}  whileTap={{ scale: 0.8 }} key={favorite.id} className="col-span-2 p-4 bg-neutral-900 rounded-lg shadow-md border border-gray-600 hover:shadow-lg transition-shadow" >
                            <div className="group w-40 h-60 relative">
                                {favorite.thumb && (
                                    <img
                                        src={favorite.thumb}
                                        alt={favorite.title_film}
                                        className="w-full h-full object-cover rounded-lg"
                                    />
                                )}
                                <a
                                    href={`/film/${favorite.slug}`}
                                    className="left-0 top-0 absolute backdrop-blur-lg w-full h-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center rounded-lg cursor-pointer"
                                >
                                    <h3 className="text-base font-semibold ">
                                        {favorite?.title_film || 'Tên phim không xác định'}
                                    </h3>
                                </a>


                            </div>
                        </motion.div>
                    ))}
                    
                </div>    
            </div> 
            <div className='col-span-1'></div>

        </motion.div>
    );
};

export default Favorites;

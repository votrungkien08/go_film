// import React, { useState } from 'react';
// import { toast } from 'sonner';
import { useFavorite } from '../../hooks/useFavorite';
import {useAuth} from '../../hooks/useAuth'
import { Skeleton } from "../../components/ui/skeleton";
import { Link } from 'react-router-dom';
import { X } from 'lucide-react';
const Favorites = () => {
    const isLogin = useAuth();
    const { isFavorite, likeCount, handleToggleFavorite,removeFavoriteMutation,favoriteList,isLoadingFavoriteList } = useFavorite(undefined,isLogin);
    console.log("fetchFavoriteList list:", favoriteList);

    if (!isLogin) {
        return (
        <div className="flex flex-col py-60 items-center justify-center">
            <h1 className="text-4xl font-bold mb-4">Phim yêu thích</h1>
            <p className="text-lg">Vui lòng đăng nhập để xem danh sách phim yêu thích.</p>
        </div>
        );
    }
    if (isLoadingFavoriteList) {
        return (
            <div className='grid grid-cols-12 gap-4 min-h-[1000px] py-20 px-4'>
                <div className="col-span-1"></div>
                <div className="col-span-10">
                    <h1 className="text-4xl font-bold mb-8">Phim yêu thích</h1>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                            {Array.from({ length: 25 }).map((_, i) => (
                            <div key={i}
                                className="w-full h-64"
                            >
                                    <Skeleton className="w-full h-full  p-4 rounded-lg" />
                            </div>
                        ))}

                    </div>
                </div>
                <div className="col-span-1"></div>
                
            </div>


        )
    }

    if (!favoriteList.length) {
        return (
            
            <div className="flex flex-col py-60 items-center justify-center">
                <h1 className="text-4xl font-bold mb-4">Phim yêu thích</h1>
                <p className="text-lg">Bạn chưa có phim yêu thích nào.</p>
            </div>
        );
    }
    return (
        <div
            className="grid grid-cols-12 gap-4 min-h-[1000px] py-20 px-4"
        >
            <div className="col-span-1"></div>
            <div className="col-span-10">
                <h1 className="text-4xl font-bold mb-8">Phim yêu thích</h1>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                        
                        {favoriteList.map((favorite) => (
                        <div
                            key={favorite.id}
                            className="relative p-4 bg-neutral-800 rounded-xl shadow-lg border border-gray-700 hover:shadow-xl transition-all duration-300"
                        >
                            <div className="relative w-full h-64 group">
                                {favorite.thumb && (
                                    (
                                    <img
                                        src={favorite.thumb}
                                        alt={favorite.title_film}
                                        className="w-full h-full object-cover rounded-lg"
                                    />
                                )
                                ) }

                                {/* Hover overlay - excluding the delete button area */}
                                <Link
                                    to={`/film/${favorite.slug}`}
                                    className="absolute inset-0 bg-black bg-opacity-60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center rounded-lg"
                                    style={{ zIndex: 1 }}
                                >
                                    <h3 className="text-lg font-semibold text-white text-center px-2">
                                        {favorite.title_film || 'Tên phim không xác định'}
                                    </h3>
                                </Link>

                                {/* Delete button with higher z-index to stay on top */}
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                            e.stopPropagation();
                                        removeFavoriteMutation.mutate(favorite.id);
                                        // removeFavorite(favorite.id);
                                    }}
                                    // disabled={removing === favorite.id}
                                    className={`absolute top-2 right-2 p-1.5 rounded-full transition-colors duration-200
                                        ? 'bg-gray-600 cursor-not-allowed'
                                        : 'bg-gray-900/80 hover:bg-red-600 backdrop-blur-sm'
                                        } text-white shadow-lg cursor-pointer`}
                                    style={{ zIndex: 10 }}
                                    title="Xóa khỏi yêu thích"
                                    >
                                        <X className='w-3 h-3'/>

                                </button>
                            </div>
                        </div>
                    ))}
                        

                           
                    
                </div>
            </div>
            <div className="col-span-1"></div>
        </div>
    );
};

export default Favorites;
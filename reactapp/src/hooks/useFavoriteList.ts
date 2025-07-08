import { useFavorite } from './useFavorite';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { type Film } from '../types/index';

export const useFavoriteList =  () => {
    const [favoriteFilms,setFavoriteFilms] = useState<Film[]>([]);
     const [loading, setLoading] = useState<boolean>(true);
    useEffect(() => {
        const fetchFavorites = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get('http://localhost:8000/api/favorites', {
                    headers: {
                    Authorization: `Bearer ${token}`,
                    }
                })
                setFavoriteFilms(response.data.favorites)
            }catch(err: any) {
            console.error('Lỗi khi fetch film:', err.response?.data || err.message);
            } finally {
            setLoading(false);
            }
        }

        fetchFavorites()
    },[])

    return { favoriteFilms, loading };
}
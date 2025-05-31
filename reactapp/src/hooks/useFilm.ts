// src/hooks/useFilmData.ts
import { useEffect, useState } from 'react';
import axios from 'axios';
import {Film,Episode} from '../types';

interface FilmData {
  film: Film | null;
  error: string;
  selectedEpisode: Episode | null;
  setSelectedEpisode: (episode: Episode | null) => void;
}

export const useFilmData = (slug: string): FilmData => {
  const [film, setFilm] = useState<Film | null>(null);
  const [error, setError] = useState('');
  const [selectedEpisode, setSelectedEpisode] = useState<Episode | null>(null);
    // Lấy chi tiết phim

  useEffect(() => {
    const fetchFilm = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/api/film/${slug}`);
        setFilm(response.data);
        if (response.data.film_episodes?.length > 0) {
          // console.log('hehehe',response.data.film_episodes[0]);
          setSelectedEpisode(response.data.film_episodes[0]);
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Không tìm thấy phim hoặc lỗi server.');
      }
    };
    fetchFilm();
  }, [slug]);

  return { film, error, selectedEpisode, setSelectedEpisode };
};
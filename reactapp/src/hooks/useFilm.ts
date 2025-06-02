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

export const useFilmData = (slug: string, episodeParam?: string): FilmData => {
  const [film, setFilm] = useState<Film | null>(null);
  const [error, setError] = useState('');
  const [selectedEpisode, setSelectedEpisode] = useState<Episode | null>(null);
    // Lấy chi tiết phim
  // Sửa: Hàm để trích xuất số tập từ episode_title
    const getEpisodeNumber = (number: string): number => {
        const match = number.match(/\d+/); // Trích xuất số từ chuỗi, ví dụ "12" -> 12
        return match ? parseInt(match[0]) : 0;
    };
  useEffect(() => {
    const fetchFilm = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/api/film/${slug}`);
        console.log(`Film data for slug "${slug}":`, response.data); // Debug
        setFilm(response.data);
        if (response.data.film_episodes?.length > 0) {
          console.log('episodeParam', episodeParam); // Debug
          // console.log('hehehe',response.data.film_episodes[0]);
          if (episodeParam) {
            const matchedEpisode = response.data.film_episodes.find((ep: Episode) =>
                getEpisodeNumber(ep.episode_title) === getEpisodeNumber(episodeParam));
            console.log('Matched episode in useFilmData:', matchedEpisode); // Debug
            setSelectedEpisode(matchedEpisode || response.data.film_episodes[0]); // Fallback: tập đầu tiên
          } else {
            console.log('No episodeParam, selecting first episode:', response.data.film_episodes[0]); // Debug
            setSelectedEpisode(response.data.film_episodes[0]); // Mặc định chọn tập đầu tiên
          }
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Không tìm thấy phim hoặc lỗi server.');
      }
    };
    fetchFilm();
  }, [slug,episodeParam]);

  return { film, error, selectedEpisode, setSelectedEpisode };
};
import { useState, useCallback } from 'react';
import axios, { AxiosError } from 'axios';

// Định nghĩa các interface
interface Episode {
  episode_number: string;
  episode_title: string;
  episode_url: string;
  duration: string;
}

interface Year {
  id: number;
  release_year: number;
}

interface Country {
  id: number;
  country_name: string;
}

interface Genre {
  id: number;
  genre_name: string;
}

interface Film {
  id: number;
  slug: string;
  title_film: string;
  thumb: string;
  trailer: string | null;
  film_type: boolean; // true: Phim lẻ, false: Phim bộ
  year: Year | null;
  country: Country | null;
  genres: Genre[];
  actor: string;
  director: string;
  content: string;
  view: number;
  is_premium: boolean;
  point_required: number | null;
  film_episodes: Episode[];
}

interface FilmData {
  id?: number;
  slug: string;
  title_film: string;
  thumb: string;
  trailer: string | null;
  film_type: number; // 0: Phim lẻ, 1: Phim bộ
  year_id: string;
  country_id: string;
  actor: string;
  director: string;
  content: string;
  view: number;
  genre_id: number[];
  is_premium: boolean;
  point_required: string;
}

const useFilmControl = (
  initialFilms: Film[],
  years: Year[],
  countries: Country[],
  genres: Genre[]
) => {
  // States
  const [films, setFilms] = useState<Film[]>(initialFilms);
  const [showAddFilmForm, setShowAddFilmForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [filmData, setFilmData] = useState<FilmData>({
    slug: '',
    title_film: '',
    thumb: '',
    trailer: '',
    film_type: 0,
    year_id: '',
    country_id: '',
    actor: '',
    director: '',
    content: '',
    view: 0,
    genre_id: [],
    is_premium: false,
    point_required: '',
  });
  const [episodes, setEpisodes] = useState<Episode[]>([
    { episode_number: '', episode_title: '', episode_url: '', duration: '' },
  ]);
  const [trailerFile, setTrailerFile] = useState<File | null>(null);
  const [episodeFiles, setEpisodeFiles] = useState<{ [key: number]: File }>({});

  
  // Handlers
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setFilmData((prev) => ({ ...prev, [name]: value }));
    },
    []
  );

  const toggleGenre = useCallback((genreId: number) => {
    setFilmData((prev) => ({
      ...prev,
      genre_id: prev.genre_id.includes(genreId)
        ? prev.genre_id.filter((id) => id !== genreId)
        : [...prev.genre_id, genreId],
    }));
  }, []);

  const handleEpisodeChange = useCallback(
    // (index: number, field: keyof Episode, value: string | number) => {
    //   setEpisodes((prev) =>
    //     prev.map((ep, i) => (i === index ? { ...ep, [field]: value } : ep))
    //   );
    // },
    // []
    (index: number, field: keyof Episode, value: string | number) => {
      setEpisodes((prev) =>
        prev.map((ep, i) => (i === index ? { ...ep, [field]: value.toString() } : ep)) // Đảm bảo value là string
      );
    },
    []
  );

  const addEpisode = useCallback(() => {
    setEpisodes((prev) => [
      ...prev,
      { episode_number: '' , episode_title: '', episode_url: '', duration: '' },
    ]);
  }, []);

  const removeEpisode = useCallback((index: number) => {
    setEpisodes((prev) => {
      const newEpisodes = prev.filter((_, i) => i !== index);
      if (filmData.film_type === 0 && newEpisodes.length === 0) {
        return [{ episode_number: '', episode_title: '', episode_url: '', duration: '' }];
      }
      return newEpisodes;
    });
    setEpisodeFiles((prev) => {
      const newFiles = { ...prev };
      delete newFiles[index];
      return newFiles;
    });
  }, [filmData.film_type]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setFormError('');
      setFormSuccess('');
      setIsSubmitting(true);

      // Validation
      if (!filmData.title_film || filmData.title_film.trim() === '') {
        setFormError('Vui lòng nhập tiêu đề phim.');
        setIsSubmitting(false);
        return;
      }
      if (!filmData.year_id || isNaN(Number(filmData.year_id))) {
        setFormError('Vui lòng chọn năm phát hành hợp lệ.');
        setIsSubmitting(false);
        return;
      }
      if (!filmData.country_id || isNaN(Number(filmData.country_id))) {
        setFormError('Vui lòng chọn quốc gia hợp lệ.');
        setIsSubmitting(false);
        return;
      }
      if (filmData.genre_id.length === 0) {
        setFormError('Vui lòng chọn ít nhất một thể loại.');
        setIsSubmitting(false);
        return;
      }
      if (filmData.film_type === 1 && episodes.length === 0) {
        setFormError('Phim bộ cần ít nhất một tập.');
        setIsSubmitting(false);
        return;
      }
      // if (
      //   filmData.film_type === 1 &&
      //   episodes.some((ep) => !ep.episode_number || isNaN(Number(ep.episode_number)))
      // ) {
      //   setFormError('Tất cả tập phim bộ cần số tập hợp lệ.');
      //   setIsSubmitting(false);
      //   return;
      // }
      // if (filmData.film_type === 1) {
      //   const invalidEpisodes = episodes.filter((ep) => {
      //     const numberPart = ep.episode_number.replace('Tập', ''); // Lấy phần số
      //     return !ep.episode_number || isNaN(Number(numberPart)) || !ep.episode_title || !ep.duration;
      //   });
      //   if (invalidEpisodes.length > 0) {
      //     setFormError('Tất cả tập phim bộ cần số tập hợp lệ (phải chứa số và định dạng như "12 Tập").');
      //     setIsSubmitting(false);
      //     return;
      //   }
      // }
      if (filmData.is_premium && (!filmData.point_required || Number(filmData.point_required) < 0)) {
        setFormError('Vui lòng nhập số điểm yêu cầu hợp lệ cho phim premium.');
        setIsSubmitting(false);
        return;
      }

      // Prepare FormData
      const formDataToSend = new FormData();
      formDataToSend.append('title_film', filmData.title_film.trim());
      formDataToSend.append('thumb', filmData.thumb || '');
      formDataToSend.append('film_type', filmData.film_type.toString());
      formDataToSend.append('year_id', filmData.year_id.toString());
      formDataToSend.append('country_id', filmData.country_id.toString());
      formDataToSend.append('actor', filmData.actor || '');
      formDataToSend.append('director', filmData.director || '');
      formDataToSend.append('content', filmData.content || '');
      formDataToSend.append('view', filmData.view.toString());
      formDataToSend.append('is_premium', filmData.is_premium ? '1' : '0');
      if (filmData.is_premium) {
        formDataToSend.append('point_required', filmData.point_required?.toString() || '0');
      }
      filmData.genre_id.forEach((genreId) => {
        formDataToSend.append('genre_id[]', genreId.toString());
      });

      if (trailerFile) {
        formDataToSend.append('trailer_video', trailerFile);
      } else if (filmData.trailer) {
        formDataToSend.append('trailer', filmData.trailer);
      } else {
        setFormError('Vui lòng chọn trailer cho phim.');
        setIsSubmitting(false);
        return;
      }

      // Handle episodes
      if (filmData.film_type === 0 && episodes.length > 0) {
        const ep = episodes[0];
        formDataToSend.append(`film_episodes[0][episode_number]`, ep.episode_number||'');
        formDataToSend.append(`film_episodes[0][episode_title]`, ep.episode_title || '');
        formDataToSend.append(`film_episodes[0][duration]`, ep.duration || '');
        if (episodeFiles[0]) {
          formDataToSend.append(`film_episodes[0][video]`, episodeFiles[0]);
        } else if (ep.episode_url && ep.episode_url.trim() !== '') {
          formDataToSend.append(`film_episodes[0][episode_url]`, ep.episode_url.trim());
        } else {
          setFormError('Vui lòng chọn video hoặc nhập URL cho phim lẻ.');
          setIsSubmitting(false);
          return;
        }
      }
      if (filmData.film_type === 1 && episodes.length > 0) {
        episodes.forEach((ep, index) => {
          formDataToSend.append(`film_episodes[${index}][episode_number]`, ep.episode_number||'');
          formDataToSend.append(`film_episodes[${index}][episode_title]`, ep.episode_title || '');
          formDataToSend.append(`film_episodes[${index}][duration]`, ep.duration || '');
          if (episodeFiles[index]) {
            formDataToSend.append(`film_episodes[${index}][video]`, episodeFiles[index]);
          } else if (ep.episode_url && ep.episode_url.trim() !== '') {
            formDataToSend.append(`film_episodes[${index}][episode_url]`, ep.episode_url.trim());
          } else {
            setFormError(`Vui lòng chọn video hoặc nhập URL cho tập ${ep.episode_number}`);
            setIsSubmitting(false);
            return;
          }
        });
      }

      try {
        const token = localStorage.getItem('token');
        let response;
        if (isEditing && filmData.id) {
          response = await axios.post(
            `http://localhost:8000/api/updateFilm/${filmData.id}`,
            formDataToSend,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'multipart/form-data',
              },
            }
          );
        } else {
          response = await axios.post(
            'http://localhost:8000/api/addFilm',
            formDataToSend,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'multipart/form-data',
              },
            }
          );
        }

        const newFilm = response.data?.data || response.data;
        if (!newFilm || !newFilm.id) {
          throw new Error('Phản hồi từ server không hợp lệ');
        }
        console.log(newFilm)
        const year = years.find((y) => y.id === Number(filmData.year_id));
        const country = countries.find((c) => c.id === Number(filmData.country_id));
        const selectedGenres = genres.filter((g) => filmData.genre_id.includes(g.id));

        const updatedFilmWithDetails: Film = {
          ...newFilm,
          film_type: newFilm.film_type === 0 ? true : false, // Convert to boolean
          year: year || null,
          country: country || null,
          genres: selectedGenres || [],
          film_episodes: newFilm.film_episodes || (filmData.film_type === 1 ? episodes : episodes.slice(0, 1)),
        };

        if (isEditing) {
          setFormSuccess('Cập nhật phim thành công!');
          setFilms(films.map((f) => (f.id === newFilm.id ? updatedFilmWithDetails : f)));
        } else {
          setFormSuccess('Thêm phim thành công!');
          setFilms([...films, updatedFilmWithDetails]);
        }

        // Reset form
        setShowAddFilmForm(false);
        setIsEditing(false);
        setFilmData({
          slug: '',
          title_film: '',
          thumb: '',
          trailer: '',
          film_type: 0,
          year_id: '',
          country_id: '',
          actor: '',
          director: '',
          content: '',
          view: 0,
          genre_id: [],
          is_premium: false,
          point_required: '',
        });
        setEpisodes([{ episode_number: '', episode_title: '', episode_url: '', duration: '' }]);
        setTrailerFile(null);
        setEpisodeFiles({});
        setIsSubmitting(false);
      } catch (err: any) {
        let errorMessage = 'Lỗi không xác định khi thêm/cập nhật phim';
        if (err.response) {
          console.log('📦 Chi tiết lỗi từ server:', err.response.data);
          const { message, error, errors } = err.response.data;
        if (errors) {
          errorMessage = Object.values(errors).flat().join(', ');
        } else if (message) {
          errorMessage = message;
        } else if (error) {
          errorMessage = error;
        }
        } else if (err.request) {
          errorMessage = 'Không nhận được phản hồi từ server. Vui lòng kiểm tra kết nối mạng.';
        } else {
          errorMessage = `Lỗi: ${err.message}`;
        }
        setFormError(errorMessage);
        console.error('Chi tiết lỗi:', err);
        setIsSubmitting(false);
      }
    },
    [
      filmData,
      episodes,
      trailerFile,
      episodeFiles,
      isEditing,
      years,
      countries,
      genres,
      films,
    ]
  );

  const handleDeleteFilm = useCallback(
    async (filmId: number) => {
      if (!window.confirm('Bạn có chắc muốn xóa phim này?')) {
        return;
      }
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`http://localhost:8000/api/delFilm/${filmId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        setFilms((prev) => prev.filter((film) => film.id !== filmId));
        setFormSuccess('Xóa phim thành công');
      } catch (err: any) {
        let errorMessage = 'Lỗi khi xóa phim';
        if (err.response) {
          errorMessage = err.response.data?.error || `Lỗi từ server (mã ${err.response.status})`;
          const errorDetails = err.response.data?.errors
            ? Object.values(err.response.data.errors).flat().join(', ')
            : '';
          errorMessage += errorDetails ? `: ${errorDetails}` : '';
        } else if (err.request) {
          errorMessage = 'Không nhận được phản hồi từ server. Vui lòng kiểm tra kết nối mạng';
        } else {
          errorMessage = `Lỗi: ${err.message}`;
        }
        setFormError(errorMessage);
        console.error('Chi tiết lỗi:', err);
      }
    },
    []
  );

  const handleEditFilm = useCallback((film: Film) => {
    setFilmData({
      id: film.id,
      slug: film.slug,
      title_film: film.title_film,
      thumb: film.thumb,
      trailer: film.trailer,
      film_type: film.film_type ? 0 : 1, // Convert boolean to number
      year_id: film.year?.id.toString() || '',
      country_id: film.country?.id.toString() || '',
      actor: film.actor,
      director: film.director,
      content: film.content,
      view: film.view,
      genre_id: film.genres.map((genre) => genre.id),
      is_premium: film.is_premium,
      point_required: film.point_required?.toString() || '',
    });
    setEpisodes(
      film.film_episodes.length > 0
        ? film.film_episodes
        : [{ episode_number: '', episode_title: '', episode_url: '', duration: '' }]
    );
    setTrailerFile(null);
    setEpisodeFiles({});
    setIsEditing(true);
    setShowAddFilmForm(true);
  }, []);

  const resetForm = useCallback(() => {
    setShowAddFilmForm(false);
    setIsEditing(false);
    setFilmData({
      slug: '',
      title_film: '',
      thumb: '',
      trailer: '',
      film_type: 0,
      year_id: '',
      country_id: '',
      actor: '',
      director: '',
      content: '',
      view: 0,
      genre_id: [],
      is_premium: false,
      point_required: '',
    });
    setEpisodes([{ episode_number: '', episode_title: '', episode_url: '', duration: '' }]);
    setTrailerFile(null);
    setEpisodeFiles({});
    setFormError('');
    setFormSuccess('');
  }, []);

  return {
    films,
    showAddFilmForm,
    isEditing,
    isSubmitting,
    formError,
    formSuccess,
    filmData,
    episodes,
    trailerFile,
    episodeFiles,
    setFilms,
    setShowAddFilmForm,
    setIsEditing,
    setFilmData,
    setEpisodes,
    setTrailerFile,
    setEpisodeFiles,
    handleInputChange,
    toggleGenre,
    handleEpisodeChange,
    addEpisode,
    removeEpisode,
    handleSubmit,
    handleDeleteFilm,
    handleEditFilm,
    resetForm,
  };
};

export default useFilmControl;
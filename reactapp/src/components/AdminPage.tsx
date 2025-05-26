import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios, { AxiosError } from 'axios';
import {
    PlusCircleIcon,
    CalendarIcon,
    UserIcon,
    CogIcon
} from '@heroicons/react/24/solid';

interface Episode {
    episode_number: number;
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
    film_type: boolean;
    year: { id: number; release_year: number } | null;
    country: { id: number; country_name: string } | null;
    genres: { id: number; genre_name: string }[];
    actor: string;
    director: string;
    content: string;
    view: number;
    is_premium: boolean;
    point_required: number | null;
    film_episodes: Episode[];
}

const AdminPage = () => {
    const [user, setUser] = useState<{ name: string; role: string } | null>(null);
    const [error, setError] = useState('');
    const [activeSection, setActiveSection] = useState('dashboard');
    const [showAddFilmForm, setShowAddFilmForm] = useState(false);
    const [films, setFilms] = useState<Film[]>([]);
    const navigate = useNavigate();

    // State cho form thêm/sửa phim
    const [filmData, setFilmData] = useState<{
        id?: number;
        slug: string;
        title_film: string;
        thumb: string;
        trailer: string | null;
        film_type: boolean;
        year_id: string;
        country_id: string;
        actor: string;
        director: string;
        content: string;
        view: number;
        genre_id: number[];
        is_premium: boolean;
        point_required: string;
    }>({
        slug: '',
        title_film: '',
        thumb: '',
        trailer: '',
        film_type: true,
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
        { episode_number: 1, episode_title: '', episode_url: '', duration: '' }
    ]);
    const [formError, setFormError] = useState('');
    const [formSuccess, setFormSuccess] = useState('');
    const [isEditing, setIsEditing] = useState(false);

    // State cho danh sách năm, quốc gia, và thể loại
    const [years, setYears] = useState<Year[]>([]);
    const [countries, setCountries] = useState<Country[]>([]);
    const [genres, setGenres] = useState<Genre[]>([]);

    // State cho form cài đặt
    const [genreForm, setGenreForm] = useState({ genre_name: '' });
    const [yearForm, setYearForm] = useState({ release_year: '' });
    const [countryForm, setCountryForm] = useState({ country_name: '' });
    const [settingError, setSettingError] = useState('');
    const [settingSuccess, setSettingSuccess] = useState('');

    // Hàm xử lý khi nhấn nút "Sửa"
    const handleEditFilm = (film: Film) => {
        setFilmData({
            id: film.id,
            slug: film.slug,
            title_film: film.title_film,
            thumb: film.thumb,
            trailer: film.trailer,
            film_type: film.film_type,
            year_id: film.year?.id.toString() || '',
            country_id: film.country?.id.toString() || '',
            actor: film.actor,
            director: film.director,
            content: film.content,
            view: film.view,
            genre_id: film.genres.map(genre => genre.id),
            is_premium: film.is_premium,
            point_required: film.point_required?.toString() || '',
        });
        setEpisodes(film.film_episodes.length > 0 ? film.film_episodes : [
            { episode_number: 1, episode_title: '', episode_url: '', duration: '' }
        ]);
        setIsEditing(true);
        setShowAddFilmForm(true);
    };

    // Hàm xử lý submit form (thêm hoặc sửa)
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError('');
        setFormSuccess('');

        // Kiểm tra validation
        if (!filmData.year_id || isNaN(Number(filmData.year_id))) {
            setFormError('Vui lòng chọn năm phát hành hợp lệ.');
            return;
        }
        if (!filmData.country_id || isNaN(Number(filmData.country_id))) {
            setFormError('Vui lòng chọn quốc gia hợp lệ.');
            return;
        }
        if (filmData.genre_id.length === 0) {
            setFormError('Vui lòng chọn ít nhất một thể loại.');
            return;
        }
        if (!filmData.film_type && episodes.length === 0) {
            setFormError('Phim bộ cần ít nhất một tập.');
            return;
        }
        if (!filmData.film_type && episodes.some(ep => !ep.episode_number || !ep.episode_url)) {
            setFormError('Tất cả tập phim bộ cần số tập và URL hợp lệ.');
            return;
        }
        if (filmData.is_premium && (!filmData.point_required || Number(filmData.point_required) < 0)) {
            setFormError('Vui lòng nhập số điểm yêu cầu hợp lệ cho phim premium.');
            return;
        }

        const payload = {
            ...filmData,
            year_id: Number(filmData.year_id),
            country_id: Number(filmData.country_id),
            film_type: filmData.film_type,
            trailer: filmData.trailer || null,
            film_episodes: episodes,
            point_required: filmData.is_premium ? Number(filmData.point_required) || null : null,
        };

        try {
            const token = localStorage.getItem('token');
            let response;
            if (isEditing) {
                // Gửi yêu cầu PUT để cập nhật phim
                response = await axios.put(
                    `http://localhost:8000/api/updateFilm/${filmData.id}`,
                    payload,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            'Content-Type': 'application/json',
                        },
                    }
                );

                // Xử lý phản hồi
                let updatedFilm = response.data.data || response.data || {};
                if (Object.keys(updatedFilm).length === 0) {
                    // Nếu API không trả về dữ liệu phim, sử dụng payload và state hiện có
                    updatedFilm = {
                        id: filmData.id,
                        slug: filmData.slug,
                        title_film: filmData.title_film,
                        thumb: filmData.thumb,
                        trailer: filmData.trailer,
                        film_type: filmData.film_type,
                        actor: filmData.actor,
                        director: filmData.director,
                        content: filmData.content,
                        view: filmData.view,
                        is_premium: filmData.is_premium,
                        point_required: filmData.is_premium ? Number(filmData.point_required) || null : null,
                        film_episodes: episodes,
                    };
                }

                // Lấy thông tin year, country và genres từ danh sách hiện có
                const year = years.find(y => y.id === Number(filmData.year_id));
                const country = countries.find(c => c.id === Number(filmData.country_id));
                const selectedGenres = genres.filter(g => filmData.genre_id.includes(g.id));

                // Cập nhật dữ liệu phim với year, country và genres đầy đủ
                const updatedFilmWithDetails = {
                    ...updatedFilm,
                    year: year || null,
                    country: country || null,
                    genres: selectedGenres || [],
                    film_episodes: updatedFilm.film_episodes || episodes,
                };

                setFormSuccess('Cập nhật phim thành công!');
                alert('Cập nhật phim thành công!');
                setFilms(films.map(f => f.id === filmData.id ? updatedFilmWithDetails : f));
            } else {
                // Gửi yêu cầu POST để thêm phim mới
                response = await axios.post(
                    'http://localhost:8000/api/addFilm',
                    payload,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            'Content-Type': 'application/json',
                        },
                    }
                );

                // Xử lý phản hồi
                const newFilm = response.data.data || response.data;
                const year = years.find(y => y.id === Number(filmData.year_id));
                const country = countries.find(c => c.id === Number(filmData.country_id));
                const selectedGenres = genres.filter(g => filmData.genre_id.includes(g.id));

                // Thêm dữ liệu phim mới với year, country và genres đầy đủ
                const newFilmWithDetails = {
                    ...newFilm,
                    year: year || null,
                    country: country || null,
                    genres: selectedGenres || [],
                    film_episodes: newFilm.film_episodes || episodes,
                };

                setFormSuccess('Thêm phim thành công!');
                alert('Thêm phim thành công!');
                setFilms([...films, newFilmWithDetails]);
            }

            setShowAddFilmForm(false);
            setIsEditing(false);
            setFilmData({
                slug: '',
                title_film: '',
                thumb: '',
                trailer: '',
                film_type: true,
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
            setEpisodes([{ episode_number: 1, episode_title: '', episode_url: '', duration: '' }]);
        } catch (err: any) {
            // Cải thiện xử lý lỗi
            let errorMessage = 'Lỗi không xác định khi cập nhật phim';
            if (err.response) {
                errorMessage = err.response.data?.error || `Lỗi từ server (mã ${err.response.status})`;
                const errorDetails = err.response.data?.errors
                    ? Object.values(err.response.data.errors).flat().join(', ')
                    : '';
                errorMessage += errorDetails ? `: ${errorDetails}` : '';
            } else if (err.request) {
                errorMessage = 'Không nhận được phản hồi từ server. Vui lòng kiểm tra kết nối mạng.';
            } else {
                errorMessage = `Lỗi: ${err.message}`;
            }
            setFormError(errorMessage);
            console.error('Chi tiết lỗi:', err);
        }
    };
    const handleDeleteFilm = async (filmId: number) => {
        const confirmDelete = window.confirm('Bạn có chắc muốn xóa phim này?');
        if (!confirmDelete) {
            return;
        }
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:8000/api/delFilm/${filmId}`, {

                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": 'application/json',
                },
            });
            //Cập nhật danh sách phim sau khi xóa
            setFilms(films.filter(film => film.id !== filmId));
            setFormSuccess('Xóa phim thành công');
            alert('Xóa phim thành công');

        } catch (err: any) {
            let errorMessage = 'Lỗi khi xóa phim';
            if (err.response) {
                errorMessage = err.response.data?.error || `Lỗi từ server (mã ${err.response.status})`;
                const errorDetails = err.response.data?.errors ? Object.values(err.response.data.errors).flat().join(', ') : '';
                errorMessage += errorDetails ? `:${errorDetails}` : '';

            } else if (err.request) {
                errorMessage = 'Không nhận được phản hồi từ server. Vui lòng kiểm tra kết nối mạng';

            } else {
                errorMessage = `Lỗi ${err.message}`;

            }
            setFormError(errorMessage);
            console.error('Chi tiết lỗi', err);

        }
    }

    const renderMovies = () => (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">Quản Lý Phim</h2>
                <button
                    onClick={() => {
                        setShowAddFilmForm(true);
                        setIsEditing(false);
                        setFilmData({
                            slug: '',
                            title_film: '',
                            thumb: '',
                            trailer: '',
                            film_type: true,
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
                        setEpisodes([{ episode_number: 1, episode_title: '', episode_url: '', duration: '' }]);
                    }}
                    className="bg-[#ff4c00] text-white px-4 py-2 rounded hover:bg-[#e04300] cursor-pointer"
                >
                    Thêm Phim Mới
                </button>
            </div>

            {showAddFilmForm && (
                <div className="bg-gray-800 p-6 rounded-lg shadow mb-6">
                    <h3 className="text-xl font-bold text-white mb-4">{isEditing ? 'Chỉnh Sửa Phim' : 'Thêm Phim Mới'}</h3>
                    {formError && <div className="text-red-500 mb-4">{formError}</div>}
                    {formSuccess && <div className="text-green-500 mb-4">{formSuccess}</div>}
                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-gray-300">Slug</label>
                                <input
                                    type="text"
                                    name="slug"
                                    value={filmData.slug}
                                    onChange={handleInputChange}
                                    className="w-full p-2 bg-gray-700 text-white rounded"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-gray-300">Tiêu Đề Phim</label>
                                <input
                                    type="text"
                                    name="title_film"
                                    value={filmData.title_film}
                                    onChange={handleInputChange}
                                    className="w-full p-2 bg-gray-700 text-white rounded"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-gray-300">Thumbnail URL</label>
                                <input
                                    type="text"
                                    name="thumb"
                                    value={filmData.thumb}
                                    onChange={handleInputChange}
                                    className="w-full p-2 bg-gray-700 text-white rounded"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-gray-300">Trailer URL</label>
                                <input
                                    type="text"
                                    name="trailer"
                                    value={filmData.trailer ?? ''}
                                    onChange={handleInputChange}
                                    className="w-full p-2 bg-gray-700 text-white rounded"
                                    placeholder="Nhập URL trailer (tùy chọn)"
                                />
                            </div>
                            <div>
                                <label className="block text-gray-300">Loại Phim</label>
                                <select
                                    name="film_type"
                                    value={filmData.film_type.toString()}
                                    onChange={(e) => setFilmData(prev => ({ ...prev, film_type: e.target.value === 'true' }))}
                                    className="w-full p-2 bg-gray-700 text-white rounded"
                                    required
                                >
                                    <option value="true">Phim Lẻ</option>
                                    <option value="false">Phim Bộ</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-gray-300">Năm Phát Hành</label>
                                <select
                                    name="year_id"
                                    value={filmData.year_id}
                                    onChange={handleInputChange}
                                    className="w-full p-2 bg-gray-700 text-white rounded"
                                    required
                                >
                                    <option value="">Chọn năm</option>
                                    {Array.isArray(years) && years.map(year => (
                                        <option key={year.id} value={year.id}>
                                            {year.release_year}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-gray-300">Quốc Gia</label>
                                <select
                                    name="country_id"
                                    value={filmData.country_id}
                                    onChange={handleInputChange}
                                    className="w-full p-2 bg-gray-700 text-white rounded"
                                    required
                                >
                                    <option value="">Chọn quốc gia</option>
                                    {Array.isArray(countries) && countries.map(country => (
                                        <option key={country.id} value={country.id}>
                                            {country.country_name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-gray-300">Diễn Viên</label>
                                <input
                                    type="text"
                                    name="actor"
                                    value={filmData.actor}
                                    onChange={handleInputChange}
                                    className="w-full p-2 bg-gray-700 text-white rounded"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-gray-300">Đạo Diễn</label>
                                <input
                                    type="text"
                                    name="director"
                                    value={filmData.director}
                                    onChange={handleInputChange}
                                    className="w-full p-2 bg-gray-700 text-white rounded"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-gray-300 mb-1">Thể Loại</label>
                                <div className="bg-gray-700 rounded p-2 max-h-40 overflow-y-auto">
                                    {genres.length === 0 ? (
                                        <p className="text-gray-400">Không có thể loại</p>
                                    ) : (
                                        Array.isArray(genres) && genres.map(genre => (
                                            <button
                                                key={genre.id}
                                                type="button"
                                                onClick={() => toggleGenre(genre.id)}
                                                className={`block w-full text-left px-3 py-2 mb-1 rounded ${filmData.genre_id.includes(genre.id)
                                                    ? 'bg-[#ff4c00] text-white'
                                                    : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                                                    }`}
                                            >
                                                {genre.genre_name}
                                            </button>
                                        ))
                                    )}
                                </div>
                            </div>
                            <div className="col-span-2">
                                <label className="block text-gray-300">Nội Dung</label>
                                <textarea
                                    name="content"
                                    value={filmData.content}
                                    onChange={handleInputChange}
                                    className="w-full p-2 bg-gray-700 text-white rounded"
                                    rows={4}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-gray-300">Số Lượt Xem</label>
                                <input
                                    type="number"
                                    name="view"
                                    value={filmData.view}
                                    onChange={handleInputChange}
                                    className="w-full p-2 bg-gray-700 text-white rounded"
                                    min={0}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-gray-300">Phim Premium</label>
                                <input
                                    type="checkbox"
                                    name="is_premium"
                                    checked={filmData.is_premium}
                                    onChange={(e) => setFilmData(prev => ({ ...prev, is_premium: e.target.checked }))}
                                    className="w-5 h-5 text-[#ff4c00] bg-gray-700 rounded"
                                />
                            </div>
                            <div>
                                <label className="block text-gray-300">Số Điểm Yêu Cầu</label>
                                <input
                                    type="number"
                                    name="point_required"
                                    value={filmData.point_required}
                                    onChange={handleInputChange}
                                    className="w-full p-2 bg-gray-700 text-white rounded"
                                    min={0}
                                    placeholder="Nhập số điểm (nếu là phim premium)"
                                    disabled={!filmData.is_premium}
                                />
                            </div>
                        </div>

                        <div className="mt-6">
                            <h4 className="text-lg font-semibold text-white mb-2">Tập Phim</h4>
                            {episodes.map((episode, index) => (
                                <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                                    <div>
                                        <label className="block text-gray-300">Số Tập</label>
                                        <input
                                            type="number"
                                            value={episode.episode_number}
                                            onChange={(e) => handleEpisodeChange(index, 'episode_number', Number(e.target.value))}
                                            className="w-full p-2 bg-gray-700 text-white rounded"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-gray-300">Tiêu Đề Tập</label>
                                        <input
                                            type="text"
                                            value={episode.episode_title}
                                            onChange={(e) => handleEpisodeChange(index, 'episode_title', e.target.value)}
                                            className="w-full p-2 bg-gray-700 text-white rounded"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-gray-300">URL Video</label>
                                        <input
                                            type="text"
                                            value={episode.episode_url}
                                            onChange={(e) => handleEpisodeChange(index, 'episode_url', e.target.value)}
                                            className="w-full p-2 bg-gray-700 text-white rounded"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-gray-300">Thời Lượng</label>
                                        <input
                                            type="text"
                                            value={episode.duration}
                                            onChange={(e) => handleEpisodeChange(index, 'duration', e.target.value)}
                                            className="w-full p-2 bg-gray-700 text-white rounded"
                                        />
                                    </div>
                                    {episodes.length > 1 && (
                                        <div className="flex items-end">
                                            <button
                                                type="button"
                                                onClick={() => removeEpisode(index)}
                                                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                                            >
                                                Xóa
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={addEpisode}
                                className="bg-[#ff4c00] text-white px-4 py-2 rounded hover:bg-[#e04300] mt-2"
                            >
                                Thêm Tập
                            </button>
                        </div>

                        <div className="mt-6 flex justify-end gap-4">
                            <button
                                type="button"
                                onClick={() => {
                                    setShowAddFilmForm(false);
                                    setIsEditing(false);
                                    setFilmData({
                                        slug: '',
                                        title_film: '',
                                        thumb: '',
                                        trailer: '',
                                        film_type: true,
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
                                    setEpisodes([{ episode_number: 1, episode_title: '', episode_url: '', duration: '' }]);
                                }}
                                className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
                            >
                                Hủy
                            </button>
                            <button
                                type="submit"
                                className="bg-[#ff4c00] text-white px-4 py-2 rounded hover:bg-[#e04300]"
                            >
                                {isEditing ? 'Cập Nhật Phim' : 'Thêm Phim'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="overflow-x-auto">
                <table className="w-full text-left text-gray-300">
                    <thead className="bg-gray-800">
                        <tr>
                            <th className="p-3">Tiêu Đề Phim</th>
                            <th className="p-3">Thể Loại</th>
                            <th className="p-3">Năm Phát Hành</th>
                            <th className="p-3">Quốc Gia</th>
                            <th className="p-3">Loại Phim</th>
                            <th className="p-3">Đạo Diễn</th>
                            <th className="p-3">Diễn Viên</th>
                            <th className="p-3">Nội Dung</th>
                            <th className="p-3">Số Lượt Xem</th>
                            <th className="p-3">Phim Premium</th>
                            <th className="p-3">Điểm Yêu Cầu</th>
                            <th className="p-3">Tác Vụ</th>
                        </tr>
                    </thead>
                    <tbody>
                        {films.length === 0 ? (
                            <tr>
                                <td colSpan={12} className="p-3 text-center">Chưa có phim nào</td>
                            </tr>
                        ) : (
                            films.map(film => (
                                <tr key={film.id} className="border-b border-gray-700">
                                    <td className="p-3">{film.title_film}</td>
                                    <td className="p-3">
                                        {film.genres.map(genre => genre.genre_name).join(', ')}
                                    </td>
                                    <td className="p-3">{film.year?.release_year || 'N/A'}</td>
                                    <td className="p-3">{film.country?.country_name || 'N/A'}</td>
                                    <td className="p-3">{film.film_type ? 'Phim Lẻ' : 'Phim Bộ'}</td>
                                    <td className="p-3">{film.director}</td>
                                    <td className="p-3">{film.actor}</td>
                                    <td className="p-3">{film.content}</td>
                                    <td className="p-3">{film.view}</td>
                                    <td className="p-3">{film.is_premium ? 'Có' : 'Không'}</td>
                                    <td className="p-3">{film.is_premium ? film.point_required || '0' : 'N/A'}</td>
                                    <td className="p-3">
                                        <button
                                            onClick={() => handleEditFilm(film)}
                                            className="bg-blue-500 text-white px-3 py-1 rounded mr-2 hover:bg-blue-600 cursor-pointer"
                                        >
                                            Sửa
                                        </button>
                                        <button onClick={() => handleDeleteFilm(film.id)}
                                            className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 cursor-pointer">
                                            Xóa
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const handleGenreInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setGenreForm({ genre_name: e.target.value });
    };
    const handleCountryInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCountryForm({ country_name: e.target.value });
    };
    const handleYearInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setYearForm({ release_year: e.target.value });
    };
    const handleAddGenre = async (e: React.FormEvent) => {
        e.preventDefault();
        setSettingError('');
        setSettingSuccess('');
        if (!genreForm.genre_name.trim()) {
            setSettingError('Tên thể loại không được để trống');
            return;
        }
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post('http://localhost:8000/api/addgenres',
                { genre_name: genreForm.genre_name },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                }
            );
            setGenres([...genres, response.data]);
            setGenreForm({ genre_name: '' });
            setSettingSuccess('Thêm thể loại thành công');
        } catch (err: any) {
            const errorMessage = err.response?.data?.error || 'Lỗi khi thêm thể loại';
            const errorDetails = err.response?.data?.errors
                ? Object.values(err.response.data.errors).flat().join(', ')
                : '';
            setSettingError(`${errorMessage}${errorDetails ? ': ' + errorDetails : ''}`);
            console.error('Lỗi từ server:', err.response?.data);
        }
    };
    const handleAddCountry = async (e: React.FormEvent) => {
        e.preventDefault();
        setSettingError('');
        setSettingSuccess('');
        if (!countryForm.country_name.trim()) {
            setSettingError('Tên quốc gia không được để trống');
            return;
        }
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post('http://localhost:8000/api/addcountries', {
                country_name: countryForm.country_name
            },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                }
            );
            setCountries([...countries, response.data]);
            setCountryForm({ country_name: '' });
            setSettingSuccess('Thêm quốc gia thành công');
        } catch (err: any) {
            const errorMessage = err.response?.data?.error || "Lỗi khi thêm quốc gia";
            const errorDetails = err.response?.data?.errors ? Object.values(err.response.data.errors).flat().join(', ') : '';
            setSettingError(`${errorMessage}${errorDetails ? ': ' + errorDetails : ''}`);
            console.error('Lỗi từ server:', err.response?.data);
        }
    };
    const handleAddYear = async (e: React.FormEvent) => {
        e.preventDefault();
        setSettingError('');
        setSettingSuccess('');

        const year = parseInt(yearForm.release_year, 10);
        if (!yearForm.release_year.trim() || isNaN(year) || year < 1900 || year > new Date().getFullYear() + 1) {
            setSettingError('Vui lòng nhập năm hợp lệ (1900 - ' + (new Date().getFullYear() + 1) + ').');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(
                'http://localhost:8000/api/addyears',
                { release_year: year },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                }
            );
            const newYear = { id: response.data.id, release_year: response.data.release_year };
            setYears(prev => [...prev, newYear].sort((a, b) => a.release_year - b.release_year));
            setYearForm({ release_year: '' });
            setSettingSuccess('Thêm năm thành công!');
        } catch (err: any) {
            const errorMessage = err.response?.data?.error || 'Lỗi khi thêm năm';
            const errorDetails = err.response?.data?.errors
                ? Object.values(err.response.data.errors).flat().join(', ')
                : '';
            setSettingError(`${errorMessage}${errorDetails ? ': ' + errorDetails : ''}`);
            console.error('Lỗi từ server:', err.response?.data);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    navigate('/');
                    return;
                }
                const [yearsResponse, countriesResponse, genresResponse, filmsResponse] = await Promise.all([
                    axios.get('http://localhost:8000/api/years', {
                        headers: { Authorization: `Bearer ${token}` }
                    }),
                    axios.get('http://localhost:8000/api/countries', {
                        headers: { Authorization: `Bearer ${token}` }
                    }),
                    axios.get('http://localhost:8000/api/genres', {
                        headers: { Authorization: `Bearer ${token}` }
                    }),
                    axios.get('http://localhost:8000/api/films', {
                        headers: { Authorization: `Bearer ${token}` }
                    })
                ]);
                setYears(yearsResponse.data.years);
                setCountries(countriesResponse.data.country);
                setGenres(genresResponse.data.genres);
                setFilms(filmsResponse.data);
            } catch (err: any) {
                console.error('Lỗi khi lấy dữ liệu:', err.response?.data || err.message);
                setFormError('Không thể tải dữ liệu năm, quốc gia, thể loại hoặc phim.');
            }
        };
        fetchData();
    }, [navigate]);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    navigate('/');
                    return;
                }
                const response = await axios.get('http://localhost:8000/api/user', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (response.data.user.role !== 'admin') {
                    navigate('/');
                    return;
                }
                setUser(response.data.user);
            } catch (err: any) {
                setError('Không thể tải thông tin người dùng');
                navigate('/');
            }
        };
        fetchUser();
    }, [navigate]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFilmData(prev => ({ ...prev, [name]: value }));
    };

    const toggleGenre = (genreId: number) => {
        setFilmData(prev => {
            const newGenreIds = prev.genre_id.includes(genreId)
                ? prev.genre_id.filter(id => id !== genreId)
                : [...prev.genre_id, genreId];
            return { ...prev, genre_id: newGenreIds };
        });
    };

    const handleEpisodeChange = (index: number, field: keyof Episode, value: string | number) => {
        const newEpisodes = [...episodes];
        newEpisodes[index] = { ...newEpisodes[index], [field]: value };
        setEpisodes(newEpisodes);
    };

    const addEpisode = () => {
        setEpisodes(prev => [
            ...prev,
            { episode_number: prev.length + 1, episode_title: '', episode_url: '', duration: '' }
        ]);
    };

    const removeEpisode = (index: number) => {
        setEpisodes(prev => prev.filter((_, i) => i !== index));
    };

    const renderDashboard = () => (
        <div className="p-6">
            <h2 className="text-2xl font-bold text-white mb-6">Bảng Điều Khiển</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-800 p-4 rounded-lg shadow">
                    <h3 className="text-lg font-semibold text-gray-300">Tổng Số Người Dùng</h3>
                    <p className="text-3xl text-white mt-2">0</p>
                </div>
                <div className="bg-gray-800 p-4 rounded-lg shadow">
                    <h3 className="text-lg font-semibold text-gray-300">Tổng Số Phim</h3>
                    <p className="text-3xl text-white mt-2">{films.length}</p>
                </div>
                <div className='bg-gray-800 p-4 rounded-lg shadow'>
                    <h3 className='text-lg font-semibold text-gray-300'>Tổng Số Thể Loại</h3>
                    <p className='text-3xl text-white mt-2'>{genres.length}</p>
                </div>
                <div className='bg-gray-800 p-4 rounded-lg shadow'>
                    <h3 className='text-lg font-semibold text-gray-300'>Tổng Số Quốc Gia</h3>
                    <p className='text-3xl text-white mt-2'>{countries.length}</p>
                </div>
                <div className='bg-gray-800 p-4 rounded-lg shadow'>
                    <h3 className='text-lg font-semibold text-gray-300'>Tổng Số Năm</h3>
                    <p className='text-3xl text-white mt-2'>{years.length}</p>
                </div>
            </div>
        </div>
    );

    const renderUsers = () => (
        <div className="p-6">
            <h2 className="text-2xl font-bold text-white mb-6">Quản Lý Người Dùng</h2>
            <div className="overflow-x-auto">
                <table className="w-full text-left text-gray-300">
                    <thead className="bg-gray-800">
                        <tr>
                            <th className="p-3">Tên</th>
                            <th className="p-3">Email</th>
                            <th className="p-3">Password</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td colSpan={3} className="p-3 text-center">Chưa có người dùng nào</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );

    const renderSettings = () => (
        <div className="p-6">
            <h2 className="text-2xl font-bold text-white mb-6">Cài Đặt</h2>
            {settingError && <div className='text-red-500 mb-4'>{settingError}</div>}
            {settingSuccess && <div className='text-green-500 mb-4'>{settingSuccess}</div>}
            <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                <div className='bg-gray-800 p-4 rounded-lg shadow'>
                    <h3 className='text-lg font-semibold text-gray-300 mb-4'>Thêm thể loại</h3>
                    <form onSubmit={handleAddGenre}>
                        <div className='mb-4'>
                            <label className='block text-gray-300 mb-2'>Tên thể loại</label>
                            <input type="text" value={genreForm.genre_name} onChange={handleGenreInputChange} className='w-full p-2 bg-gray-700 text-white rounded' />
                        </div>
                        <button type='submit' className='bg-[#ff4c00] text-white px-4 py-2 rounded hover:bg-[#e04300] cursor-pointer'>
                            Thêm thể loại
                        </button>
                    </form>
                    <div className='mt-4'>
                        <h4 className='text-gray-300 font-semibold'>Danh sách thể loại</h4>
                        {genres.length === 0 ? (
                            <p className='text-gray-400'>Chưa có thể loại nào</p>
                        ) : (
                            <ul className='mt-2 text-gray-300'>
                                {genres.map(genre => (
                                    <li key={genre.id} className='py-1'>{genre.genre_name}</li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
                <div className='bg-gray-800 rounded-lg shadow p-4'>
                    <h3 className='text-lg text-white font-semibold mb-4'>Thêm quốc gia</h3>
                    <form onSubmit={handleAddCountry}>
                        <div className='mb-4'>
                            <label className='text-gray-300 mb-2 block'>Tên quốc gia</label>
                            <input type="text" className='w-full p-2 bg-gray-700 text-white rounded' value={countryForm.country_name} onChange={handleCountryInputChange} />
                        </div>
                        <button type='submit' className='bg-[#ff4c00] text-white px-4 py-2 rounded hover:bg-[#e04300]'>
                            Thêm quốc gia
                        </button>
                    </form>
                    <div className='mt-4'>
                        <h4 className='text-gray-300 font-semibold'>Danh sách quốc gia</h4>
                        {countries.length === 0 ? (<p className='text-gray-400'>Chưa có quốc gia nào</p>) : (
                            <ul className='mt-2 text-gray-300'>
                                {countries.map(country => (
                                    <li key={country.id} className='py-1'>
                                        {country.country_name}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
                <div className='bg-gray-800 p-4 rounded-lg shadow'>
                    <h3 className='text-lg font-semibold text-gray-300 mb-4'>Thêm năm</h3>
                    <form onSubmit={handleAddYear}>
                        <div className='mb-4'>
                            <label className='block text-gray-300 mb-2'>Năm phát hành</label>
                            <input type="text" onChange={handleYearInputChange} value={yearForm.release_year} className='w-full p-2 bg-gray-700 text-white rounded' min="2000" max={new Date().getFullYear() + 1} />
                        </div>
                        <button type='submit' className='bg-[#ff4c00] text-white px-4 py-2 rounded hover:bg-[#e04300]'>Thêm năm</button>
                    </form>
                    <div className='mt-4'>
                        <h4 className='text-gray-300 font-semibold'>Danh sách năm</h4>
                        {years.length === 0 ? (<p className='text-gray-400'>Chưa có năm nào</p>) : (
                            <ul className='mt-2 text-gray-300'>
                                {years.map(year => (
                                    <li key={year.id} className='py-1'>
                                        {year.release_year}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );

    if (error) {
        return <div className="text-red-500 text-center mt-10">{error}</div>;
    }

    if (!user) {
        return <div className="text-white text-center mt-10">Đang tải...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-900 flex">
            <div className="w-16 bg-gray-800 flex flex-col items-center py-6 fixed h-full">
                <button
                    onClick={() => setActiveSection('dashboard')}
                    className={`p-3 mb-4 ${activeSection === 'dashboard' ? 'text-[#ff4c00]' : 'text-gray-300'} hover:text-[#ff4c00]`}
                >
                    <PlusCircleIcon className="h-8 w-8" />
                </button>
                <button
                    onClick={() => setActiveSection('movies')}
                    className={`p-3 mb-4 ${activeSection === 'movies' ? 'text-[#ff4c00]' : 'text-gray-300'} hover:text-[#ff4c00]`}
                >
                    <CalendarIcon className="h-8 w-8" />
                </button>
                <button
                    onClick={() => setActiveSection('users')}
                    className={`p-3 mb-4 ${activeSection === 'users' ? 'text-[#ff4c00]' : 'text-gray-300'} hover:text-[#ff4c00]`}
                >
                    <UserIcon className="h-8 w-8" />
                </button>
                <button
                    onClick={() => setActiveSection('settings')}
                    className={`p-3 ${activeSection === 'settings' ? 'text-[#ff4c00]' : 'text-gray-300'} hover:text-[#ff4c00]`}
                >
                    <CogIcon className="h-8 w-8" />
                </button>
            </div>

            <div className="flex-1 ml-16">
                {activeSection === 'dashboard' && renderDashboard()}
                {activeSection === 'movies' && renderMovies()}
                {activeSection === 'users' && renderUsers()}
                {activeSection === 'settings' && renderSettings()}
            </div>
        </div>
    );
};

export default AdminPage;
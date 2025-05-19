import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import React from 'react';
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

const AdminPage = () => {
    const [user, setUser] = useState<{ name: string; role: string } | null>(null);
    const [error, setError] = useState('');
    const [activeSection, setActiveSection] = useState('dashboard');
    const [showAddFilmForm, setShowAddFilmForm] = useState(false);
    const navigate = useNavigate();

    // State cho form thêm phim
    const [filmData, setFilmData] = useState({
        slug: '',
        title_film: '',
        thumb: '',
        film_type: true, // true = phim lẻ, false = phim bộ
        year_id: '',
        country_id: '',
        actor: '',
        director: '',
        content: '',
        view: 0,
        genre_id: [] as number[],
    });
    const [episodes, setEpisodes] = useState<Episode[]>([
        { episode_number: 1, episode_title: '', episode_url: '', duration: '' }
    ]);
    const [formError, setFormError] = useState('');
    const [formSuccess, setFormSuccess] = useState('');

    // State cho danh sách năm, quốc gia, và thể loại
    const [years, setYears] = useState<Year[]>([]);
    const [countries, setCountries] = useState<Country[]>([]);
    const [genres, setGenres] = useState<Genre[]>([]);

    // Lấy danh sách năm, quốc gia, và thể loại từ API
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [yearsResponse, countriesResponse, genresResponse] = await Promise.all([
                    axios.get('http://localhost:8000/api/years'),
                    axios.get('http://localhost:8000/api/countries'),
                    axios.get('http://localhost:8000/api/genres')
                ]);
                setYears(yearsResponse.data);
                setCountries(countriesResponse.data);
                setGenres(genresResponse.data);
            } catch (err: any) {
                console.error('Lỗi khi lấy dữ liệu:', err.response?.data || err.message);
                setFormError('Không thể tải dữ liệu năm, quốc gia hoặc thể loại.');
            }
        };
        fetchData();
    }, []);

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

    // Xử lý thay đổi input trong form
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFilmData(prev => ({ ...prev, [name]: value }));
    };

    // Xử lý chọn/bỏ chọn thể loại
    const toggleGenre = (genreId: number) => {
        setFilmData(prev => {
            const newGenreIds = prev.genre_id.includes(genreId)
                ? prev.genre_id.filter(id => id !== genreId)
                : [...prev.genre_id, genreId];
            console.log('Thể loại đã chọn:', newGenreIds);
            return { ...prev, genre_id: newGenreIds };
        });
    };

    // Xử lý thay đổi input cho episodes
    const handleEpisodeChange = (index: number, field: keyof Episode, value: string | number) => {
        const newEpisodes = [...episodes];
        newEpisodes[index] = { ...newEpisodes[index], [field]: value };
        setEpisodes(newEpisodes);
    };

    // Thêm một episode mới
    const addEpisode = () => {
        setEpisodes(prev => [
            ...prev,
            { episode_number: prev.length + 1, episode_title: '', episode_url: '', duration: '' }
        ]);
    };

    // Xóa episode
    const removeEpisode = (index: number) => {
        setEpisodes(prev => prev.filter((_, i) => i !== index));
    };

    // Xử lý submit form
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

        const payload = {
            ...filmData,
            year_id: Number(filmData.year_id),
            country_id: Number(filmData.country_id),
            film_type: filmData.film_type,
            film_episodes: episodes,
        };
        console.log('Payload gửi đi:', payload);

        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(
                'http://localhost:8000/api/addPhim',
                payload,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                }
            );
            setFormSuccess('Thêm phim thành công!');
            setShowAddFilmForm(false);
            // Reset form
            setFilmData({
                slug: '',
                title_film: '',
                thumb: '',
                film_type: true,
                year_id: '',
                country_id: '',
                actor: '',
                director: '',
                content: '',
                view: 0,
                genre_id: [],
            });
            setEpisodes([{ episode_number: 1, episode_title: '', episode_url: '', duration: '' }]);
        } catch (err: any) {
            const errorMessage = err.response?.data?.error || 'Lỗi khi thêm phim';
            const errorDetails = err.response?.data?.errors
                ? Object.values(err.response.data.errors).flat().join(', ')
                : '';
            setFormError(`${errorMessage}${errorDetails ? ': ' + errorDetails : ''}`);
            console.error('Lỗi từ server:', err.response?.data);
        }
    };

    if (error) {
        return <div className="text-red-500 text-center mt-10">{error}</div>;
    }

    if (!user) {
        return <div className="text-white text-center mt-10">Đang tải...</div>;
    }

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
                    <p className="text-3xl text-white mt-2">0</p>
                </div>
            </div>
        </div>
    );

    const renderMovies = () => (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">Quản Lý Phim</h2>
                <button
                    onClick={() => setShowAddFilmForm(true)}
                    className="bg-[#ff4c00] text-white px-4 py-2 rounded hover:bg-[#e04300] cursor-pointer"
                >
                    Thêm Phim Mới
                </button>
            </div>

            {showAddFilmForm && (
                <div className="bg-gray-800 p-6 rounded-lg shadow mb-6">
                    <h3 className="text-xl font-bold text-white mb-4">Thêm Phim Mới</h3>
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
                                    {years.map(year => (
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
                                    {countries.map(country => (
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
                                <label className="block text-gray-300 mb-1">Thể Loại</label>
                                <div className="bg-gray-700 rounded p-2 max-h-40 overflow-y-auto">
                                    {genres.length === 0 ? (
                                        <p className="text-gray-400">Không có thể loại</p>
                                    ) : (
                                        genres.map(genre => (
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
                                onClick={() => setShowAddFilmForm(false)}
                                className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
                            >
                                Hủy
                            </button>
                            <button
                                type="submit"
                                className="bg-[#ff4c00] text-white px-4 py-2 rounded hover:bg-[#e04300]"
                            >
                                Thêm Phim
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
                            <th className="p-3">Tên Phim</th>
                            <th className="p-3">Thể Loại</th>
                            <th className="p-3">Năm Phát Hành</th>
                            <th className="p-3">Đạo Diễn</th>
                            <th className="p-3">Diễn Viên</th>
                            <th className="p-3">Nội Dung</th>
                            <th className="p-3">Số Lượt Xem</th>
                            <th className="p-3">Tác Vụ</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td colSpan={9} className="p-3 text-center">Chưa có phim nào</td>
                        </tr>
                    </tbody>
                </table>
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
            <p className="text-gray-300">Chưa có nội dung cài đặt.</p>
        </div>
    );

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
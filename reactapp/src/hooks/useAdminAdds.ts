import { useState, useCallback } from 'react';
import axios from 'axios';

interface Genre {
  id: number;
  genre_name: string;
}

interface Country {
  id: number;
  country_name: string;
}

interface Year {
  id: number;
  release_year: number;
}

interface AdminAddState {
  genres: Genre[];
  countries: Country[];
  years: Year[];
  genreForm: { genre_name: string };
  countryForm: { country_name: string };
  yearForm: { release_year: string };
  settingError: string | null;
  settingSuccess: string | null;
}

export function useAdminAdd(initialGenres: Genre[], initialCountries: Country[], initialYears: Year[]) {
  const [state, setState] = useState<AdminAddState>({
    genres: initialGenres,
    countries: initialCountries,
    years: initialYears,
    genreForm: { genre_name: '' },
    countryForm: { country_name: '' },
    yearForm: { release_year: '' },
    settingError: null,
    settingSuccess: null,
  });

  const setInitialData = (newGenres: Genre[], newCountries: Country[], newYears: Year[]) => {
    setState((prev) => ({ ...prev, genres: newGenres, countries: newCountries, years: newYears }));
  };

  const handleGenreInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setState((prev) => ({ ...prev, genreForm: { genre_name: e.target.value } }));
  }, []);

  const handleCountryInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setState((prev) => ({ ...prev, countryForm: { country_name: e.target.value } }));
  }, []);

  const handleYearInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setState((prev) => ({ ...prev, yearForm: { release_year: e.target.value } }));
  }, []);

  const handleAddGenre = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setState((prev) => ({ ...prev, settingError: '', settingSuccess: '' }));
      if (!state.genreForm.genre_name.trim()) {
        setState((prev) => ({ ...prev, settingError: 'Tên thể loại không được để trống' }));
        return;
      }
      try {
        const token = localStorage.getItem('token');
        const response = await axios.post(
          'http://localhost:8000/api/addgenres',
          { genre_name: state.genreForm.genre_name },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );
        setState((prev) => ({
          ...prev,
          genres: [...prev.genres, response.data],
          genreForm: { genre_name: '' },
          settingSuccess: 'Thêm thể loại thành công',
          settingError: null,
        }));
      } catch (err: any) {
        const errorMessage = err.response?.data?.error || 'Lỗi khi thêm thể loại';
        const errorDetails = err.response?.data?.errors
          ? Object.values(err.response.data.errors).flat().join(', ')
          : '';
        setState((prev) => ({
          ...prev,
          settingError: `${errorMessage}${errorDetails ? ': ' + errorDetails : ''}`,
        }));
        console.error('Lỗi từ server:', err.response?.data);
      }
    },
    [state.genreForm.genre_name]
  );

  const handleAddCountry = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setState((prev) => ({ ...prev, settingError: '', settingSuccess: '' }));
      if (!state.countryForm.country_name.trim()) {
        setState((prev) => ({ ...prev, settingError: 'Tên quốc gia không được để trống' }));
        return;
      }
      try {
        const token = localStorage.getItem('token');
        const response = await axios.post(
          'http://localhost:8000/api/addcountries',
          { country_name: state.countryForm.country_name },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );
        setState((prev) => ({
          ...prev,
          countries: [...prev.countries, response.data],
          countryForm: { country_name: '' },
          settingSuccess: 'Thêm quốc gia thành công',
          settingError: null,
        }));
      } catch (err: any) {
        const errorMessage = err.response?.data?.error || 'Lỗi khi thêm quốc gia';
        const errorDetails = err.response?.data?.errors
          ? Object.values(err.response.data.errors).flat().join(', ')
          : '';
        setState((prev) => ({
          ...prev,
          settingError: `${errorMessage}${errorDetails ? ': ' + errorDetails : ''}`,
        }));
        console.error('Lỗi từ server:', err.response?.data);
      }
    },
    [state.countryForm.country_name]
  );

  const handleAddYear = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setState((prev) => ({ ...prev, settingError: '', settingSuccess: '' }));

      const year = parseInt(state.yearForm.release_year, 10);
      if (!state.yearForm.release_year.trim() || isNaN(year) || year < 1900 || year > new Date().getFullYear() + 1) {
        setState((prev) => ({
          ...prev,
          settingError: 'Vui lòng nhập năm hợp lệ (1900 - ' + (new Date().getFullYear() + 1) + ').',
        }));
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
        setState((prev) => ({
          ...prev,
          years: [...prev.years, newYear].sort((a, b) => a.release_year - b.release_year),
          yearForm: { release_year: '' },
          settingSuccess: 'Thêm năm thành công!',
          settingError: null,
        }));
      } catch (err: any) {
        const errorMessage = err.response?.data?.error || 'Lỗi khi thêm năm';
        const errorDetails = err.response?.data?.errors
          ? Object.values(err.response.data.errors).flat().join(', ')
          : '';
        setState((prev) => ({
          ...prev,
          settingError: `${errorMessage}${errorDetails ? ': ' + errorDetails : ''}`,
        }));
        console.error('Lỗi từ server:', err.response?.data);
      }
    },
    [state.yearForm.release_year]
  );

  return {
    ...state,
    setInitialData,
    handleGenreInputChange,
    handleCountryInputChange,
    handleYearInputChange,
    handleAddGenre,
    handleAddCountry,
    handleAddYear,
  };
}
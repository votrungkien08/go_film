import { useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';
import { DashboardContent } from 'src/layouts/dashboard';
import { Scrollbar } from 'src/components/scrollbar';
import { AddTableRow } from '../add-table-row';
import { AddTableHead } from '../add-table-head';
import { useAdminAdd } from '../../../hooks/useAdminAdds';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
export function AddView() {
  const {
    genres,
    countries,
    years,
    genreForm,
    countryForm,
    yearForm,
    settingError,
    settingSuccess,
    handleGenreInputChange,
    handleCountryInputChange,
    handleYearInputChange,
    handleAddGenre,
    handleAddCountry,
    handleAddYear,
    setInitialData,
  } = useAdminAdd([], [], []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.error('No token found');
          return;
        }
        const [genresResponse, countriesResponse, yearsResponse] = await Promise.all([
          axios.get('http://localhost:8000/api/genres', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('http://localhost:8000/api/countries', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('http://localhost:8000/api/years', { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        setInitialData(genresResponse.data.genres || [], countriesResponse.data.country || [], yearsResponse.data.years || []);
      } catch (err: any) {
        console.error('Lỗi khi lấy dữ liệu:', err.response?.data || err.message);
      }
    };
    fetchData();
  }, [setInitialData]);

  const renderSettingsForm = () => (
    <Box sx={{ p: 3, mb: 3, bgcolor: 'background.paper', borderRadius: 1 }}>
      <Typography variant="h6" gutterBottom>
        Cài Đặt
      </Typography>
      {settingError && <Typography color="error" sx={{ mb: 2 }}>{settingError}</Typography>}
      {settingSuccess && <Typography color="success.main" sx={{ mb: 2 }}>{settingSuccess}</Typography>}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, gap: 3 }}>
        <Card sx={{ p: 2, bgcolor: 'grey.800', borderRadius: 1 }}>
          <Typography variant="h6" sx={{ color: 'grey.300', mb: 2 }}>
            Thêm thể loại
          </Typography>
          <form onSubmit={handleAddGenre}>
            <Box sx={{ mb: 2 }}>
              <Typography sx={{ color: 'grey.300', mb: 1 }}>Tên thể loại</Typography>
              <TextField
                value={genreForm.genre_name}
                onChange={handleGenreInputChange}
                variant="outlined"
                fullWidth
                sx={{ bgcolor: 'grey.700', '& .MuiInputBase-input': { color: 'white' } }}
              />
            </Box>
            <Button type="submit" variant="contained" sx={{ bgcolor: '#ff4c00', '&:hover': { bgcolor: '#e04300' } }}>
              Thêm thể loại
            </Button>
          </form>
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1" sx={{ color: 'grey.300' }}>
              Danh sách thể loại
            </Typography>
            {genres.length === 0 ? (
              <Typography color="text.secondary">Chưa có thể loại nào</Typography>
            ) : (
              <Box sx={{ mt: 1 }}>
                {genres.map((genre) => (
                  <Typography key={genre.id} sx={{ py: 0.5, color: 'grey.300' }}>
                    {genre.genre_name}
                  </Typography>
                ))}
              </Box>
            )}
          </Box>
        </Card>

        <Card sx={{ p: 2, bgcolor: 'grey.800', borderRadius: 1 }}>
          <Typography variant="h6" sx={{ color: 'grey.300', mb: 2 }}>
            Thêm quốc gia
          </Typography>
          <form onSubmit={handleAddCountry}>
            <Box sx={{ mb: 2 }}>
              <Typography sx={{ color: 'grey.300', mb: 1 }}>Tên quốc gia</Typography>
              <TextField
                value={countryForm.country_name}
                onChange={handleCountryInputChange}
                variant="outlined"
                fullWidth
                sx={{ bgcolor: 'grey.700', '& .MuiInputBase-input': { color: 'white' } }}
              />
            </Box>
            <Button type="submit" variant="contained" sx={{ bgcolor: '#ff4c00', '&:hover': { bgcolor: '#e04300' } }}>
              Thêm quốc gia
            </Button>
          </form>
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1" sx={{ color: 'grey.300' }}>
              Danh sách quốc gia
            </Typography>
            {countries.length === 0 ? (
              <Typography color="text.secondary">Chưa có quốc gia nào</Typography>
            ) : (
              <Box sx={{ mt: 1 }}>
                {countries.map((country) => (
                  <Typography key={country.id} sx={{ py: 0.5, color: 'grey.300' }}>
                    {country.country_name}
                  </Typography>
                ))}
              </Box>
            )}
          </Box>
        </Card>

        <Card sx={{ p: 2, bgcolor: 'grey.800', borderRadius: 1 }}>
          <Typography variant="h6" sx={{ color: 'grey.300', mb: 2 }}>
            Thêm năm
          </Typography>
          <form onSubmit={handleAddYear}>
            <Box sx={{ mb: 2 }}>
              <Typography sx={{ color: 'grey.300', mb: 1 }}>Năm phát hành</Typography>
              <TextField
                type="number"
                value={yearForm.release_year}
                onChange={handleYearInputChange}
                variant="outlined"
                fullWidth
                sx={{ bgcolor: 'grey.700', '& .MuiInputBase-input': { color: 'white' } }}
                inputProps={{ min: 1900, max: new Date().getFullYear() + 1 }}
              />
            </Box>
            <Button type="submit" variant="contained" sx={{ bgcolor: '#ff4c00', '&:hover': { bgcolor: '#e04300' } }}>
              Thêm năm
            </Button>
          </form>
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1" sx={{ color: 'grey.300' }}>
              Danh sách năm
            </Typography>
            {years.length === 0 ? (
              <Typography color="text.secondary">Chưa có năm nào</Typography>
            ) : (
              <Box sx={{ mt: 1 }}>
                {years.map((year) => (
                  <Typography key={year.id} sx={{ py: 0.5, color: 'grey.300' }}>
                    {year.release_year}
                  </Typography>
                ))}
              </Box>
            )}
          </Box>
        </Card>
      </Box>
    </Box>
  );

  return (
    <DashboardContent>
      <Box sx={{ mb: 5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4">Quản lý danh mục</Typography>
      </Box>
      {renderSettingsForm()}
    </DashboardContent>
  );
}
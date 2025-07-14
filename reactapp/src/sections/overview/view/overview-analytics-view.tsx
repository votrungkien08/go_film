import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

import { use, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios, { AxiosError } from 'axios';

import { DashboardContent } from 'src/layouts/dashboard';
import { _posts, _tasks, _traffic, _timeline } from 'src/_mock';

import { AnalyticsNews } from '../analytics-news';
import { AnalyticsTasks } from '../analytics-tasks';
import { AnalyticsCurrentVisits } from '../analytics-current-visits';
import { AnalyticsOrderTimeline } from '../analytics-order-timeline';
import { AnalyticsWebsiteVisits } from '../analytics-website-visits';
import { AnalyticsWidgetSummary } from '../analytics-widget-summary';
import { AnalyticsTrafficBySite } from '../analytics-traffic-by-site';
import { AnalyticsCurrentSubject } from '../analytics-current-subject';
import { AnalyticsConversionRates } from '../analytics-conversion-rates';

import { useComments } from '../../../hooks/useComment';
import { useUser } from '../../../hooks/useUser';
import { color } from 'framer-motion';

// ----------------------------------------------------------------------
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
export function OverviewAnalyticsView() {

  const [films, setFilms] = useState([]);
  const [formError, setFormError] = useState('');
  const [user, setUser] = useState<{ name: string; role: string } | null>(null);
  const [error, setError] = useState('');
  const [loadingData, setLoadingData] = useState(true);
  const [loadingUser, setLoadingUser] = useState(true);

  const [totalTransactionAmount, setTotalTransactionAmount] = useState(0);

  const navigate = useNavigate();

  // State cho danh sách năm, quốc gia, và thể loại
  const [years, setYears] = useState<Year[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);


  // State cho dữ liệu lượt xem theo ngày
  const [viewStats, setViewStats] = useState<{ month: string; views: number }[]>([]);

  const { comments, commentsLoading, commentsError } = useComments(undefined, false, true);
  const { allUsers } = useUser();
  const [transactionStats, setTransactionStats] = useState<{ month: string; total_amount: number }[]>([]);
  console.log('all user', allUsers);

  useEffect(() => {
    console.log('log ra')
    const fetchData = async () => {

      setLoadingData(true);
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
        // setFilms(filmsResponse.data);
        setFilms(filmsResponse.data.map((film: any) => ({
          ...film,
          film_type: film.film_type === 1 ? false : true, // 0 = Phim Lẻ (true), 1 = Phim Bộ (false)
          year: film.year ? { id: film.year.id, release_year: film.year.release_year } : null,
          country: film.country ? { id: film.country.id, country_name: film.country.country_name } : null,
          genres: film.genres || [],
        })));
      } catch (err: any) {
        console.error('Lỗi khi lấy dữ liệu:', err.response?.data || err.message);
        setFormError('Không thể tải dữ liệu năm, quốc gia, thể loại hoặc phim.');
      } finally {
        setLoadingData(false);

      }
    };
    fetchData();
  }, [navigate]);

  useEffect(() => {
    const fetchUser = async () => {
      setLoadingUser(true);
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/');
          return;
        }
        const response = await axios.get('http://localhost:8000/api/user', {
          headers: { Authorization: `Bearer ${token}` }
        });
        // console.log('user nè',response.data);
        if (response.data.user.role !== 'admin') {
          navigate('/');
          return;
        }
        setUser(response.data.user);
        // setAllUsers(allUsers)
        // setAllUsers(usersRes)
      } catch (err: any) {
        console.error('Lỗi API:', err);
        setError('Không thể tải thông tin người dùng');
        navigate('/');
      } finally {
        setLoadingUser(false);

      }
    };
    fetchUser();
  }, [navigate]);

  useEffect(() => {
    // Lấy thống kê lượt xem theo ngày
    const fetchViewStats = async () => {
      try {
        const res = await axios.get('http://localhost:8000/api/view-stats-by-month');
        setViewStats(res.data);
      } catch (err) {
        console.error('Lỗi khi lấy thống kê lượt xem:', err);
      }
    };
    fetchViewStats();
  }, []);
  useEffect(() => {
    const fetchTotalTransactionAmount = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/');
          return;
        }
        const response = await axios.get('http://localhost:8000/api/total-transaction-amount', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setTotalTransactionAmount(response.data.total_amount);
      } catch (err: any) {
        console.error('Lỗi khi lấy tổng số tiền giao dịch:', err.response?.data || err.message);
        setError('Không thể tải tổng số tiền giao dịch');
      }
    };
    fetchTotalTransactionAmount();
  }, [navigate]);
  useEffect(() => {
    const fetchTransactionStats = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/');
          return;
        }
        const res = await axios.get('http://localhost:8000/api/transaction-amount-by-month', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setTransactionStats(res.data);
      } catch (err) {
        console.error('Lỗi khi lấy thống kê giao dịch:', err);
      }
    };
    fetchTransactionStats();
  }, [navigate]);

  if (loadingData || loadingUser) return <Typography>Loading...</Typography>;
  return (
    <DashboardContent maxWidth="xl">
      <Typography variant="h4" sx={{ mb: { xs: 3, md: 5 } }}>
        Xin chào đã trở lại 👋
      </Typography>

      <Grid container spacing={3}>

        {/* Tổng số phim */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <AnalyticsWidgetSummary
            title="Tổng số phim"
            total={films.length}
            icon={<img alt="Weekly sales" src="/assets/icons/glass/ic-glass-bag.svg" />}
            chart={{
              categories: [],
              series: [],
            }}
          />
        </Grid>


        {/* Tổng số người dùng */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <AnalyticsWidgetSummary
            title="Người dùng"
            total={allUsers.length}
            color="secondary"
            icon={<img alt="New users" src="/assets/icons/glass/ic-glass-users.svg" />}
            chart={{
              categories: [],
              series: [],
            }}
          />
        </Grid>


        {/* Tổng số bình luận */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <AnalyticsWidgetSummary
            title="Bình luận"
            total={comments.length}
            color="warning"
            icon={<img alt="Purchase orders" src="/assets/icons/glass/ic-glass-message.svg" />}
            chart={{
              categories: [],
              series: [],
            }}
          />
        </Grid>


        {/* Tổng số giao dịch */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <AnalyticsWidgetSummary
            title="Giao dịch"
            total={totalTransactionAmount} // TODO: thay bằng số giao dịch thực tế nếu có
            color="error"
            icon={<img alt="Messages" src="/assets/icons/glass/ic-glass-buy.svg" />}
            chart={{
              categories: [],
              series: [],
            }}
          />
        </Grid>


        {/* Biểu đồ tròn: Thống kê thể loại phim - bên trái */}
        <Grid size={{ xs: 12, md: 6, lg: 4 }}>
          <AnalyticsCurrentVisits
            title="Tỉ lệ các thể loại phim"
            chart={{
              series: genres.map((g) => ({ label: g.genre_name, value: films.filter(f => f.genres.some(gg => gg.genre_name === g.genre_name)).length })),
            }}
          />
        </Grid>


        {/* Container cho 2 biểu đồ bên phải */}
        <Grid size={{ xs: 12, md: 6, lg: 8 }}>
          <Grid container spacing={3}>
            {/* Biểu đồ cột: Thống kê lượt xem theo tháng */}
            <Grid size={{ xs: 12 }}>
              <AnalyticsWebsiteVisits
                title="Lượt xem phim theo tháng"
                subheader="Thống kê lượt xem từng tháng"
                chart={{
                  categories: viewStats.map(item => item.month),
                  series: [
                    {
                      name: 'Lượt xem',
                      data: viewStats.map(item => item.views),
                    },
                  ],
                }}
              />
            </Grid>

            {/* Biểu đồ đường: Số tiền giao dịch theo tháng */}
            <Grid size={{ xs: 12 }}>
              <AnalyticsWebsiteVisits
                title="Số tiền giao dịch theo tháng"
                subheader="Thống kê tổng tiền giao dịch từng tháng"
                chart={{
                  categories: transactionStats.map(item => item.month),
                  series: [
                    {
                      name: 'Tổng tiền',
                      data: transactionStats.map(item => item.total_amount),
                    },
                  ],
                  options: {
                    chart: { type: 'line' },
                    stroke: { curve: 'smooth', width: 2 },
                    markers: { size: 4 },
                  },
                }}
              />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </DashboardContent>
  );
}


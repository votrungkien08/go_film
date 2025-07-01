import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { useEffect, useState } from 'react';
import {  useNavigate } from 'react-router-dom';
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
   // const [error, setError] = useState('');
  const navigate = useNavigate();

  // State cho danh sách năm, quốc gia, và thể loại
  const [years, setYears] = useState<Year[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);

  const {comments, commentsLoading, commentsError}  = useComments(undefined,false,true);
  const {allUsers} = useUser();
  console.log('all user',allUsers);

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
          }finally {
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
  if (loadingData || loadingUser) return <Typography>Loading...</Typography>;
  return (
    <DashboardContent maxWidth="xl">
      <Typography variant="h4" sx={{ mb: { xs: 3, md: 5 } }}>
        Hi, Welcome back 👋
      </Typography>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <AnalyticsWidgetSummary
            title="Tổng số phim"
            percent={2.6}
            total={films.length}
            icon={<img alt="Weekly sales" src="/assets/icons/glass/ic-glass-bag.svg" />}
            chart={{
              categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
              series: [22, 8, 35, 50, 82, 84, 77, 12],
            }}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <AnalyticsWidgetSummary
            title="Users"
            percent={-0.1}
            total={allUsers.length}
            color="secondary"
            icon={<img alt="New users" src="/assets/icons/glass/ic-glass-users.svg" />}
            chart={{
              categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
              series: [56, 47, 40, 62, 73, 30, 23, 54],
            }}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <AnalyticsWidgetSummary
            title="Comments"
            percent={2.8}
            total={comments.length}
            color="warning"
            icon={<img alt="Purchase orders" src="/assets/icons/glass/ic-glass-buy.svg" />}
            chart={{
              categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
              series: [40, 70, 50, 28, 70, 75, 7, 64],
            }}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <AnalyticsWidgetSummary
            title="Messages"
            percent={3.6}
            total={234}
            color="error"
            icon={<img alt="Messages" src="/assets/icons/glass/ic-glass-message.svg" />}
            chart={{
              categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
              series: [56, 30, 23, 54, 47, 40, 62, 73],
            }}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6, lg: 4 }}>
          <AnalyticsCurrentVisits
            title="Current visits"
            chart={{
              series: [
                { label: 'America', value: 3500 },
                { label: 'Asia', value: 2500 },
                { label: 'Europe', value: 1500 },
                { label: 'Africa', value: 500 },
              ],
            }}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6, lg: 8 }}>
          <AnalyticsWebsiteVisits
            title="Website visits"
            subheader="(+43%) than last year"
            chart={{
              categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
              series: [
                { name: 'Team A', data: [43, 33, 22, 37, 67, 68, 37, 24, 55] },
                { name: 'Team B', data: [51, 70, 47, 67, 40, 37, 24, 70, 24] },
              ],
            }}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6, lg: 8 }}>
          <AnalyticsConversionRates
            title="Conversion rates"
            subheader="(+43%) than last year"
            chart={{
              categories: ['Italy', 'Japan', 'China', 'Canada', 'France'],
              series: [
                { name: '2022', data: [44, 55, 41, 64, 22] },
                { name: '2023', data: [53, 32, 33, 52, 13] },
              ],
            }}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6, lg: 4 }}>
          <AnalyticsCurrentSubject
            title="Current subject"
            chart={{
              categories: ['English', 'History', 'Physics', 'Geography', 'Chinese', 'Math'],
              series: [
                { name: 'Series 1', data: [80, 50, 30, 40, 100, 20] },
                { name: 'Series 2', data: [20, 30, 40, 80, 20, 80] },
                { name: 'Series 3', data: [44, 76, 78, 13, 43, 10] },
              ],
            }}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6, lg: 8 }}>
          <AnalyticsNews title="News" list={_posts.slice(0, 5)} />
        </Grid>

        <Grid size={{ xs: 12, md: 6, lg: 4 }}>
          <AnalyticsOrderTimeline title="Order timeline" list={_timeline} />
        </Grid>

        <Grid size={{ xs: 12, md: 6, lg: 4 }}>
          <AnalyticsTrafficBySite title="Traffic by site" list={_traffic} />
        </Grid>

        <Grid size={{ xs: 12, md: 6, lg: 8 }}>
          <AnalyticsTasks title="Tasks" list={_tasks} />
        </Grid>
      </Grid>
    </DashboardContent>
  );
}

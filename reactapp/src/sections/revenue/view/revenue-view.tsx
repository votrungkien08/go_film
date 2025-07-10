import { useState, useEffect } from 'react';
import axios from 'axios';
import { AnalyticsWebsiteVisits } from '../../overview/analytics-website-visits'; // Thay bằng đường dẫn thực tế
import AdRevenue from './ads-revenue-view'; // Đảm bảo đường dẫn đúng nếu dùng component này
import CustomerRevenue  from './customer-renenue-view'; // Đảm bảo đường dẫn đúng nếu dùng component này
import { toast } from 'sonner';
import { Sheet } from 'lucide-react';
export function RevenueView() {
  const [monthlyData, setMonthlyData] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [month, setMonth] = useState<string>(String(new Date().getMonth() + 1));
  const [year, setYear] = useState<string>(String(new Date().getFullYear()));
  const [error, setError] = useState(null);
  const [tab, setTab] = useState<'ads' | 'customer'>('ads');
  
  const handleExportReport = async () => {
    const token = localStorage.getItem('token');
    const exportUrl = `http://localhost:8000/api/admin/export-revenue-summary?year=${year}&month=${month}`;

    try {
      const response = await fetch(exportUrl, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Lỗi khi tải báo cáo');
      console.log('Response headers:', response.headers);
      console.log('Content-Type:', response.headers.get('Content-Type'));
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `bao_cao_doanh_thu_${month}_${year}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error(error);
      toast.error('Không thể xuất báo cáo');
    }
  };


  useEffect(() => {
    const token = localStorage.getItem('token');
    console.log('Token:', token);
    const parsedMonth = Number(month);
    const parsedYear = Number(year);

    if (!parsedMonth || !parsedYear) return;
    if (!token) {
      setError('No token found. Please login again.');
      return;
    }

    // API theo tab
    let monthlyUrl = '';
    let rangeUrl = '';
    if (tab === 'ads') {
      monthlyUrl = `http://localhost:8000/api/admin/export-monthly-revenue?month=${month}&year=${year}`;
      rangeUrl = `http://localhost:8000/api/admin/monthly-revenue-range?year=${year}`;
    } else if (tab === 'customer') {
      monthlyUrl = `http://localhost:8000/api/admin/monthly-customer-revenue?month=${month}&year=${year}`;
      rangeUrl = `http://localhost:8000/api/admin/monthly-customer-revenue-range?year=${year}`;
    }

    Promise.all([
      axios.get(monthlyUrl, {
        headers: { Authorization: `Bearer ${token}` },
      }),
      axios.get(rangeUrl, {
        headers: { Authorization: `Bearer ${token}` },
      }),
    ])
      .then(([monthlyResponse, chartResponse]) => {
        console.log('Monthly Response:', monthlyResponse.data);
        console.log('Chart Response:', chartResponse.data);
        setMonthlyData(monthlyResponse.data);
        setChartData(chartResponse.data);
      })
      .catch(error => {
        console.error('Error fetching data:', error.response ? error.response.data : error.message);
        setError('Unauthorized or server error. Please login as admin.');
      });
  }, [month, year, tab]);



  if (error) {
    return <div style={{ padding: '20px', color: 'red' }}>{error}</div>;
  }

  if (!monthlyData || !chartData) {
    return <div style={{ padding: '20px' }}>Loading...</div>;
  }
return (
<div className="min-h-screen w-full bg-gray-400 p-6">
  <h1 className="text-3xl font-bold mb-6">Quản Lý Doanh Thu</h1>

  <div className="flex items-center justify-between mb-4">
    <div>
      <button
        onClick={() => setTab('ads')}
        className={`cursor-pointer rounded-md px-4 py-2 mr-2 ${
          tab === 'ads'
            ? 'bg-blue-600 text-white border-blue-600'
            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
        }`}
      >
        Doanh thu quảng cáo
      </button>
      <button
        onClick={() => setTab('customer')}
        className={`cursor-pointer rounded-md px-4 py-2 ${
          tab === 'customer'
            ? 'bg-blue-600 text-white border-blue-600'
            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
        }`}
      >
        Doanh thu khách hàng
      </button>
    </div>

    <div className="px-4 py-2 rounded-md flex justify-between text-white bg-green-700">
      <button onClick={handleExportReport}  className='text-right rounded-md  cursor-pointer'>
        Xuất báo cáo
      </button>
      <Sheet />
    </div>
  </div>

  {tab === 'ads' && (
    <AdRevenue
      month={month}
      setMonth={setMonth}
      year={year}
      setYear={setYear}
      monthlyData={monthlyData}
      chartData={chartData}
    />
  )}
  {tab === 'customer' && (
    <CustomerRevenue
      month={month}
      setMonth={setMonth}
      year={year}
      setYear={setYear}
      monthlyData={monthlyData}
      chartData={chartData}
    />
  )}
</div>

);

}
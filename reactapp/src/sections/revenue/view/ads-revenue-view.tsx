// src/components/admin/AdRevenuePanel.tsx

import React from 'react';
import { AnalyticsWebsiteVisits } from '../../overview/analytics-website-visits'; // Thay bằng đường dẫn thực tế

interface AdRevenueProps {

  month: string;
  setMonth: (month: string) => void;
  year: string;
  setYear: (year: string) => void;
  monthlyData: any;
  chartData: {
    title: string;
    subheader: string;
    categories: string[];
    series: { name: string; data: number[] }[];
  };
}

export default function AdRevenue({

  month,
  setMonth,
  year,
  setYear,
  monthlyData,
  chartData,
}: AdRevenueProps) {
  return (
    <div className="bg-gray-50 p-5 rounded-lg shadow-md w-full">
      <h2 className="text-xl font-semibold text-gray-700 mb-4">
        Doanh Thu Tháng {monthlyData.month}
      </h2>

      <div className="flex justify-between mb-4">
        <div className="space-y-2 text-left text-gray-700 text-base">
          <p>
            <span className="font-medium">Số lượng click:</span> {monthlyData.click_count}
          </p>
          <p>
            <span className="font-medium">Số lượng lượt xem:</span> {monthlyData.view_count}
          </p>
          <p>
            <span className="font-medium">Doanh thu click:</span>{' '}
            {monthlyData.click_revenue?.toLocaleString()} VND
          </p>
          <p>
            <span className="font-medium">Doanh thu lượt xem:</span>{' '}
            {monthlyData.view_revenue?.toLocaleString()} VND
          </p>
          <p>
            <span className="font-medium">Tổng doanh thu:</span>
            <span className="text-green-600 font-bold ml-1">
              {monthlyData.total_revenue?.toLocaleString()} VND
            </span>
          </p>
        </div>

        <div className="flex items-start gap-4">
          <div>
            <label className="block text-left text-sm font-medium text-gray-600">Tháng</label>
            <input
              type="number"
              min="1"
              max="12"
              value={month}
              onChange={(e) => {
                const value = e.target.value;
                if (value === '' || (Number(value) >= 1 && Number(value) <= 12)) {
                  setMonth(String(value));
                }
              }}
              className="mt-1 w-24 px-3 py-1.5 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-left text-sm font-medium text-gray-600">Năm</label>
            <input
              type="number"
              min="2000"
              max="2100"
              value={year}
              onChange={(e) => {
                const value = e.target.value;
                if (value === '' || (Number(value) >= 2000 && Number(value) <= 2100)) {
                  setYear(String(value));
                }
              }}
              className="mt-1 w-32 px-3 py-1.5 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      <AnalyticsWebsiteVisits
        title={chartData.title}
        subheader={chartData.subheader}
        chart={{
          colors: ['#1E3A8A', '#F59E0B'],
          categories: chartData.categories,
          series: chartData.series,
        }}
        sx={{ height: 1 }}
      />
    </div>
  );
}

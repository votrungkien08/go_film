<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\AdEvent;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Log;
class AdEventController extends Controller
{

    // public function track(Request $request)
    // {
    //     try{
    //         Log::info('Track event', $request->all());
    //         $request->validate([
    //             'event_type' => 'required|in:view,click',
    //             'ad_campaign_id' => 'required|exists:ad_campaigns,id',
    //         ]);

    //         AdEvent::create([
    //             'event_type' => $request->event_type,
    //             'ad_campaign_id' => $request->ad_campaign_id,
    //             'ip_address' => $request->ip(),
    //         ]);

    //         return response()->json(['message' => 'ok']);
    //     }catch(\Exception $e) {
    //         return response()->json([
    //             'masseage' => $e->getMessage()
    //         ]);
    //     }
    // }
    public function track(Request $request)
    {
        try {
            Log::info('Track request received', $request->all());

            $request->validate([
                'event_type' => 'required|in:view,click',
                'ad_campaign_id' => 'required|exists:ad_campaigns,id',
            ]);

            $event = AdEvent::create([
                'event_type' => $request->event_type,
                'ad_campaign_id' => $request->ad_campaign_id,
                'ip_address' => $request->ip(),
            ]);

            Log::info('AdEvent created successfully', ['event' => $event]);

            return response()->json(['message' => 'ok']);
        } catch (\Exception $e) {
            Log::error('Lỗi khi tracking event:', ['error' => $e->getMessage()]);
            return response()->json([
                'message' => $e->getMessage()
            ]);
        }
    }
    public function revenue() {
        try {
            $costView = 20000;
            $costClick = 1000;
            
            $clickCount = AdEvent::where('event_type', 'click')->count() ;
            $viewCount = AdEvent::where('event_type', 'view')->count();

            $totleClickRevenue = $clickCount * $costClick;
            $totalViewRevenue = 0;

            if ($viewCount >= 1000) {
                $totalViewRevenue = floor($viewCount/1000) * $costView;
            }

            return response()->json([
                'status' => 'success',
                'click_count' => $clickCount,
                'view_count' => $viewCount,
                'totalViewRevenue' => $totalViewRevenue,
                'totleClickRevenue' => $totleClickRevenue,
                'totalRevenue' => $totalViewRevenue + $totleClickRevenue,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Error fetching comments',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    public function monthlyAdRevenue(Request $request) {
        try {
            $month = $request->input('month',now()->month);
            $year = $request->input('year',now()->year);
            
            $start = Carbon::create($year, $month, 1)->startOfMonth();
            $end = Carbon::create($year,$month,1)->endOfMonth();

            $countView = AdEvent::where('event_type','view')->whereBetween('created_at', [$start, $end])->count(); 
            $countClick = AdEvent::where('event_type','click')->whereBetween('created_at', [$start, $end])->count(); 


            $clickRevenue = $countClick * 1000;
            $viewRevenue = $countView >= 1000 ? floor($countView/1000) * 20000 : 0;


            return response()->json([
            'month' => "$month/$year",
            'click_count' => $countClick,
            'view_count' => $countView,
            'click_revenue' => $clickRevenue,
            'view_revenue' => $viewRevenue,
            'total_revenue' => $clickRevenue + $viewRevenue,
        
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Error fetching comments',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    public function monthlyAdRevenueRange(Request $request)
    {
        try {
            $year = $request->input('year', now()->year); 

            $months = [];
            $clickCounts = [];
            $viewCounts = [];
            $clickRevenues = [];
            $viewRevenues = [];
            $totalRevenues = [];

            for ($month = 1; $month <= 12; $month++) {
                $start = Carbon::create($year, $month, 1)->startOfMonth();
                $end = Carbon::create($year, $month, 1)->endOfMonth();

                $countView = AdEvent::where('event_type', 'view')->whereBetween('created_at', [$start, $end])->count();
                $countClick = AdEvent::where('event_type', 'click')->whereBetween('created_at', [$start, $end])->count();

                $clickRevenue = $countClick * 1000;
                $viewRevenue = $countView >= 1000 ? floor($countView / 1000) * 20000 : 0;
                $totalRevenue = $clickRevenue + $viewRevenue;

                $months[] = "$month/$year";
                $clickCounts[] = $countClick;
                $viewCounts[] = $countView;
                $clickRevenues[] = $clickRevenue;
                $viewRevenues[] = $viewRevenue;
                $totalRevenues[] = $totalRevenue;
            }

            return response()->json([
                'title' => 'Doanh thu quảng cáo theo tháng',
                'subheader' => "Năm {$year}",
                'categories' => $months,
                'series' => [
                    ['name' => 'Doanh thu click', 'data' => $clickRevenues],
                    ['name' => 'Doanh thu lượt xem', 'data' => $viewRevenues],
                ],
                'details' => [
                    'click_counts' => $clickCounts,
                    'view_counts' => $viewCounts,
                    'total_revenues' => $totalRevenues,
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Error fetching revenue',
                'message' => $e->getMessage(),
            ], 500);
        }
    }
}

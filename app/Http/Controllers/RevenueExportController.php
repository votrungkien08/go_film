<?php

namespace App\Http\Controllers;

use App\Exports\FromArrayExport;
use App\Http\Controllers\Controller;
use App\Models\AdEvent;
use App\Models\Transaction;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;
use Illuminate\Support\Facades\Log;
class RevenueExportController extends Controller
{
    // public function exportSummary(Request $request)
    // {
    //     $year = $request->input('year', now()->year);
    //     $monthParam = $request->input('month'); // nếu null thì là xuất cả năm
        
    //     $months = $monthParam ? [$monthParam] : range(1, 12); // chỉ 1 tháng hoặc cả 12 tháng

    //     $adRows = [];
    //     $adRows[] = ['', '', '', '', '', ''];
    //     $adRows[] = ['=== Doanh thu quảng cáo ===', '', '', '', '', ''];
    //     $adRows[] = ['Tháng', 'Lượt xem', 'Lượt click', 'Doanh thu view (VNĐ)', 'Doanh thu click (VNĐ)', 'Tổng doanh thu (VNĐ)'];

    //     foreach ($months as $month) {
    //         $start = Carbon::create($year, $month, 1)->startOfMonth();
    //         $end = Carbon::create($year, $month, 1)->endOfMonth();

    //         $countView = AdEvent::where('event_type', 'view')->whereBetween('created_at', [$start, $end])->count();
    //         $countClick = AdEvent::where('event_type', 'click')->whereBetween('created_at', [$start, $end])->count();

    //         $clickRevenue = $countClick * 1000;
    //         $viewRevenue = $countView >= 1000 ? floor($countView / 1000) * 20000 : 0;
    //         $totalRevenue = $clickRevenue + $viewRevenue;

    //         $adRows[] = ["$month/$year", $countView, $countClick, $viewRevenue, $clickRevenue, $totalRevenue];
    //     }
    //     $cusRows = [];
    //     $cusRows[] = ['', '', '', '', '', '', ];
    //     $cusRows[] = ['=== Doanh thu khách hàng ===', '', '', '', '', ''];
    //     $cusRows[] = ['Tháng', 'Số giao dịch', 'Tổng tiền (VNĐ)', '', '', ''];

    //     foreach ($months as $month) {
    //         $start = Carbon::create($year, $month, 1)->startOfMonth();
    //         $end = Carbon::create($year, $month, 1)->endOfMonth();

    //         $transactions = Transaction::where('status', 'success')
    //             ->whereBetween('updated_at', [$start, $end])
    //             ->get();

    //         $monthlyAmount = $transactions->sum('amount');
    //         $monthlyCount = $transactions->count();

    //         // ✅ Đảm bảo đủ 6 cột
    //         $cusRows[] = ["$month/$year", $monthlyCount, $monthlyAmount, '', '', ''];
    //     }

    //     $allRows = array_merge($adRows, $cusRows);

    //     foreach ($allRows as $i => &$row) {
    //         // Bắt buộc phải là array
    //         if (!is_array($row)) {
    //             Log::error("Dòng $i không phải là array", ['row' => $row]);
    //             $row = [(string) $row, '', '', '', '', ''];
    //         }

    //         // Chuẩn hóa cột đúng 6
    //         $row = array_pad($row, 6, '');

    //         // Kiểm tra từng giá trị có hợp lệ không
    //         foreach ($row as $j => &$cell) {
    //             if (is_array($cell) || is_object($cell)) {
    //                 Log::error("❌ Cell [$i][$j] là object/array", ['value' => $cell]);
    //                 $cell = ''; // fix về chuỗi rỗng
    //             } else if (!mb_check_encoding($cell, 'UTF-8')) {
    //                 Log::error("❌ Cell [$i][$j] không phải UTF-8", ['value' => $cell]);
    //                 $cell = ''; // fix lỗi encode
    //             }
    //         }
    //     }

    //     $filename = $monthParam
    //         ? "bao_cao_doanh_thu_{$monthParam}_{$year}.xlsx"
    //         : "bao_cao_doanh_thu_{$year}.xlsx";

    //     return Excel::download(new FromArrayExport($allRows), $filename);
    // }
public function exportSummary(Request $request)
{
    $year = $request->input('year', now()->year);
    $monthParam = $request->input('month'); // nếu null thì là xuất cả năm
    
    $months = $monthParam ? [$monthParam] : range(1, 12); // chỉ 1 tháng hoặc cả 12 tháng

    $adRows = [];
    $adRows[] = ['', '', '', '', '', ''];
    $adRows[] = ['=== Doanh thu quảng cáo ===', '', '', '', '', ''];
    $adRows[] = ['Tháng', 'Lượt xem', 'Lượt click', 'Doanh thu view (VNĐ)', 'Doanh thu click (VNĐ)', 'Tổng doanh thu (VNĐ)'];

    foreach ($months as $month) {
        $start = Carbon::create($year, $month, 1)->startOfMonth();
        $end = Carbon::create($year, $month, 1)->endOfMonth();

        $countView = AdEvent::where('event_type', 'view')->whereBetween('created_at', [$start, $end])->count();
        $countClick = AdEvent::where('event_type', 'click')->whereBetween('created_at', [$start, $end])->count();

        $clickRevenue = $countClick * 1000;
        $viewRevenue = $countView >= 1000 ? floor($countView / 1000) * 20000 : 0;
        $totalRevenue = $clickRevenue + $viewRevenue;

        // ✅ Đảm bảo tất cả là string hoặc số, không có null
        $adRows[] = [
            $month . '/' . $year,
            (int) $countView,
            (int) $countClick,
            (int) $viewRevenue,
            (int) $clickRevenue,
            (int) $totalRevenue
        ];
    }
    
    $cusRows = [];
    $cusRows[] = ['', '', '', '', '', ''];
    $cusRows[] = ['=== Doanh thu khách hàng ===', '', '', '', '', ''];
    $cusRows[] = ['Tháng', 'Số giao dịch', 'Tổng tiền (VNĐ)', '', '', ''];

    foreach ($months as $month) {
        $start = Carbon::create($year, $month, 1)->startOfMonth();
        $end = Carbon::create($year, $month, 1)->endOfMonth();

        $transactions = Transaction::where('status', 'success')
            ->whereBetween('updated_at', [$start, $end])
            ->get();

        $monthlyAmount = $transactions->sum('amount');
        $monthlyCount = $transactions->count();

        // ✅ Đảm bảo tất cả là string hoặc số, không có null
        $cusRows[] = [
            $month . '/' . $year,
            (int) $monthlyCount,
            (int) $monthlyAmount,
            '',
            '',
            ''
        ];
    }

    // ✅ Merge và làm sạch dữ liệu
    $allRows = array_merge($adRows, $cusRows);

    // ✅ Làm sạch và chuẩn hóa dữ liệu
    foreach ($allRows as $i => &$row) {
        // Đảm bảo là array
        if (!is_array($row)) {
            $row = [(string) $row, '', '', '', '', ''];
        }

        // Chuẩn hóa đúng 6 cột
        $row = array_pad($row, 6, '');
        $row = array_slice($row, 0, 6); // Chỉ lấy 6 cột đầu

        // Làm sạch từng cell
        foreach ($row as $j => &$cell) {
            if (is_null($cell)) {
                $cell = '';
            } elseif (is_array($cell) || is_object($cell)) {
                $cell = '';
            } elseif (is_bool($cell)) {
                $cell = $cell ? '1' : '0';
            } elseif (is_numeric($cell)) {
                $cell = (string) $cell;
            } else {
                // Làm sạch string
                $cell = (string) $cell;
                $cell = mb_convert_encoding($cell, 'UTF-8', 'auto');
                $cell = preg_replace('/[\x00-\x1F\x7F]/', '', $cell); // Xóa ký tự điều khiển
            }
        }
    }

    // ✅ Tên file an toàn
    $filename = $monthParam
        ? "bao_cao_doanh_thu_{$monthParam}_{$year}.xlsx"
        : "bao_cao_doanh_thu_{$year}.xlsx";

    // ✅ Tạo filename an toàn
    $filename = preg_replace('/[^a-zA-Z0-9_.-]/', '_', $filename);

    try {
        return Excel::download(new FromArrayExport($allRows), $filename);
    } catch (Exception $e) {
        Log::error('Excel export failed: ' . $e->getMessage());
        return response()->json(['error' => 'Không thể xuất file Excel'], 500);
    }
}
}

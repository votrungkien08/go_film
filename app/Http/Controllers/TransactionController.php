<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Mail;
use App\Mail\PaymentSuccess;
class TransactionController extends Controller
{
    public function createPayment(Request $request)
    {
        $request->validate([
            'points' => 'required|integer|min:1',
            'amount' => 'required|numeric|min:0',
        ]);

        $user = auth()->user();
        if (!$user) {
            Log::warning('Unauthorized access attempt to create payment');
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $txnRef = 'VNPAY-' . Str::random(10);
        $transaction = Transaction::create([
            'user_id' => $user->id,
            'points' => $request->points,
            'amount' => $request->amount,
            'txn_ref' => $txnRef,
            'status' => 'pending',
        ]);

        // Lấy config VNPay
        $vnp_TmnCode = config('services.vnpay.tmn_code');
        $vnp_HashSecret = config('services.vnpay.hash_secret');
        $vnp_Url = config('services.vnpay.url');
        $vnp_ReturnUrl = config('services.vnpay.return_url');

        // Debug log để kiểm tra
        Log::info('VNPay configuration check', [
            'tmn_code' => $vnp_TmnCode ? 'Set' : 'Not set',
            'hash_secret' => $vnp_HashSecret ? 'Set (Length: ' . strlen($vnp_HashSecret) . ')' : 'Not set',
            'url' => $vnp_Url,
            'return_url' => $vnp_ReturnUrl,
        ]);

        // Kiểm tra cấu hình VNPay
        if (empty($vnp_TmnCode) || empty($vnp_HashSecret) || empty($vnp_Url) || empty($vnp_ReturnUrl)) {
            Log::error('Missing VNPay configuration', [
                'tmn_code' => $vnp_TmnCode ?? 'null',
                'hash_secret_exists' => !empty($vnp_HashSecret),
                'url' => $vnp_Url ?? 'null',
                'return_url' => $vnp_ReturnUrl ?? 'null',
            ]);
            return response()->json([
                'message' => 'Lỗi cấu hình hệ thống VNPay. Vui lòng liên hệ quản trị viên.',
                'error' => 'vnpay_config_missing'
            ], 500);
        }

        $vnp_TxnRef = $txnRef;
        $vnp_OrderInfo = "Thanh toan mua {$request->points} diem";
        $vnp_OrderType = 'billpayment';
        $vnp_Amount = $request->amount * 100; // VNPay yêu cầu đơn vị là VND * 100
        $vnp_Locale = 'vn';
        $vnp_IpAddr = $request->ip();
        $vnp_CreateDate = now()->format('YmdHis');

        $inputData = [
            "vnp_Version" => "2.1.0",
            "vnp_TmnCode" => $vnp_TmnCode,
            "vnp_Amount" => $vnp_Amount,
            "vnp_Command" => "pay",
            "vnp_CreateDate" => $vnp_CreateDate,
            "vnp_CurrCode" => "VND",
            "vnp_IpAddr" => $vnp_IpAddr,
            "vnp_Locale" => $vnp_Locale,
            "vnp_OrderInfo" => $vnp_OrderInfo,
            "vnp_OrderType" => $vnp_OrderType,
            "vnp_ReturnUrl" => $vnp_ReturnUrl,
            "vnp_TxnRef" => $vnp_TxnRef,
        ];

        ksort($inputData);
        $query = [];
        foreach ($inputData as $key => $value) {
            $query[] = urlencode($key) . '=' . urlencode($value);
        }
        $queryString = implode('&', $query);
        $vnpSecureHash = hash_hmac('sha512', $queryString, $vnp_HashSecret);
        $vnp_Url .= '?' . $queryString . '&vnp_SecureHash=' . $vnpSecureHash;

        Log::info('VNPay payment URL created successfully', [
            'txn_ref' => $vnp_TxnRef,
            'amount' => $vnp_Amount,
            'points' => $request->points,
            'user_id' => $user->id,
        ]);

        return response()->json([
            'url' => $vnp_Url,
            'txn_ref' => $vnp_TxnRef,
            'message' => 'Tạo giao dịch thành công'
        ]);
    }

    public function callback(Request $request)
    {
        $vnp_HashSecret = config('services.vnpay.hash_secret');
        $frontendUrl = env('FRONTEND_URL', 'http://localhost:5173');

        Log::info('VNPay callback received', $request->all());

        if (!$request->has('vnp_SecureHash') || !$request->has('vnp_TxnRef')) {
            Log::error('Missing vnp_SecureHash or vnp_TxnRef', $request->all());
            return redirect($frontendUrl . '/?payment=error&message=invalid_callback');
        }

        $vnp_SecureHash = $request->vnp_SecureHash;
        $inputData = $request->except('vnp_SecureHash');

        ksort($inputData);
        $query = [];
        foreach ($inputData as $key => $value) {
            if (substr($key, 0, 4) === 'vnp_') {
                $query[] = urlencode($key) . '=' . urlencode($value);
            }
        }
        $hashData = implode('&', $query);
        $secureHash = hash_hmac('sha512', $hashData, $vnp_HashSecret);

        $transaction = Transaction::where('txn_ref', $request->vnp_TxnRef)->first();

        if (!$transaction) {
            Log::error('Transaction not found', ['txn_ref' => $request->vnp_TxnRef]);
            return redirect($frontendUrl . '/?payment=error&message=transaction_not_found');
        }

        if ($secureHash === $vnp_SecureHash) {
            if ($request->vnp_ResponseCode == '00' && $transaction->status === 'pending') {
                $transaction->update([
                    'status' => 'success'
                ]);

                $user = User::find($transaction->user_id);
                if ($user) {
                    $user->points += $transaction->points;
                    $user->save();

                    // Gửi email thông báo thanh toán thành công
                    try {
                        Mail::to($user->email)->send(new PaymentSuccess($transaction, $user));
                        Log::info('Payment success email sent', [
                            'user_id' => $user->id,
                            'email' => $user->email,
                            'tnx_ref' => $transaction->vnp_TxnRef
                        ]);
                    } catch (\Exception $e) {
                        Log::error('Failed to send payment success email', [
                            'user_id' => $user->id,
                            'email' => $user->email,
                            'error' => $e->getMessage()
                        ]);
                    }
                    Log::info('Payment successful, points added', [
                        'user_id' => $user->id,
                        'points_added' => $transaction->points,
                        'new_points' => $user->points,
                        'txn_ref' => $request->vnp_TxnRef,
                    ]);

                    return redirect($frontendUrl . '/?payment=success&points=' . $transaction->points);
                } else {
                    Log::error('User not found', ['user_id' => $transaction->user_id]);
                    return redirect($frontendUrl . '/?payment=error&message=user_not_found');
                }
            } else {
                $transaction->update(['status' => 'failed']);
                Log::warning('Payment failed', [
                    'response_code' => $request->vnp_ResponseCode,
                    'txn_ref' => $request->vnp_TxnRef,
                ]);
                return redirect($frontendUrl . '/?payment=failed&code=' . $request->vnp_ResponseCode);
            }
        }

        Log::error('Invalid secure hash', [
            'txn_ref' => $request->vnp_TxnRef,
            'calculated_hash' => $secureHash,
            'received_hash' => $vnp_SecureHash
        ]);
        return redirect($frontendUrl . '/?payment=error&message=invalid_hash');
    }
    public function getTotalSuccessAmount()
    {
        try {
            $totalAmount = Transaction::where('status', 'success')
                ->sum('amount');

            return response()->json([
                'total_amount' => $totalAmount,
                'message' => 'Lấy tổng số tiền giao dịch thành công'
            ]);
        } catch (\Exception $e) {
            Log::error('Lỗi khi lấy tổng số tiền giao dịch:', [
                'error' => $e->getMessage()
            ]);
            return response()->json([
                'message' => 'Không thể lấy tổng số tiền giao dịch',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    public function getUserPaymentHistories(Request $request)
    {
        try {
            $user = auth()->user();
            if (!$user) {
                Log::warning('Bạn cần đăng nhập để xem lịch sử thanh toán');
                return response()->json(['message' => 'Unauthorized'], 401);
            }

            $transactions = Transaction::where('user_id', $user->id)
                ->select('id', 'points', 'amount', 'txn_ref', 'status', 'created_at', 'updated_at')
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json([

                'message' => 'Lấy lịch sử giao dịch thành công',
                'transactions' => $transactions,
            ], 200);
        } catch (\Exception $e) {
            Log::error('Lỗi khi lấy lịch sử giao dịch:', [
                'error' => $e->getMessage(),
                'user_id' => $user->id ?? 'unknown',
            ]);
            return response()->json([
                'message' => 'Không thể lấy lịch sử giao dịch',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    public function getAmountByMonth()
    {
        $months = request()->input('months', 12); // Mặc định lấy 12 tháng gần nhất
        $result = \DB::table('transactions')
            ->selectRaw('DATE_FORMAT(created_at, "%m-%Y") as month, SUM(amount) as total_amount')
            ->where('created_at', '>=', now()->subMonths($months))
            ->where('status', 'success')
            ->groupByRaw('DATE_FORMAT(created_at, "%m-%Y")')
            ->orderBy('month')
            ->get();
        return response()->json($result);
    }
}
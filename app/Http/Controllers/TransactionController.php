<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

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

        $vnp_TmnCode = env('VNPAY_TMN_CODE');
        $vnp_HashSecret = env('VNPAY_HASH_SECRET');
        $vnp_Url = env('VNPAY_URL');
        $vnp_ReturnUrl = env('VNPAY_RETURN_URL');

        $vnp_TxnRef = $txnRef;
        $vnp_OrderInfo = "Thanh toán mua {$request->points} điểm";
        $vnp_OrderType = 'billpayment';
        $vnp_Amount = $request->amount * 100;
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
        $query = http_build_query($inputData);
        $hashData = $query;
        $vnpSecureHash = hash_hmac('sha512', $hashData, $vnp_HashSecret);
        $vnp_Url .= '?' . $query . '&vnp_SecureHash=' . $vnpSecureHash;

        return response()->json(['url' => $vnp_Url]);
    }

    public function callback(Request $request)
    {
        $vnp_HashSecret = env('VNPAY_HASH_SECRET');
        $vnp_SecureHash = $request->vnp_SecureHash;
        $inputData = $request->except('vnp_SecureHash');

        ksort($inputData);
        $hashData = http_build_query($inputData);
        $secureHash = hash_hmac('sha512', $hashData, $vnp_HashSecret);

        $transaction = Transaction::where('txn_ref', $request->vnp_TxnRef)->first();
        $appUrl = env('APP_URL');

        if ($secureHash === $vnp_SecureHash && $transaction) {
            if ($request->vnp_ResponseCode == '00') {
                $transaction->update(['status' => 'success']);
                $user = User::find($transaction->user_id);
                $user->points += $transaction->points;
                $user->save();

                return redirect($appUrl . '/?payment=SUCCESS');
            } else {
                $transaction->update(['status' => 'failed']);
                return redirect($appUrl . '/?payment=FAILED');
            }
        }

        return redirect($appUrl . '/?payment=ERROR');
    }
}
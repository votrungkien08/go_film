<?php

namespace App\Mail;

use App\Models\Transaction;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class PaymentSuccess extends Mailable
{
    use Queueable, SerializesModels;

    public $transaction;
    public $user;

    public function __construct(Transaction $transaction, $user)
    {
        $this->transaction = $transaction;
        $this->user = $user;
    }

    public function build()
    {
        return $this->subject('Thanh Toán Thành Công - Mua Điểm Premium')
            ->view('emails.payment_success')
            ->with([
                'userName' => $this->user->name,
                'points' => $this->transaction->points,
                'amount' => number_format($this->transaction->amount, 0, ',', '.'),
                'txnRef' => $this->transaction->txn_ref,
                'date' => now()->format('d/m/Y H:i'),
            ]);
    }
}
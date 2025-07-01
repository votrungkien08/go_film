<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ChatbotHistory extends Model
{
    use HasFactory;

    protected $table = 'chatbot_histories';

    protected $fillable = [
        'user_id',
        'user_message',
        'bot_response',
    ];
}
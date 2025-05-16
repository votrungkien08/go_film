<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Comment extends Model
{
    protected $table = 'comment';
    protected $fillable = [
        'user_id',
        'film_id',
        'comment',
        'created_at',
    ];

    public function user()
    {
        return $this->belongsTo(User::class,'user_id');
    }

    public function film()
    {
        return $this->belongsTo(Film::class,'film_id');
    }
}

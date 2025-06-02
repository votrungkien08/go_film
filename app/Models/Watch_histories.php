<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Watch_histories extends Model
{
    protected $table = 'watch_histories';
    public $timestamps = false;
    protected $fillable = [
        'user_id',
        'episodes_id',
        'watch_at',
        'progress_time',
    ];


    public function user()
    {
        return $this->belongsTo(User::class,'user_id');
    }

    public function episodes()
    {
        return $this->belongsTo(Film_episodes::class,'episodes_id');
    }
}

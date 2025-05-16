<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Watch_histories extends Model
{
  protected $table = 'watch_histories';
    protected $fillable = [
        'user_id',
        'film_id',
        'watch_at',
    ];


    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function film()
    {
        return $this->belongsTo(Film::class);
    }
}

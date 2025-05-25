<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Favorite extends Model
{
    protected $table = 'favorite';
    protected $fillable = [
        'user_id',
        'film_id',
    ];
    public function user() {
        return $this->belongsTo(User::class,'user_id');
    }
    public function film() {
        return $this->belongsTo(Film::class,'film_id');
    }
}

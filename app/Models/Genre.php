<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Genre extends Model
{
    protected $table = 'genre';
    public $timestamps = false;

    protected $fillable = [
        'genre_name',

    ];

    public function films()
    {
        return $this->belongsToMany(Film::class, 'film_genre', 'genre_id', 'film_id');
    }
}
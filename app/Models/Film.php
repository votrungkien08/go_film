<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Film extends Model
{
    protected $table = 'film';
    public $timestamps = false;
    protected $fillable = [
        'slug',
        'title_film',
        'thumb',
        'trailer',
        'film_type',
        'actor',
        'director',
        'content',
        'view',
        'year_id',
        'country_id',
        'is_premium',
        'point_required',
    ];

    public function year() {
        return $this->belongsTo(Year::class,'year_id');
    }
    public function country() {
        return $this->belongsTo(Country::class,'country_id');
    }
    public function film_episodes() {
        return $this->hasMany(Film_episodes::class,'film_id');
    }
    public function genres() {
        return $this->belongsToMany(Genre::class, 'film_genre','film_id','genre_id');
    }
    public function comments() {
        return $this->hasMany(Comment::class,'film_id');
    }
    public function favorites() {
        return $this->hasMany(Favorite::class,'film_id');
    }
    public function ratings() {
        return $this->hasMany(Rating::class,'film_id');
    }
    // public function watch_histories() {
    //     return $this->hasMany(Watch_histories::class,'film_id');
    // }
}

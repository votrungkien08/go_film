<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserFilmView extends Model
{
    use HasFactory;

    protected $table = 'user_film_views';

    protected $fillable = [
        'user_id',
        'film_id',
        'episode_id',
        'points_deducted',
        'points_deducted_amount',
        'viewed_at',
        'points_rewarded',
        'points_rewarded_amount',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function film()
    {
        return $this->belongsTo(Film::class);
    }

    public function episode()
    {
        return $this->belongsTo(Film_episodes::class, 'episode_id');
    }
}
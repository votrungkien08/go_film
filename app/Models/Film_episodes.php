<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Film_episodes extends Model
{
protected $table = 'film_episodes';
    protected $fillable = [
        'film_id',
        'episode_number',
        'episode_title',
        'episode_url',
        'duration',
    ];

    public function films()
    {
        return $this->belongsTo(Film::class, 'film_id');
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Year extends Model
{
    protected $table = 'year';
    protected $fillable = [
        'release_year',
    ];


    public function films() {
        return $this->hasMany(Film::class,'year_id');
    }
}

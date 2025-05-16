<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Country extends Model
{
    protected $table = 'country';
    protected $fillable = [
        'country_name',
    ];

    public function films() {
        return $this->hasMany(Film::class,'country_id');
    }
}

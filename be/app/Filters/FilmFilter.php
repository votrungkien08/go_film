<?php

namespace App\Filters;

use App\Filters\QueryFilter;
use Illuminate\Support\Facades\Log;

class FilmFilter extends QueryFilter
{
    protected $filterable = [
        'film_type',
        // 'title_film',
        'genre',
        'year',
        'country',
        'type'
    ];

    public function filterType($filmType)
    {
        return $this->builder->where('film_type', $filmType);
    }
    public function filterSearch($title)
    {
        return $this->builder->where('title_film', 'like', '%' . $title . '%');
    }
    public function filterAdvance($title)
    {
        return $this->builder->where('title_film', 'like', '%' . $title . '%');
    }

    public function filterGenre($values)
    {
        $genres = is_array($values) ? $values : array_filter(explode(',', $values));
        Log::info('Filter genres before whereHas', $genres);
        return $this->builder->whereHas('genres', function ($queyry) use ($genres) {
            Log::info('Filter genres:', $genres);
            $queyry->whereIn('slug', $genres);
        });
    }

    public function filterYear($value)
    {
        return $this->builder->whereHas('year', function ($query) use ($value) {
            $query->where('release_year', $value);
        });
    }
    public function filterCountry($slug)
    {
        return $this->builder->whereHas('country', function ($query) use ($slug) {
            $query->where('slug', $slug);
        });
    }
}

<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class FilmStoreRequest extends FormRequest
{

    public function authorize(): bool
    {
        //return false;
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
            return [
                'title_film' => 'required|string|max:255',
                'thumb' => 'required|string|max:255',
                'film_type' => 'required|boolean',
                'year_id' => 'required|exists:year,id',
                'country_id' => 'required|exists:country,id',
                'actor' => 'required|string',
                'director' => 'required|string',
                'content' => 'required|string',
                'view' => 'required|integer',
                'genre_id' => 'required|array', // Phải là một mảng
                'genre_id.*'    => 'integer|exists:genre,id',  // từng phần tử
            ];
       
    }

    public function messages()
    {
        
            return [
             
                'title_film.required' => 'title_film is required',
                'thumb.required' => 'thumb is required',
                'film_type.required' => 'film_type is required',
                'year_id.required' => 'year_id is required',
                'country_id.required' => 'country_id is required',
                'actor.required' => 'actor is required',
                'director.required' => 'director is required',
                'content.required' => 'content is required',
                'view.required' => 'view is required',
                // 'genre_id.required' => 'luot_xem is required',
            ];

    }
}

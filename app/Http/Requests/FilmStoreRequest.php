<?php
namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class FilmStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'slug' => 'required|string|max:255|unique:Film,slug',
            'title_film' => 'required|string|max:255',
            'thumb' => 'required|string|max:255',
            'film_type' => 'required|boolean',
            'year_id' => 'required|exists:year,id',
            'country_id' => 'required|exists:country,id',
            'actor' => 'required|string',
            'director' => 'required|string',
            'content' => 'required|string',
            'view' => 'required|integer|min:0',
            'genre_id' => 'required|array|min:1',
            'genre_id.*' => 'integer|exists:genre,id',
            'film_episodes' => 'required_if:film_type,false|array|min:1',
            'film_episodes.*.episode_number' => 'required|integer|min:1',
            'film_episodes.*.episode_title' => 'nullable|string',
            'film_episodes.*.episode_url' => 'required|url',
            'film_episodes.*.duration' => 'nullable|string',
            'is_premium' => 'boolean',
            'point_required' => [
                'nullable',
                'integer',
                'min:0',
                Rule::requiredIf($this->is_premium), // Bắt buộc nếu is_premium là true
            ],
        ];
    }

    public function messages()
    {
        return [
            'slug.required' => 'Slug là bắt buộc.',
            'slug.unique' => 'Slug đã tồn tại.',
            'title_film.required' => 'Tiêu đề phim là bắt buộc.',
            'thumb.required' => 'Thumbnail là bắt buộc.',
            'film_type.required' => 'Loại phim là bắt buộc.',
            'film_type.boolean' => 'Loại phim phải là true hoặc false.',
            'year_id.required' => 'Năm phát hành là bắt buộc.',
            'year_id.exists' => 'Năm phát hành không hợp lệ.',
            'country_id.required' => 'Quốc gia là bắt buộc.',
            'country_id.exists' => 'Quốc gia không hợp lệ.',
            'actor.required' => 'Diễn viên là bắt buộc.',
            'director.required' => 'Đạo diễn là bắt buộc.',
            'content.required' => 'Nội dung là bắt buộc.',
            'view.required' => 'Số lượt xem là bắt buộc.',
            'view.integer' => 'Số lượt xem phải là số nguyên.',
            'view.min' => 'Số lượt xem không được nhỏ hơn 0.',
            'genre_id.required' => 'Vui lòng chọn ít nhất một thể loại.',
            'genre_id.*.exists' => 'Thể loại không hợp lệ.',
            'film_episodes.required_if' => 'Phim bộ cần ít nhất một tập.',
            'film_episodes.*.episode_number.required' => 'Số tập là bắt buộc.',
            'film_episodes.*.episode_number.integer' => 'Số tập phải là số nguyên.',
            'film_episodes.*.episode_number.min' => 'Số tập phải lớn hơn hoặc bằng 1.',
            'film_episodes.*.episode_url.required' => 'URL video là bắt buộc.',
            'film_episodes.*.episode_url.url' => 'URL video không hợp lệ.',
            'is_premium.boolean' => 'Trạng thái premium phải là true hoặc false.',
            'point_required.required' => 'Số điểm yêu cầu là bắt buộc cho phim premium.',
            'point_required.integer' => 'Số điểm yêu cầu phải là số nguyên.',
            'point_required.min' => 'Số điểm yêu cầu không được nhỏ hơn 0.',
        ];
    }
}
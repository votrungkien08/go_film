<?php
namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Log;
class FilmStoreRequest extends FormRequest
{


    public function rules()
    {
        $filmId = $this->route('id'); // Lấy ID từ route khi cập nhật
        Log::info('Request data in FilmStoreRequest:', request()->all());
        return [
            'title_film' => 'required|string',
            'thumb' => 'required|url',
            'film_type' => 'required|integer',
            'year_id' => 'required|integer',
            'country_id' => 'required|integer',
            'actor' => 'required|string',
            'director' => 'required|string',
            'content' => 'required|string',
            'view' => 'required|integer',
            'genre_id' => 'required|array',
            'genre_id.*' => 'integer|exists:genre,id',
'trailer_video' => 'nullable|file|mimes:mp4',
'film_episodes' => 'required|array',
'film_episodes.*.episode_number' => 'required|string',
        'film_episodes.*.episode_title' => 'nullable|string',
        'film_episodes.*.duration' => 'nullable|string',

'film_episodes.*.video' => 'required|file|mimes:mp4',




        ];
    }

    public function messages()
    {
        return [
            'slug.required' => 'Slug là bắt buộc.',
            'slug.unique' => 'Slug đã tồn tại.',
            'thumb.required' => 'Thumbnail là bắt buộc.',
            'film_type.required' => 'Loại phim là bắt buộc.',
            'film_type.integer' => 'Loại phim phải là true hoặc false.',
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
            'is_premium.boolean' => 'Trạng thái premium phải là true hoặc false.',
            'point_required.required' => 'Số điểm yêu cầu là bắt buộc cho phim premium.',
            'point_required.integer' => 'Số điểm yêu cầu phải là số nguyên.',
            'point_required.min' => 'Số điểm yêu cầu không được nhỏ hơn 0.',
        ];
    }
}
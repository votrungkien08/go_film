<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Http\Requests\FilmStoreRequest;
use App\Models\Film;
use App\Models\Film_episodes;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;

class FilmController extends Controller
{

    public function index()
    {
        try {
            // Lấy tất cả phim cùng với thông tin năm, quốc gia, và thể loại
            $films = Film::with(['year', 'country', 'genres', 'film_episodes'])->get();
            return response()->json($films, 200);
        } catch (\Exception $e) {
            Log::error('❌ Error fetching films', ['message' => $e->getMessage()]);
            return response()->json(['error' => 'Không thể lấy danh sách phim'], 500);
        }
    }
    public function show($slug)
    {
        try {
            $film = Film::with(['year', 'country', 'genres', 'film_episodes'])
                ->where('slug', $slug)
                ->firstOrFail();
            return response()->json($film, 200);
        } catch (\Exception $e) {
            Log::error('❌ Error fetching film', ['slug' => $slug, 'message' => $e->getMessage()]);
            return response()->json(['error' => 'Không tìm thấy phim'], 404);
        }
    }
    public function store(FilmStoreRequest $request)
    {
        try {
            DB::beginTransaction();

            // Tạo slug từ tên phim
            // $slug = Str::slug($request->ten_phim, '-');

            // Kiểm tra phim đã tồn tại chưa
            // if (Film::where('slug', $slug)->exists()) {
            //     return response()->json(['error' => 'Film exists'], 409);
            // }

            // Tạo instance của CloudinaryController và gọi getVideosByPhim
            // $cloudinaryController = app(CloudinaryController::class);
            // $videosResponse = $cloudinaryController->getVideosByPhim(new Request(['ten_phim' => $request->ten_phim]));

            // // Kiểm tra phản hồi từ getVideosByPhim
            // if ($videosResponse->getStatusCode() !== 200) {
            //     Log::error('❌ Error get list film', [
            //         'status' => $videosResponse->getStatusCode(),
            //         'response' => $videosResponse->getContent()
            //     ]);
            //     return response()->json(['error' => 'Error'], 500);
            // }

            // $videosData = json_decode($videosResponse->getContent(), true);
            // if (!isset($videosData['videos']) || empty($videosData['videos'])) {
            //     return response()->json(['error' => 'Không tìm thấy tập phim nào'], 404);
            // }

            // Tạo dữ liệu phim để lưu vào database
            $filmData = [
                'slug' => $request->slug,
                'title_film' => $request->title_film,
                'thumb' => $request->thumb,
                'film_type' => $request->film_type,
                'year_id' => $request->year_id,
                'country_id' => $request->country_id,
                'actor' => $request->actor,
                'director' => $request->director,
                'content' => $request->content,
                'view' => $request->view,
                'is_premium' => $request->is_premium ?? false, // Mặc định là false nếu không gửi
                'point_required' => $request->point_required ?? null, // Mặc định là null nếu không gửi
            ];

            // Lưu phim vào database
            $film = Film::create($filmData);
            Log::info('Film create', ['film_id' => $film->id]);

            // Lưu chi tiết phim (tập phim) vào bảng chi_tiet_phim
            // foreach ($videosData['videos'] as $index => $video) {
            //     $episodes = $film->film_episodes()->create([
            //         'episode_number' => $video['episode_number'],
            //         'episode_title' => $video['episode_title'] ?? 'N/A',
            //         'episode_url' => $video['episode_url'] ?? '',
            //         'duration' => $video['duration'] ?? 'N/A',
            //         'film_id' => $film->id,
            //     ]);
            //     Log::info('Save episodes', ['episodes' => $episodes->toArray()]);
            // }
            foreach ($request->input('film_episodes', []) as $episode) {
                // Tạo tập phim dựa trên dữ liệu client gửi lên
                $created = $film->film_episodes()->create([
                    'episode_number' => $episode['episode_number'],
                    'episode_title' => $episode['episode_title'] ?? 'N/A',
                    'episode_url' => $episode['episode_url'] ?? '',
                    'duration' => $episode['duration'] ?? 'N/A',
                    // 'film_id' sẽ tự động được chèn vì bạn dùng relation film_episodes()
                ]);

                Log::info('Save episodes', ['episode' => $created->toArray()]);
            }

            $newTheLoai = $request->genre_id; // Thể loại mới từ request
            $currentTheLoaiIds = $film->genres()->pluck('genre_id')->toArray(); // Lấy ID các thể loại hiện tại

            // Lặp qua từng thể loại mới, kiểm tra và chỉ cập nhật nếu cần
            foreach ($newTheLoai as $theLoaiId) {
                if (!in_array($theLoaiId, $currentTheLoaiIds)) {
                    // Nếu thể loại chưa có, thêm nó vào bảng pivot
                    $film->genres()->attach($theLoaiId);
                }
            }
            Log::info('genre success', ['genre_id' => $newTheLoai]);

            // Load lại phim với mối quan hệ theloais và chiTietPhim
            $film->load(['genres', 'film_episodes']);
            Log::info('Data loaded', [
                'episodes' => $film->film_episodes->toArray(),
                'genres' => $film->genres->toArray(),

            ]);

            DB::commit();

            return response()->json([
                'message' => 'Add film successfully',
                'data' => $film,
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('❌ Error add film', ['message' => $e->getMessage()]);
            return response()->json([
                'error' => 'Error add film: ' . $e->getMessage(),
            ], 500);
        }
    }
}

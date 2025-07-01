<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Http\Requests\FilmStoreRequest;
use App\Models\Film;
use App\Models\Film_episodes;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\Request as BaseRequest;
class FilmController extends Controller
{
    public function index()
    {
        try {
            // Lấy tất cả phim cùng với thông tin năm, quốc gia, và thể loại
            $films = Film::with(['year', 'country', 'genres', 'film_episodes'])->orderBy('created_at', 'ASC')->get();
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


// public function store(FilmStoreRequest $request)
// {
//     try {
//         DB::beginTransaction();
//         Log::info('Received Request Data:', $request->except(['video', 'film_episodes']));

//         // Tạo slug từ tên phim
//         $slug = Str::slug($request->title_film, '-');

//         // Kiểm tra phim đã tồn tại chưa
//         if (Film::where('slug', $slug)->exists()) {
//             return response()->json(['error' => 'Slug đã tồn tại'], 422);
//         }

//         // Khởi tạo CloudinaryController
//         $cloudinaryController = app(CloudinaryController::class);

//         // Chuẩn bị request cho uploadVideo
//         $uploadRequest = new Request([
//             'title_film' => $request->title_film,
//         ]);

//         // Thêm file trailer nếu có
//         if ($request->hasFile('video')) {
//             $uploadRequest->files->set('video', $request->file('video'));
//             $uploadRequest->request->set('video_type', 'trailer'); // Đánh dấu là trailer
//         }

//         // Thêm file episodes nếu có
//         $episodes = $request->input('film_episodes', []);
//         if (!empty($episodes)) {
//             $episodeFiles = $request->file('videos', []);
//             $filmEpisodes = [];
//             foreach ($episodes as $index => $episode) {
//                 if (isset($episodeFiles[$index])) {
//                     $filmEpisodes[$index] = [
//                         'video' => $episodeFiles[$index],
//                         'episode_number' => $episode['episode_number'],
//                         'episode_title' => $episode['episode_title'] ?? '',
//                         'duration' => $episode['duration'] ?? '',
//                     ];
//                 }
//             }
//             $uploadRequest->request->set('film_episodes', $filmEpisodes);
//             $uploadRequest->request->set('video_type', 'episode'); // Đánh dấu là episode
//         }

//         // Gọi uploadVideo để xử lý upload
//         $uploadResponse = $cloudinaryController->uploadVideo($uploadRequest);
//         if ($uploadResponse->getStatusCode() !== 200) {
//             return $uploadResponse;
//         }
//         $uploadData = json_decode($uploadResponse->getContent(), true);

//         // Tạo dữ liệu phim
//         $film = Film::create([
//             'slug' => $slug,
//             'title_film' => $request->title_film,
//             'thumb' => $request->thumb,
//             'trailer' => $uploadData['trailer_url'] ?? $request->trailer, // Sử dụng URL từ upload hoặc giữ URL cũ
//             'film_type' => $request->film_type,
//             'year_id' => $request->year_id,
//             'country_id' => $request->country_id,
//             'actor' => $request->actor,
//             'director' => $request->director,
//             'content' => $request->content,
//             'view' => $request->view,
//             'is_premium' => $request->is_premium,
//             'point_required' => $request->point_required ?? null,
//         ]);
//         Log::info('Film created', ['film_id' => $film->id]);

//         // Lưu film_episodes từ uploadData
//         $episodesFromUpload = $uploadData['episodes'] ?? [];
//         foreach ($episodesFromUpload as $episode) {
//             $film->film_episodes()->create([
//                 'episode_number' => $episode['episode_number'],
//                 'episode_title' => $episode['episode_title'] ?? '',
//                 'episode_url' => $episode['episode_url'],
//                 'duration' => $episode['duration'] ?? 'N/A',
//                 'film_id' => $film->id,
//             ]);
//             Log::info('Lưu chi tiết phim thành công', ['episode' => $episode]);
//         }

//         // Kiểm tra số tập trùng lặp
//         $episodeNumbers = array_column($episodesFromUpload, 'episode_number');
//         if ($episodesFromUpload && count(array_unique($episodeNumbers)) !== count($episodeNumbers)) {
//             return response()->json(['error' => 'Số tập phim không được trùng lặp'], 400);
//         }

//         // Gắn thể loại
//         $newGenres = $request->input('genre_id', []);
//         $currentGenreIds = $film->genres()->pluck('genre_id')->toArray();
//         foreach ($newGenres as $genreId) {
//             if (!in_array($genreId, $currentGenreIds)) {
//                 $film->genres()->attach($genreId);
//             }
//         }
//         Log::info('Gắn thể loại thành công', ['genre_id' => $newGenres]);

//         $film->load(['genres', 'film_episodes', 'year', 'country']);
//         DB::commit();

//         return response()->json([
//             'message' => 'Thêm phim và tập phim thành công',
//             'data' => $film,
//         ], 201);
//     } catch (\Exception $e) {
//         DB::rollBack();
//         Log::error('❌ Lỗi khi thêm phim', ['message' => $e->getMessage()]);
//         return response()->json(['error' => 'Lỗi khi thêm phim: ' . $e->getMessage()], 500);
//     }
// }
public function store(FilmStoreRequest $request)
{
    try {
        DB::beginTransaction();
        Log::info('Received Request Data:', $request->except(['video', 'film_episodes']));

        // Tạo slug từ tên phim
        $slug = Str::slug($request->title_film, '-');

        // Kiểm tra phim đã tồn tại chưa
        if (Film::where('slug', $slug)->exists()) {
            return response()->json(['error' => 'Slug đã tồn tại'], 422);
        }

        // Khởi tạo CloudinaryController
        $cloudinaryController = app(CloudinaryController::class);

        // Chuẩn bị request cho uploadVideo
$uploadRequest = new BaseRequest(
    $request->query(),
    $request->all(),
    [],
    [],
    [],
    $request->server(),
    $request->getContent()
);
        // Thêm file trailer nếu có
        if ($request->hasFile('trailer_video') ) {
            $uploadRequest->files->set('video', $request->file('trailer_video'));
                // Kiểm tra trên $uploadRequest chứ không phải $request
            Log::info('DEBUG video file exists?', [
                'has_video' => $uploadRequest->hasFile('video'),
                'video_file' => $uploadRequest->file('video')?->getClientOriginalName()
            ]);
        }

        // Thêm file episodes nếu có
        $episodes = $request->input('film_episodes', []);
        if (!empty($episodes)) {
            $episodeFiles = $request->file('film_episodes',[]);
            $filmEpisodes = [];
            foreach ($request->input('film_episodes', []) as $index => $episode) {
                if (isset($episodeFiles[$index]['video'])) {
                    $filmEpisodes[$index] = [
                        'video' => $episodeFiles[$index]['video'],  // file vẫn còn giữ
                        'episode_number' => $episode['episode_number'],
                        'episode_title' => $episode['episode_title'] ?? '',
                        'duration' => $episode['duration'] ?? '',
                    ];
                }
            }
            Log::info('DEBUG uploadVideo: film_episodes', $request->film_episodes ?? []);
            $uploadRequest->request->set('film_episodes', $filmEpisodes);
        }

        // Gọi uploadVideo để xử lý upload
        $uploadResponse = $cloudinaryController->uploadVideo($uploadRequest);
        if ($uploadResponse->getStatusCode() !== 200) {
            return $uploadResponse;
        }
        $uploadData = json_decode($uploadResponse->getContent(), true);
        Log::info('UploadData:', $uploadData);
        // Tạo dữ liệu phim
        $film = Film::create([
            'slug' => $slug,
            'title_film' => $request->title_film,
            'thumb' => $request->thumb,
            'trailer' => $uploadData['trailer_url'] ?? $request->trailer ?? null,
            'film_type' => $request->film_type,
            'year_id' => $request->year_id,
            'country_id' => $request->country_id,
            'actor' => $request->actor,
            'director' => $request->director,
            'content' => $request->content,
            'view' => $request->view,
            'is_premium' => $request->is_premium,
            'point_required' => $request->point_required ?? null,
        ]);
        Log::info('Trailer đã lưu là:', ['trailer' => $film->trailer]);
        Log::info('Film created', ['film_id' => $film->id]);

        // Lưu film_episodes từ uploadData
        $episodesFromUpload = $uploadData['episodes'] ?? [];
        foreach ($episodesFromUpload as $episode) {
            $film->film_episodes()->create([
                'episode_number' => $episode['episode_number'],
                'episode_title' => $episode['episode_title'] ?? '',
                'episode_url' => $episode['episode_url'],
                'duration' => $episode['duration'] ?? '',
                'film_id' => $film->id,
            ]);
            Log::info('Lưu chi tiết phim thành công', ['episode' => $episode]);
        }

        // // Kiểm tra số tập trùng lặp
        // $episodeNumbers = array_column($episodesFromUpload, 'episode_number');
        // if ($episodesFromUpload && count(array_unique($episodeNumbers)) !== count($episodeNumbers)) {
        //     return response()->json(['error' => 'Số tập phim không được trùng lặp'], 400);
        // }

        // Gắn thể loại
        $newGenres = $request->input('genre_id', []);
        $currentGenreIds = $film->genres()->pluck('genre_id')->toArray();
        foreach ($newGenres as $genreId) {
            if (!in_array($genreId, $currentGenreIds)) {
                $film->genres()->attach($genreId);
            }
        }
        Log::info('Gắn thể loại thành công', ['genre_id' => $newGenres]);

        $film->load(['genres', 'film_episodes', 'year', 'country']);
        DB::commit();

        return response()->json([
            'message' => 'Thêm phim và tập phim thành công',
            'data' => $film,
        ], 201);
    } catch (\Exception $e) {
        DB::rollBack();
        Log::error('❌ Lỗi khi thêm phim', ['message' => $e->getMessage()]);
        return response()->json(['error' => 'Lỗi khi thêm phim: ' . $e->getMessage()], 500);
    }
}
    // public function update(FilmStoreRequest $request, $id)
    // {
    //     try {
    //         DB::beginTransaction();

    //         $film = Film::findOrFail($id);



    //         $film->update($filmData);
    //         Log::info('Film updated', ['film_id' => $film->id]);

    //         // Xóa các tập phim cũ và thêm các tập mới
    //         $film->film_episodes()->delete();
    //         foreach ($request->input('film_episodes', []) as $episode) {
    //             $film->film_episodes()->create([
    //                 'episode_number' => $episode['episode_number'],
    //                 'episode_title' => $episode['episode_title'] ?? 'N/A',
    //                 'episode_url' => $episode['episode_url'] ?? '',
    //                 'duration' => $episode['duration'] ?? 'N/A',
    //             ]);
    //         }
    //         Log::info('Episodes updated', ['film_id' => $film->id]);

    //         // Cập nhật thể loại
    //         $newGenreIds = $request->genre_id;
    //         $film->genres()->sync($newGenreIds); // Sử dụng sync để cập nhật thể loại
    //         Log::info('Genres updated', ['genre_ids' => $newGenreIds]);

    //         $film->load(['genres', 'film_episodes']);
    //         Log::info('Data loaded', [
    //             'episodes' => $film->film_episodes->toArray(),
    //             'genres' => $film->genres->toArray(),
    //         ]);

    //         DB::commit();

    //         return response()->json([
    //             'message' => 'Cập nhật phim thành công',
    //             'data' => $film,
    //         ], 200);
    //     } catch (\Exception $e) {
    //         DB::rollBack();
    //         Log::error('❌ Error updating film', ['message' => $e->getMessage()]);
    //         return response()->json([
    //             'error' => 'Lỗi khi cập nhật phim: ' . $e->getMessage(),
    //         ], 500);
    //     }
    // }
public function update(Request $request, $id)
{
    try {
        DB::beginTransaction();

        $film = Film::findOrFail($id);
        $cloudinaryController = app(CloudinaryController::class);

        // 👉 Tạo slug để truyền folder (nhưng không lưu lại DB)
        $cloudFolderSlug = Str::slug($film->title_film, '-'); // dùng tên cũ để giữ folder đồng nhất

        // ⚙️ Tạo uploadRequest để clone lại request gốc
        $uploadRequest = new \Illuminate\Http\Request(
            $request->query(),  
            $request->all(),
            [],
            [],
            [],
            $request->server(),
            $request->getContent()
        );

        $uploadRequest->request->set('folder', $cloudFolderSlug); // truyền folder vào CloudinaryController

        // 📤 Trailer nếu có
        if ($request->hasFile('trailer_video')) {
            $uploadRequest->files->set('video', $request->file('trailer_video'));
        }

        // 📤 Episodes nếu có
        
        // $episodeFiles = $request->file('film_episodes', []);
        $filmEpisodes = [];
        foreach ($request->input('film_episodes', []) as $index => $episode) {
            $videoFile = $request->file("film_episodes.$index.video");
            // if (isset($episodeFiles[$index]['video'])) {
                $filmEpisodes[$index] = [
                    // 'video' => $episodeFiles[$index]['video'] ?? null,
                    'episode_number' => $episode['episode_number'],
                    'episode_title' => $episode['episode_title'] ?? '',
                    'duration' => $episode['duration'] ?? '',
                    'video' => $videoFile,
                    'episode_url' => $episode['episode_url'] ?? null,
                ];
            // }
        }
        // $rawEpisodes = $request->all()['film_episodes'] ?? [];
        // $parsedEpisodes = [];

        // // Lặp qua các chỉ số
        // foreach ($rawEpisodes as $index => $episode) {
        //     $parsedEpisodes[] = [
        //         'episode_number' => $episode['episode_number'],
        //         'episode_title' => $episode['episode_title'] ?? '',
        //         'duration' => $episode['duration'] ?? '',
        //         'episode_url' => $episode['episode_url'] ?? '',
        //         'video' => $request->file("film_episodes.$index.video") ?? null,
        //     ];
        // }
        if (!empty($filmEpisodes)) {
            $uploadRequest->request->set('film_episodes', $filmEpisodes);
                // Gán từng file video vào uploadRequest (rất quan trọng)
            foreach ($filmEpisodes as $index => $episode) {
                if ($episode['video']) {
                    $uploadRequest->files->set("film_episodes.$index.video", $episode['video']);
                }
            }
        }
        Log::info('📤 Uploading episodes', $filmEpisodes);
        Log::info('🎬 request files:', $request->allFiles());

        // 🚀 Gọi uploadVideo nếu có trailer/episodes
        $uploadData = [];
        if ($request->hasFile('trailer_video') || !empty($filmEpisodes)) {
            $uploadResponse = $cloudinaryController->uploadVideo($uploadRequest);
            if ($uploadResponse->getStatusCode() !== 200) {
                return $uploadResponse;
            }
            $uploadData = json_decode($uploadResponse->getContent(), true);
        }

        // 🧩 Update phim
        $film->update([
            // KHÔNG cập nhật slug
            'thumb' => $request->thumb,
            'trailer' => $uploadData['trailer_url'] ?? $film->trailer,
            'film_type' => $request->film_type,
            'year_id' => $request->year_id,
            'country_id' => $request->country_id,
            'actor' => $request->actor,
            'director' => $request->director,
            'content' => $request->content,
            'view' => $request->view,
            'is_premium' => $request->is_premium,
            'point_required' => $request->point_required ?? $film->point_required,
        ]);

        // 🧩 Nếu có update episodes thì xóa cũ tạo mới
        if (!empty($uploadData['episodes'])) {
            $film->film_episodes()->delete();
            foreach ($uploadData['episodes'] as $episode) {
                $film->film_episodes()->create([
                    'episode_number' => $episode['episode_number'],
                    'episode_title' => $episode['episode_title'] ?? '',
                    'episode_url' => $episode['episode_url'],
                    'duration' => $episode['duration'] ?? '',
                ]);
            }
        }

        // 🔄 Gắn thể loại
        $film->genres()->sync($request->input('genre_id', []));

        DB::commit();

        return response()->json([
            'message' => 'Cập nhật phim thành công',
            'data' => $film->load(['genres', 'film_episodes']),
        ]);
    } catch (\Exception $e) {
        DB::rollBack();
        Log::error('❌ Lỗi khi cập nhật phim', ['message' => $e->getMessage()]);
        return response()->json(['error' => 'Lỗi khi cập nhật phim: ' . $e->getMessage()], 500);
    }
}



    public function destroy($id)
    {
        try {
            $film = Film::findOrFail($id);
            $film->delete();
            return response()->json(['message' => 'Xóa phim thành công'], 200);
        } catch (\Exception $e) {
            Log::error('❌ Error deleting film', ['message' => $e->getMessage()]);
            return response()->json(['error' => 'Lỗi khi xóa phim'], 500);
        }
    }
    public function filter(Request $request)
    {
        try {
            $query = Film::with(['year', 'country', 'genres', 'film_episodes']);

            // Lọc theo thể loại - sử dụng genre parameter
            if ($request->has('genre')) {
                $genreNames = is_array($request->genre) ? $request->genre : [$request->genre];
                $query->whereHas('genres', function ($q) use ($genreNames) {
                    $q->whereIn('genre.genre_name', $genreNames);
                });
            }

            // Lọc theo quốc gia - sử dụng country parameter
            if ($request->has('country')) {
                $query->whereHas('country', function ($q) use ($request) {
                    $q->where('country_name', $request->country);
                });
            }

            // Lọc theo năm - sử dụng year parameter
            if ($request->has('year')) {
                $query->whereHas('year', function ($q) use ($request) {
                    $q->where('release_year', $request->year);
                });
            }

            // Lọc theo loại phim - sử dụng type parameter
            if ($request->has('type')) {
                $filmType = $request->type === 'phim-le' ? 1 : 0;
                $query->where('film_type', $filmType);
            }

            // Tìm kiếm - giữ nguyên search parameter
            if ($request->has('search')) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('title_film', 'like', '%' . $search . '%')
                        ->orWhere('content', 'like', '%' . $search . '%')
                        ->orWhere('actor', 'like', '%' . $search . '%')
                        ->orWhere('director', 'like', '%' . $search . '%');
                });
            }

            $films = $query->get();
            return response()->json($films, 200);

        } catch (\Exception $e) {
            Log::error('Lỗi khi lọc phim', ['message' => $e->getMessage()]);
            return response()->json(['error' => 'Không thể lọc phim'], 500);
        }
    }

    public function increaseView(Request $request)
    {
        $request->validate([
            'id' => 'required|integer|exists:film,id',
        ]);

        try {
            $film = Film::findOrFail($request->id);
            $film->increment('view');
            $film->refresh();
            return response()->json([
                'message' => 'Lượt xem đã được tăng',
                'view_count' => $film->view,
            ], 200);
        } catch (\Exception $e) {
            Log::error('Error increase view ', ['message' => $e->getMessage()]);
            return response()->json(['error' => 'Không thể tăng lượt xem phim'], 500);
        }
    }
}
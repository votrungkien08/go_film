<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use App\Http\Requests\FilmStoreRequest;
use App\Models\Film;
use App\Models\Film_episodes;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\Request as BaseRequest;
use App\Models\UserFilmView;
use Illuminate\Support\Facades\Auth;

class FilmController extends Controller
{
    public function index()
    {
        try {
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
            if ($request->hasFile('trailer_video')) {
                $uploadRequest->files->set('video', $request->file('trailer_video'));
                Log::info('DEBUG video file exists?', [
                    'has_video' => $uploadRequest->hasFile('video'),
                    'video_file' => $uploadRequest->file('video')?->getClientOriginalName()
                ]);
            }

            // Thêm file episodes nếu có
            $episodes = $request->input('film_episodes', []);
            if (!empty($episodes)) {
                $episodeFiles = $request->file('film_episodes', []);
                $filmEpisodes = [];
                foreach ($request->input('film_episodes', []) as $index => $episode) {
                    if (isset($episodeFiles[$index]['video'])) {
                        $filmEpisodes[$index] = [
                            'video' => $episodeFiles[$index]['video'],
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

    public function update(Request $request, $id)
    {
        try {
            DB::beginTransaction();

            $film = Film::findOrFail($id);
            $cloudinaryController = app(CloudinaryController::class);

            // Tạo slug để truyền folder (nhưng không lưu lại DB)
            $cloudFolderSlug = Str::slug($film->title_film, '-');

            // Tạo uploadRequest để clone lại request gốc
            $uploadRequest = new \Illuminate\Http\Request(
                $request->query(),
                $request->all(),
                [],
                [],
                [],
                $request->server(),
                $request->getContent()
            );

            $uploadRequest->request->set('folder', $cloudFolderSlug);

            if ($request->hasFile('trailer_video')) {
                $uploadRequest->files->set('video', $request->file('trailer_video'));
            }

            $filmEpisodes = [];
            foreach ($request->input('film_episodes', []) as $index => $episode) {
                $videoFile = $request->file("film_episodes.$index.video");
                $filmEpisodes[$index] = [
                    'episode_number' => $episode['episode_number'],
                    'episode_title' => $episode['episode_title'] ?? '',
                    'duration' => $episode['duration'] ?? '',
                    'video' => $videoFile,
                    'episode_url' => $episode['episode_url'] ?? null,
                ];
            }

            if (!empty($filmEpisodes)) {
                $uploadRequest->request->set('film_episodes', $filmEpisodes);
                foreach ($filmEpisodes as $index => $episode) {
                    if ($episode['video']) {
                        $uploadRequest->files->set("film_episodes.$index.video", $episode['video']);
                    }
                }
            }
            Log::info('📤 Uploading episodes', $filmEpisodes);
            Log::info('🎬 request files:', $request->allFiles());

            $uploadData = [];
            if ($request->hasFile('trailer_video') || !empty($filmEpisodes)) {
                $uploadResponse = $cloudinaryController->uploadVideo($uploadRequest);
                if ($uploadResponse->getStatusCode() !== 200) {
                    return $uploadResponse;
                }
                $uploadData = json_decode($uploadResponse->getContent(), true);
            }

            $film->update([
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

    // public function filter(Request $request)
    // {
    //     try {
    //         $query = Film::with(['year', 'country', 'genres', 'film_episodes']);

    //         if ($request->has('genre')) {
    //             $genreNames = is_array($request->genre) ? $request->genre : [$request->genre];
    //             foreach ($genreNames as $genreName) {
    //                 $query->whereHas(
    //                     'genres',
    //                     function ($q) use ($genreName) {
    //                         $q->where('genre_name', $genreName);
    //                     }
    //                 );
    //             }
    //         }

    //         if ($request->has('country')) {
    //             $query->whereHas('country', function ($q) use ($request) {
    //                 $q->where('country_name', $request->country);
    //             });
    //         }

    //         if ($request->has('year')) {
    //             $query->whereHas('year', function ($q) use ($request) {
    //                 $q->where('release_year', $request->year);
    //             });
    //         }

    //         if ($request->has('type')) {
    //             $filmType = $request->type === 'phim-bo' ? 1 : 0;
    //             $query->where('film_type', $filmType);
    //         }

    //         if ($request->has('search')) {
    //             $search = $request->search;
    //             $query->where('title_film', 'like', '%' . $search . '%');
    //         }

    //         $films = $query->get();
    //         return response()->json($films, 200);
    //     } catch (\Exception $e) {
    //         Log::error('Lỗi khi lọc phim', ['message' => $e->getMessage()]);
    //         return response()->json(['error' => 'Không thể lọc phim'], 500);
    //     }
    // }
    private function slugToGenreName($slug)
    {
        // Normalize slug (convert spaces to hyphens, lowercase)
        $normalizedSlug = strtolower(str_replace(' ', '-', trim($slug)));

        // Mapping slug to genre name
        $slugMapping = [
            'hanh-dong' => 'Hành Động',
            'phieu-luu' => 'Phiêu Lưu',
            'vien-tuong' => 'Viễn Tưởng',
            'chinh-kich' => 'Chính Kịch',
            'tam-ly' => 'Tâm Lý',
            'bi-an' => 'Bí Ẩn',
            'kinh-di' => 'Kinh Dị',
            'tinh-cam' => 'Tình Cảm',
            'gia-dinh' => 'Gia Đình',
            'hai-huoc' => 'Hài Hước',
            'hinh-su' => 'Hình Sự',
            'chien-tranh' => 'Chiến Tranh'
        ];

        // Try normalized slug first
        if (isset($slugMapping[$normalizedSlug])) {
            return $slugMapping[$normalizedSlug];
        }

        // If not found, try original slug
        if (isset($slugMapping[$slug])) {
            return $slugMapping[$slug];
        }

        // Fallback: convert slug back to proper case
        return ucwords(str_replace(['-', '_'], ' ', $slug));
    }
    public function filter(Request $request)
    {
        try {
            $query = Film::with(['year', 'country', 'genres', 'film_episodes']);

            // Xử lý tham số genre
            if ($request->has('genre')) {
                $genreSlug = trim($request->genre);
                if ($genreSlug) {
                    $genreName = $this->slugToGenreName($genreSlug);

                    Log::info('Genre filter', [
                        'slug' => $genreSlug,
                        'mapped_name' => $genreName
                    ]);

                    $query->whereHas('genres', function ($q) use ($genreName) {
                        $q->where('genre_name', $genreName);
                    });
                }
            }
            // Xử lý tham số country
            if ($request->has('country')) {
                $country = trim($request->country);
                if ($country) {
                    $query->whereHas('country', function ($q) use ($country) {
                        $q->where('country_name', $country);
                    });
                }
            }

            // Xử lý tham số year
            if ($request->has('year')) {
                $year = trim($request->year);
                if ($year && is_numeric($year)) {
                    $query->whereHas('year', function ($q) use ($year) {
                        $q->where('release_year', $year);
                    });
                }
            }

            // Xử lý tham số type
            if ($request->has('type')) {
                $filmType = $request->type === 'phim-bo' ? 1 : ($request->type === 'phim-le' ? 0 : null);
                if (!is_null($filmType)) {
                    $query->where('film_type', $filmType);
                }
            }

            // Xử lý tham số search
            if ($request->has('search')) {
                $search = trim($request->search);
                if ($search) {
                    $query->where('title_film', 'like', '%' . $search . '%');
                }
            }

            // Loại trừ phim hiện tại nếu có tham số exclude_id
            if ($request->has('exclude_id')) {
                $excludeId = trim($request->exclude_id);
                if (is_numeric($excludeId)) {
                    $query->where('id', '!=', $excludeId);
                }
            }

            // Giới hạn số lượng phim trả về (mặc định 10, phù hợp với gợi ý)
            $limit = $request->input('limit', 10);
            $films = $query->take($limit)->get();

            return response()->json($films, 200);
        } catch (\Exception $e) {
            Log::error('Lỗi khi lọc phim', ['message' => $e->getMessage(), 'stack' => $e->getTraceAsString()]);
            return response()->json(['error' => 'Không thể lọc phim'], 500);
        }
    }

    public function checkPaymentStatus(Request $request)
    {
        try {
            $request->validate([
                'film_id' => 'required|exists:film,id',
                'episode_id' => 'nullable|exists:film_episodes,id',
            ]);

            $user = Auth::user();
            if (!$user) {
                return response()->json(['error' => 'Bạn cần đăng nhập để thực hiện thao tác này'], 401);
            }

            $film = Film::findOrFail($request->film_id);

            if (!$film->is_premium) {
                return response()->json([
                    'can_watch' => true,
                    'already_paid' => false,
                    'is_premium' => false,
                    'message' => 'Phim miễn phí'
                ], 200);
            }

            $query = [
                'user_id' => $user->id,
                'film_id' => $film->id,
            ];

            // Chỉ thêm episode_id cho phim lẻ (film_type === false)
            if ($request->has('episode_id') && !$film->film_type) {
                $query['episode_id'] = $request->episode_id;
            }

            $existingView = UserFilmView::where($query)->first();

            if ($existingView && $existingView->points_deducted) {
                return response()->json([
                    'can_watch' => true,
                    'already_paid' => true,
                    'is_premium' => true,
                    'message' => 'Bạn đã thanh toán cho nội dung này',
                    'remaining_points' => $user->points
                ], 200);
            }

            $pointsRequired = $film->point_required ?? 0;
            $hasEnoughPoints = $user->points >= $pointsRequired;

            return response()->json([
                'can_watch' => true, // Cho phép xem 10% đầu tiên
                'already_paid' => false,
                'is_premium' => true,
                'has_enough_points' => $hasEnoughPoints,
                'points_required' => $pointsRequired,
                'user_points' => $user->points,
                'message' => $hasEnoughPoints ? 'Cần thanh toán để xem tiếp sau 10%' : 'Không đủ điểm để xem tiếp'
            ], 200);
        } catch (\Exception $e) {
            Log::error('❌ Error checking payment status', [
                'message' => $e->getMessage(),
                'request' => $request->all(),
                'user' => isset($user) ? $user->id : null,
            ]);
            return response()->json(['error' => 'Lỗi khi kiểm tra trạng thái thanh toán'], 500);
        }
    }

    public function deductPoints(Request $request)
    {
        try {
            $request->validate([
                'film_id' => 'required|exists:film,id',
                'episode_id' => 'nullable|exists:film_episodes,id',
                'only_check' => 'nullable|boolean',
            ]);

            $user = Auth::user();
            if (!$user) {
                return response()->json(['error' => 'Bạn cần đăng nhập để thực hiện thao tác này'], 401);
            }

            $film = Film::findOrFail($request->film_id);

            if (!$film->is_premium) {
                return response()->json([
                    'response' => 'Phim này không yêu cầu điểm',
                    'can_watch' => true,
                    'already_paid' => false,
                ], 200);
            }

            $query = [
                'user_id' => $user->id,
                'film_id' => $film->id,
            ];

            if ($request->has('episode_id')) {
                $query['episode_id'] = $request->episode_id;
            }

            $existingView = UserFilmView::where($query)->first();

            if ($existingView && $existingView->points_deducted) {
                return response()->json([
                    'message' => 'Bạn đã thanh toán, có thể xem lại miễn phí.',
                    'can_watch' => true,
                    'already_paid' => true,
                    'remaining_points' => $user->points,
                ], 200);
            }

            $pointsRequired = $film->point_required ?? 0;
            if ($user->points < $pointsRequired) {
                return response()->json([
                    'message' => 'Bạn không đủ điểm để xem phim này',
                    'can_watch' => false,
                    'points_required' => $pointsRequired,
                    'user_points' => $user->points
                ], 403);
            }

            if ($request->has('only_check') && $request->only_check) {
                return response()->json([
                    'message' => 'Bạn đủ điểm, có thể phát phim.',
                    'can_watch' => true,
                    'already_paid' => false,
                    'points_required' => $pointsRequired,
                    'user_points' => $user->points
                ], 200);
            }

            DB::beginTransaction();

            $user->points -= $pointsRequired;
            $user->save();

            if ($film->film_type) { // Phim bộ: film_type === true
                UserFilmView::updateOrCreate(
                    [
                        'user_id' => $user->id,
                        'film_id' => $film->id,
                    ],
                    [
                        'points_deducted' => true,
                        'points_deducted_amount' => $pointsRequired,
                        'viewed_at' => now(),
                    ]
                );
            } else { // Phim lẻ: film_type === false
                UserFilmView::updateOrCreate(
                    $query,
                    [
                        'points_deducted' => true,
                        'points_deducted_amount' => $pointsRequired,
                        'viewed_at' => now(),
                    ]
                );
            }

            DB::commit();

            Log::info('Points deducted successfully', [
                'user_id' => $user->id,
                'film_id' => $film->id,
                'episode_id' => $request->episode_id ?? null,
                'points_deducted' => $pointsRequired,
                'remaining_points' => $user->points
            ]);

            return response()->json([
                'message' => 'Đã trừ ' . $pointsRequired . ' điểm thành công',
                'remaining_points' => $user->points,
                'can_watch' => true,
                'already_paid' => true,
                'points_deducted' => $pointsRequired
            ], 200);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('❌ Error deducting points', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'request' => $request->all(),
                'user' => isset($user) ? $user->id : null,
            ]);
            return response()->json([
                'error' => 'Lỗi khi trừ điểm',
                'detail' => $e->getMessage()
            ], 500);
        }
    }

    public function rewardPointsForNormalFilm(Request $request)
    {
        try {
            $request->validate([
                'film_id' => 'required|exists:film,id',
                'episode_id' => 'nullable|exists:film_episodes,id',
                'only_check' => 'nullable|boolean',
            ]);

            $user = Auth::user();
            if (!$user) {
                return response()->json(['error' => 'Bạn cần đăng nhập để thực hiện thao tác này'], 401);
            }

            $film = Film::findOrFail($request->film_id);
            if ($film->is_premium) {
                return response()->json([
                    'message' => 'Phim premium không được cộng điểm',
                    'success' => false
                ], 400);
            }

            $query = [
                'user_id' => $user->id,
                'film_id' => $film->id,
            ];
            if ($request->has('episode_id')) {
                $query['episode_id'] = $request->episode_id;
            }

            $existingView = UserFilmView::where($query)->first();

            if ($request->has('only_check') && $request->only_check) {
                return response()->json([
                    'has_rewarded' => $existingView && $existingView->points_rewarded,
                    'message' => $existingView && $existingView->points_rewarded ? 'Đã tích điểm trước đó' : 'Chưa tích điểm',
                    'current_points' => $user->points
                ], 200);
            }

            if ($existingView && $existingView->points_rewarded) {
                return response()->json([
                    'message' => 'Bạn đã được cộng điểm cho phim/tập này rồi',
                    'success' => false,
                    'current_points' => $user->points
                ], 200);
            }

            DB::beginTransaction();
            $user->points += 3;
            $user->save();

            UserFilmView::updateOrCreate(
                $query,
                [
                    'points_rewarded' => true,
                    'points_rewarded_amount' => 3,
                    'viewed_at' => now(),
                ]
            );
            DB::commit();

            Log::info('Rewarded points for normal film', [
                'user_id' => $user->id,
                'film_id' => $film->id,
                'episode_id' => $request->episode_id ?? null,
                'points_rewarded' => 3,
                'current_points' => $user->points
            ]);

            return response()->json([
                'message' => 'Bạn đã được cộng 3 điểm khi xem phim thường!',
                'success' => true,
                'current_points' => $user->points
            ], 200);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('❌ Error rewarding points', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'request' => $request->all(),
                'user' => isset($user) ? $user->id : null,
            ]);
            return response()->json([
                'error' => 'Lỗi khi cộng điểm',
                'detail' => $e->getMessage()
            ], 500);
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

    public function getViewStatsByMonth(Request $request)
    {
        $months = $request->input('months', 12);
        $data = \DB::table('watch_histories')
            ->selectRaw('DATE_FORMAT(watch_at, "%m-%Y") as month, COUNT(*) as views')
            ->where('watch_at', '>=', now()->subMonths($months))
            ->groupByRaw('DATE_FORMAT(watch_at, "%m-%Y")')
            ->orderBy('month', 'asc')
            ->get();
        return response()->json($data);
    }
    public function getPointsHistory(Request $request)
    {
        try {
            $user = Auth::user();
            if (!$user) {
                return response()->json(['error' => 'Bạn cần đăng nhập để xem lịch sử điểm'], 401);
            }

            $history = UserFilmView::where('user_id', $user->id)
                ->join('film', 'user_film_views.film_id', '=', 'film.id')
                ->leftJoin('film_episodes', 'user_film_views.episode_id', '=', 'film_episodes.id')
                ->select(
                    'film.title_film',
                    'film_episodes.episode_title',
                    'user_film_views.points_deducted',
                    'user_film_views.points_deducted_amount',
                    'user_film_views.points_rewarded',
                    'user_film_views.points_rewarded_amount',
                    'user_film_views.viewed_at'
                )
                ->where(function ($query) {
                    $query->where('user_film_views.points_deducted', true)
                        ->orWhere('user_film_views.points_rewarded', true);
                })
                ->orderBy('user_film_views.viewed_at', 'desc')
                ->get();

            $formattedHistory = $history->map(function ($item) {
                $points = $item->points_deducted ? -$item->points_deducted_amount : $item->points_rewarded_amount;
                $title = $item->episode_title ? "{$item->title_film} - {$item->episode_title}" : $item->title_film;
                return [
                    'title' => $title,
                    'date' => $item->viewed_at,
                    'points' => $points,
                    'type' => $item->points_deducted ? 'deducted' : 'rewarded',
                ];
            });

            return response()->json([
                'message' => 'Lấy lịch sử tích/trừ điểm thành công',
                'data' => $formattedHistory,
            ], 200);
        } catch (\Exception $e) {
            Log::error('❌ Error fetching points history', [
                'message' => $e->getMessage(),
                'user_id' => $user ? $user->id : null,
            ]);
            return response()->json(['error' => 'Lỗi khi lấy lịch sử điểm'], 500);
        }
    }
}
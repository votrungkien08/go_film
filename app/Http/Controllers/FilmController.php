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

            $filmData = [
                'slug' => $request->slug,
                'title_film' => $request->title_film,
                'thumb' => $request->thumb,
                'trailer' => $request->trailer,
                'film_type' => $request->film_type,
                'year_id' => $request->year_id,
                'country_id' => $request->country_id,
                'actor' => $request->actor,
                'director' => $request->director,
                'content' => $request->content,
                'view' => $request->view,
                'is_premium' => $request->is_premium ?? false,
                'point_required' => $request->point_required ?? null,
            ];

            $film = Film::create($filmData);
            Log::info('Film created', ['film_id' => $film->id]);

            foreach ($request->input('film_episodes', []) as $episode) {
                $created = $film->film_episodes()->create([
                    'episode_number' => $episode['episode_number'],
                    'episode_title' => $episode['episode_title'] ?? 'N/A',
                    'episode_url' => $episode['episode_url'] ?? '',
                    'duration' => $episode['duration'] ?? 'N/A',
                ]);
                Log::info('Saved episode', ['episode' => $created->toArray()]);
            }

            $newGenreIds = $request->genre_id;
            $currentGenreIds = $film->genres()->pluck('genre_id')->toArray();

            foreach ($newGenreIds as $genreId) {
                if (!in_array($genreId, $currentGenreIds)) {
                    $film->genres()->attach($genreId);
                }
            }
            Log::info('Genres attached', ['genre_ids' => $newGenreIds]);

            $film->load(['genres', 'film_episodes']);
            Log::info('Data loaded', [
                'episodes' => $film->film_episodes->toArray(),
                'genres' => $film->genres->toArray(),
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Thêm phim thành công',
                'data' => $film,
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('❌ Error adding film', ['message' => $e->getMessage()]);
            return response()->json([
                'error' => 'Lỗi khi thêm phim: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function update(FilmStoreRequest $request, $id)
    {
        try {
            DB::beginTransaction();

            $film = Film::findOrFail($id);

            $filmData = [
                'slug' => $request->slug,
                'title_film' => $request->title_film,
                'thumb' => $request->thumb,
                'trailer' => $request->trailer,
                'film_type' => $request->film_type,
                'year_id' => $request->year_id,
                'country_id' => $request->country_id,
                'actor' => $request->actor,
                'director' => $request->director,
                'content' => $request->content,
                'view' => $request->view,
                'is_premium' => $request->is_premium ?? false,
                'point_required' => $request->point_required ?? null,
            ];

            $film->update($filmData);
            Log::info('Film updated', ['film_id' => $film->id]);

            $film->film_episodes()->delete();
            foreach ($request->input('film_episodes', []) as $episode) {
                $film->film_episodes()->create([
                    'episode_number' => $episode['episode_number'],
                    'episode_title' => $episode['episode_title'] ?? 'N/A',
                    'episode_url' => $episode['episode_url'] ?? '',
                    'duration' => $episode['duration'] ?? 'N/A',
                ]);
            }
            Log::info('Episodes updated', ['film_id' => $film->id]);

            $newGenreIds = $request->genre_id;
            $film->genres()->sync($newGenreIds);
            Log::info('Genres updated', ['genre_ids' => $newGenreIds]);

            $film->load(['genres', 'film_episodes']);
            Log::info('Data loaded', [
                'episodes' => $film->film_episodes->toArray(),
                'genres' => $film->genres->toArray(),
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Cập nhật phim thành công',
                'data' => $film,
            ], 200);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('❌ Error updating film', ['message' => $e->getMessage()]);
            return response()->json([
                'error' => 'Lỗi khi cập nhật phim: ' . $e->getMessage(),
            ], 500);
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

            if ($request->has('genre')) {
                $genreNames = is_array($request->genre) ? $request->genre : [$request->genre];
                foreach ($genreNames as $genreName) {
                    $query->whereHas(
                        'genres',
                        function ($q) use ($genreName) {
                            $q->where('genre.genre_name', $genreName);
                        }
                    );
                }
            }

            if ($request->has('country')) {
                $query->whereHas('country', function ($q) use ($request) {
                    $q->where('country_name', $request->country);
                });
            }

            if ($request->has('year')) {
                $query->whereHas('year', function ($q) use ($request) {
                    $q->where('release_year', $request->year);
                });
            }

            if ($request->has('type')) {
                $filmType = $request->type === 'phim-le' ? 1 : 0;
                $query->where('film_type', $filmType);
            }

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

            if ($request->has('episode_id')) {
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
                'can_watch' => false,
                'already_paid' => false,
                'is_premium' => true,
                'has_enough_points' => $hasEnoughPoints,
                'points_required' => $pointsRequired,
                'user_points' => $user->points,
                'message' => $hasEnoughPoints ? 'Cần thanh toán để xem' : 'Không đủ điểm để xem'
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
                    'message' => 'Bạn đủ điểm, có thể phát phim. Sẽ trừ điểm khi xem đến 90%.',
                    'can_watch' => true,
                    'already_paid' => false,
                    'points_required' => $pointsRequired,
                    'user_points' => $user->points
                ], 200);
            }

            DB::beginTransaction();

            $user->points -= $pointsRequired;
            $user->save();

            UserFilmView::updateOrCreate(
                $query,
                [
                    'points_deducted' => true,
                    'points_deducted_amount' => $pointsRequired,
                    'viewed_at' => now(),
                ]
            );

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
                'already_paid' => false,
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
                'only_check' => 'nullable|boolean', // THÊM: Hỗ trợ tham số only_check
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

            // THÊM: Xử lý only_check để kiểm tra trạng thái tích điểm
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
}
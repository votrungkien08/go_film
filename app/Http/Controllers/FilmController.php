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

            // Xóa các tập phim cũ và thêm các tập mới
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

            // Cập nhật thể loại
            $newGenreIds = $request->genre_id;
            $film->genres()->sync($newGenreIds); // Sử dụng sync để cập nhật thể loại
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
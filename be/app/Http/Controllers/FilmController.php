<?php

namespace App\Http\Controllers;

use App\Filters\FilmFilter;
use App\Models\User;
use Illuminate\Http\Request;
use App\Http\Requests\FilmStoreRequest;
use App\Models\Film;
use App\Models\Film_episodes;
use App\Models\Genre;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\Request as BaseRequest;
use App\Models\UserFilmView;
use Exception;
use Illuminate\Support\Facades\Auth;

class FilmController extends Controller
{
    public function index()
    {
        try {
            $films = Film::with(['year', 'country', 'genres', 'film_episodes'])->orderBy('created_at', 'ASC')->get();
            return response()->json($films, 200);
        } catch (\Exception $e) {
            Log::error('Error fetching films', ['message' => $e->getMessage()]);
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
            Log::error('Error fetching film', ['slug' => $slug, 'message' => $e->getMessage()]);
            return response()->json(['error' => 'Không tìm thấy phim'], 404);
        }
    }
    public function store(Request $request)
    {
        try {
            Log::debug('Request all', $request->all());
            Log::debug('Request files', $request->file());
            DB::beginTransaction();
            $slug = Str::slug($request->title_film);
            if (Film::where('slug', $slug)->exists()) {
                return response()->json(['error' => 'Phim đã tồn tại'], 422);
            }
            if ($request->hasFile('trailer')) {
                $cloudinaryController = new CloudinaryController();
                $uploadResponse = $cloudinaryController->uploadTrailer($request);
                $trailer_url = $uploadResponse->getData()->trailer;
            } elseif ($request->trailer_url) {
                $trailer_url = $request->trailer_url;
            }


            $film = Film::create([
                'slug' => $slug,
                'title_film' => $request->title_film,
                'thumb' => $request->thumb,
                'trailer' => $trailer_url,
                'film_type' => $request->film_type,
                'year_id' => $request->year_id,
                'country_id' => $request->country_id,
                'actor' => $request->actor,
                'director' => $request->director,
                'content' => $request->content,
                'view' => $request->view,
            ]);

            if ($request->has('film_episodes')) {
                foreach ($request->input('film_episodes') as $episode) {
                    $film->film_episodes()->create([
                        'episode_number' => $episode['episode_number'],
                        'episode_title' => $episode['episode_title'],
                        'episode_url' => $episode['episode_url'],
                        'duration' => $episode['duration'],
                    ]);
                }
            }

            if ($request->has('genre')) {
                $film->genres()->attach($request->genre);
            }
            DB::commit();
            return response()->json([
                'message' => 'Thêm phim thành công',
                'data' => $film->load('film_episodes'),
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Lỗi khi thêm phim', ['message' => $e->getMessage()]);
            return response()->json(['error' => 'Lỗi khi thêm phim: ' . $e->getMessage()], 500);
        }
    }

    public function update(Request $request, $idFilm)
    {
        Log::info('Full request data:', $request->all());
        try {
            DB::beginTransaction();
            Log::info('==== BẮT ĐẦU UPDATE FILM ====');
            Log::info('Full request all(): ', $request->all());
            Log::info('Thumb input: ' . $request->input('thumb'));
            Log::info('Trailer input: ' . $request->input('trailer'));
            $film = Film::findOrFail($idFilm);

            if ($request->hasFile('trailer')) {
                $cloudinaryController = new CloudinaryController();
                $uploadResponse = $cloudinaryController->uploadTrailer($request);
                $trailer_url = $uploadResponse->getData()->trailer;
            } elseif ($request->trailer_url) {
                $trailer_url = $request->trailer_url;
            }
            $film->update([
                'title_film' => $request->title_film,
                'thumb' => $request->input('thumb'),
                'trailer' => $trailer_url,
                'film_type' => $request->film_type,
                'year_id' => $request->year_id,
                'country_id' => $request->country_id,
                'actor' => $request->actor,
                'director' => $request->director,
                'content' => $request->content,
                'view' => $request->view,
            ]);
            if ($request->has('genre')) {
                $film->genres()->sync($request->genre);
            }
            Log::info('Full request', $request->all());
            if ($request->has('film_episodes')) {

                Log::info('film episode request', $request->film_episodes);
                foreach ($request->input('film_episodes') as $episode) {
                    $film->film_episodes()->updateOrCreate(
                        [
                            'id' => $episode['id'],
                            'film_id' => $idFilm,
                        ],
                        [
                            'episode_number' => $episode['episode_number'],
                            'episode_title' => $episode['episode_title'],
                            'episode_url' => $episode['episode_url'],
                            'duration' => $episode['duration'],
                        ]
                    );
                }
            }

            $film->save();
            DB::commit();
            return response()->json([
                'message' => 'Cập nhật phim thành công',
                'data' => $film->load('film_episodes'),
            ], 200);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Lỗi khi cập nhật phim', ['message' => $e->getMessage()]);
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
            Log::error('Error deleting film', ['message' => $e->getMessage()]);
            return response()->json(['error' => 'Lỗi khi xóa phim'], 500);
        }
    }



    public function filterFilmAdvance(Request $request)
    {
        try {
            DB::enableQueryLog();
            Log::info('advance request', $request->all());
            $filter = new FilmFilter($request);
            $filmSearch = Film::filter($filter)
                ->with([
                    'film_episodes',
                    'year',
                    'genres',
                    'country'
                ])
                ->get();
            Log::info(DB::getQueryLog());
            return response()->json($filmSearch);
        } catch (Exception $e) {
            Log::error($e->getMessage());
            return response()->json(['error' => 'Lỗi khi lọc loại phim', 'message' => $e->getMessage(),], 500);
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

    public function getRankTop()
    {
        try {
            $rank = Film::orderByDesc('view')->get();
            return response()->json($rank);
        } catch (Exception $e) {
            Log::error('Error get rank top', ['message' => $e->getMessage()]);
            return response()->json(['error' => 'Không thể lấy danh sách phim'], 500);
        }
    }

    public function getUpdateTop()
    {
        try {
            $updateTop = Film::orderByDesc('created_at')
                ->get();
            return response()->json($updateTop);
        } catch (Exception $e) {
            Log::error('Error get update top', ['message' => $e->getMessage()]);
            return response()->json(['error' => 'Không thể lấy danh sách phim'], 500);
        }
    }

    public function getFilmTheater()
    {
        try {
            DB::enableQueryLog();
            $filmTheater = Film::with('genres')
                ->whereHas('genres', function ($query) {
                    $query->where('slug',  'chieu-rap');
                })
                // ->orderByDesc('created_at')
                ->get();
            Log::info('Film theater', ['count' => $filmTheater]);
            return response()->json($filmTheater);
        } catch (Exception $e) {
            Log::error('Error get theater', ['message' => $e->getMessage()]);
            return response()->json(['error' => 'Không thể lấy danh sách phim'], 500);
        }
    }
}

<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Country;
use App\Models\Favorite;
use App\Models\Film;
use App\Models\User;
use Illuminate\Support\Facades\Log;

use Exception;

class FavoriteController extends Controller
{
    public function index()
    {
        $favorites = Favorite::with(['user', 'film'])->get();

        return response()->json([
            'status' => 'success',
            'favorites' => $favorites,
        ]);
    }
    //check 
    public function isFavorite($filmId)
    {
        try {
            $user = auth('api')->user();
            if (!$user) {
                return response()->json(['is_favorite' => false]);
            }
            $isFavorite = Favorite::where('film_id', $filmId)
                ->where('user_id', $user->id)
                ->exists();
            return response()->json([
                'favorite' => $isFavorite
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'error' => $e->getMessage()
            ], 500);
        }
    }
    public function getTopFavorite()
    {
        try {
            $film = Film::withCount('favorites')
                ->orderByDesc('favorites_count')
                ->take(10)
                ->get();
            return response()->json([
                'message' => 'fetch top favorite success',
                'film' => $film
            ], 200);
        } catch (Exception $e) {
            Log::error('Lỗi getTopFavorite: ' . $e->getMessage(), ['trace' => $e->getTraceAsString()]);
            return response()->json([
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function addFavorite(Request $request)
    {
        try {
            $user = auth('api')->user();
            if (!$user) {
                return response()->json([
                    'error' => 'not login'
                ], 401);
            }
            $validated = $request->validate([
                'film_id' => 'required|exists:film,id',
            ]);
            $existingFavorite = Favorite::where('user_id', $user->id)
                ->where('film_id', $validated['film_id'])
                ->first();
            if ($existingFavorite) {
                return response()->json([
                    'message' => 'Film already in favorites'
                ], 200);
            }
            $favorite = new Favorite();
            $favorite->user_id = $user->id;
            $favorite->film_id = $validated['film_id'];
            $favorite->save(); // Laravel sẽ tự động điền created_at và updated_at
            Log::info('Add favorite request:', $request->all());
            return response()->json([
                'message' => 'Film added to favorites successfully',
                'user_id' => $favorite->user_id,
                'film_id' => $favorite->film_id,
            ], 201); // Sử dụng 201 cho created
        } catch (Exception $e) {
            return response()->json([
                'error' => $e->getMessage()
            ], 500);
        }
    }


    public function removeFavorite(Request $request, $filmId)
    {
        try {
            $user = auth('api')->user();

            if (!$user) {
                return response()->json([
                    'error' => 'User not authenticated'
                ], 401);
            }

            $favorite = Favorite::where('user_id', $user->id)
                ->where('film_id', $filmId)
                ->first();

            if (!$favorite) {
                return response()->json([
                    'error' => 'Favorite not found',
                ], 404);
            }

            $favorite->delete();

            return response()->json([
                'message' => 'Favorite removed successfully',
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // list favorite
    public function getUserFilmFavorite(Request $request)
    {
        try {
            $user = $request->user();

            $favorites = $user->favorites()->with('film')->get()->pluck('film');

            return response()->json([
                'message' => 'get user film favorite succes',
                'favorites' => $favorites
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getLike($idFilm)
    {
        try {
            $film = Film::find($idFilm);

            $likeCount = Favorite::where('film_id', $idFilm)->count();
            return response()->json([
                'message' => 'fetch success favorite',
                'film' => $film,
                'likeCount' => $likeCount
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'error' => $e->getMessage()
            ], 500);
        }
    }
}

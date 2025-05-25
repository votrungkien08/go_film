<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Country;
use App\Models\Favorite;
use App\Models\Film;
use Exception;

class FavoriteController extends Controller
{
    public function getFavoriteByIdFilm(Request $request, $idFilm) {
        try {
            $film = Film::find($idFilm);
                if (!$film) {
                    return response()->json([
                        'error' => 'Film not found',
                    ], 404);
                }
                $favorite = $film->favorites()->with('user')->get(); // Nạp quan hệ user
                return response()->json([
                    'favorite' => $favorite,
                    'message' => 'fetch favorite successfully',
                ], 200);
            } catch (\Exception $e) {
                return response()->json([
                    'error' => 'Error fetching favorite',
                    'message' => $e->getMessage(),
                ], 500);
        }
    }
    public function getTopFavorite() {
        try {
            $film = Film::withCount('favorites')->orderByDesc('favorites_count')->get();
            return response()->json([
                'message' => 'fetch top favorite success',
                'film' => $film
            ],200);
        } catch(Exception $e) {
            \Log::error('Lỗi getTopFavorite: ' . $e->getMessage(), ['trace' => $e->getTraceAsString()]);
            return response()->json([
                'error'=> $e->getMessage()
            ],500);
        }
    }
}

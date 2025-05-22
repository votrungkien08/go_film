<?php

namespace App\Http\Controllers;

use App\Models\Rating;
use Illuminate\Http\Request;

class RatingController extends Controller
{
    public function postRating(Request $request)
    {
        try {
            $user = $request->user();
            if (!$user) {
                return response()->json([
                    'error' => 'Unauthenticated',
                ], 401);
            }
            $request->validate([
                'film_id' => 'required|integer',
                'rating' => 'required|integer|min:1|max:5',
            ]);

            $rating = new Rating();
            $rating->film_id = $request->film_id;
            $rating->user_id = $user->id;
            $rating->rating = $request->rating;
            $rating->created_at = now();
            $rating->save();
            return response()->json([
                'message' => 'Rating submitted successfully',
                'rating' => $rating,
                'user' => $user->name,
                'film_id' => $request->film_id,
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error: ' . $e->getMessage(),
            ], 500);
        }

    }
    public function getUserRating(Request $request, $filmId)
    {
        try {
            $user = $request->user();
            if (!$user) {
                return response()->json([
                    'error' => 'Unauthenticated',
                ], 401);
            }

            $rating = Rating::where('user_id', $user->id)
                ->where('film_id', $filmId)
                ->first();

            if (!$rating) {
                return response()->json([
                    'message' => 'No rating found',
                    'rating' => null,
                ], 200);
            }

            return response()->json([
                'message' => 'Rating fetched successfully',
                'rating' => $rating->rating,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Error fetching rating',
                'message' => $e->getMessage(),
            ], 500);
        }
    }
}
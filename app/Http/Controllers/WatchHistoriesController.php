<?php

namespace App\Http\Controllers;

use App\Models\Watch_histories;
use Illuminate\Http\Request;

class WatchHistoriesController extends Controller
{


    public function store(Request $request)
    {
        try {
            $user = $request->user();
            if (!$user) {
                return response()->json([
                    'error' => 'Unauthorized',
                ], 401);
            }
            $history = Watch_histories::updateOrCreate([
                'user_id' => $user->id,
                'film_id' => $request->film_id,
            ], [
                'watch_at' => now(),
            ]);


            return response()->json([
                'message' => 'Watch history stored successfully',
                'history' => $history,
            ], 201);
        }catch (\Exception $e) {
            return response()->json([
                'message' => 'Error: ' . $e->getMessage(),
            ], 500);
        }

    }
}

<?php

namespace App\Http\Controllers;

use App\Models\Watch_histories;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

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
            $request->validate([
                'episodes_id' => 'required|integer|exists:film_episodes,id',
                'progress_time' => 'required|integer|min:0',
            ]);
            $history = Watch_histories::updateOrCreate([
                'user_id' => $user->id,
                'episodes_id' => $request->episodes_id,
            ], [
                'watch_at' => now(),
                'progress_time' => $request->progress_time,
            ]);

            $history->load('episodes.film');

            Log::info('Storing watch history', [
                'user_id' => $user->id,
                'episodes_id' => $request->episodes_id,
                'progress_time' => $request->progress_time,
            ]);
            return response()->json([
                'message' => 'Watch history stored successfully',
                'history' => $history,
            ], 200);
        }catch (\Exception $e) {
            return response()->json([
                'message' => 'Error: ' . $e->getMessage(),
            ], 500);
        }

    }



    public function getWatchHistory(Request $request) {
        try {
            $user = $request->user();
            if (!$user) {
                return response()->json([
                    'error' => 'Unauthorized',
                ], 401);
            }

            $history = Watch_histories::with('episodes.film')
                ->where('user_id',$user->id)
                ->orderBy('watch_at','desc')
                ->get();


            return response()->json([
                'message' => 'get Watch history successfully',
                'history' => $history,
            ], 200);
        }catch (\Exception $e) {
            return response()->json([
                'message' => 'Error: ' . $e->getMessage(),
            ], 500);
        }
    }


    
}

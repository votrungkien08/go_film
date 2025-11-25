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

            Log::info('Received store watch history request', [
                'user_id' => $user->id,
                'request_data' => $request->all(),
            ]);

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

            Log::info('Watch history stored successfully', [
                'user_id' => $user->id,
                'episodes_id' => $request->episodes_id,
                'progress_time' => $request->progress_time,
            ]);
            return response()->json([
                'message' => 'Watch history stored successfully',
                'history' => $history,
            ], 200);
        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::error('Validation failed for watch history', [
                'errors' => $e->errors(),
                'request_data' => $request->all(),
            ]);
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            Log::error('Error storing watch history', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'request_data' => $request->all(),
            ]);
            return response()->json([
                'message' => 'Error storing watch history',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function getWatchHistory(Request $request)
    {
        try {
            $user = $request->user();
            if (!$user) {
                return response()->json([
                    'error' => 'Unauthorized',
                ], 401);
            }

            // **THÊM**: Lọc bỏ các bản ghi có episode_id là null
            $history = Watch_histories::with('episodes.film')
                ->where('user_id', $user->id)
                ->whereNotNull('episodes_id') // Ngăn trả về bản ghi với episode_id null
                ->orderBy('watch_at', 'desc')
                ->get();

            return response()->json([
                'message' => 'get Watch history successfully',
                'history' => $history,
            ], 200);
        } catch (\Exception $e) {
            Log::error('Error fetching watch history', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return response()->json([
                'message' => 'Error fetching watch history',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
    public function deleteWatchHistory(Request $request, $historyId)
    {
        try {
            $user = $request->user();

            if (!$user) {
                return response()->json([
                    'error' => 'User not authenticated'
                ], 401);
            }

            $history = Watch_histories::where('id', $historyId)
                ->where('user_id', $user->id)
                ->first();

            if (!$history) {
                return response()->json([
                    'error' => 'Watch history not found',
                ], 404);
            }

            $history->delete();

            Log::info('Watch history deleted successfully', [
                'user_id' => $user->id,
                'history_id' => $historyId,
            ]);

            return response()->json([
                'message' => 'Watch history deleted successfully',
            ], 200);
        } catch (\Exception $e) {
            Log::error('Error deleting watch history', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'history_id' => $historyId,
            ]);

            return response()->json([
                'error' => $e->getMessage()
            ], 500);
        }
    }
}

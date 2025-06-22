<?php

namespace App\Http\Controllers;

use App\Models\Film_episodes;
use App\Models\Watch_histories;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class EpisodesController extends Controller
{
    public function getFilmByEpisodeId(Request $request, $episodeId)
    {
        try {
            $episode = Film_episodes::with('film')
                ->find($episodeId);
            
            if (!$episode) {
                return response()->json(['error' => 'Episode not found'], 404);
            }
            return response()->json([
                'success' => true,
                'episode' => [
                    'id' => $episode->id,
                    'film_id' => $episode->film_id,
                    'episode_number' => $episode->episode_number,
                    'episode_title' => $episode->episode_title,
                    'episode_url' => $episode->episode_url,
                    'duration' => $episode->duration,
                ],
                'film' => [
                    'id' => $episode->film->id,
                    'title_film' => $episode->film->title_film,
                    'slug' => $episode->film->slug,
                    'thumb' => $episode->film->thumb,
                ]
            ], 200);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Error fetching film: ' . $e->getMessage()], 500);
        }
    }

    


    
}

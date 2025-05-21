<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Genre;
class GenreController extends Controller
{
    public function index() {
        try {
            $genres = Genre::all();
            return response()->json([
                'genres' => $genres,
                'message' => 'fetch genres successfully',
            ],200);
        }catch(\Exception $e) {
            return response()->json(['error' => 'Error fetching genres'], 500);
        }
    }
}

<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Models\Genre;
class GenreController extends Controller
{
    public function index()
    {
        try {
            $genres = Genre::all();
            return response()->json([
                'genres' => $genres,
                'message' => 'fetch genres successfully',
            ], 200);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Error fetching genres'], 500);
        }
    }
    public function store(Request $request): JsonResponse
    {
        $request->validate(['genre_name' => 'required|string|max:255|unique:genre,genre_name']);
        try {
            $genre = Genre::create(['genre_name' => $request->genre_name,]);
            return response()->json([
                'id' => $genre->id,
                'genre_name' => $genre->genre_name,
            ], 201);
        } catch (\Exception $e) {
            \Log::error("Lỗi khi thêm thể loại: " . $e->getMessage());
            return response()->json(['error' => 'Lỗi khi thêm thể loại', 'message' => $e->getMessage(),], 500);
        }
    }

}
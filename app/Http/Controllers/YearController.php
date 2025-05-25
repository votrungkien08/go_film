<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Year;
use Illuminate\Http\JsonResponse;

class YearController extends Controller
{
    public function index(): JsonResponse
    {
        try {
            $years = Year::orderBy('release_year', 'asc')->get();
            return response()->json([
                'years' => $years,
                'message' => 'fetch years successfully',
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Error fetching years',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'release_year' => 'required|integer|min:1900|max:' . (date('Y') + 1) . '|unique:year,release_year',
        ]);

        try {
            $year = Year::create([
                'release_year' => $request->release_year,
            ]);

            // Chuyển đổi đối tượng $year thành mảng để đảm bảo JSON hợp lệ
            return response()->json([
                'id' => $year->id,
                'release_year' => $year->release_year,
            ], 201);
        } catch (\Exception $e) {
            \Log::error('Error creating year: ' . $e->getMessage());
            return response()->json([
                'error' => 'Error creating year',
                'message' => $e->getMessage(),
            ], 500);
        }
    }
}
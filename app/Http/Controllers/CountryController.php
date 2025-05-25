<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Models\Country;
class CountryController extends Controller
{
    public function index()
    {
        try {
            $countries = Country::all();
            return response()->json([
                'message' => 'fetch country success',
                'country' => $countries
            ], 200);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Error fetching countries'], 500);
        }
    }
    public function store(Request $request): JsonResponse
    {
        $request->validate(['country_name' => 'required|string|max:255|unique:country,country_name',]);
        try {
            $country = Country::create([
                'country_name' => $request->country_name,
            ]);
            return response()->json([
                'id' => $country->id,
                'country_name' => $country->country_name,
            ], 201);
        } catch (\Exception $e) {
            \Log::error('Lỗi khi thêm quốc gia: ' . $e->getMessage());
            return response()->json(['error' => 'Lỗi khi thêm quốc gia', 'message' => $e->getMessage(),], 500);
        }
    }

}
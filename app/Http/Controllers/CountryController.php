<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Country;
class CountryController extends Controller
{
    public function index() {
        try {
            $countries = Country::all();
            return response()->json([
                'message' => 'fetch country success',
                'country' => $countries
            ],200);
        }
        catch (\Exception $e) {
            return response()->json(['error' => 'Error fetching countries'], 500);
        }
    }
}

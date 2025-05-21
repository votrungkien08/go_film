<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Year;
class YearController extends Controller
{
    public function index() {
        try {
            $years = Year::all();
            return response()->json([
                'years' => $years,
                'message' => 'fetch years successfully',
            ],200);
        }catch(\Exception $e) {
            return response()->json([
                'error' => 'Error fetching years',
                'message' => $e->getMessage(),
            ],500);
        }
    }
}


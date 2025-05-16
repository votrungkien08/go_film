<?php 
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use Illuminate\Http\Request;

use App\Http\Controllers\CloudinaryController;
use Illuminate\Support\Facades\Log;

Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
});


Route::post('/test-file', function (Request $request) {
    Log::info('📂 File test upload', [
        'hasFile' => $request->hasFile('video'),
        'size' => $request->file('video')?->getSize(),
    ]);
    return response()->json(['ok' => true]);
});
Route::get('/cloudinary-test', [CloudinaryController::class, 'testCloudinary']);
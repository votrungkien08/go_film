<?php
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use Illuminate\Http\Request;
use App\Http\Controllers\CloudinaryController;
use App\Http\Controllers\FilmController;
use App\Http\Controllers\YearController;
use App\Http\Controllers\CountryController;
use App\Http\Controllers\GenreController; // Thêm dòng này
use Illuminate\Support\Facades\Log;

Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'getUser']);
});

Route::post('/test-file', function (Request $request) {
    Log::info('📂 File test upload', [
        'hasFile' => $request->hasFile('video'),
        'size' => $request->file('video')?->getSize(),
    ]);
    return response()->json(['ok' => true]);
});
Route::get('/cloudinary-test', [CloudinaryController::class, 'testCloudinary']);

Route::post('/store-film', [CloudinaryController::class, 'uploadVideo']);
Route::get('/get-videos', [CloudinaryController::class, 'getVideosByPhim']);

Route::post('addPhim', [FilmController::class, 'store']);
Route::get('/years', [YearController::class, 'index']);
Route::get('/countries', [CountryController::class, 'index']);
Route::get('/genres', [GenreController::class, 'index']); // Thêm dòng này
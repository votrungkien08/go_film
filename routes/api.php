<?php
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use Illuminate\Http\Request;
use App\Http\Controllers\CloudinaryController;
use App\Http\Controllers\FilmController;
use App\Http\Controllers\YearController;
use App\Http\Controllers\CountryController;
use App\Http\Controllers\GenreController;
use Illuminate\Support\Facades\Log;
use App\Http\Controllers\CommentController;
use App\Http\Controllers\FavoriteController;
use App\Http\Controllers\RatingController;
use App\Http\Controllers\WatchHistoriesController;
use App\Models\Film;

Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'getUser']);

    // comment
    Route::post('/film/postComment', [CommentController::class, 'postComment']);
    Route::post('/checkComment', [CommentController::class, 'checkComment']);


    // rating
    Route::post('/film/postRating', [RatingController::class, 'postRating']);
    Route::post('/film/watch-history', [WatchHistoriesController::class, 'store']);
    Route::get('/film/rating/{filmId}', [RatingController::class, 'getUserRating'])->middleware('auth:sanctum');
    Route::post('/addyears', [YearController::class, 'store']);
    Route::post('/addcountries', [CountryController::class, 'store']);
    Route::post('/addgenres', [GenreController::class, 'store']);
    Route::delete('/delFilm/{id}', [FilmController::class, 'destroy']);

    // favorite
    Route::post('addFavorite', [FavoriteController::class, 'addFavorite']);
    Route::delete('removeFavorite/{idFilm}', [FavoriteController::class, 'removeFavorite']);
});

// favorite
Route::get('/film/{idFilm}/favorite', [FavoriteController::class, 'isFavorite']);
Route::get('/favorite', [FavoriteController::class, 'getTopFavorite']);



Route::get('/film/getRating/{filmId}', [RatingController::class, 'getRating']);


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



Route::post('/addFilm', [FilmController::class, 'store']);
Route::put('/updateFilm/{id}', [FilmController::class, 'update']);
Route::get('/films', [FilmController::class, 'index']);
Route::get('/film/{slug}', [FilmController::class, 'show']);



Route::get('/countries', [CountryController::class, 'index']);
Route::get('/genres', [GenreController::class, 'index']);
Route::get('/years', [YearController::class, 'index']);


Route::get('/comments', [CommentController::class, 'index']);
Route::get('/{id}/comments', [CommentController::class, 'getCommentByIdFilm']);
// block comment
Route::post('/toggleBlockComment/{idComment}', [CommentController::class, 'toggleBlockComments']);
Route::get('/film/comments/{idFilm}', [CommentController::class, 'getCommentByIdFilm']);
Route::get('/film/comments/user/{idUser}', [CommentController::class, 'getUserComment']);


Route::get('/film/{idFilm}/favorite', [FavoriteController::class, 'getFavoriteByIdFilm']);
Route::get('/favorite', [FavoriteController::class, 'getTopFavorite']);
Route::get('/filter-films', [FilmController::class, 'filter']);


//Route::get('/film/{id}', [FilmController::class, 'getFilmById']);

//>>>>>>> 0bf23a4 (commit detail film and comment)
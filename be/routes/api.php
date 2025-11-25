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
use App\Http\Controllers\EpisodesController;
use App\Http\Controllers\FavoriteController;
use App\Http\Controllers\RatingController;
use App\Http\Controllers\WatchHistoriesController;
use App\Http\Controllers\TransactionController;
use App\Http\Controllers\ChatbotController;
use App\Http\Controllers\AdEventController;
use App\Http\Controllers\RevenueExportController;
use App\Http\Controllers\GoogleController;
use Illuminate\Support\Facades\Mail;
use App\Models\Film;
use App\Models\Film_episodes;
use App\Models\Watch_histories;

// reset pass
Route::post('/reset-password', [AuthController::class, 'resetPassword']);
Route::post('/send-password-reset', [AuthController::class, 'sendResetLinkEmail']);

Route::get('/films/filter', [FilmController::class, 'filter']);
//login google
Route::get('auth/google/url', [GoogleController::class, 'googleLoginUrl']);
Route::get('auth/google/callback', [GoogleController::class, 'loginCallback']);
//user
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout']);
Route::post('/refresh', [AuthController::class, 'refresh']);
Route::middleware('jwt.auth')->group(function () {
    //user
    Route::get('/user', [AuthController::class, 'profile']);

    // comment
    Route::post('/film/postComment', [CommentController::class, 'postComment']);
    Route::post('/checkComment', [CommentController::class, 'checkComment']);

    // favorite
    Route::post('addFavorite', [FavoriteController::class, 'addFavorite']);
    Route::delete('/favorites/{filmId}', [FavoriteController::class, 'removeFavorite']);
    Route::get('/favorites', [FavoriteController::class, 'getUserFilmFavorite']);
    Route::get('/film/{idFilm}/favorite', [FavoriteController::class, 'isFavorite']);
    Route::get('/favorite-film/{filmId}', [FavoriteController::class, 'getLike']);

    // rating
    Route::post('/film/postRating', [RatingController::class, 'postRating']);
    // Route::post('/film/watch-history', [WatchHistoriesController::class, 'store']);
    Route::get('/film/rating/{filmId}', [RatingController::class, 'getUserRating']);
    Route::post('/addyears', [YearController::class, 'store']);
    Route::post('/addcountries', [CountryController::class, 'store']);
    Route::post('/addgenres', [GenreController::class, 'store']);
    Route::delete('/delFilm/{id}', [FilmController::class, 'destroy']);


    // watch history
    Route::get('/watch-histories', [WatchHistoriesController::class, 'getWatchHistory']);
    Route::delete('/watch-histories/{historyId}', [WatchHistoriesController::class, 'deleteWatchHistory'])->middleware('auth:api');
    Route::post('/store-histories', [WatchHistoriesController::class, 'store']);
});
// Route::get('/user', [AuthController::class, 'profile']);
// Route::post('/logout', [AuthController::class, 'logout']);
Route::middleware(['auth:sanctum', 'admin'])->group(function () {
    // edit, del user
    Route::put('/update-user/{id}', [AuthController::class, 'updateUser']);
    Route::delete('/delete-user/{id}', [AuthController::class, 'deleteUser']);
    Route::post('/add-user', [AuthController::class, 'addUser']);

    // favorite
    Route::get('/admin/favorites', [FavoriteController::class, 'index']);
    // rating
    Route::get('/admin/ratings', [RatingController::class, 'index']);
});

Route::get('/admin/export-revenue-summary', [RevenueExportController::class, 'exportSummary']);


// get user 
Route::get('/get-all-users', [AuthController::class, 'getAllUser']);

// episode
Route::get('/episode/{episodeId}', [EpisodesController::class, 'getFilmByEpisodeId']);

// filter
Route::get('/filter', [FilmController::class, 'filterFilmAdvance']);

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
Route::get('/get-videos', [CloudinaryController::class, 'getVideosByFilm']);



Route::post('/addFilm', [FilmController::class, 'store']);
Route::post('/updateFilm/{id}', [FilmController::class, 'update']);

Route::get('/films', [FilmController::class, 'index']);
Route::get('/film/{slug}', [FilmController::class, 'show']);
Route::get('/films/rank-top', [FilmController::class, 'getRankTop']);
Route::get('/films/update-top', [FilmController::class, 'getUpdateTop']);
Route::get('/films/theater', [FilmController::class, 'getFilmTheater']);

Route::get('/countries', [CountryController::class, 'index']);
Route::get('/genres', [GenreController::class, 'index']);
Route::get('/years', [YearController::class, 'index']);


Route::get('/comments', [CommentController::class, 'index']);
Route::get('/{id}/comments', [CommentController::class, 'getCommentByIdFilm']);
// block comment
Route::post('/toggleBlockComment/{idComment}', [CommentController::class, 'toggleBlockComments']);
Route::get('/film/comments/{idFilm}', [CommentController::class, 'getCommentByIdFilm']);
Route::get('/film/comments/user/{idUser}', [CommentController::class, 'getUserComment']);

// increase view
Route::post('/increaseView', [FilmController::class, 'increaseView']);


Route::get('/favorite', [FavoriteController::class, 'getTopFavorite']);
Route::get('/filter-films', [FilmController::class, 'filter']);


//Route::get('/film/{id}', [FilmController::class, 'getFilmById']);

Route::get('/view-stats-by-month', [FilmController::class, 'getViewStatsByMonth']);

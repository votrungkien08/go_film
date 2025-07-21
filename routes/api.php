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
use Illuminate\Support\Facades\Mail;
use App\Models\Film;
use App\Models\Film_episodes;
use App\Models\Watch_histories;

Route::post('/login', [AuthController::class, 'login'])->name('login');
Route::post('/register', [AuthController::class, 'register']);
// reset pass
Route::post('/reset-password', [AuthController::class, 'resetPassword']);
Route::post('/send-password-reset', [AuthController::class, 'sendResetLinkEmail']);
Route::middleware('auth:sanctum')->group(function () {
    //user
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'getUser']);





    // comment
    Route::post('/film/postComment', [CommentController::class, 'postComment']);
    Route::post('/checkComment', [CommentController::class, 'checkComment']);


    // rating
    Route::post('/film/postRating', [RatingController::class, 'postRating']);
    // Route::post('/film/watch-history', [WatchHistoriesController::class, 'store']);
    Route::get('/film/rating/{filmId}', [RatingController::class, 'getUserRating']);
    Route::post('/addyears', [YearController::class, 'store']);
    Route::post('/addcountries', [CountryController::class, 'store']);
    Route::post('/addgenres', [GenreController::class, 'store']);
    Route::delete('/delFilm/{id}', [FilmController::class, 'destroy']);

    // favorite
    Route::post('addFavorite', [FavoriteController::class, 'addFavorite']);
    Route::delete('removeFavorite/{idFilm}', [FavoriteController::class, 'removeFavorite']);
    Route::get('/favorites', [FavoriteController::class, 'getUserFilmFavorite']);


    // VNPay payment
    Route::post('/vnpay/create', [TransactionController::class, 'createPayment']);
    Route::get('/total-transaction-amount', [TransactionController::class, 'getTotalSuccessAmount']);
    Route::get('/payment-histories', [TransactionController::class, 'getUserPaymentHistories']);
    Route::get('/transaction-amount-by-month', [TransactionController::class, 'getAmountByMonth']);

    // watch history
    Route::get('/watch-histories', [WatchHistoriesController::class, 'getWatchHistory']);
    Route::post('/store-histories', [WatchHistoriesController::class, 'store']);
    Route::post('/films/deduct-points', [FilmController::class, 'deductPoints']);
    Route::post('/films/reward-points', [FilmController::class, 'rewardPointsForNormalFilm']);

    Route::get('/points-history', [FilmController::class, 'getPointsHistory'])->middleware('auth:sanctum');

    // <<<<<<< HEAD
// Route::get('/admin/export-monthly-revenue', [AdEventController::class, 'monthlyRevenue']);
});

Route::middleware(['auth:sanctum', 'admin'])->group(function () {
    //revenue ad
    Route::get('/admin/export-monthly-revenue', [AdEventController::class, 'monthlyAdRevenue']);
    Route::get('/admin/monthly-revenue-range', [AdEventController::class, 'monthlyAdRevenueRange']);
    // revenue customer
    Route::get('/admin/monthly-customer-revenue', [TransactionController::class, 'monthlyCustomerRevenue']);
    Route::get('/admin/monthly-customer-revenue-range', [TransactionController::class, 'monthlyCustomerRevenueRange']);


    // edit, del user
    Route::put('/update-user/{id}', [AuthController::class, 'updateUser']);
    Route::delete('/delete-user/{id}', [AuthController::class, 'deleteUser']);
    Route::post('/add-user', [AuthController::class, 'addUser']);

    // favorite
    Route::get('/admin/favorites', [FavoriteController::class, 'index']);
    // rating
    Route::get('/admin/ratings', [RatingController::class, 'index']);
});
Route::post('/track-ad', [AdEventController::class, 'track']);
// Route cho người dùng bình thường gửi sự kiện quảng cáo
// Route::middleware('auth:sanctum')->post('/track-ad', [AdEventController::class, 'track']);
Route::get('/admin/export-revenue-summary', [RevenueExportController::class, 'exportSummary']);

// track ad event

// // get user 
//     Route::get('/get-all-users', [AuthController::class, 'getAllUser']);
// =======

// });


// get user 
Route::get('/get-all-users', [AuthController::class, 'getAllUser']);
// >>>>>>> 04382ac67ad755056403025a6fb8d2cfad63e487


// episode
Route::get('/episode/{episodeId}', [EpisodesController::class, 'getFilmByEpisodeId']);


// favorite
Route::get('/film/{idFilm}/favorite', [FavoriteController::class, 'isFavorite']);
Route::get('/favorite', [FavoriteController::class, 'getTopFavorite']);
Route::get('/favorite-film/{filmId}', [FavoriteController::class, 'getLike']);



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


//Route::get('/film/{idFilm}/favorite', [FavoriteController::class, 'getFavoriteByIdFilm']);
Route::get('/favorite', [FavoriteController::class, 'getTopFavorite']);
Route::get('/filter-films', [FilmController::class, 'filter']);
// VNPay callback
Route::get('/vnpay/callback', [TransactionController::class, 'callback']);

Route::post('/chatbot', [ChatbotController::class, 'handle']);

//Route::get('/film/{id}', [FilmController::class, 'getFilmById']);

Route::get('/view-stats-by-month', [FilmController::class, 'getViewStatsByMonth']);
<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Film;
use App\Models\ChatbotHistory;
use App\Models\Watch_histories;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use Google\Cloud\Dialogflow\V2\SessionsClient;
use Google\Cloud\Dialogflow\V2\TextInput;
use Google\Cloud\Dialogflow\V2\QueryInput;

class ChatbotController extends Controller
{
    protected $sessionsClient;
    protected $projectId = 'filmbot-oiik';

    public function __construct()
    {
        $this->sessionsClient = new SessionsClient([
            'transport' => 'rest',
            'transportConfig' => [
                'rest' => [
                    'restClientConfig' => [

                        'verify' => false

                    ]
                ]
            ]
        ]);

    }

    public function handle(Request $request)
    {
        try {
            // Phân biệt request từ Dialogflow webhook và frontend
            if ($request->has('queryResult')) {
                $queryText = trim($request->input('queryResult.queryText'));
                $params = $request->input('queryResult.parameters', []);
                $intent = $request->input('queryResult.intent.displayName', '');
            } else {
                $queryText = trim($request->input('queryText'));
                if (empty($queryText)) {
                    return response()->json([
                        'fulfillmentText' => 'Vui lòng nhập câu hỏi để tìm phim!'
                    ], 400);
                }
                $dialogflowResponse = $this->callDialogflow($queryText);
                Log::info('Dialogflow response', ['response' => $dialogflowResponse]);
                $intent = $dialogflowResponse['intent'] ?? '';
                $params = $dialogflowResponse['parameters'] ?? [];
            }

            $cacheKey = 'chatbot_search_' . md5($queryText);

            $responseText = Cache::remember($cacheKey, 3600, function () use ($intent, $params) {
                if (strtolower($intent) !== 'searchfilm') {
                    return 'Tôi chỉ hỗ trợ tìm phim. Bạn muốn tìm phim gì?';
                }

                $query = Film::with(['year', 'country', 'genres']);

                // Áp dụng các tham số từ Dialogflow
                if (!empty($params['genre'])) {
                    $query->whereHas('genres', function ($q) use ($params) {
                        $q->where('genre_name', 'like', '%' . $params['genre'] . '%');
                    });
                }
                if (!empty($params['country'])) {
                    $query->whereHas('country', function ($q) use ($params) {
                        $q->where('country_name', 'like', '%' . $params['country'] . '%');
                    });
                }
                if (!empty($params['date.year'])) {
                    $query->whereHas('year', function ($q) use ($params) {
                        $q->where('release_year', $params['date.year']);
                    });
                }
                if (!empty($params['person.actor'])) {
                    $query->where('actor', 'like', '%' . $params['person.actor'] . '%');
                }
                if (!empty($params['person.director'])) {
                    $query->where('director', 'like', '%' . $params['person.director'] . '%');
                }
                if (!empty($params['title_film'])) {
                    $query->where('title_film', 'like', '%' . $params['title_film'] . '%');
                }

                // Gợi ý dựa trên lịch sử xem
                if (Auth::check()) {
                    $userGenres = Watch_histories::where('user_id', Auth::id())
                        ->join('film_genre', 'watch_histories.film_id', '=', 'film_genre.film_id')
                        ->join('genre', 'film_genre.genre_id', '=', 'genre.id')
                        ->groupBy('genre_id')
                        ->orderByRaw('COUNT(*) DESC')
                        ->take(3)
                        ->pluck('genre_id')
                        ->toArray();
                    if (!empty($userGenres)) {
                        $query->orWhereHas('genres', function ($q) use ($userGenres) {
                            $q->whereIn('genre.id', $userGenres);
                        });
                    }
                }

                $films = $query->take(5)->get(['id', 'title_film', 'slug', 'content']);

                if ($films->isEmpty()) {
                    return 'Không tìm thấy phim phù hợp. Bạn muốn thử lại không?';
                }

                $responseText = "Danh sách phim gợi ý:\n";
                foreach ($films as $film) {
                    $responseText .= "- {$film->title_film}: {$film->content} (Link: /film/{$film->slug})\n";
                }

                return $responseText;
            });

            if (Auth::check()) {
                ChatbotHistory::create([
                    'user_id' => Auth::id(),
                    'user_message' => $queryText,
                    'bot_response' => $responseText,
                ]);
            }

            // Trả về phản hồi cho cả frontend và Dialogflow webhook
            return response()->json([
                'fulfillmentText' => $responseText
            ], 200);
        } catch (\Exception $e) {
            Log::error('Chatbot error', ['message' => $e->getMessage()]);
            return response()->json([
                'fulfillmentText' => 'Có lỗi xảy ra. Vui lòng thử lại!'
            ], 500);
        } finally {
            $this->sessionsClient->close();
        }
    }

    private function callDialogflow($queryText)
    {
        try {
            $session = $this->sessionsClient->sessionName($this->projectId, uniqid());
            $textInput = new TextInput();
            $textInput->setText($queryText)->setLanguageCode('vi');
            $queryInput = new QueryInput();
            $queryInput->setText($textInput);

            $response = $this->sessionsClient->detectIntent($session, $queryInput);
            $queryResult = $response->getQueryResult();
            $intent = $queryResult->getIntent()->getDisplayName();
            $parameters = json_decode($queryResult->getParameters()->serializeToJsonString(), true);

            return [
                'intent' => $intent,
                'parameters' => $parameters
            ];
        } catch (\Exception $e) {
            Log::error('Dialogflow error', ['message' => $e->getMessage()]);
            return [
                'intent' => '',
                'parameters' => []
            ];
        }
    }
}
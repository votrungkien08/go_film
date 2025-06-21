<?php
namespace App\Http\Controllers;

use App\Models\Film;
use App\Models\ChatbotHistory;
use App\Models\Watch_histories;
use Illuminate\Http\Request;
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
                if (strtolower($intent) === 'default welcome intent') {
                    return 'Xin chào! Tôi có thể giúp gì cho bạn?';
                }

                if (strtolower($intent) === 'searchfilm') {
                    return $this->handleSearchFilm($params);
                }

                if (strtolower($intent) === 'get_series_details') {
                    return $this->handleSeriesDetails($params);
                }

                return "Xin lỗi, tôi chưa hiểu ý bạn. Bạn có thể hỏi ví dụ như:\n- Tìm phim bộ hành động Mỹ\n- Phim The Witcher có mấy tập?\n- Một tập của The Witcher bao nhiêu phút?\nBạn muốn tìm phim gì?";
            });

            if (Auth::check()) {
                ChatbotHistory::create([
                    'user_id' => Auth::id(),
                    'user_message' => $queryText,
                    'bot_response' => $responseText,
                ]);
            }

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

    private function handleSearchFilm($params)
    {
        $query = Film::with(['year', 'country', 'genres']);
        $filtersApplied = false;

        $filmType = $params['film_type'] ?? null;
        if (is_array($filmType)) {
            $filmType = $filmType[0] ?? null;
        }
        if (!empty($filmType)) {
            $filmTypeNorm = strtolower(trim($filmType));
            if (in_array($filmTypeNorm, ['phim bộ', 'series', 'bộ'])) {
                $query->where('film_type', 0);
                $filtersApplied = true;
            } elseif (in_array($filmTypeNorm, ['phim lẻ', 'movie', 'lẻ'])) {
                $query->where('film_type', 1);
                $filtersApplied = true;
            }
        }

        Log::info('Chatbot search params', [
            'film_type' => $filmType ?? null,
            'genre' => $params['genre'] ?? null,
            'country' => $params['country'] ?? null,
            'query_sql' => $query->toSql(),
        ]);

        if (!empty($params['genre'])) {
            $genre = $this->normalizeText($params['genre']);
            $query->whereHas('genres', function ($q) use ($genre) {
                $q->whereRaw('LOWER(REPLACE(REPLACE(TRIM(genre_name), " ", ""), "-", "")) LIKE ?', ["%{$genre}%"]);
            });
            $filtersApplied = true;
        }

        if (!empty($params['country'])) {
            $country = $this->normalizeText($params['country']);
            $query->whereHas('country', function ($q) use ($country) {
                $q->whereRaw('LOWER(REPLACE(REPLACE(TRIM(country_name), " ", ""), "-", "")) LIKE ?', ["%{$country}%"]);
            });
            $filtersApplied = true;
        }

        if (!empty($params['date.year'])) {
            $query->whereHas('year', function ($q) use ($params) {
                $q->where('release_year', $params['date.year']);
            });
            $filtersApplied = true;
        }

        if (!empty($params['person.actor'])) {
            $actor = $this->normalizeText($params['person.actor']);
            $query->whereRaw('LOWER(REPLACE(REPLACE(TRIM(actor), " ", ""), "-", "")) LIKE ?', ["%{$actor}%"]);
            $filtersApplied = true;
        }

        if (!empty($params['person.director'])) {
            $director = $this->normalizeText($params['person.director']);
            $query->whereRaw('LOWER(REPLACE(REPLACE(TRIM(director), " ", ""), "-", "")) LIKE ?', ["%{$director}%"]);
            $filtersApplied = true;
        }

        if (!empty($params['title_film'])) {
            $title = $this->normalizeText($params['title_film']);
            $query->whereRaw('LOWER(REPLACE(REPLACE(TRIM(title_film), " ", ""), "-", "")) LIKE ?', ["%{$title}%"]);
            $filtersApplied = true;
        }

        if (Auth::check() && !$filtersApplied) {
            $userGenres = Watch_histories::where('user_id', Auth::id())
                ->join('film_genre', 'watch_histories.film_id', '=', 'film_genre.film_id')
                ->join('genre', 'film_genre.genre_id', '=', 'genre.id')
                ->groupBy('genre_id')
                ->orderByRaw('COUNT(*) DESC')
                ->take(3)
                ->pluck('genre_id')
                ->toArray();
            if (!empty($userGenres)) {
                $query->whereHas('genres', function ($q) use ($userGenres) {
                    $q->whereIn('genre.id', $userGenres);
                });
            }
        }

        $films = $query->take(5)->get(['id', 'title_film', 'slug', 'content', 'thumb']);

        if ($films->isEmpty()) {
            return json_encode([
                'type' => 'text',
                'message' => 'Không tìm thấy phim phù hợp. Bạn muốn thử lại không?'
            ]);
        }

        $filmList = $films->map(function ($film) {
            return [
                'title' => $film->title_film,
                'description' => $film->content,
                'link' => "/film/{$film->slug}",
                'thumb' => $film->thumb ? asset($film->thumb) : null
            ];
        })->toArray();

        return json_encode([
            'type' => 'film_list',
            'films' => $filmList
        ]);
    }

    private function handleSeriesDetails($params)
    {
        if (empty($params['title_film'])) {
            return 'Vui lòng cung cấp tên phim để tôi kiểm tra!';
        }

        $titleFilm = trim($params['title_film']);
        $normalizedTitle = $this->normalizeText($titleFilm);

        Log::info('Searching for film', [
            'original_title' => $params['title_film'],
            'normalized_title' => $normalizedTitle
        ]);

        $titleMap = [
            'bác sĩ thám tử takao ameku' => 'Ameku M.D.: Doctor Detective',
            'takao ameku' => 'Ameku M.D.: Doctor Detective',
            'bác sĩ takao ameku' => 'Ameku M.D.: Doctor Detective',
            'thám tử takao ameku' => 'Ameku M.D.: Doctor Detective'
        ];

        $mappedTitle = $titleMap[$normalizedTitle] ?? $titleFilm;

        $film = Film::with('film_episodes')
            ->where('film_type', 0)
            ->where(function ($query) use ($normalizedTitle, $mappedTitle) {
                $query->whereRaw('LOWER(REPLACE(REPLACE(TRIM(title_film), " ", ""), "-", "")) LIKE ?', ["%{$normalizedTitle}%"])
                    ->orWhere('title_film', 'like', '%' . $mappedTitle . '%')
                    ->orWhereRaw('LOWER(title_film) LIKE ?', ['%' . mb_strtolower($mappedTitle, 'UTF-8') . '%']);
            })
            ->first(['id', 'title_film', 'film_type']);

        if (!$film) {
            $film = Film::with('film_episodes')
                ->where(function ($query) use ($normalizedTitle, $mappedTitle) {
                    $query->whereRaw('LOWER(REPLACE(REPLACE(TRIM(title_film), " ", ""), "-", "")) LIKE ?', ["%{$normalizedTitle}%"])
                        ->orWhere('title_film', 'like', '%' . $mappedTitle . '%')
                        ->orWhereRaw('LOWER(title_film) LIKE ?', ['%' . mb_strtolower($mappedTitle, 'UTF-8') . '%']);
                })
                ->first(['id', 'title_film', 'film_type']);
        }

        if (!$film) {
            $films = Film::whereRaw('LOWER(title_film) LIKE ?', ['%' . mb_strtolower($titleFilm, 'UTF-8') . '%'])
                ->take(3)
                ->get(['title_film']);

            if ($films->isNotEmpty()) {
                $suggestions = $films->pluck('title_film')->implode(', ');
                return "Không tìm thấy phim bộ với tên '{$titleFilm}'. Có phải bạn muốn tìm: {$suggestions}?";
            }

            return "Không tìm thấy phim với tên '{$titleFilm}'. Bạn có muốn thử lại không?";
        }

        if ($film->film_type != 0) {
            return "'{$film->title_film}' không phải là phim bộ. Đây là phim lẻ.";
        }

        if (!empty($params['detail_type'])) {
            $detailType = $params['detail_type'];
            if (is_array($detailType)) {
                $detailType = $detailType[0] ?? '';
            }
            $detailType = strtolower($detailType);

            if (in_array($detailType, ['số tập', 'tập'])) {
                $episodeCount = $film->film_episodes->count();
                if ($episodeCount > 0) {
                    return "Phim '{$film->title_film}' có {$episodeCount} tập.";
                }
                return "Hiện tại chưa có thông tin số tập của phim '{$film->title_film}'.";
            }

            if (in_array($detailType, ['thời lượng', 'phút', 'dài'])) {
                $durations = $film->film_episodes->pluck('duration')->map(function ($duration) {
                    return (int) preg_replace('/[^0-9]/', '', $duration);
                })->filter(function ($duration) {
                    return $duration > 0;
                });

                $averageDuration = $durations->count() > 0 ? $durations->avg() : null;
                if (is_numeric($averageDuration) && $averageDuration > 0) {
                    return "Mỗi tập của phim '{$film->title_film}' có thời lượng khoảng " . round($averageDuration) . " phút.";
                }
                return "Hiện tại chưa có thông tin thời lượng mỗi tập của phim '{$film->title_film}'.";
            }
        }

        $episodeCount = $film->film_episodes->count();
        $durations = $film->film_episodes->pluck('duration')->map(function ($duration) {
            return (int) preg_replace('/[^0-9]/', '', $duration);
        })->filter(function ($duration) {
            return $duration > 0;
        });
        $averageDuration = $durations->count() ? $durations->avg() : null;

        $response = "Phim '{$film->title_film}'";
        if ($episodeCount > 0) {
            $response .= " có {$episodeCount} tập";
        }
        if (is_numeric($averageDuration) && $averageDuration > 0) {
            $response .= ", mỗi tập khoảng " . round($averageDuration) . " phút";
        }
        return $response . ".";
    }

    private function normalizeText($text)
    {
        $normalized = mb_strtolower(trim($text), 'UTF-8');
        $normalized = str_replace([' ', '-', '_'], '', $normalized);
        $normalized = $this->removeVietnameseAccents($normalized);
        return $normalized;
    }

    private function removeVietnameseAccents($str)
    {
        $accents = [
            'à',
            'á',
            'ạ',
            'ả',
            'ã',
            'â',
            'ầ',
            'ấ',
            'ậ',
            'ẩ',
            'ẫ',
            'ă',
            'ằ',
            'ắ',
            'ặ',
            'ẳ',
            'ẵ',
            'è',
            'é',
            'ẹ',
            'ẻ',
            'ẽ',
            'ê',
            'ề',
            'ế',
            'ệ',
            'ể',
            'ễ',
            'ì',
            'í',
            'ị',
            'ỉ',
            'ĩ',
            'ò',
            'ó',
            'ọ',
            'ỏ',
            'õ',
            'ô',
            'ồ',
            'ố',
            'ộ',
            'ổ',
            'ỗ',
            'ơ',
            'ờ',
            'ớ',
            'ợ',
            'ở',
            'ỡ',
            'ù',
            'ú',
            'ụ',
            'ủ',
            'ũ',
            'ư',
            'ừ',
            'ứ',
            'ự',
            'ử',
            'ữ',
            'ỳ',
            'ý',
            'ỵ',
            'ỷ',
            'ỹ',
            'đ'
        ];

        $noAccents = [
            'a',
            'a',
            'a',
            'a',
            'a',
            'a',
            'a',
            'a',
            'a',
            'a',
            'a',
            'a',
            'a',
            'a',
            'a',
            'a',
            'a',
            'e',
            'e',
            'e',
            'e',
            'e',
            'e',
            'e',
            'e',
            'e',
            'e',
            'e',
            'i',
            'i',
            'i',
            'i',
            'i',
            'o',
            'o',
            'o',
            'o',
            'o',
            'o',
            'o',
            'o',
            'o',
            'o',
            'o',
            'o',
            'o',
            'o',
            'o',
            'o',
            'o',
            'u',
            'u',
            'u',
            'u',
            'u',
            'u',
            'u',
            'u',
            'u',
            'u',
            'u',
            'y',
            'y',
            'y',
            'y',
            'y',
            'd'
        ];

        return str_replace($accents, $noAccents, $str);
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
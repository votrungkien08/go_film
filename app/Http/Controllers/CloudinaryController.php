<?php

namespace App\Http\Controllers;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Http;
use Illuminate\Http\Request;
use App\Models\Film;
use App\Models\Film_episodes;
// use CloudinaryLabs\CloudinaryLaravel\Facades\Cloudinary;
use Illuminate\Support\Facades\Log;
use Cloudinary\Api\Ping;
use Cloudinary\Cloudinary;                // 🎯 SDK client
use Cloudinary\Api\AdminApi;              // 🎯 Admin API
// use CloudinaryLabs\CloudinaryLaravel\Cloudinary;

// use CloudinaryLabs\CloudinaryLaravel\Cloudinary;

class CloudinaryController extends Controller
{

// public function uploadVideo(Request $request)
// {
//     $request->validate([
//         'title_film'   => 'required|string',
//         'video_type'   => 'required|in:trailer,episode',
//         'episode_number' => 'required_if:video_type,episode|string|nullable',
//         'episode_title' => 'required_if:video_type,episode|string|nullable',
//         'duration' => 'required|string',
//         'video'      => 'required|file|mimetypes:video/mp4,video/*',
//     ]);

//     $path = $request->file('video')->getRealPath();
//     $filename = $request->file('video')->getClientOriginalName();
//     $titleSlug = Str::slug($request->title_film, '-');
//     $videoType = $request->video_type;

//     $cloudinary = new \Cloudinary\Cloudinary([
//         'cloud' => [
//             'cloud_name' => env('CLOUDINARY_CLOUD_NAME'),
//             'api_key'    => env('CLOUDINARY_KEY'),
//             'api_secret' => env('CLOUDINARY_SECRET'),
//         ],
//         'url' => ['secure' => true],
//     ]);

//     // Xử lý tùy theo loại video
//     if ($videoType === 'trailer') {
//         $folder = "videos/{$titleSlug}/trailer";
//         $public_id = 'trailer';
//         $context = [];
//     } else {
//         $episodeSlug = Str::slug($request->episode_title ?? "tap-{$request->episode_number}");
//         $folder = "videos/{$titleSlug}";
//         $public_id = $episodeSlug;
//         $context = [
//             'episode_number' => $request->episode_number,
//             'episode_title' => $request->episode_title,
//             'duration' => $request->duration,
//         ];
//     }

//     try {
//         $upload = $cloudinary->uploadApi()->upload($path, [
//             'resource_type' => 'video',
//             'upload_preset' => env('CLOUDINARY_UPLOAD_PRESET'),
//             'public_id' => $public_id,
//             'folder' => $folder,
//             'context' => $context,
//         ]);

//         if ($videoType === 'trailer') {
//             // Cập nhật cột trailer trong bảng phim
//             // Giả sử bạn có hàm tìm phim theo slug hoặc ID
//             $film = Film::where('slug', $titleSlug)->first();
//             if ($film) {
//                 $film->trailer = $upload['secure_url'];
//                 $film->save();
//             }
//         }

//         return response()->json([
//             'type' => $videoType,
//             'episode_url' => $upload['secure_url'],
//         ]);
//     } catch (\Exception $e) {
//         Log::error('❌ Upload lỗi', ['message' => $e->getMessage()]);
//         return response()->json(['error' => 'Lỗi khi upload video: ' . $e->getMessage()], 500);
//     }
// }

public function uploadVideo(Request $request)
{
    $request->validate([
        'title_film' => 'required|string',
        'video' => 'nullable|file|mimetypes:video/mp4',
        'film_episodes.*.video' => 'nullable|file|mimetypes:video/mp4',
    ]);

    $titleSlug = Str::slug($request->title_film, '-');
    $cloudinary = new \Cloudinary\Cloudinary([
        'cloud' => [
            'cloud_name' => env('CLOUDINARY_CLOUD_NAME'),
            'api_key' => env('CLOUDINARY_KEY'),
            'api_secret' => env('CLOUDINARY_SECRET'),
        ],
        'url' => ['secure' => true],
    ]);

    $response = [
        'title_film' => $request->title_film,
    ];

    try {
        // Upload trailer nếu có
        if ($request->hasFile('video')) {
            $path = $request->file('video')->getRealPath();
            $folder = "videos/{$titleSlug}";
            $public_id = 'trailer';

            $upload = $cloudinary->uploadApi()->upload($path, [
                'resource_type' => 'video',
                'upload_preset' => env('CLOUDINARY_UPLOAD_PRESET'),
                'public_id' => $public_id,
                'folder' => $folder,
            ]);

            $response['trailer_url'] = $upload['secure_url'];
        }

        // Upload episodes nếu có
        if ($request->has('film_episodes')) {
            $episodes = $request->film_episodes;
            $episodeDetails = [];

            foreach ($episodes as $index => $episode) {
                $path = $episode['video']->getRealPath();
                $episodeSlug = Str::slug($episode['episode_title'] ?? "tap-{$episode['episode_number']}");
                $folder = "videos/{$titleSlug}";
                $public_id = $episodeSlug . '-' . ($index + 1);

                $upload = $cloudinary->uploadApi()->upload($path, [
                    'resource_type' => 'video',
                    'upload_preset' => env('CLOUDINARY_UPLOAD_PRESET'),
                    'public_id' => $public_id,
                    'folder' => $folder,
                    'context' => [
                        'episode_number' => $episode['episode_number'],
                        'episode_title' => $episode['episode_title'],
                        'duration' => $episode['duration'],
                    ],
                ]);

                $episodeDetails[] = [
                    'episode_number' => $episode['episode_number'],
                    'episode_title' => $episode['episode_title'],
                    'episode_url' => $upload['secure_url'],
                    'duration' => $episode['duration'],
                ];
            }

            $response['episodes'] = $episodeDetails;
        }

        return response()->json($response, 200);
    } catch (\Exception $e) {
        Log::error('❌ Upload lỗi', ['message' => $e->getMessage()]);
        return response()->json(['error' => 'Lỗi khi upload video: ' . $e->getMessage()], 500);
    }
}

// public function getVideosByFilm(Request $request)
// {
//     $title_film = $request->query('title_film');
//     if (!$title_film || !is_string($title_film)) {
//         return response()->json(['error' => 'Thiếu hoặc sai kiểu title_film'], 400);
//     }
    
//     $slug = Str::slug($title_film, '-');
//     $folder = "videos/{$slug}";

//     Log::info('📥 Nhận request getVideosByFilm', [
//         'title_film' => $title_film,
//         'slug' => $slug,
//         'folder' => $folder,
//     ]);

//     try {
//         $cloudinary = new Cloudinary([
//             'cloud' => [
//                 'cloud_name' => env('CLOUDINARY_CLOUD_NAME'),
//                 'api_key' => env('CLOUDINARY_KEY'),
//                 'api_secret' => env('CLOUDINARY_SECRET'),
//             ],
//             'url' => ['secure' => true],
//         ]);

//         $resources = $cloudinary->adminApi()->assets([
//             'type' => 'upload',
//             'prefix' => $folder,
//             'resource_type' => 'video',
//             'max_results' => 100,
//             'context' => true,
//         ]);

//         Log::info('📋 Phản hồi từ Cloudinary', ['resources' => $resources]);

//         if (!isset($resources['resources']) || empty($resources['resources'])) {
//             // Thử lấy tất cả video nếu không tìm thấy trong thư mục
//             $allResources = $cloudinary->adminApi()->assets([
//                 'type' => 'upload',
//                 'resource_type' => 'video',
//                 'max_results' => 100,
//                 'context' => true,
//             ]);
//             Log::info('📋 Phản hồi từ Cloudinary (không prefix)', ['all_resources' => $allResources]);

//             return response()->json([
//                 'message' => 'Không tìm thấy video cho phim này trong thư mục: ' . $folder,
//             ], 404);
//         }

//         $videos = collect($resources['resources'])->map(function ($video) use ($request) {
//             $episode_number = 'Không xác định';
//             $episode_title = 'Không xác định';
//             $duration = 'N/A';

//             if (isset($video['context']) && isset($video['context']['custom'])) {
//                 $contextData = $video['context']['custom'];
//                 $episode_number = $contextData['episode_number'] ?? 'Không xác định';
//                 $episode_title = $contextData['episode_title'] ?? 'Không xác định';
//                 $duration = $contextData['duration'] ?? 'N/A';
//             } else {
//                 $publicId = $video['public_id'];
//                 $parts = explode('/', $publicId);
//                 $filename = end($parts);

//                 if (preg_match('/tap-(\d+)/', $filename, $matches)) {
//                     $episode_number = $matches[1] . ' tập';
//                     $episode_title = 'Tập ' . $matches[1];
//                 }

//                 if (isset($video['duration'])) {
//                     $duration = round($video['duration']) . ' phút';
//                 }
//             }

//             return [
//                 'title_film' => $request->query('title_film'),
//                 'episode_number' => $episode_number,
//                 'episode_title' => $episode_title,
//                 'duration' => $duration,
//                 'episode_url' => $video['secure_url'],
//             ];
//         });

//         return response()->json([
//             'videos' => $videos,
//         ]);
//     } catch (\Exception $e) {
//         Log::error('❌ Lỗi khi lấy video', ['message' => $e->getMessage()]);
//         return response()->json([
//             'error' => 'Lỗi khi lấy video: ' . $e->getMessage(),
//         ], 500);
//     }
// }
// public function getVideosByFilm(Request $request)
// {
//     $title_film = $request->query('title_film');
//     if (!$title_film || !is_string($title_film)) {
//         return response()->json(['error' => 'Thiếu hoặc sai kiểu title_film'], 400);
//     }
    
//     $slug = Str::slug($title_film, '-');
//     $folder = "videos/{$slug}";

//     Log::info('📥 Nhận request getVideosByFilm', [
//         'title_film' => $title_film,
//         'slug' => $slug,
//         'folder' => $folder,
//     ]);

//     try {
//         $cloudinary = new Cloudinary([
//             'cloud' => [
//                 'cloud_name' => env('CLOUDINARY_CLOUD_NAME'),
//                 'api_key' => env('CLOUDINARY_KEY'),
//                 'api_secret' => env('CLOUDINARY_SECRET'),
//             ],
//             'url' => ['secure' => true],
//         ]);

//         $resources = $cloudinary->adminApi()->assets([
//             'type' => 'upload',
//             'prefix' => $folder,
//             'resource_type' => 'video',
//             'max_results' => 100,
//             'context' => true,
//         ]);

//         Log::info('📋 Phản hồi từ Cloudinary', ['resources' => $resources]);

//         if (!isset($resources['resources']) || empty($resources['resources'])) {
//             return response()->json([
//                 'message' => 'Không tìm thấy video cho phim này trong thư mục: ' . $folder,
//             ], 404);
//         }

//         $videos = collect($resources['resources'])->map(function ($video) use ($request) {
//             $episode_number = 'Không xác định';
//             $episode_title = 'Không xác định';
//             $duration = 'N/A';
//             $is_trailer = false;

//             if (isset($video['context']) && isset($video['context']['custom'])) {
//                 $contextData = $video['context']['custom'];
//                 $episode_number = $contextData['episode_number'] ?? 'Không xác định';
//                 $episode_title = $contextData['episode_title'] ?? 'Không xác định';
//                 $duration = $contextData['duration'] ?? 'N/A';
//                 $is_trailer = isset($contextData['is_trailer']) && $contextData['is_trailer'] === 'true';
//             } else {
//                 $publicId = $video['public_id'];
//                 $parts = explode('/', $publicId);
//                 $filename = end($parts);

//                 if (preg_match('/tap-(\d+)/', $filename, $matches)) {
//                     $episode_number = $matches[1] . ' tập';
//                     $episode_title = 'Tập ' . $matches[1];
//                 } elseif (str_contains($filename, 'trailer')) {
//                     $is_trailer = true;
//                     $episode_title = 'Trailer';
//                 }

//                 if (isset($video['duration'])) {
//                     $duration = round($video['duration']) . ' phút';
//                 }
//             }

//             return [
//                 'title_film' => $request->query('title_film'),
//                 'episode_number' => $episode_number,
//                 'episode_title' => $episode_title,
//                 'duration' => $duration,
//                 'episode_url' => $video['secure_url'],
//                 'is_trailer' => $is_trailer,
//             ];
//         });

//         return response()->json([
//             'videos' => $videos,
//         ]);
//     } catch (\Exception $e) {
//         Log::error('❌ Lỗi khi lấy video', ['message' => $e->getMessage()]);
//         return response()->json([
//             'error' => 'Lỗi khi lấy video: ' . $e->getMessage(),
//         ], 500);
//     }
// }

// public function getVideosByFilm(Request $request)
// {
//     $title_film = $request->query('title_film');
//     if (!$title_film || !is_string($title_film)) {
//         return response()->json(['error' => 'Thiếu hoặc sai kiểu title_film'], 400);
//     }
    
//     $slug = Str::slug($title_film, '-');
//     $folder = "videos/{$slug}";

//     Log::info('📥 Nhận request getVideosByFilm', [
//         'title_film' => $title_film,
//         'slug' => $slug,
//         'folder' => $folder,
//     ]);

//     try {
//         $cloudinary = new Cloudinary([
//             'cloud' => [
//                 'cloud_name' => env('CLOUDINARY_CLOUD_NAME'),
//                 'api_key' => env('CLOUDINARY_KEY'),
//                 'api_secret' => env('CLOUDINARY_SECRET'),
//             ],
//             'url' => ['secure' => true],
//         ]);

//         $resources = $cloudinary->adminApi()->assets([
//             'type' => 'upload',
//             'prefix' => $folder . '/', // Đảm bảo khớp với thư mục upload
//             'resource_type' => 'video',
//             'max_results' => 100,
//             'context' => true,
//         ]);

//         Log::info('📋 Phản hồi từ Cloudinary', ['resources' => $resources]);

//         if (!isset($resources['resources']) || empty($resources['resources'])) {
//             return response()->json([
//                 'message' => 'Không tìm thấy video cho phim này trong thư mục: ' . $folder,
//             ], 404);
//         }

//         $response = [
//             'title_film' => $title_film,
//             'slug' => $slug,
//         ];

//         $trailer_url = null;
//         $episodes = [];

//         foreach ($resources['resources'] as $video) {
//             $episode_number = 'Không xác định';
//             $episode_title = 'Không xác định';
//             $duration = 'N/A';

//             if (isset($video['context']) && isset($video['context']['custom'])) {
//                 $contextData = $video['context']['custom'];
//                 $episode_number = $contextData['episode_number'] ?? 'Không xác định';
//                 $episode_title = $contextData['episode_title'] ?? 'Không xác định';
//                 $duration = $contextData['duration'] ?? 'N/A';
//             } else {
//                 $publicId = $video['public_id'];
//                 $filename = explode('/', $publicId);
//                 $filename = end($filename);

//                 if (preg_match('/tap-(\d+)/', $filename, $matches)) {
//                     $episode_number = $matches[1] . ' tập';
//                     $episode_title = 'Tập ' . $matches[1];
//                 } elseif (str_contains($filename, 'trailer')) {
//                     $episode_title = 'Trailer';
//                 }

//                 if (isset($video['duration'])) {
//                     $duration = round($video['duration']) . ' phút';
//                 }
//             }

//             if (str_contains($video['public_id'], 'trailer')) {
//                 $trailer_url = $video['secure_url'];
//             } else {
//                 $episodes[] = [
//                     'episode_number' => $episode_number,
//                     'episode_title' => $episode_title,
//                     'episode_url' => $video['secure_url'],
//                 ];
//             }
//         }

//         if ($trailer_url) {
//             $response['trailer_url'] = $trailer_url;
//         }
//         if (!empty($episodes)) {
//             $response['episodes'] = $episodes;
//         }

//         return response()->json($response);
//     } catch (\Exception $e) {
//         Log::error('❌ Lỗi khi lấy video', ['message' => $e->getMessage()]);
//         return response()->json([
//             'error' => 'Lỗi khi lấy video: ' . $e->getMessage(),
//         ], 500);
//     }
// }
// public function getVideosByFilm(Request $request)
// {
//     // Lấy slug từ query parameters
//     $slug = $request->query('slug');
//     if (!$slug || !is_string($slug)) {
//         return response()->json(['error' => 'Thiếu hoặc sai kiểu slug'], 400);
//     }

//     $folder = "videos/{$slug}";

//     Log::info('📥 Nhận request getVideosByFilm', [
//         'slug' => $slug,
//         'folder' => $folder,
//     ]);

//     try {
//         $cloudinary = new Cloudinary([
//             'cloud' => [
//                 'cloud_name' => env('CLOUDINARY_CLOUD_NAME'),
//                 'api_key' => env('CLOUDINARY_KEY'),
//                 'api_secret' => env('CLOUDINARY_SECRET'),
//             ],
//             'url' => ['secure' => true],
//         ]);

//         $resources = $cloudinary->adminApi()->assets([
//             'type' => 'upload',
//             'prefix' => $folder . '/', // Đảm bảo khớp với thư mục upload
//             'resource_type' => 'video',
//             'max_results' => 100,
//             'context' => true,
//         ]);

//         Log::info('📋 Phản hồi từ Cloudinary', ['resources' => $resources]);

//         if (!isset($resources['resources']) || empty($resources['resources'])) {
//             return response()->json([
//                 'message' => 'Không tìm thấy video cho phim này trong thư mục: ' . $folder,
//             ], 404);
//         }

//         $response = [
//             'slug' => $slug,
//         ];

//         $trailer_url = null;
//         $episodes = [];

//         foreach ($resources['resources'] as $video) {
//             $episode_number = 'Không xác định';
//             $episode_title = 'Không xác định';
//             $duration = 'N/A';

//             if (isset($video['context']) && isset($video['context']['custom'])) {
//                 $contextData = $video['context']['custom'];
//                 $episode_number = $contextData['episode_number'] ?? 'Không xác định';
//                 $episode_title = $contextData['episode_title'] ?? 'Không xác định';
//                 $duration = $contextData['duration'] ?? 'N/A';
//             } else {
//                 $publicId = $video['public_id'];
//                 $filename = explode('/', $publicId);
//                 $filename = end($filename);

//                 if (preg_match('/tap-(\d+)/', $filename, $matches)) {
//                     $episode_number = $matches[1] . ' tập';
//                     $episode_title = 'Tập ' . $matches[1];
//                 } elseif (str_contains($filename, 'trailer')) {
//                     $episode_title = 'Trailer';
//                 }

//                 if (isset($video['duration'])) {
//                     $duration = round($video['duration']) . ' phút';
//                 }
//             }

//             if (str_contains($video['public_id'], 'trailer')) {
//                 $trailer_url = $video['secure_url'];
//             } else {
//                 $episodes[] = [
//                     'episode_number' => $episode_number,
//                     'episode_title' => $episode_title,
//                     'episode_url' => $video['secure_url'],
//                 ];
//             }
//         }

//         // Lấy title_film từ context của trailer (nếu có) hoặc để trống
//         $title_film = 'Không xác định';
//         if ($trailer_url && isset($resources['resources'][0]['context']['custom']['title_film'])) {
//             $title_film = $resources['resources'][0]['context']['custom']['title_film'];
//         }

//         $response['title_film'] = $title_film;

//         if ($trailer_url) {
//             $response['trailer_url'] = $trailer_url;
//         }
//         if (!empty($episodes)) {
//             $response['episodes'] = $episodes;
//         }

//         return response()->json($response);
//     } catch (\Exception $e) {
//         Log::error('❌ Lỗi khi lấy video', ['message' => $e->getMessage()]);
//         return response()->json([
//             'error' => 'Lỗi khi lấy video: ' . $e->getMessage(),
//         ], 500);
//     }
// }
public function getVideosByFilm(Request $request)
{
    $slug = $request->query('slug');
    if (!$slug || !is_string($slug)) {
        return response()->json(['error' => 'Thiếu hoặc sai kiểu slug'], 400);
    }

    $folder = "videos/{$slug}";

    Log::info('📥 Nhận request getVideosByFilm', [
        'slug' => $slug,
        'folder' => $folder,
    ]);

    try {
        $cloudinary = new Cloudinary([
            'cloud' => [
                'cloud_name' => env('CLOUDINARY_CLOUD_NAME'),
                'api_key' => env('CLOUDINARY_KEY'),
                'api_secret' => env('CLOUDINARY_SECRET'),
            ],
            'url' => ['secure' => true],
        ]);

        $resources = $cloudinary->adminApi()->assets([
            'type' => 'upload',
            'prefix' => $folder . '/',
            'resource_type' => 'video',
            'max_results' => 100,
            'context' => true,
        ]);

        Log::info('📋 Phản hồi từ Cloudinary', ['resources' => $resources]);

        if (!isset($resources['resources']) || empty($resources['resources'])) {
            return response()->json([
                'message' => 'Không tìm thấy video cho phim này trong thư mục: ' . $folder,
            ], 404);
        }

        $response = [
            'slug' => $slug,
        ];

        $trailer_url = null;
        $episodes = [];

        foreach ($resources['resources'] as $video) {
            $episode_number = 'Không xác định';
            $episode_title = 'Không xác định';
            $duration = 'N/A';

            if (isset($video['context']) && isset($video['context']['custom'])) {
                $contextData = $video['context']['custom'];
                $title_film = $contextData['title_film'] ?? 'Không xác định';
                $episode_number = $contextData['episode_number'] ?? 'Không xác định';
                $episode_title = $contextData['episode_title'] ?? 'Không xác định';
                $duration = $contextData['duration'] ?? 'N/A';
            } else {
                $publicId = $video['public_id'];
                $filename = explode('/', $publicId);
                $filename = end($filename);

                if (preg_match('/tap-(\d+)/', $filename, $matches)) {
                    $episode_number = $matches[1] . ' tập';
                    $episode_title = 'Tập ' . $matches[1];
                } elseif (str_contains($filename, 'trailer')) {
                    $episode_title = 'Trailer';
                }

                if (isset($video['duration'])) {
                    $duration = round($video['duration']) . ' phút';
                }
            }

            $response['title_film'] = $title_film;

            if (str_contains($video['public_id'], 'trailer')) {
                $trailer_url = $video['secure_url'];
            } else {
                $episodes[] = [
                    'episode_number' => $episode_number,
                    'episode_title' => $episode_title,
                    'duration' => $duration,
                    'episode_url' => $video['secure_url'],
                ];
            }
        }

        if ($trailer_url) {
            $response['trailer_url'] = $trailer_url;
        }
        if (!empty($episodes)) {
            $response['episodes'] = $episodes;
        }

        return response()->json($response);
    } catch (\Exception $e) {
        Log::error('❌ Lỗi khi lấy video', ['message' => $e->getMessage()]);
        return response()->json(['error' => 'Lỗi khi lấy video: ' . $e->getMessage()], 500);
    }
}
public function testCloudinary()
{
    $cloudinary = new Cloudinary([
        'cloud' => [
            'cloud_name' => env('CLOUDINARY_CLOUD_NAME'),
            'api_key'    => env('CLOUDINARY_KEY'),
            'api_secret' => env('CLOUDINARY_SECRET'),
        ],
        'url' => ['secure' => true],
    ]);
    try {
        $cloudinary = new \Cloudinary\Cloudinary([
            'cloud' => [
                'cloud_name' => env('CLOUDINARY_CLOUD_NAME'),
                'api_key'    => env('CLOUDINARY_KEY'),
                'api_secret' => env('CLOUDINARY_SECRET'),
            ],
            'url' => ['secure' => true],
        ]);
    
        $api    = $cloudinary->adminApi();
        $result = $api->ping();  // ApiResponse
    
        // Convert to plain array:
        $payload = $result->getArrayCopy();
    
        Log::info('✅ Ping thành công', ['response' => $payload]);
        return response()->json([
            'status'   => 'connected',
            'response' => $payload,
        ]);
    } catch (\Exception $e) {
        Log::error('❌ Ping lỗi', ['message' => $e->getMessage()]);
        return response()->json([
            'error' => 'Không kết nối được với Cloudinary: ' . $e->getMessage(),
        ], 500);
    }
}

}

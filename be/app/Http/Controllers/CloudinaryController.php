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
            } elseif (!empty($request->trailer_url)) {
                // Nếu không upload mới, dùng lại trailer_url cũ từ form
                $response['trailer_url'] = $request->trailer_url;
            }

            if ($request->has('film_episodes')) {
                $episodes = $request->film_episodes;
                $episodeDetails = [];

                foreach ($episodes as $index => $episode) {
                    $videoFile = $episode['video'] ?? null;
                    $hasVideo = $videoFile && $videoFile instanceof \Illuminate\Http\UploadedFile;

                    if ($hasVideo) {
                        $path = $videoFile->getRealPath();
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

                        $episodeUrl = $upload['secure_url'];
                    } elseif (!empty($episode['episode_url'])) {
                        // Dùng lại video cũ nếu không upload mới
                        $episodeUrl = $episode['episode_url'];
                    } else {
                        // Nếu không có gì hết, bỏ qua hoặc log cảnh báo
                        Log::warning("⚠️ Episode $index thiếu cả video và episode_url", $episode);
                        continue;
                    }

                    $episodeDetails[] = [
                        'episode_number' => $episode['episode_number'],
                        'episode_title' => $episode['episode_title'],
                        'episode_url' => $episodeUrl,
                        'duration' => $episode['duration'],
                    ];
                }

                $response['episodes'] = $episodeDetails;
            }

            return response()->json($response, 200);
        } catch (\Exception $e) {
            Log::error(' Upload lỗi', ['message' => $e->getMessage()]);
            return response()->json(['error' => 'Lỗi khi upload video: ' . $e->getMessage()], 500);
        }
    }


    public function uploadTrailer(Request $request)
    {
        $request->validate([
            'title_film' => 'required|string|max:255',
            'trailer' => 'required|file|mimes:mp4',
        ]);
        $slug = Str::slug($request->title_film);
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
            'trailer' => null,
        ];

        try {
            if ($request->hasFile('trailer')) {
                $path = $request->file('trailer')->getRealPath();
                $folder = "videos/{$slug}";
                $public_id = 'trailer';

                $upload = $cloudinary->uploadApi()->upload($path, [
                    'resource_type' => 'video',
                    'upload_preset' => env('CLOUDINARY_UPLOAD_PRESET'),
                    'public_id' => $public_id,
                    'folder' => $folder,
                ]);

                $response['trailer'] = $upload['secure_url'];
            }
            // else if (!empty($request->trailer_url)) {
            //     $response['trailer_url'] = $request->trailer_url;
            // }

            return response()->json($response, 200);
        } catch (\Exception $e) {
            Log::error('Lỗi khi upload trailer', ['message' => $e->getMessage()]);
            return response()->json(['error' => 'Lỗi khi upload trailer: ' . $e->getMessage()], 500);
        }
    }
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
            Log::error('Lỗi khi lấy video', ['message' => $e->getMessage()]);
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

            Log::info('Ping thành công', ['response' => $payload]);
            return response()->json([
                'status'   => 'connected',
                'response' => $payload,
            ]);
        } catch (\Exception $e) {
            Log::error('Ping lỗi', ['message' => $e->getMessage()]);
            return response()->json([
                'error' => 'Không kết nối được với Cloudinary: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function uploadImage(Request $request)
    {
        // khởi tạo với URL config trong .env
        $cloudinary = new Cloudinary(env('CLOUDINARY_URL'));

        // gọi uploadApi()->upload()
        $result = $cloudinary
            ->uploadApi()
            ->upload(
                $request->file('file')->getRealPath(),
                ['folder' => $request->input('folder', '')]
            );

        return response()->json([
            'url' => $result['secure_url'], // SDK gốc trả mảng
        ]);
    }
}

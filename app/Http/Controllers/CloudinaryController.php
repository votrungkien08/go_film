<?php

namespace App\Http\Controllers;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Http;
use Illuminate\Http\Request;
use app\Models\Film;
use app\Models\Film_episodes;
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
    Log::info('🔑 Cloud URL', ['url' => config('cloudinary.cloud_url')]);
    Log::info('🚀 Nhận request uploadVideo', $request->all());

    $request->validate([
        'title_film'   => 'required|string',
        'episode_number'     => 'required|string',
        'episode_title'    => 'required|string',
        'duration' => 'required|string',
        'video'      => 'required|file|mimetypes:video/mp4,video/*',
    ]);

    $path = $request->file('video')->getRealPath();
    $filename = $request->file('video')->getClientOriginalName();
    $filesize = $request->file('video')->getSize();

    Log::info('📁 File upload info', [
        'path' => $path,
        'filename' => $filename,
        'filesize_mb' => $filesize / 1024 / 1024,
        'file_exists' => file_exists($path),
    ]);
    $titile_film_slug = Str::slug($request->title_film, '-'); 
    $titleslug = Str::slug($request->episode_title, '-');
    $public_id = $titleslug;
    try {
        $cloudinary = new \Cloudinary\Cloudinary([
            'cloud' => [
                'cloud_name' => env('CLOUDINARY_CLOUD_NAME'),
                'api_key'    => env('CLOUDINARY_KEY'),
                'api_secret' => env('CLOUDINARY_SECRET'),
            ],
            'url' => ['secure' => true],
        ]);
    
        Log::info('📤 Bắt đầu gửi file lên Cloudinary', ['filename' => $filename]);
    
        // Thêm context metadata
        $context = "so_tap={$request->so_tap}|ten_tap={$request->ten_tap}|thoi_luong={$request->thoi_luong}";
        
        $upload = $cloudinary->uploadApi()->upload($path, [
            'resource_type' => 'video',
            'upload_preset' => env('CLOUDINARY_UPLOAD_PRESET'),
            'public_id' => $public_id,
            'folder' => "videos/{$titile_film_slug}",
            'context' => $context  // Thêm metadata vào đây
        ]);
    
        Log::info('✅ Upload video thành công', ['response' => $upload]);
        return response()->json([
            'title_film'   => $request->title_film,
            'episode_number'     => $request->episode_number,
            'episode_title'    => $request->episode_title,
            'duration' => $request->duration,
            'episode_url'   => $upload['secure_url'],
        ]);
    } catch (\Exception $e) {
        Log::error('❌ Upload video lỗi', ['message' => $e->getMessage()]);
        return response()->json(['error' => 'Lỗi khi upload video: ' . $e->getMessage()], 500);
    }
}
public function getVideosByPhim(Request $request)
{
    $tenPhim = $request->query('ten_phim');
    if (!$tenPhim || !is_string($tenPhim)) {
        return response()->json(['error' => 'Thiếu hoặc sai kiểu ten_phim'], 400);
    }
    
    $tenphimslug = Str::slug($tenPhim, '-');
    $folder = "videos/{$tenphimslug}";

    Log::info('📥 Nhận request getVideosByPhim', [
        'ten_phim' => $tenPhim,
        'tenphimslug' => $tenphimslug,
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
            'prefix' => $folder,
            'resource_type' => 'video',
            'max_results' => 100,
            'context' => true,
        ]);

        Log::info('📋 Phản hồi từ Cloudinary', ['resources' => $resources]);

        if (!isset($resources['resources']) || empty($resources['resources'])) {
            // Thử lấy tất cả video nếu không tìm thấy trong thư mục
            $allResources = $cloudinary->adminApi()->assets([
                'type' => 'upload',
                'resource_type' => 'video',
                'max_results' => 100,
                'context' => true,
            ]);
            Log::info('📋 Phản hồi từ Cloudinary (không prefix)', ['all_resources' => $allResources]);

            return response()->json([
                'message' => 'Không tìm thấy video cho phim này trong thư mục: ' . $folder,
            ], 404);
        }

        $videos = collect($resources['resources'])->map(function ($video) use ($request) {
            $soTap = 'Không xác định';
            $tenTap = 'Không xác định';
            $thoiLuong = 'N/A';

            if (isset($video['context']) && isset($video['context']['custom'])) {
                $contextData = $video['context']['custom'];
                $soTap = $contextData['so_tap'] ?? 'Không xác định';
                $tenTap = $contextData['ten_tap'] ?? 'Không xác định';
                $thoiLuong = $contextData['thoi_luong'] ?? 'N/A';
            } else {
                $publicId = $video['public_id'];
                $parts = explode('/', $publicId);
                $filename = end($parts);

                if (preg_match('/tap-(\d+)/', $filename, $matches)) {
                    $soTap = $matches[1] . ' tập';
                    $tenTap = 'Tập ' . $matches[1];
                }

                if (isset($video['duration'])) {
                    $thoiLuong = round($video['duration']) . ' phút';
                }
            }

            return [
                'ten_phim' => $request->query('ten_phim'),
                'so_tap' => $soTap,
                'ten_tap' => $tenTap,
                'thoi_luong' => $thoiLuong,
                'link_tap' => $video['secure_url'],
            ];
        });

        return response()->json([
            'videos' => $videos,
        ]);
    } catch (\Exception $e) {
        Log::error('❌ Lỗi khi lấy video', ['message' => $e->getMessage()]);
        return response()->json([
            'error' => 'Lỗi khi lấy video: ' . $e->getMessage(),
        ], 500);
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

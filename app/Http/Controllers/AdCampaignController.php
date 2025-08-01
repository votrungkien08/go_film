<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Requests\AdCampaignStoreRequest;
use App\Models\AdCampaign;
use App\Models\AdEvent;
use App\Http\Controllers\CloudinaryController;
use Illuminate\Http\Request;
use Illuminate\Http\Request as BaseRequest;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
class AdCampaignController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        
    }

    // public function store(Request $request)
    // {
    //     try {
    //         $data = $request->validate([
    //             'customer_id' => 'required|exists:ad_customers,id',
    //             'title' => 'required|string',
    //             'image' => 'nullable|file|image|mimes:jpg,jpeg,png,gif',
    //             'start_date' => 'required|date',
    //             'end_date' => 'required|date',
    //             'deposit_amount' => 'required|numeric',
    //             'is_deposited' => 'required|boolean',
    //             'cost_per_view' => 'required|numeric',
    //             'cost_per_click' => 'required|numeric',
    //         ]);

    //         // Nếu có ảnh thì upload lên Cloudinary
    //         if ($request->hasFile('image')) {
    //             $uploadedFileUrl = Cloudinary::upload($request->file('image')->getRealPath())->getSecurePath();
    //             $data['image'] = $uploadedFileUrl; // Gán link vào data để lưu DB
    //         }

    //         $ad = AdCampaign::create($data);

    //         return response()->json(['message' => 'Đã thêm quảng cáo', 'ad' => $ad], 201);
    //     } catch (\Exception $e) {
    //         return response()->json([
    //             'message' => $e->getMessage()
    //         ], 500);
    //     }
    // }

    public function store(Request $request)
    {
        DB::beginTransaction();
        try {
            // 1. Validate các field
            $data = $request->validate([
                'customer_id'    => 'required|exists:ad_customer,id',
                'title'          => 'required|string|max:255',
                'image'      => 'nullable|file|image|mimes:jpeg,png,jpg,gif,webp',
                'start_date'     => 'required|date',
                'end_date'       => 'required|date',
                'deposit_amount' => 'required|numeric',
                'is_deposited'   => 'required|boolean',
                'cost_per_view'  => 'required|numeric',
                'cost_per_click' => 'required|numeric',
                'position' => 'required|string|in:update,ranking',
                'url_shop' => 'required|url',
            ]);

            // 2. Khởi tạo CloudinaryController
            $cloudinaryController = app(CloudinaryController::class);

            // 3. Chuẩn bị BaseRequest giả để gọi uploadImage (giống uploadVideo của bạn)
            $uploadReq = new BaseRequest(
                $request->query(),
                $request->all(),
                [], [], [], 
                $request->server(),
                $request->getContent()
            );

            // Nếu có file image_ads, gán vào key 'file' để CloudinaryController xử lý
            if ($request->hasFile('image')) {
                $uploadReq->files->set('file', $request->file('image'));

                // thêm param folder theo title slug
                $uploadReq->request->set('folder', 'ad_campaigns/' . Str::slug($data['title'], '-'));
            }

            // 4. Gọi lên CloudinaryController để upload ảnh
            //    Giả sử CloudinaryController có method uploadImage() trả về JSON chứa 'url'
            $uploadResp = $cloudinaryController->uploadImage($uploadReq);

            if ($uploadResp->getStatusCode() !== 200) {
                // nếu upload thất bại, trả về response gốc
                return $uploadResp;
            }

            $uploaded = json_decode($uploadResp->getContent(), true);
            Log::info('Ad image uploaded to Cloudinary:', $uploaded);

            // 5. Gán URL trả về vào $data để lưu DB
            $data['image'] = $uploaded['url'] ?? null;

            // 6. Tạo record AdCampaign
            $ad = AdCampaign::create($data);

            DB::commit();
            return response()->json([
                'message' => 'Đã thêm quảng cáo thành công',
                'ad'      => $ad,
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('❌ Lỗi khi thêm AdCampaign:', ['error' => $e->getMessage()]);
            return response()->json([
                'message' => 'Lỗi khi thêm quảng cáo: ' . $e->getMessage()
            ], 500);
        }
    }

    public function update(Request $request, $id)
    {
        DB::beginTransaction();
        try {
            // 1. Tìm bản ghi AdCampaign theo ID
            $ad = AdCampaign::findOrFail($id);
Log::info('Found AdCampaign:', ['id' => $id, 'ad' => $ad->toArray()]);

        // Log dữ liệu request
        Log::info('Update AdCampaign request data:', [
            'request_data' => $request->all(),
            'files' => $request->hasFile('image') ? ['image' => $request->file('image')->getClientOriginalName()] : [],
        ]);
            // 2. Validate các field
            $data = $request->validate([
                'customer_id'    => 'required|exists:ad_customer,id',
                'title'          => 'required|string|max:255',
                'image'          => 'nullable|file|image|mimes:jpeg,png,jpg,gif,webp', // image là tùy chọn
                'start_date'     => 'required|date',
                'end_date'       => 'required|date',
                'deposit_amount' => 'required|numeric',
                'is_deposited'   => 'required|boolean',
                'cost_per_view'  => 'required|numeric',
                'cost_per_click' => 'required|numeric',
                'position'       => 'required|string|in:update,ranking',
                'url_shop'       => 'required|url',
            ]);

            // 3. Khởi tạo CloudinaryController
            $cloudinaryController = app(CloudinaryController::class);

            // 4. Xử lý ảnh
            if ($request->hasFile('image')) {
                // Nếu có file ảnh mới, chuẩn bị BaseRequest để upload
                $uploadReq = new BaseRequest(
                    $request->query(),
                    $request->all(),
                    [], [], [],
                    $request->server(),
                    $request->getContent()
                );
                $uploadReq->files->set('file', $request->file('image'));
                $uploadReq->request->set('folder', 'ad_campaigns/' . Str::slug($data['title'], '-'));

                // Gọi CloudinaryController để upload ảnh
                $uploadResp = $cloudinaryController->uploadImage($uploadReq);

                if ($uploadResp->getStatusCode() !== 200) {
                    return $uploadResp;
                }

                $uploaded = json_decode($uploadResp->getContent(), true);
                Log::info('Ad image updated on Cloudinary:', $uploaded);

                // Cập nhật URL ảnh mới
                $data['image'] = $uploaded['url'] ?? $ad->image; // Giữ URL cũ nếu upload thất bại
            } else {
                // Nếu không có file ảnh mới, giữ nguyên URL ảnh cũ
                $data['image'] = $ad->image;
            }

            // 5. Cập nhật bản ghi AdCampaign
            $ad->update($data);

            DB::commit();
            return response()->json([
                'message' => 'Cập nhật quảng cáo thành công',
                'ad'      => $ad,
            ], 200);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('❌ Lỗi khi cập nhật AdCampaign:', ['error' => $e->getMessage()]);
            return response()->json([
                'message' => 'Lỗi khi cập nhật quảng cáo: ' . $e->getMessage()
            ], 500);
        }
    }

    // public function active()
    // {
    //     $today = now()->toDateString();

    //     $ads = AdCampaign::where('start_date', '<=', $today)
    //         ->where('end_date', '>=', $today)
    //         ->orderBy('start_date','desc')
    //         ->get(['title', 'image','url_shop', 'cost_per_view', 'cost_per_click']);

    //     return response()->json($ads);
    // }
    public function active(Request $request)
    {
        $today = now()->toDateString();
        
        // Lấy position từ query parameter
        $position = $request->query('position');
        
        $query = AdCampaign::where('start_date', '<=', $today)
            ->where('end_date', '>=', $today)
            ->orderBy('start_date', 'desc');
        
        // Filter theo position nếu có
        if ($position) {
            $query->where('position', $position);
        }
        
        $ads = $query->get(['id', 'title', 'image', 'url_shop', 'position', 'cost_per_view', 'cost_per_click']);
        
        // Debug log
        Log::info('Active ads API called', [
            'position' => $position,
            'ads_count' => $ads->count(),
            'ads_data' => $ads->toArray()
        ]);
        
        return response()->json($ads);
    }



public function getCampaignStats($id)
{
    $campaign = AdCampaign::findOrFail($id);
    $stats = $campaign->calculateStats();

    return response()->json([
        'campaign_id' => $id,
        ...$stats
    ]);
}



    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }


    /**
     * Display the specified resource.
     */
    public function show(AdCampaign $adCampaign)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(AdCampaign $adCampaign)
    {
        //
    }



    /**
     * Remove the specified resource from storage.
     */
    public function destroy(AdCampaign $adCampaign)
    {
        //
    }
}

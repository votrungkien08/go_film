<?php

namespace App\Http\Controllers;

use App\Models\AdCampaign;
use App\Models\AdCustomer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class AdCustomerController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        try{
            $customers = AdCustomer::all();



            return response()->json([
                'customers' => $customers
            ]);
        } catch(\Exception $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ]);
        }
    }

    // public function getAdsByCustomer($id)
    // {
    //     try{
    //         $customer = AdCustomer::with('campaigns')->findOrFail($id);
    //         $ads = $customer->campaigns;
    //         Log::info('Lấy campaign thành công cho customer ID ' . $id);
    //         return response()->json([
    //             'ads' => $ads
    //         ]);
    //     } catch(\Exception $e) {
    //         Log::error('Lỗi khi lấy campaign của customer: ' . $e->getMessage());
    //         return response()->json([
    //             'message' => $e->getMessage(),
    //         ],500);
    //     }
    // }

    public function getAdsByCustomer($id)
    {
        try {
            $customer = AdCustomer::with('campaigns.events')->findOrFail($id);

            $ads = $customer->campaigns->map(function ($campaign) {
                $stats = $campaign->calculateStats();

                return [
                    'id' => $campaign->id,
                    'title' => $campaign->title,
                    'image' => $campaign->image,
                    'start_date' => $campaign->start_date,
                    'end_date' => $campaign->end_date,
                    'deposit_amount' => $campaign->deposit_amount,
                    'is_deposited' => $campaign->is_deposited,
                    'cost_per_view' => $campaign->cost_per_view,
                    'cost_per_click' => $campaign->cost_per_click,
                    'position' => $campaign->position,
                    'url_shop' => $campaign->url_shop,
                    'views' => $stats['views'],
                    'clicks' => $stats['clicks'],
                    'revenue' => $stats['revenue'],
                    'is_ended' => $stats['is_ended'],
                ];
            });

            return response()->json(['ads' => $ads]);

        } catch (\Exception $e) {
            Log::error('Lỗi khi lấy campaign của customer: ' . $e->getMessage());
            return response()->json([
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:ad_customer,email',
            'phone' => 'required|string|max:15',
            ]);

            $customer = AdCustomer::create([
                'name' => $request->name,
                'email' => $request->email,
                'phone' => $request->phone,
            ]);

            return response()->json(['message' => 'Khách hàng được tạo thành công', 'customer' => $customer], 201);
        }catch(\Exception $e ) {
            Log::info('Lỗi khi thêm khách hàng:', ['error' => $e->getMessage()]);
            return response()->json([
                'message' => $e->getMessage()
            ]);
        }
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
    public function show(AdCustomer $adCustomer)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(AdCustomer $adCustomer)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, AdCustomer $adCustomer)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(AdCustomer $adCustomer)
    {
        //
    }
}

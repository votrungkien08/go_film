<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AdCampaign extends Model
{
    protected $table = 'ad_campaigns';

    protected $fillable = [
        'customer_id',
        'title',
        'image',
        'start_date',
        'end_date',
        'deposit_amount',
        'is_deposited',
        'deposit_date',
        'cost_per_view',
        'cost_per_click',
        'url_shop'
    ];

    public function customers() {
        return $this->belongsTo(AdCustomer::class,'customer_id');
    }
    public function events() {
        return $this->hasMany(AdEvent::class,'ad_campaign_id');
    }

    
    public function calculateStats()
    {
        // Đếm theo quan hệ đã khai báo thay vì AdEvent::where(...)
        $views = $this->events()->where('event_type', 'view')->count();
        $clicks = $this->events()->where('event_type', 'click')->count();

        // Tính doanh thu từ view (theo 1000 view)
        $viewRevenue = floor($views / 1000) * $this->cost_per_view;
        $clickRevenue = $clicks * $this->cost_per_click;

        return [
            'views' => $views,
            'clicks' => $clicks,
            'revenue' => $viewRevenue + $clickRevenue,
            'end_date' => $this->end_date,
            'is_ended' => now()->greaterThanOrEqualTo($this->end_date),
        ];
    }
}

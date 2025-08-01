<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AdEvent extends Model
{
    use HasFactory;
    protected $table = 'ad_events';

    protected $fillable = [
        'ad_campaign_id',
        'event_type',
        'ip_address',
    ];


    public function campaign() {
        return $this->belongsTo(AdCampaign::class,'ad_campaign_id');
    }
}

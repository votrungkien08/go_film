<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AdCustomer extends Model
{
    protected $table = 'ad_customer';

    protected $fillable = [
        'name',
        'email',
        'phone',

    ];
public $timestamps = false;
    public function campaigns() {
        return $this->hasMany(AdCampaign::class,'customer_id');
    }

}

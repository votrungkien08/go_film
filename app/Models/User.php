<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
class User extends Authenticatable
{
    use Notifiable,HasApiTokens;
    protected $table = 'user';
    public $timestamps = false;
    protected $fillable = [
        'name',
        'email',
        'password',
        'points',
        'role',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }
    public function comments() {
        return $this->hasMany(Comment::class,'user_id');
    }
    public function favorites() {
        return $this->hasMany(Favorite::class,'user_id');
    }
    public function ratings(){
        return $this->hasMany(Rating::class,'user_id');
    }
    public function watch_histories() {
        return $this->hasMany(Watch_histories::class,'user_id');
    }
}

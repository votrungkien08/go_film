<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddPremiumFieldsToFilmTable extends Migration
{
    public function up()
    {
        Schema::table('Film', function (Blueprint $table) {
            $table->boolean('is_premium')->default(false); // Cột is_premium, mặc định là false (không phải premium)
            $table->integer('point_required')->nullable(); // Cột point_required, có thể null
        });
    }

    public function down()
    {
        Schema::table('Film', function (Blueprint $table) {
            $table->dropColumn(['is_premium', 'point_required']);
        });
    }
}
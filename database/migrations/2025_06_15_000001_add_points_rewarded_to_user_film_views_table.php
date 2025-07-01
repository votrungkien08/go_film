<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('user_film_views', function (Blueprint $table) {
            $table->boolean('points_rewarded')->default(false)->after('viewed_at');
            $table->integer('points_rewarded_amount')->nullable()->after('points_rewarded');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('user_film_views', function (Blueprint $table) {
            $table->dropColumn(['points_rewarded', 'points_rewarded_amount']);
        });
    }
};

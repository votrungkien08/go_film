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
            $table->boolean('points_deducted')->default(false)->after('episode_id');
            $table->integer('points_deducted_amount')->nullable()->after('points_deducted');
            $table->dateTime('viewed_at')->nullable()->after('points_deducted_amount');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('user_film_views', function (Blueprint $table) {
            $table->dropColumn(['points_deducted', 'points_deducted_amount', 'viewed_at']);
        });
    }
};

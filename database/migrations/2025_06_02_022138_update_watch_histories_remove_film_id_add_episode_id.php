<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('watch_histories', function (Blueprint $table) {
            $table->dropForeign('watch_histories_film_id_foreign');
            $table->dropColumn('film_id');
            $table->unsignedBigInteger('episode_id')->nullable()->after('user_id');
            $table->integer('progress_time')->default(0)->after('episode_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('watch_histories', function (Blueprint $table) {
            $table->unsignedBigInteger('film_id')->after('user_id');
            $table->dropColumn('episode_id');
            $table->dropColumn('progress_time');
            $table->foreign('film_id')->references('id')->on('films')->onDelete('cascade');
        });
    }
};

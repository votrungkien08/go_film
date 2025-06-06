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
        Schema::create('watch_histories', function (Blueprint $table) {
            $table->increments('id');
            $table->unsignedInteger('user_id');
            $table->unsignedInteger('film_id');
            $table->timestamp('watch_at')->nullable();

             // foreign key
            $table->foreign('user_id')->references('id')->on('user')->onDelete('cascade');
            $table->foreign('film_id')->references('id')->on('film')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('watch_histories');
    }
};
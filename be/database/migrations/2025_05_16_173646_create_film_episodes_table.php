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
        Schema::create('film_episodes', function (Blueprint $table) {
            $table->increments('id');
            $table->unsignedInteger('film_id');
            $table->string('episode_number');
            $table->string('episode_title');
            $table->string('episode_url');
            $table->string('duration');

            // foreign key
            $table->foreign('film_id')->references('id')->on('film')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('film_episodes');
    }
};
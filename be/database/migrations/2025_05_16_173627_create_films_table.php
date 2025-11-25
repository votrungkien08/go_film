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
        Schema::create('film', function (Blueprint $table) {
            $table->increments('id');
            $table->string('slug')->unique();
            $table->string('title_film');
            $table->string('thumb');
            $table->boolean('film_type')->default(0); // 0: Movie, 1: Series
            $table->string('actor');
            $table->string('director');
            $table->string('content');
            $table->integer('view')->default(0);
            $table->unsignedInteger('year_id');
            $table->unsignedInteger('country_id');

            // Foreign key constraints
            $table->foreign('year_id')->references('id')->on('year')->onDelete('cascade');
            $table->foreign('country_id')->references('id')->on('country')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('film');
    }
};
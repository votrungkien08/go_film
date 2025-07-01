<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateUserFilmViewsTable extends Migration
{
    public function up()
    {
        Schema::create('user_film_views', function (Blueprint $table) {
            $table->increments('id');
            $table->unsignedInteger('user_id');
            $table->unsignedInteger('film_id');
            $table->timestamp('viewed_at')->nullable();
            $table->timestamps();

            $table->foreign('user_id')->references('id')->on('user')->onDelete('cascade');
            $table->foreign('film_id')->references('id')->on('film')->onDelete('cascade');
        });

    }

    public function down()
    {
        Schema::dropIfExists('user_film_views');
    }
}
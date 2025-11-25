<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AlterFilmTableChangeContentToText extends Migration
{
    public function up()
    {
        Schema::table('film', function (Blueprint $table) {
            $table->text('content')->change();
        });
    }

    public function down()
    {
        Schema::table('film', function (Blueprint $table) {
            $table->string('content', 255)->change();
        });
    }
}
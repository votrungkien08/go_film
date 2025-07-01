<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateChatbotHistoriesTable extends Migration
{
    public function up()
    {
        Schema::create('chatbot_histories', function (Blueprint $table) {
            $table->id();
            $table->unsignedInteger('user_id')->nullable();
            $table->text('user_message');
            $table->text('bot_response');
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('chatbot_histories');
    }
}
?>
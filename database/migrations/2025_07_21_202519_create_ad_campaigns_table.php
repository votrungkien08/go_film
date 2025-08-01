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
        Schema::create('ad_campaigns', function (Blueprint $table) {
            $table->increments('id');
            $table->unsignedInteger('customer_id');
            $table->string('title');
            $table->string('image')->nullable();
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();
            $table->decimal('deposit_amount',12,2)->nullable();
            $table->boolean('is_deposited')->default(false);
            $table->date('deposit_date')->nullable();
            $table->decimal('cost_per_view', 10, 2)->default(0.0);
            $table->decimal('cost_per_click', 10, 2)->default(0.0);
            $table->timestamps();


            $table->foreign('customer_id')->references('id')->on('ad_customer')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ad_campaigns');
    }
};

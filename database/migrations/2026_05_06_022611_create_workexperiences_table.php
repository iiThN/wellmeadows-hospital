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
        Schema::create('workexperiences', function (Blueprint $table) {
            $table->id();
            $table->string('staff_number');
            $table->string('position');
            $table->string('organization');
            $table->date('start_date');
            $table->date('finish_date')->nullable();
            $table->foreign('staff_number')->references('staff_number')->on('staff')->onDelete('cascade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('workexperiences');
    }
};

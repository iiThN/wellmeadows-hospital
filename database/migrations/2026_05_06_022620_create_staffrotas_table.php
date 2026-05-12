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
        Schema::create('staffrota', function (Blueprint $table) {
            $table->id('rota_id');
            $table->date('week_beginning');
            $table->string('shift');
            $table->string('staff_number');
            $table->integer('ward_number');
            $table->foreign('staff_number')->references('staff_number')->on('staff')->onDelete('cascade');
            $table->foreign('ward_number')->references('ward_number')->on('ward')->onDelete('cascade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('staffrota');
    }
};

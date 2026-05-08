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
        Schema::create('appointments', function (Blueprint $table) {
            $table->string('appointment_number')->primary();
            $table->date('appointment_date');
            $table->time('appointment_time');
            $table->string('examination_room');
            $table->string('outcome')->nullable();
            $table->string('patient_number');
            $table->string('consultant_number');
            $table->foreign('patient_number')->references('patient_number')->on('patients')->onDelete('cascade');
            $table->foreign('consultant_number')->references('staff_number')->on('staff')->onDelete('cascade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('appointments');
    }
};

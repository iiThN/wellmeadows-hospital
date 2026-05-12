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
        Schema::create('outpatient', function (Blueprint $table) {
            $table->id();
            $table->string('patient_number');
            $table->date('appointment_date');
            $table->time('appointment_time');
            $table->foreign('patient_number')->references('patient_number')->on('patient')->onDelete('cascade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('outpatient');
    }
};

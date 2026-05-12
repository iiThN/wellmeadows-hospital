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
        Schema::create('inpatient', function (Blueprint $table) {
            $table->id();
            $table->string('patient_number');
            $table->integer('ward_number');
            $table->integer('bed_number');
            $table->date('date_on_waitlist')->nullable();
            $table->integer('expected_stay_days')->nullable();
            $table->date('date_placed')->nullable();
            $table->date('expected_leave_date')->nullable();
            $table->date('actual_leave_date')->nullable();
            $table->foreign('patient_number')->references('patient_number')->on('patient')->onDelete('cascade');
            $table->foreign('ward_number')->references('ward_number')->on('ward')->onDelete('cascade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('inpatient');
    }
};

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
        Schema::create('patients', function (Blueprint $table) {
            $table->string('patient_number')->primary();
            $table->string('first_name');
            $table->string('last_name');
            $table->text('address');
            $table->string('telephone');
            $table->date('date_of_birth');
            $table->string('sex');
            $table->string('marital_status');
            $table->date('date_registered');
            $table->string('clinic_number')->nullable();
            $table->foreign('clinic_number')->references('clinic_number')->on('localdoctors')->nullOnDelete();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('patients');
    }
};

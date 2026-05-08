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
        Schema::create('patientmedications', function (Blueprint $table) {
            $table->id('medication_id');
            $table->string('patient_number');
            $table->string('drug_number');
            $table->string('prescribed_by');
            $table->integer('units_per_day');
            $table->string('method_of_admin');
            $table->date('start_date');
            $table->date('finish_date')->nullable();
            $table->foreign('patient_number')->references('patient_number')->on('patients')->onDelete('cascade');
            $table->foreign('drug_number')->references('drug_number')->on('pharmaceuticalsupplies')->onDelete('cascade');
            $table->foreign('prescribed_by')->references('staff_number')->on('staff')->onDelete('cascade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('patientmedications');
    }
};

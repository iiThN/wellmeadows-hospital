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
        Schema::create('requisitions', function (Blueprint $table) {
            $table->string('requisition_number')->primary();
            $table->date('requisition_date');
            $table->date('signed_date')->nullable();
            $table->string('signed_by')->nullable();
            $table->integer('ward_number');
            $table->string('staff_number');
            $table->foreign('ward_number')->references('ward_number')->on('wards')->onDelete('cascade');
            $table->foreign('staff_number')->references('staff_number')->on('staff')->onDelete('cascade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('requisitions');
    }
};

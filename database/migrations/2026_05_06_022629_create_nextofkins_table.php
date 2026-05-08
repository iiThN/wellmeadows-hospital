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
        Schema::create('nextofkins', function (Blueprint $table) {
            $table->id();
            $table->string('patient_number');
            $table->string('full_name');
            $table->string('relationship');
            $table->text('address');
            $table->string('telephone');
            $table->foreign('patient_number')->references('patient_number')->on('patients')->onDelete('cascade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('nextofkins');
    }
};

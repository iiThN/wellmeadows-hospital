<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('treatment', function (Blueprint $table) {
            $table->bigIncrements('treatment_id');
            $table->string('appointment_number');
            $table->text('diagnosis')->nullable();
            $table->text('procedure')->nullable();
            $table->date('treatment_date');
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->foreign('appointment_number')
                ->references('appointment_number')
                ->on('appointment')
                ->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('treatment');
    }
};
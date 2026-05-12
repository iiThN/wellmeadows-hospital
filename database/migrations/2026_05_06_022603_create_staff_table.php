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
        Schema::create('staff', function (Blueprint $table) {
            $table->string('staff_number')->primary();
            $table->string('first_name');
            $table->string('last_name');
            $table->text('address');
            $table->string('telephone');
            $table->date('date_of_birth');
            $table->string('sex');
            $table->string('nin')->unique();
            $table->decimal('current_salary', 10, 2);
            $table->string('salary_scale');
            $table->string('pay_type');
            $table->decimal('hours_per_week', 4, 1);
            $table->string('contract_type');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('staff');
    }
};

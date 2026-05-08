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
        Schema::create('pharmaceuticalsupplies', function (Blueprint $table) {
            $table->string('drug_number')->primary();
            $table->string('drug_name');
            $table->text('description');
            $table->string('dosage');
            $table->string('method_of_admin');
            $table->integer('quantity_in_stock');
            $table->integer('reorder_level');
            $table->decimal('cost_per_unit', 10, 2);
            $table->string('supplier_number');
            $table->foreign('supplier_number')->references('supplier_number')->on('suppliers')->onDelete('cascade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pharmaceuticalsupplies');
    }
};

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
        Schema::create('supplies', function (Blueprint $table) {
            $table->string('item_number')->primary();
            $table->string('item_name');
            $table->text('item_description');
            $table->string('supply_type');
            $table->integer('quantity_in_stock');
            $table->integer('reorder_level');
            $table->decimal('cost_per_unit', 10, 2);
            $table->string('supplier_number');
            $table->foreign('supplier_number')->references('supplier_number')->on('supplier')->onDelete('cascade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('supplies');
    }
};

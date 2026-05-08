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
        Schema::create('requisitionitems', function (Blueprint $table) {
            $table->id('req_item_id');
            $table->string('requisition_number');
            $table->string('item_number')->nullable();
            $table->string('drug_number')->nullable();
            $table->integer('quantity_required');
            $table->decimal('cost_per_unit', 10, 2);
            $table->foreign('requisition_number')->references('requisition_number')->on('requisitions')->onDelete('cascade');
            $table->foreign('item_number')->references('item_number')->on('supplies')->nullOnDelete();
            $table->foreign('drug_number')->references('drug_number')->on('pharmaceuticalsupplies')->nullOnDelete();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('requisitionitems');
    }
};

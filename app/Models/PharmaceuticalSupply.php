<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PharmaceuticalSupply extends Model
{
    protected $table = 'pharmaceuticalsupply';
    protected $primaryKey = 'drug_number';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'drug_number', 'drug_name', 'description', 'dosage',
        'method_of_admin', 'quantity_in_stock', 'reorder_level',
        'cost_per_unit', 'supplier_number',
    ];
}
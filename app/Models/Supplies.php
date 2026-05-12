<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Supplies extends Model
{
    protected $table = 'supplies';
    protected $primaryKey = 'item_number';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'item_number', 'item_name', 'item_description', 'supply_type',
        'quantity_in_stock', 'reorder_level', 'cost_per_unit', 'supplier_number',
    ];
}
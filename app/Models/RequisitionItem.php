<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RequisitionItem extends Model
{
    protected $table = 'requisitionitem';
    protected $primaryKey = 'req_item_id';

    protected $fillable = [
        'requisition_number', 'item_number', 'drug_number',
        'quantity_required', 'cost_per_unit',
    ];
}
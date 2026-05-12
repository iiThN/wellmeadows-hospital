<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Requisition extends Model
{
    protected $table = 'requisition';
    protected $primaryKey = 'requisition_number';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'requisition_number', 'requisition_date', 'signed_date',
        'signed_by', 'ward_number', 'staff_number',
    ];

    public function items()
    {
        return $this->hasMany(RequisitionItem::class, 'requisition_number', 'requisition_number');
    }
}
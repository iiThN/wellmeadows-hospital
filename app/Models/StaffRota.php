<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StaffRota extends Model
{
    protected $table = 'staffrota';
    protected $primaryKey = 'rota_id';
    public $timestamps = false;

    protected $fillable = ['staff_number', 'ward_number', 'week_beginning', 'shift'];

    public function staff()
    {
        return $this->belongsTo(Staff::class, 'staff_number', 'staff_number');
    }

    public function ward()
    {
        return $this->belongsTo(Ward::class, 'ward_number', 'ward_number');
    }
}
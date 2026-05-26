<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StaffPosition extends Model
{
    protected $table = 'staffposition';
    protected $primaryKey = 'id';
    public $timestamps = false;

    protected $fillable = [
        'staff_number', 'position_title', 'start_date', 'end_date',
    ];

    public function staff()
    {
        return $this->belongsTo(Staff::class, 'staff_number', 'staff_number');
    }
}
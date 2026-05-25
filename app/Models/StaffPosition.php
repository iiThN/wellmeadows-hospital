<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StaffPosition extends Model
{
    protected $table = 'staff_position';
    protected $primaryKey = 'id';

    protected $fillable = [
        'staff_number', 'position_title', 'start_date', 'end_date',
    ];
}
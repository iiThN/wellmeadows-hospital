<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Inpatient extends Model
{
    protected $table = 'inpatient';
    protected $primaryKey = 'id';

    protected $fillable = [
        'patient_number', 'ward_number', 'bed_number',
        'date_on_waitlist', 'expected_stay_days', 'date_placed',
        'expected_leave_date', 'actual_leave_date',
    ];
}
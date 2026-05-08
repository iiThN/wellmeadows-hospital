<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Outpatient extends Model
{
    protected $table = 'outpatient';
    protected $primaryKey = 'id';

    protected $fillable = [
        'patient_number', 'appointment_date', 'appointment_time',
    ];
}
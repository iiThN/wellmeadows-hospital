<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Outpatient extends Model
{
    protected $table = 'outpatients';
    protected $primaryKey = 'id';
    public $incrementing = true;
    public $timestamps = true;       

    protected $fillable = [
        'patient_number', 'appointment_date', 'appointment_time',
    ];
}
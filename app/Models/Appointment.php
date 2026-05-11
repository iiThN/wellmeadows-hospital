<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Appointment extends Model
{
    protected $table = 'appointments';
    protected $primaryKey = 'appointment_number';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'appointment_number', 'patient_number', 'consultant_number',
        'appointment_date', 'appointment_time', 'examination_room', 'outcome',
    ];
}
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

    public function treatment()
    {
        return $this->hasOne(Treatment::class, 'appointment_number', 'appointment_number');
    }

    public function patient()
    {
        return $this->belongsTo(Patient::class, 'patient_number', 'patient_number');
    }

    public function consultant()
    {
        return $this->belongsTo(Staff::class, 'consultant_number', 'staff_number');
    }
}
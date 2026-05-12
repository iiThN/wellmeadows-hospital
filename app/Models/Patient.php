<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Patient extends Model
{
    protected $table = 'patients';
    protected $primaryKey = 'patient_number';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'patient_number', 'first_name', 'last_name', 'address',
        'telephone', 'date_of_birth', 'sex', 'marital_status',
        'date_registered', 'clinic_number',
    ];

    // Active admission only
    public function inpatient()
    {
        return $this->hasOne(Inpatient::class, 'patient_number', 'patient_number')
                    ->whereNull('actual_leave_date')
                    ->latest('date_placed');
    }

    public function inpatientHistory()
    {
        return $this->hasMany(Inpatient::class, 'patient_number', 'patient_number')
                    ->orderByDesc('date_placed');
    }


    // Most recent outpatient visit
    public function outpatient()
    {
        return $this->hasOne(Outpatient::class, 'patient_number', 'patient_number')
                    ->latest('appointment_date');
    }

    // All outpatient visits — for history
    public function outpatientHistory()
    {
        return $this->hasMany(Outpatient::class, 'patient_number', 'patient_number')
                    ->orderByDesc('appointment_date');
    }

    public function nextOfKin()
    {
        return $this->hasMany(NextOfKin::class, 'patient_number', 'patient_number');
    }

    public function appointments()
    {
        return $this->hasMany(Appointment::class, 'patient_number', 'patient_number');
    }

    public function localDoctor()
    {
        return $this->belongsTo(LocalDoctor::class, 'clinic_number', 'clinic_number');
    }
}
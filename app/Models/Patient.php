<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Patient extends Model
{
    protected $table = 'patient';
    protected $primaryKey = 'patient_number';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'patient_number', 'first_name', 'last_name', 'address',
        'telephone', 'date_of_birth', 'sex', 'marital_status',
        'date_registered', 'clinic_number',
    ];

    public function inpatient()
    {
        return $this->hasOne(Inpatient::class, 'patient_number', 'patient_number');
    }

    public function outpatient()
    {
        return $this->hasOne(Outpatient::class, 'patient_number', 'patient_number');
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
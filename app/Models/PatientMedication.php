<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PatientMedication extends Model
{
    protected $table = 'patientmedication';
    protected $primaryKey = 'medication_id';

    protected $fillable = [
        'patient_number', 'drug_number', 'prescribed_by',
        'units_per_day', 'method_of_admin', 'start_date', 'finish_date',
    ];
}
<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Outpatient extends Model
{
    protected $table = 'outpatient';
    protected $primaryKey = 'patient_number';  // ← baguhin ito
    public $incrementing = false;               // ← idagdag
    protected $keyType = 'string';              // ← idagdag
    public $timestamps = false;                 // ← idagdag (walang created_at/updated_at)

    protected $fillable = [
        'patient_number', 'appointment_date', 'appointment_time',
    ];
}
<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Treatment extends Model
{
    protected $table = 'treatment';
    protected $primaryKey = 'treatment_id';

    protected $fillable = [
        'appointment_number', 'diagnosis',
        'procedure', 'treatment_date', 'notes',
    ];

    public function appointment()
    {
        return $this->belongsTo(Appointment::class, 'appointment_number', 'appointment_number');
    }
}
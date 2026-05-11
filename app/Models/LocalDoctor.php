<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LocalDoctor extends Model
{
    protected $table = 'local_doctors';
    protected $primaryKey = 'clinic_number';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'clinic_number', 'full_name', 'address', 'telephone',
    ];
}
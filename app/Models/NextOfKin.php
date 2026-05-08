<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class NextOfKin extends Model
{
    protected $table = 'nextofkin';
    protected $primaryKey = 'id';

    protected $fillable = [
        'patient_number', 'full_name', 'relationship', 'address', 'telephone',
    ];
}
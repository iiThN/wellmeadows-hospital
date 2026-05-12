<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Qualification extends Model
{
    protected $table = 'qualification';
    protected $primaryKey = 'id';
    protected $fillable = ['staff_number', 'qual_type', 'date_obtained', 'institution'];
}
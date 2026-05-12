<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WorkExperience extends Model
{
    protected $table = 'workexperiences';
    protected $primaryKey = 'id';
    protected $fillable = ['staff_number', 'position', 'organization', 'start_date', 'finish_date'];
}
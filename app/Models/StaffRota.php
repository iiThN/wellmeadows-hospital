<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StaffRota extends Model
{
    protected $table = 'staffrota';
    protected $primaryKey = 'rota_id';
    protected $fillable = ['staff_number', 'ward_number', 'week_beginning', 'shift'];
}
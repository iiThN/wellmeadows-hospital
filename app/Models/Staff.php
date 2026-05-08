<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Staff extends Model
{
    protected $table = 'staff';
    protected $primaryKey = 'staff_number';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'staff_number', 'first_name', 'last_name', 'address',
        'telephone', 'date_of_birth', 'sex', 'nin',
        'current_salary', 'salary_scale', 'pay_type',
        'hours_per_week', 'contract_type',
    ];

    public function qualifications()
    {
        return $this->hasMany(Qualification::class, 'staff_number', 'staff_number');
    }

    public function workExperiences()
    {
        return $this->hasMany(WorkExperience::class, 'staff_number', 'staff_number');
    }

    public function rotas()
    {
        return $this->hasMany(StaffRota::class, 'staff_number', 'staff_number');
    }

        public function positions()
    {
        return $this->hasMany(StaffPosition::class, 'staff_number', 'staff_number');
    }

    public function currentPosition()
    {
        return $this->hasOne(StaffPosition::class, 'staff_number', 'staff_number')
            ->whereNull('end_date')
            ->latest('start_date');
    }
}
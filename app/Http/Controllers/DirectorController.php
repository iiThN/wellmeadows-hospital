<?php
namespace App\Http\Controllers;

use App\Models\Patient;
use App\Models\Ward;
use App\Models\Supplier;

class DirectorController extends Controller
{
    public function dashboard()
    {
        return response()->json([
            'stats' => [
                'total_patients' => Patient::count(),
                'total_wards' => Ward::count(),
                'total_suppliers' => Supplier::count(),
            ]
        ]);
    }
}
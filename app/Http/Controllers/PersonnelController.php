<?php
namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\Staff;
use App\Models\User;
use Illuminate\Http\Request;

class PersonnelController extends Controller
{
    public function dashboard()
    {
        return Inertia::render('personnel/dashboard', [
            'stats' => [
                'total_staff'    => Staff::count(),
                'total_accounts' => User::count(),
            ]
        ]);
    }

    public function staffIndex()
    {
        $staff = Staff::orderBy('last_name')->get();
        return Inertia::render('modules/staff-management/index', ['staff' => $staff]);
    }

    public function staffCreate()
    {
        return Inertia::render('modules/staff-management/create');
    }

    public function staffStore(Request $request)
    {
        $validated = $request->validate([
            'staff_number'  => 'required|string|unique:staff,staff_number',
            'first_name'    => 'required|string|max:100',
            'last_name'     => 'required|string|max:100',
            'address'       => 'required|string',
            'telephone'     => 'required|string|max:20',
            'date_of_birth' => 'required|date',
            'sex'           => 'required|in:Male,Female',
            'nin'           => 'required|string|max:20',
            'current_salary'=> 'required|numeric',
            'salary_scale'  => 'required|string|max:20',
            'pay_type'      => 'required|in:Weekly,Monthly',
            'hours_per_week'=> 'required|numeric',
            'contract_type' => 'required|in:Permanent,Temporary',
        ]);

        Staff::create($validated);
        return back()->with('success', '...');
    }

    public function staffEdit(string $id)
    {
        $staff = Staff::findOrFail($id);
        return Inertia::render('modules/staff-management/edit', ['staff' => $staff]);
    }

    public function staffUpdate(Request $request, string $id)
    {
        $staff = Staff::findOrFail($id);

        $validated = $request->validate([
            'first_name'    => 'required|string|max:100',
            'last_name'     => 'required|string|max:100',
            'address'       => 'required|string',
            'telephone'     => 'required|string|max:20',
            'date_of_birth' => 'required|date',
            'sex'           => 'required|in:Male,Female',
            'nin'           => 'required|string|max:20',
            'current_salary'=> 'required|numeric',
            'salary_scale'  => 'required|string|max:20',
            'pay_type'      => 'required|in:Weekly,Monthly',
            'hours_per_week'=> 'required|numeric',
            'contract_type' => 'required|in:Permanent,Temporary',
        ]);

        $staff->update($validated);
        return back()->with('success', '...');
    }

    public function staffDestroy(string $id)
    {
        Staff::findOrFail($id)->delete();
        return back()->with('success', '...');
    }

    public function staffShow(string $id)
    {
        $staff = Staff::with(['qualifications', 'workExperiences', 'rotas'])->findOrFail($id);
        return response()->json($staff);
    }
}
<?php
namespace App\Http\Controllers;

use App\Models\Staff;
use App\Models\User;
use Illuminate\Http\Request;

class PersonnelController extends Controller
{
    public function dashboard()
    {
        return response()->json([
            'stats' => [
                'total_staff'    => Staff::count(),
                'total_accounts' => User::count(),
            ]
        ]);
    }

    public function staffIndex()
    {
        $staff = Staff::orderBy('last_name')->get();
        return response()->json(['staff' => $staff]);
    }

    public function staffCreate()
    {
        response()->json([]);
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
        return response()->json(['message' => '...']);
    }

    public function staffEdit(string $id)
    {
        $staff = Staff::findOrFail($id);
        return response()->json(['staff' => $staff]);
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
        return response()->json(['message' => '...']);
    }

    public function staffDestroy(string $id)
    {
        Staff::findOrFail($id)->delete();
        return response()->json(['message' => '...']);
    }

    public function staffShow(string $id)
        {
            $staff = Staff::with(['qualifications', 'workExperiences', 'rotas', 'positions'])->findOrFail($id);

            $wardNumbers = $staff->rotas->pluck('ward_number')->unique();

            $inpatients = \App\Models\Inpatient::whereIn('ward_number', $wardNumbers)
                ->whereNull('actual_leave_date')
                ->get();

            $patientNumbers = $inpatients->pluck('patient_number');
            $patients = \App\Models\Patient::whereIn('patient_number', $patientNumbers)
                ->get(['patient_number', 'first_name', 'last_name', 'sex', 'date_of_birth']);

            $staffData = $staff->toArray();
            $staffData['patients'] = $inpatients->map(function ($ip) use ($patients) {
                $patient = $patients->where('patient_number', $ip->patient_number)->first();
                return [
                    'patient_number' => $ip->patient_number,
                    'first_name'     => $patient?->first_name ?? '—',
                    'last_name'      => $patient?->last_name ?? '—',
                    'ward_number'    => $ip->ward_number,
                    'bed_number'     => $ip->bed_number,
                    'date_placed'    => $ip->date_placed,
                    'expected_leave_date' => $ip->expected_leave_date,
                ];
            })->values();

            return response()->json($staffData);
        }  // ← isara ang staffShow dito

        public function staffPositionStore(Request $request, string $id)
        {
            $validated = $request->validate([
                'position_title' => 'required|string|max:100',
                'start_date'     => 'required|date',
                'end_date'       => 'nullable|date|after_or_equal:start_date',
            ]);

            $validated['staff_number'] = $id;

            \App\Models\StaffPosition::create($validated);
            return response()->json(['message' => 'Position assigned.']);
        }

        public function staffPositionUpdate(Request $request, string $id, int $posId)
        {
            $position = \App\Models\StaffPosition::where('staff_number', $id)->findOrFail($posId);

            $validated = $request->validate([
                'position_title' => 'required|string|max:100',
                'start_date'     => 'required|date',
                'end_date'       => 'nullable|date|after_or_equal:start_date',
            ]);

            $position->update($validated);
            return response()->json(['message' => 'Position updated.']);
        }

        public function staffPositionDestroy(string $id, int $posId)
        {
            \App\Models\StaffPosition::where('staff_number', $id)->findOrFail($posId)->delete();
            return response()->json(['message' => 'Position removed.']);
        }
    
    }
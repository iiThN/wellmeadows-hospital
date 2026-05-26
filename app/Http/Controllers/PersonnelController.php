<?php
namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\Staff;
use App\Models\User;
use App\Models\Qualification;
use App\Models\WorkExperience;
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
            'staff_number'                       => 'required|string|unique:staff,staff_number',
            'first_name'                         => 'required|string|max:100',
            'last_name'                          => 'required|string|max:100',
            'address'                            => 'required|string',
            'telephone'                          => 'required|string|max:20',
            'date_of_birth'                      => 'required|date',
            'sex'                                => 'required|in:Male,Female',
            'nin'                                => 'required|string|max:20',
            'current_salary'                     => 'required|numeric',
            'salary_scale'                       => 'required|string|max:20',
            'pay_type'                           => 'required|in:Weekly,Monthly',
            'hours_per_week'                     => 'required|numeric',
            'contract_type'                      => 'required|in:Permanent,Temporary',
            'qualifications'                     => 'nullable|array',
            'qualifications.*.qual_type'         => 'nullable|string|max:100',
            'qualifications.*.date_obtained'     => 'nullable|date',
            'qualifications.*.institution'       => 'nullable|string|max:100',
            'work_experiences'                   => 'nullable|array',
            'work_experiences.*.position'        => 'nullable|string|max:100',
            'work_experiences.*.organization'    => 'nullable|string|max:100',
            'work_experiences.*.start_date'      => 'nullable|date',
            'work_experiences.*.finish_date'     => 'nullable|date',
        ]);

        $staff = Staff::create(collect($validated)->except(['qualifications', 'work_experiences'])->toArray());

        foreach ($validated['qualifications'] ?? [] as $q) {
            if (!empty($q['qual_type']) && !empty($q['institution']) && !empty($q['date_obtained'])) {
                $staff->qualifications()->create($q);
            }
        }

        foreach ($validated['work_experiences'] ?? [] as $w) {
            if (!empty($w['position']) && !empty($w['organization']) && !empty($w['start_date'])) {
                $staff->workExperiences()->create($w);
            }
        }

        return redirect('/modules/staff-management')->with('success', 'Staff created successfully.');
    }

    public function staffEdit(string $id)
    {
        $staff = Staff::with(['qualifications', 'workExperiences'])->findOrFail($id);
        return Inertia::render('modules/staff-management/edit', ['staff' => $staff]);
    }

    public function staffUpdate(Request $request, string $id)
    {
        $staff = Staff::findOrFail($id);

        $validated = $request->validate([
            'first_name'                         => 'required|string|max:100',
            'last_name'                          => 'required|string|max:100',
            'address'                            => 'required|string',
            'telephone'                          => 'required|string|max:20',
            'date_of_birth'                      => 'required|date',
            'sex'                                => 'required|in:Male,Female',
            'nin'                                => 'required|string|max:20',
            'current_salary'                     => 'required|numeric',
            'salary_scale'                       => 'required|string|max:20',
            'pay_type'                           => 'required|in:Weekly,Monthly',
            'hours_per_week'                     => 'required|numeric',
            'contract_type'                      => 'required|in:Permanent,Temporary',
            'qualifications'                     => 'nullable|array',
            'qualifications.*.qual_type'         => 'nullable|string|max:100',
            'qualifications.*.date_obtained'     => 'nullable|date',
            'qualifications.*.institution'       => 'nullable|string|max:100',
            'work_experiences'                   => 'nullable|array',
            'work_experiences.*.position'        => 'nullable|string|max:100',
            'work_experiences.*.organization'    => 'nullable|string|max:100',
            'work_experiences.*.start_date'      => 'nullable|date',
            'work_experiences.*.finish_date'     => 'nullable|date',
        ]);

        $staff->update(collect($validated)->except(['qualifications', 'work_experiences'])->toArray());

        // Replace qualifications: delete old, insert new
        $staff->qualifications()->delete();
        foreach ($validated['qualifications'] ?? [] as $q) {
            if (!empty($q['qual_type']) && !empty($q['institution']) && !empty($q['date_obtained'])) {
                $staff->qualifications()->create($q);
            }
        }

        // Replace work experiences: delete old, insert new
        $staff->workExperiences()->delete();
        foreach ($validated['work_experiences'] ?? [] as $w) {
            if (!empty($w['position']) && !empty($w['organization']) && !empty($w['start_date'])) {
                $staff->workExperiences()->create($w);
            }
        }

        return redirect('/modules/staff-management')->with('success', 'Staff updated successfully.');
    }

    public function staffDestroy(string $id)
    {
        Staff::findOrFail($id)->delete();
        return back()->with('success', 'Staff deleted.');
    }

    public function staffShow(string $id)
    {
        $staff = Staff::with(['qualifications', 'workExperiences', 'rotas'])->findOrFail($id);
        return response()->json($staff);
    }
}
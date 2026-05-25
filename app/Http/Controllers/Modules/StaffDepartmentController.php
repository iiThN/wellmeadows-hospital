<?php
namespace App\Http\Controllers\Modules;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use App\Models\Staff;
use App\Models\StaffPosition;
use App\Models\StaffRota;
use App\Models\Ward;
use App\Models\Inpatient;
use App\Models\Patient;
use Illuminate\Http\Request;

class StaffDepartmentController extends Controller
{
    /**
     * Main index: all staff with their current positions & ward assignments.
     */
    public function index()
    {
        $staff = Staff::with(['currentPosition', 'rotas'])->orderBy('last_name')->get();
        $wards = Ward::orderBy('ward_number')->get(['ward_number', 'ward_name']);

        $staffData = $staff->map(function ($s) {
            return [
                'staff_number'   => $s->staff_number,
                'first_name'     => $s->first_name,
                'last_name'      => $s->last_name,
                'telephone'      => $s->telephone,
                'contract_type'  => $s->contract_type,
                'position_title' => $s->currentPosition?->position_title ?? '—',
                'position_start' => $s->currentPosition?->start_date ?? null,
                'assigned_wards' => $s->rotas->pluck('ward_number')->unique()->values(),
            ];
        });

        return Inertia::render('modules/staff-department/index', [
            'staff' => $staffData,
            'wards' => $wards,
        ]);
    }

    /**
     * Full details for a single staff member (positions + rotas + patient responsibilities).
     */
    public function show(string $id)
    {
        $staff = Staff::with(['positions', 'rotas.ward'])->findOrFail($id);

        // Get all ward numbers this staff member is assigned to
        $wardNumbers = $staff->rotas->pluck('ward_number')->unique()->values();

        // Get all current inpatients in those wards
        $inpatients = Inpatient::whereIn('ward_number', $wardNumbers)
            ->whereNull('actual_leave_date')
            ->get();

        $patientNumbers = $inpatients->pluck('patient_number');
        $patients = Patient::whereIn('patient_number', $patientNumbers)
            ->get(['patient_number', 'first_name', 'last_name', 'date_of_birth', 'sex']);

        $patientResponsibilities = $inpatients->map(function ($ip) use ($patients, $staff) {
            $patient = $patients->where('patient_number', $ip->patient_number)->first();
            $rota    = $staff->rotas->where('ward_number', $ip->ward_number)->first();
            return [
                'patient_number'      => $ip->patient_number,
                'first_name'          => $patient?->first_name ?? '—',
                'last_name'           => $patient?->last_name ?? '—',
                'date_of_birth'       => $patient?->date_of_birth ?? '—',
                'sex'                 => $patient?->sex ?? '—',
                'ward_number'         => $ip->ward_number,
                'ward_name'           => $rota?->ward?->ward_name ?? 'Ward ' . $ip->ward_number,
                'bed_number'          => $ip->bed_number,
                'date_placed'         => $ip->date_placed,
                'expected_leave_date' => $ip->expected_leave_date,
            ];
        })->sortBy('ward_number')->values();

        return response()->json([
            'staff_number'  => $staff->staff_number,
            'first_name'    => $staff->first_name,
            'last_name'     => $staff->last_name,
            'telephone'     => $staff->telephone,
            'contract_type' => $staff->contract_type,
            'positions'     => $staff->positions->map(fn($p) => [
                'id'             => $p->id,
                'position_title' => $p->position_title,
                'start_date'     => $p->start_date,
                'end_date'       => $p->end_date,
            ]),
            'rotas' => $staff->rotas->map(fn($r) => [
                'rota_id'        => $r->rota_id,
                'ward_number'    => $r->ward_number,
                'ward_name'      => $r->ward?->ward_name ?? '—',
                'week_beginning' => $r->week_beginning,
                'shift'          => $r->shift,
            ]),
            'patients' => $patientResponsibilities,
        ]);
    }

    // ─── Positions ────────────────────────────────────────────────────────────

    /**
     * Assign a new position/role to a staff member.
     * Automatically closes any previously open position first.
     */
    public function positionStore(Request $request, string $staffNumber)
    {
        Staff::findOrFail($staffNumber);

        $validated = $request->validate([
            'position_title' => 'required|string|max:100',
            'start_date'     => 'required|date',
        ]);

        // Close previous open position
        StaffPosition::where('staff_number', $staffNumber)
            ->whereNull('end_date')
            ->update(['end_date' => $validated['start_date']]);

        StaffPosition::create([
            'staff_number'   => $staffNumber,
            'position_title' => $validated['position_title'],
            'start_date'     => $validated['start_date'],
            'end_date'       => null,
        ]);

        return back()->with('success', 'Position assigned.');
    }

    /**
     * End/close a position.
     */
    public function positionEnd(Request $request, int $positionId)
    {
        $position = StaffPosition::findOrFail($positionId);

        $validated = $request->validate([
            'end_date' => 'nullable|date',
        ]);

        $position->update([
            'end_date' => $validated['end_date'] ?? now()->toDateString(),
        ]);

        return back()->with('success', 'Position ended.');
    }

    /**
     * Remove a position record entirely.
     */
    public function positionDestroy(int $positionId)
    {
        StaffPosition::findOrFail($positionId)->delete();
        return back()->with('success', 'Position removed.');
    }

    // ─── Ward Assignments (Rotas) ──────────────────────────────────────────────

    /**
     * Assign a staff member to a ward with a shift schedule.
     */
    public function rotaStore(Request $request, string $staffNumber)
    {
        Staff::findOrFail($staffNumber);

        $validated = $request->validate([
            'ward_number'    => 'required|integer|exists:wards,ward_number',
            'week_beginning' => 'required|date',
            'shift'          => 'required|in:Early,Late,Night',
        ]);

        StaffRota::create([
            'staff_number'   => $staffNumber,
            'ward_number'    => $validated['ward_number'],
            'week_beginning' => $validated['week_beginning'],
            'shift'          => $validated['shift'],
        ]);

        return back()->with('success', 'Ward assignment added.');
    }

    /**
     * Remove a ward assignment.
     */
    public function rotaDestroy(int $rotaId)
    {
        StaffRota::findOrFail($rotaId)->delete();
        return back()->with('success', 'Ward assignment removed.');
    }
}
<?php
namespace App\Http\Controllers\Modules;

use App\Http\Controllers\Controller;
use App\Models\Ward;
use App\Models\Inpatient;
use App\Models\Patient;
use App\Models\Staff;
use App\Models\StaffPosition;
use App\Models\StaffRota;
use App\Models\Requisition;
use App\Models\RequisitionItem;
use App\Models\Supplies;
use App\Models\PharmaceuticalSupply;
use Illuminate\Http\Request;

class WardManagementController extends Controller
{
    public function index()
    {
        $wards = Ward::orderBy('ward_number')->get();

        $wards = $wards->map(function ($ward) {
            $occupied = Inpatient::where('ward_number', $ward->ward_number)
                ->whereNull('actual_leave_date')
                ->count();

            return [
                'ward_number'   => $ward->ward_number,
                'ward_name'     => $ward->ward_name,
                'location'      => $ward->location,
                'total_beds'    => $ward->total_beds,
                'tel_extension' => $ward->tel_extension,
                'occupied_beds' => $occupied,
                'vacant_beds'   => max(0, $ward->total_beds - $occupied),
            ];
        });

        return response()->json([
            'wards' => $wards,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'ward_number'   => 'required|integer|exists:wards,ward_number',
            'ward_name'     => 'required|string|max:100',
            'location'      => 'required|string|max:100',
            'total_beds'    => 'required|integer|min:1',
            'tel_extension' => 'nullable|string|max:20',
        ]);

        Ward::create($validated);
        return response()->json(['message' => 'Ward created.']);
    }

    public function update(Request $request, int $id)
    {
        $ward = Ward::findOrFail($id);

        $validated = $request->validate([
            'ward_name'     => 'required|string|max:100',
            'location'      => 'required|string|max:100',
            'total_beds'    => 'required|integer|min:1',
            'tel_extension' => 'nullable|string|max:20',
        ]);

        $ward->update($validated);
        return response()->json(['message' => 'Ward updated.']);
    }

    public function destroy(int $id)
    {
        Ward::findOrFail($id)->delete();
        return response()->json(['message' => 'Ward deleted.']);
    }

    public function show(int $id)
    {
        $ward = Ward::findOrFail($id);

        $occupied = Inpatient::where('ward_number', $id)
            ->whereNull('actual_leave_date')
            ->count();

        // (c) Staff allocated to this ward
        $staffRota = StaffRota::where('ward_number', $id)
            ->with('staff')
            ->get();

        $staff = Staff::all(['staff_number', 'first_name', 'last_name']);
        $positions = StaffPosition::whereNull('end_date')->get();

        $wardStaff = $staff->filter(function ($s) use ($staffRota) {
            return $staffRota->pluck('staff_number')->contains($s->staff_number);
        })->map(function ($s) use ($positions, $staffRota) {
            $position = $positions->where('staff_number', $s->staff_number)->first();
            $rota = $staffRota->where('staff_number', $s->staff_number)->first();
            return [
                'staff_number'   => $s->staff_number,
                'first_name'     => $s->first_name,
                'last_name'      => $s->last_name,
                'position_title' => $position?->position_title ?? '—',
                'shift'          => $rota?->shift ?? '—',
                'week_beginning' => $rota?->week_beginning ?? '—',
            ];
        })->values();

        // (h)(i) Patients currently in this ward
        $inpatients = Inpatient::where('ward_number', $id)
            ->whereNull('actual_leave_date')
            ->get();

        $patients = Patient::whereIn('patient_number', $inpatients->pluck('patient_number'))
            ->get(['patient_number', 'first_name', 'last_name', 'date_of_birth', 'sex']);

        $wardPatients = $inpatients->map(function ($ip) use ($patients) {
            $patient = $patients->where('patient_number', $ip->patient_number)->first();
            return [
                'patient_number'     => $ip->patient_number,
                'first_name'         => $patient?->first_name ?? '—',
                'last_name'          => $patient?->last_name ?? '—',
                'bed_number'         => $ip->bed_number,
                'date_placed'        => $ip->date_placed,
                'expected_leave_date'=> $ip->expected_leave_date,
                'expected_stay_days' => $ip->expected_stay_days,
            ];
        });

        // (n) Supplies provided to this ward
        $requisitions = Requisition::where('ward_number', $id)->get();
        $reqItems = RequisitionItem::whereIn('requisition_number', $requisitions->pluck('requisition_number'))->get();

        $supplies = Supplies::all(['item_number', 'item_name']);
        $drugs    = PharmaceuticalSupply::all(['drug_number', 'drug_name']);

        $wardSupplies = $reqItems->map(function ($item) use ($supplies, $drugs, $requisitions) {
            $req    = $requisitions->where('requisition_number', $item->requisition_number)->first();
            $supply = $supplies->where('item_number', $item->item_number)->first();
            $drug   = $drugs->where('drug_number', $item->drug_number)->first();
            return [
                'requisition_number' => $item->requisition_number,
                'requisition_date'   => $req?->requisition_date,
                'item_name'          => $supply?->item_name ?? $drug?->drug_name ?? '—',
                'type'               => $drug ? 'Drug' : 'Supply',
                'quantity_required'  => $item->quantity_required,
                'cost_per_unit'      => $item->cost_per_unit,
            ];
        });

        return response()->json([
            'ward' => [
                'ward_number'   => $ward->ward_number,
                'ward_name'     => $ward->ward_name,
                'location'      => $ward->location,
                'total_beds'    => $ward->total_beds,
                'tel_extension' => $ward->tel_extension,
                'occupied_beds' => $occupied,
                'vacant_beds'   => max(0, $ward->total_beds - $occupied),
            ],
            'staff'    => $wardStaff,
            'patients' => $wardPatients,
            'supplies' => $wardSupplies,
        ]);
    }
}


<?php
namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\Patient;
use App\Models\Inpatient;
use App\Models\Outpatient;
use App\Models\NextOfKin;
use App\Models\Appointment;
use App\Models\LocalDoctor;
use App\Models\Ward;
use App\Models\Staff;
use App\Models\StaffPosition;
use Illuminate\Http\Request;
use App\Models\PatientMedication;
use App\Models\PharmaceuticalSupply;
use App\Models\Requisition;
use App\Models\RequisitionItem;
use App\Models\Supplies;
use App\Models\StaffRota;

class ChargeNurseController extends Controller
{
    public function dashboard()
    {
        return Inertia::render('charge-nurse/dashboard', [
            'stats' => [
                'total_patients'  => Patient::count(),
                'inpatients'      => Inpatient::whereNull('actual_leave_date')->count(),
                'outpatients'     => Outpatient::count(),
                'appointments'    => Appointment::count(),
            ]
        ]);
    }

    public function patients()
    {
        $patients = Patient::with(['inpatient', 'outpatient', 'localDoctor'])
            ->orderBy('last_name')
            ->get();

        $wards   = Ward::orderBy('ward_number')->get(['ward_number', 'ward_name']);
        $doctors = LocalDoctor::orderBy('full_name')->get();
        $consultantNumbers = StaffPosition::where('position_title', 'Consultant')
            ->whereNull('end_date')
            ->pluck('staff_number');

        $consultants = Staff::whereIn('staff_number', $consultantNumbers)
            ->get(['staff_number', 'first_name', 'last_name']);

        return Inertia::render('modules/patient-management/index', [
            'patients'    => $patients,
            'wards'       => $wards,
            'doctors'     => $doctors,
            'consultants' => $consultants,
        ]);
    }

    public function patientDetails(string $id)
    {
        $patient = Patient::with(['inpatient', 'outpatient', 'nextOfKin', 'appointments', 'localDoctor'])
            ->findOrFail($id);
        return response()->json($patient);
    }

    // Register patient
    public function patientStore(Request $request)
    {
        $validated = $request->validate([
            'patient_number'  => 'required|string|unique:patient,patient_number',
            'first_name'      => 'required|string|max:100',
            'last_name'       => 'required|string|max:100',
            'address'         => 'nullable|string',
            'telephone'       => 'nullable|string|max:20',
            'date_of_birth'   => 'required|date',
            'sex'             => 'required|in:Male,Female',
            'marital_status'  => 'required|in:Single,Married,Widowed,Divorced',
            'date_registered' => 'required|date',
            'clinic_number'   => 'nullable|string',
            // next of kin
            'kin'             => 'nullable|array',
            'kin.*.full_name'    => 'required_with:kin|string',
            'kin.*.relationship' => 'nullable|string',
            'kin.*.address'      => 'nullable|string',
            'kin.*.telephone'    => 'nullable|string',
            // local doctor
            'doctor_full_name'  => 'nullable|string',
            'doctor_address'    => 'nullable|string',
            'doctor_telephone'  => 'nullable|string',
        ]);

        // Handle local doctor
        $clinicNumber = $validated['clinic_number'] ?? null;
        if ($clinicNumber && !LocalDoctor::find($clinicNumber)) {
            LocalDoctor::create([
                'clinic_number' => $clinicNumber,
                'full_name'     => $validated['doctor_full_name'] ?? '',
                'address'       => $validated['doctor_address'] ?? '',
                'telephone'     => $validated['doctor_telephone'] ?? '',
            ]);
        }

        $patient = Patient::create([
            'patient_number'  => $validated['patient_number'],
            'first_name'      => $validated['first_name'],
            'last_name'       => $validated['last_name'],
            'address'         => $validated['address'] ?? null,
            'telephone'       => $validated['telephone'] ?? null,
            'date_of_birth'   => $validated['date_of_birth'],
            'sex'             => $validated['sex'],
            'marital_status'  => $validated['marital_status'],
            'date_registered' => $validated['date_registered'],
            'clinic_number'   => $clinicNumber,
        ]);

        // Next of kin
        if (!empty($validated['kin'])) {
            foreach ($validated['kin'] as $kin) {
                if (!empty($kin['full_name'])) {
                    NextOfKin::create([
                        'patient_number' => $patient->patient_number,
                        'full_name'      => $kin['full_name'],
                        'relationship'   => $kin['relationship'] ?? null,
                        'address'        => $kin['address'] ?? null,
                        'telephone'      => $kin['telephone'] ?? null,
                    ]);
                }
            }
        }

        return back()->with('success', 'Patient registered.');
    }

    // Edit patient
    public function patientUpdate(Request $request, string $id)
    {
        $patient = Patient::findOrFail($id);

        $validated = $request->validate([
            'first_name'     => 'required|string|max:100',
            'last_name'      => 'required|string|max:100',
            'address'        => 'nullable|string',
            'telephone'      => 'nullable|string|max:20',
            'date_of_birth'  => 'required|date',
            'sex'            => 'required|in:Male,Female',
            'marital_status' => 'required|in:Single,Married,Widowed,Divorced',
        ]);

        $patient->update($validated);
        return back()->with('success', 'Patient updated.');
    }

    // Admit to ward
    public function admitStore(Request $request, string $id)
    {
        $validated = $request->validate([
            'ward_number'        => 'required|integer',
            'bed_number'         => 'required|integer',
            'date_on_waitlist'   => 'nullable|date',
            'date_placed'        => 'required|date',
            'expected_leave_date'=> 'nullable|date',
            'expected_stay_days' => 'nullable|integer',
        ]);

        Inpatient::create([
            'patient_number'     => $id,
            'ward_number'        => $validated['ward_number'],
            'bed_number'         => $validated['bed_number'],
            'date_on_waitlist'   => $validated['date_on_waitlist'] ?? null,
            'date_placed'        => $validated['date_placed'],
            'expected_leave_date'=> $validated['expected_leave_date'] ?? null,
            'expected_stay_days' => $validated['expected_stay_days'] ?? null,
            'actual_leave_date'  => null,
        ]);

        return back()->with('success', 'Patient admitted.');
    }

    // Discharge
    public function discharge(string $id)
    {
        Inpatient::where('patient_number', $id)
            ->whereNull('actual_leave_date')
            ->update(['actual_leave_date' => now()->toDateString()]);

        return back()->with('success', 'Patient discharged.');
    }

    // Outpatient
    public function outpatientStore(Request $request, string $id)
    {
        $validated = $request->validate([
            'appointment_date' => 'required|date',
            'appointment_time' => 'required',
        ]);

        Outpatient::create([
            'patient_number'   => $id,
            'appointment_date' => $validated['appointment_date'],
            'appointment_time' => $validated['appointment_time'],
        ]);

        return back()->with('success', 'Out-patient appointment set.');
    }

    // Appointment
    public function appointmentStore(Request $request, string $id)
    {
        $validated = $request->validate([
            'appointment_number' => 'required|string|unique:appointment,appointment_number',
            'consultant_number'  => 'required|string',
            'appointment_date'   => 'required|date',
            'appointment_time'   => 'nullable|string',
            'examination_room'   => 'nullable|string',
            'outcome'            => 'required|in:Waiting list,Outpatient',
        ]);

        Appointment::create([
            'appointment_number' => $validated['appointment_number'],
            'patient_number'     => $id,
            'consultant_number'  => $validated['consultant_number'],
            'appointment_date'   => $validated['appointment_date'],
            'appointment_time'   => $validated['appointment_time'] ?? null,
            'examination_room'   => $validated['examination_room'] ?? null,
            'outcome'            => $validated['outcome'],
        ]);

        return back()->with('success', 'Appointment recorded.');
    }

    //medication
    public function medication()
    {
        $medications = PatientMedication::orderBy('medication_id')->get();
        $drugs        = PharmaceuticalSupply::orderBy('drug_name')->get();
        $patients     = Patient::orderBy('last_name')->get(['patient_number', 'first_name', 'last_name']);

        return Inertia::render('modules/medication/index', [
            'medications' => $medications,
            'drugs'       => $drugs,
            'patients'    => $patients,
        ]);
    }

    public function medicationStore(Request $request)
    {
        $validated = $request->validate([
            'patient_number'  => 'required|string|exists:patient,patient_number',
            'drug_number'     => 'required|string|exists:pharmaceuticalsupply,drug_number',
            'units_per_day'   => 'required|integer|min:1',
            'method_of_admin' => 'required|string',
            'start_date'      => 'required|date',
            'finish_date'     => 'nullable|date',
            'prescribed_by'   => 'nullable|string',
        ]);

        PatientMedication::create($validated);
        return back()->with('success', 'Prescription added.');
    }

    public function medicationDestroy(int $id)
        {
            PatientMedication::findOrFail($id)->delete();
            return back()->with('success', 'Prescription removed.');
        }

    //requisition
    public function requisitions()
    {
        $requisitions = Requisition::with('items')
            ->orderByDesc('requisition_date')
            ->get();

        $supplies = Supplies::orderBy('item_name')->get();
        $drugs    = PharmaceuticalSupply::orderBy('drug_name')->get();
        $wards    = Ward::orderBy('ward_number')->get(['ward_number', 'ward_name']);

        return Inertia::render('modules/requisitions/index', [
            'requisitions' => $requisitions,
            'supplies'     => $supplies,
            'drugs'        => $drugs,
            'wards'        => $wards,
        ]);
    }

    public function requisitionStore(Request $request)
    {
        $validated = $request->validate([
            'ward_number'        => 'required|integer',
            'items'              => 'required|array|min:1',
            'items.*.type'       => 'required|in:supply,drug',
            'items.*.item_number'=> 'nullable|string',
            'items.*.drug_number'=> 'nullable|string',
            'items.*.quantity'   => 'required|integer|min:1',
            'items.*.cost'       => 'required|numeric|min:0',
        ]);

        $reqNumber = 'REQ-' . strtoupper(uniqid());
        $today     = now()->toDateString();

        $req = Requisition::create([
            'requisition_number' => $reqNumber,
            'requisition_date'   => $today,
            'signed_date'        => $today,
            'signed_by'          => auth()->user()->staff_number ?? auth()->user()->name,
            'ward_number'        => $validated['ward_number'],
            'staff_number'       => auth()->user()->staff_number,
        ]);

        foreach ($validated['items'] as $item) {
            RequisitionItem::create([
                'requisition_number' => $reqNumber,
                'item_number'        => $item['type'] === 'supply' ? $item['item_number'] : null,
                'drug_number'        => $item['type'] === 'drug'   ? $item['drug_number'] : null,
                'quantity_required'  => $item['quantity'],
                'cost_per_unit'      => $item['cost'],
            ]);
        }

        return back()->with('success', 'Requisition submitted.');
    }

    //staffrota
    public function rota()
    {
        $rotas  = StaffRota::orderByDesc('week_beginning')->get();
        $staff  = Staff::orderBy('last_name')->get(['staff_number', 'first_name', 'last_name']);
        $wards  = Ward::orderBy('ward_number')->get(['ward_number', 'ward_name']);

        return Inertia::render('modules/rota/index', [
            'rotas' => $rotas,
            'staff' => $staff,
            'wards' => $wards,
        ]);
    }

    public function rotaStore(Request $request)
    {
        $validated = $request->validate([
            'staff_number'  => 'required|string|exists:staff,staff_number',
            'ward_number'   => 'required|integer|exists:ward,ward_number',
            'week_beginning'=> 'required|date',
            'shift'         => 'required|in:Early,Late,Night',
        ]);

        StaffRota::create($validated);
        return back()->with('success', 'Rota entry added.');
    }

    public function rotaDestroy(int $id)
    {
        StaffRota::findOrFail($id)->delete();
        return back()->with('success', 'Rota entry removed.');
    }
}
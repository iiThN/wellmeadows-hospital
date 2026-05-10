<?php
namespace App\Http\Controllers\Modules;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use App\Models\Appointment;
use App\Models\Treatment;
use App\Models\Patient;
use App\Models\Staff;
use App\Models\StaffPosition;
use App\Models\Outpatient;
use Illuminate\Http\Request;

class AppointmentTreatmentController extends Controller
{
    public function index()
    {
        $appointments = Appointment::with(['treatment'])
            ->orderByDesc('appointment_date')
            ->get();

        $patients    = Patient::orderBy('last_name')->get(['patient_number', 'first_name', 'last_name']);
        $outpatients = Outpatient::with('patient')->get();

        $consultantNumbers = StaffPosition::where('position_title', 'Consultant')
            ->whereNull('end_date')
            ->pluck('staff_number');
        $consultants = Staff::whereIn('staff_number', $consultantNumbers)
            ->get(['staff_number', 'first_name', 'last_name']);

        return Inertia::render('modules/appointment-treatment/index', [
            'appointments' => $appointments,
            'patients'     => $patients,
            'consultants'  => $consultants,
            'outpatients'  => $outpatients,
        ]);
    }

    // (d)(e) Create appointment
    public function appointmentStore(Request $request)
    {
        $validated = $request->validate([
            'appointment_number' => 'required|string|unique:appointment,appointment_number',
            'patient_number'     => 'required|string|exists:patient,patient_number',
            'consultant_number'  => 'required|string|exists:staff,staff_number',
            'appointment_date'   => 'required|date',
            'appointment_time'   => 'nullable|string',
            'examination_room'   => 'nullable|string|max:50',
        ]);

        Appointment::create([
            ...$validated,
            'outcome' => 'Pending', // default until examination
        ]);

        return back()->with('success', 'Appointment created.');
    }

    // Update appointment
    public function appointmentUpdate(Request $request, string $id)
    {
        $appointment = Appointment::findOrFail($id);

        $validated = $request->validate([
            'appointment_date'  => 'required|date',
            'appointment_time'  => 'nullable|string',
            'examination_room'  => 'nullable|string|max:50',
            'outcome'           => 'required|in:Waiting list,Outpatient',
            'consultant_number' => 'required|string|exists:staff,staff_number',
        ]);

        $appointment->update($validated);
        return back()->with('success', 'Appointment updated.');
    }

    // Delete appointment
    public function appointmentDestroy(string $id)
    {
        Appointment::findOrFail($id)->delete();
        return back()->with('success', 'Appointment deleted.');
    }

    // Record treatment
    public function treatmentStore(Request $request, string $appointmentNumber)
    {
        $request->validate([
            'diagnosis'      => 'nullable|string',
            'procedure'      => 'nullable|string',
            'treatment_date' => 'required|date',
            'notes'          => 'nullable|string',
        ]);

        Treatment::updateOrCreate(
            ['appointment_number' => $appointmentNumber],
            [
                'diagnosis'      => $request->diagnosis,
                'procedure'      => $request->procedure,
                'treatment_date' => $request->treatment_date,
                'notes'          => $request->notes,
            ]
        );

        return back()->with('success', 'Treatment recorded.');
    }

    // Delete treatment
    public function treatmentDestroy(string $appointmentNumber)
    {
        Treatment::where('appointment_number', $appointmentNumber)->delete();
        return back()->with('success', 'Treatment deleted.');
    }

    // (f) Outpatient clinic report
    public function outpatientReport()
    {
        $outpatients = Outpatient::orderByDesc('appointment_date')->get();
        $patients    = Patient::all(['patient_number', 'first_name', 'last_name', 'telephone', 'address']);

        $report = $outpatients->map(function ($op) use ($patients) {
            $patient = $patients->where('patient_number', $op->patient_number)->first();
            return [
                'patient_number'   => $op->patient_number,
                'first_name'       => $patient?->first_name ?? '—',
                'last_name'        => $patient?->last_name ?? '—',
                'telephone'        => $patient?->telephone ?? '—',
                'appointment_date' => $op->appointment_date,
                'appointment_time' => $op->appointment_time,
            ];
        });

        return response()->json($report);
    }
}
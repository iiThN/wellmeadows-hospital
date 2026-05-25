<?php
use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use App\Http\Controllers\PersonnelController;
use App\Http\Controllers\ChargeNurseController;
use App\Http\Controllers\DirectorController;
use App\Http\Controllers\AccountController;
use App\Http\Controllers\Modules\WardManagementController;
use App\Http\Controllers\Modules\AppointmentTreatmentController;

// Current user
Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

// Dashboard data endpoints
Route::middleware(['auth:sanctum', 'role:personnel_officer'])->get('/personnel/dashboard', [PersonnelController::class, 'dashboard']);
Route::middleware(['auth:sanctum', 'role:charge_nurse'])->get('/charge-nurse/dashboard', [ChargeNurseController::class, 'dashboard']);
Route::middleware(['auth:sanctum', 'role:medical_director'])->get('/director/dashboard', [DirectorController::class, 'dashboard']);

// Personnel Officer routes
Route::middleware(['auth:sanctum', 'role:personnel_officer'])->group(function () {
    // Staff Management
    Route::get('/modules/staff-management', [PersonnelController::class, 'staffIndex']);
    Route::get('/modules/staff-management/{id}/details', [PersonnelController::class, 'staffShow']);
    Route::post('/modules/staff-management', [PersonnelController::class, 'staffStore']);
    Route::put('/modules/staff-management/{id}', [PersonnelController::class, 'staffUpdate']);
    Route::delete('/modules/staff-management/{id}', [PersonnelController::class, 'staffDestroy']);

    // Account Management
    Route::get('/modules/account-management', [AccountController::class, 'index']);
    Route::post('/modules/account-management', [AccountController::class, 'store']);
    Route::put('/modules/account-management/{id}', [AccountController::class, 'update']);
    Route::delete('/modules/account-management/{id}', [AccountController::class, 'destroy']);
});

// Charge Nurse routes
Route::middleware(['auth:sanctum', 'role:charge_nurse'])->group(function () {
    // Patient Management
    Route::get('/modules/patient-management', [ChargeNurseController::class, 'patients']);
    Route::get('/modules/patient-management/{id}/details', [ChargeNurseController::class, 'patientDetails']);
    Route::post('/modules/patient-management', [ChargeNurseController::class, 'patientStore']);
    Route::put('/modules/patient-management/{id}', [ChargeNurseController::class, 'patientUpdate']);
    Route::post('/modules/patient-management/{id}/admit', [ChargeNurseController::class, 'admitStore']);
    Route::post('/modules/patient-management/{id}/discharge', [ChargeNurseController::class, 'discharge']);
    Route::post('/modules/patient-management/{id}/outpatient', [ChargeNurseController::class, 'outpatientStore']);
    Route::post('/modules/patient-management/{id}/appointment', [ChargeNurseController::class, 'appointmentStore']);

    // Medication
    Route::get('/modules/medication', [ChargeNurseController::class, 'medication']);
    Route::post('/modules/medication', [ChargeNurseController::class, 'medicationStore']);
    Route::delete('/modules/medication/{id}', [ChargeNurseController::class, 'medicationDestroy']);

    // Requisitions
    Route::get('/modules/requisitions', [ChargeNurseController::class, 'requisitions']);
    Route::post('/modules/requisitions', [ChargeNurseController::class, 'requisitionStore']);

    // Rota
    Route::get('/modules/rota', [ChargeNurseController::class, 'rota']);
    Route::post('/modules/rota', [ChargeNurseController::class, 'rotaStore']);
    Route::delete('/modules/rota/{id}', [ChargeNurseController::class, 'rotaDestroy']);
});

// All authenticated users
Route::middleware(['auth:sanctum'])->group(function () {
    // Ward Management
    Route::get('/modules/ward-management', [WardManagementController::class, 'index']);
    Route::get('/modules/ward-management/{id}/details', [WardManagementController::class, 'show']);
    Route::post('/modules/ward-management', [WardManagementController::class, 'store']);
    Route::put('/modules/ward-management/{id}', [WardManagementController::class, 'update']);
    Route::delete('/modules/ward-management/{id}', [WardManagementController::class, 'destroy']);
    Route::post('/modules/staff-management/{id}/positions', [PersonnelController::class, 'staffPositionStore']);
    Route::put('/modules/staff-management/{id}/positions/{posId}', [PersonnelController::class, 'staffPositionUpdate']);
    Route::delete('/modules/staff-management/{id}/positions/{posId}', [PersonnelController::class, 'staffPositionDestroy']);

    // Appointment & Treatment
    Route::get('/modules/appointment-treatment', [AppointmentTreatmentController::class, 'index']);
    Route::get('/modules/appointment-treatment/outpatient-report', [AppointmentTreatmentController::class, 'outpatientReport']);
    Route::post('/modules/appointment-treatment/appointments', [AppointmentTreatmentController::class, 'appointmentStore']);
    Route::put('/modules/appointment-treatment/appointments/{id}', [AppointmentTreatmentController::class, 'appointmentUpdate']);
    Route::delete('/modules/appointment-treatment/appointments/{id}', [AppointmentTreatmentController::class, 'appointmentDestroy']);
    Route::post('/modules/appointment-treatment/appointments/{id}/treatment', [AppointmentTreatmentController::class, 'treatmentStore']);
    Route::delete('/modules/appointment-treatment/appointments/{id}/treatment', [AppointmentTreatmentController::class, 'treatmentDestroy']);
});
<?php
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\PersonnelController;
use App\Http\Controllers\ChargeNurseController;
use App\Http\Controllers\DirectorController;
use App\Http\Controllers\AccountController;
use App\Http\Controllers\Modules\WardManagementController;
use App\Http\Controllers\Modules\AppointmentTreatmentController;

// All GET routes serve the SPA blade (react-router handles routing client-side)
// API routes are in routes/api.php

// POST/PUT/DELETE module routes (CSRF protected, session auth)

// Module: Staff Management (Personnel Officer)
Route::middleware(['auth', 'role:personnel_officer'])
    ->prefix('modules/staff-management')
    ->group(function () {
        Route::post('/', [PersonnelController::class, 'staffStore']);
        Route::put('/{id}', [PersonnelController::class, 'staffUpdate']);
        Route::delete('/{id}', [PersonnelController::class, 'staffDestroy']);
    });

// Module: Account Management (Personnel Officer)
Route::middleware(['auth', 'role:personnel_officer'])
    ->prefix('modules/account-management')
    ->group(function () {
        Route::post('/', [AccountController::class, 'store']);
        Route::put('/{id}', [AccountController::class, 'update']);
        Route::delete('/{id}', [AccountController::class, 'destroy']);
        
    });

// Module: Patient Management (Charge Nurse)
Route::middleware(['auth', 'role:charge_nurse'])
    ->prefix('modules/patient-management')
    ->group(function () {
        Route::post('/', [ChargeNurseController::class, 'patientStore']);
        Route::put('/{id}', [ChargeNurseController::class, 'patientUpdate']);
        Route::post('/{id}/admit', [ChargeNurseController::class, 'admitStore']);
        Route::post('/{id}/discharge', [ChargeNurseController::class, 'discharge']);
        Route::post('/{id}/outpatient', [ChargeNurseController::class, 'outpatientStore']);
        Route::post('/{id}/appointment', [ChargeNurseController::class, 'appointmentStore']);
    });

// Module: Medication (Charge Nurse)
Route::middleware(['auth', 'role:charge_nurse'])
    ->prefix('modules/medication')
    ->group(function () {
        Route::post('/', [ChargeNurseController::class, 'medicationStore']);
        Route::delete('/{id}', [ChargeNurseController::class, 'medicationDestroy']);
    });

// Module: Requisitions (Charge Nurse)
Route::middleware(['auth', 'role:charge_nurse'])
    ->prefix('modules/requisitions')
    ->group(function () {
        Route::post('/', [ChargeNurseController::class, 'requisitionStore']);
    });

// Module: Staff Rota (Charge Nurse)
Route::middleware(['auth', 'role:charge_nurse'])
    ->prefix('modules/rota')
    ->group(function () {
        Route::post('/', [ChargeNurseController::class, 'rotaStore']);
        Route::delete('/{id}', [ChargeNurseController::class, 'rotaDestroy']);
    });

// Module: Ward Management (all roles)
Route::middleware(['auth'])
    ->prefix('modules/ward-management')
    ->group(function () {
        Route::post('/', [WardManagementController::class, 'store']);
        Route::put('/{id}', [WardManagementController::class, 'update']);
        Route::delete('/{id}', [WardManagementController::class, 'destroy']);
    });

// Module: Appointment & Treatment
Route::middleware(['auth'])
    ->prefix('modules/appointment-treatment')
    ->group(function () {
        Route::post('/appointments', [AppointmentTreatmentController::class, 'appointmentStore']);
        Route::put('/appointments/{id}', [AppointmentTreatmentController::class, 'appointmentUpdate']);
        Route::delete('/appointments/{id}', [AppointmentTreatmentController::class, 'appointmentDestroy']);
        Route::post('/appointments/{id}/treatment', [AppointmentTreatmentController::class, 'treatmentStore']);
        Route::delete('/appointments/{id}/treatment', [AppointmentTreatmentController::class, 'treatmentDestroy']);
    });

// Override any framework-registered GET login route
Route::get('/login', fn() => view('app'))->name('login');
Route::get('/forgot-password', fn() => view('app'))->name('password.request');
Route::get('/reset-password/{token}', fn() => view('app'))->name('password.reset');

require __DIR__.'/auth.php';
require __DIR__.'/settings.php';

// SPA catch-all
Route::get('/{any}', fn() => view('app'))
    ->where('any', '^(?!api).*')
    ->name('spa');

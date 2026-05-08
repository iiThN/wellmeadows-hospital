<?php
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\PersonnelController;
use App\Http\Controllers\ChargeNurseController;
use App\Http\Controllers\DirectorController;
use App\Http\Controllers\AccountController;
use App\Http\Controllers\Modules\WardManagementController;

// Root redirect
Route::get('/', function () {
    return redirect()->route('login');
})->name('home');

//Dashboards (role-based) 
Route::middleware(['auth', 'role:personnel_officer'])
    ->group(function () {
        Route::get('/personnel/dashboard', [PersonnelController::class, 'dashboard'])->name('personnel.dashboard');
    });

Route::middleware(['auth', 'role:charge_nurse'])
    ->group(function () {
        Route::get('/charge-nurse/dashboard', [ChargeNurseController::class, 'dashboard'])->name('charge-nurse.dashboard');
    });

Route::middleware(['auth', 'role:medical_director'])
    ->group(function () {
        Route::get('/director/dashboard', [DirectorController::class, 'dashboard'])->name('director.dashboard');
    });

//Modules 

// Module: Staff Management (Personnel Officer)
Route::middleware(['auth', 'role:personnel_officer'])
    ->prefix('modules/staff-management')
    ->group(function () {
        Route::get('/', [PersonnelController::class, 'staffIndex'])->name('staff.index');
        Route::get('/create', [PersonnelController::class, 'staffCreate'])->name('staff.create');
        Route::post('/', [PersonnelController::class, 'staffStore'])->name('staff.store');
        Route::get('/{id}/edit', [PersonnelController::class, 'staffEdit'])->name('staff.edit');
        Route::put('/{id}', [PersonnelController::class, 'staffUpdate'])->name('staff.update');
        Route::delete('/{id}', [PersonnelController::class, 'staffDestroy'])->name('staff.destroy');
        Route::get('/{id}/details', [PersonnelController::class, 'staffShow'])->name('staff.show');
    });

// Module: Account Management (Personnel Officer)
Route::middleware(['auth', 'role:personnel_officer'])
    ->prefix('modules/account-management')
    ->group(function () {
        Route::get('/', [AccountController::class, 'index'])->name('accounts.index');
        Route::post('/', [AccountController::class, 'store'])->name('accounts.store');
        Route::put('/{id}', [AccountController::class, 'update'])->name('accounts.update');
        Route::delete('/{id}', [AccountController::class, 'destroy'])->name('accounts.destroy');
    });

// Module: Patient Management (Charge Nurse)
Route::middleware(['auth', 'role:charge_nurse'])
    ->prefix('modules/patient-management')
    ->group(function () {
        Route::get('/', [ChargeNurseController::class, 'patients'])->name('patients.index');
        Route::get('/{id}/details', [ChargeNurseController::class, 'patientDetails'])->name('patients.details');
        Route::post('/', [ChargeNurseController::class, 'patientStore'])->name('patients.store');
        Route::put('/{id}', [ChargeNurseController::class, 'patientUpdate'])->name('patients.update');
        Route::post('/{id}/admit', [ChargeNurseController::class, 'admitStore'])->name('patients.admit');
        Route::post('/{id}/discharge', [ChargeNurseController::class, 'discharge'])->name('patients.discharge');
        Route::post('/{id}/outpatient', [ChargeNurseController::class, 'outpatientStore'])->name('patients.outpatient');
        Route::post('/{id}/appointment', [ChargeNurseController::class, 'appointmentStore'])->name('patients.appointment');
    });

// Module: Medication (Charge Nurse)
Route::middleware(['auth', 'role:charge_nurse'])
    ->prefix('modules/medication')
    ->group(function () {
        Route::get('/', [ChargeNurseController::class, 'medication'])->name('medication.index');
        Route::post('/', [ChargeNurseController::class, 'medicationStore'])->name('medication.store');
        Route::delete('/{id}', [ChargeNurseController::class, 'medicationDestroy'])->name('medication.destroy');
    });

// Module: Requisitions (Charge Nurse)
Route::middleware(['auth', 'role:charge_nurse'])
    ->prefix('modules/requisitions')
    ->group(function () {
        Route::get('/', [ChargeNurseController::class, 'requisitions'])->name('requisitions.index');
        Route::post('/', [ChargeNurseController::class, 'requisitionStore'])->name('requisitions.store');
    });

// Module: Staff Rota (Charge Nurse)
Route::middleware(['auth', 'role:charge_nurse'])
    ->prefix('modules/rota')
    ->group(function () {
        Route::get('/', [ChargeNurseController::class, 'rota'])->name('rota.index');
        Route::post('/', [ChargeNurseController::class, 'rotaStore'])->name('rota.store');
        Route::delete('/{id}', [ChargeNurseController::class, 'rotaDestroy'])->name('rota.destroy');
    });

// Module: Ward Management (all roles)
Route::middleware(['auth'])
    ->prefix('modules/ward-management')
    ->group(function () {
        Route::get('/', [WardManagementController::class, 'index'])->name('ward.index');
        Route::post('/', [WardManagementController::class, 'store'])->name('ward.store');
        Route::put('/{id}', [WardManagementController::class, 'update'])->name('ward.update');
        Route::delete('/{id}', [WardManagementController::class, 'destroy'])->name('ward.destroy');
        Route::get('/{id}/details', [WardManagementController::class, 'show'])->name('ward.show');
    });

require __DIR__.'/auth.php';
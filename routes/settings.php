<?php
use App\Http\Controllers\Settings\PasswordController;
use App\Http\Controllers\Settings\ProfileController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth')->group(function () {
    Route::redirect('settings', 'settings/profile');

    // Add these GET routes
    Route::get('settings/profile', fn() => view('app'))->name('profile');
    Route::get('settings/password', fn() => view('app'))->name('password');
    Route::get('settings/appearance', fn() => view('app'))->name('appearance');

    Route::patch('settings/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('settings/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::put('settings/password', [PasswordController::class, 'update'])->name('password.update');

    // API equivalents for profile data
    Route::get('api/settings/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::get('api/settings/password', [PasswordController::class, 'edit'])->name('password.edit');
});
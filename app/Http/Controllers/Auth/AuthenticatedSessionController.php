<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AuthenticatedSessionController extends Controller
{
    /**
     * Handle an incoming authentication request.
     * Returns JSON with user + redirect path (SPA handles the redirect).
     */
    public function store(LoginRequest $request)
    {
        $request->authenticate();
        $request->session()->regenerate();

        $user = $request->user();
        $role = $user->role;

        $redirect = match($role) {
            'personnel_officer' => '/personnel/dashboard',
            'charge_nurse'      => '/charge-nurse/dashboard',
            'medical_director'  => '/director/dashboard',
            default             => '/personnel/dashboard',
        };

        return response()->json([
            'user'     => $user,
            'redirect' => $redirect,
        ]);
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request)
    {
        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json(['message' => 'Logged out.']);
    }
}

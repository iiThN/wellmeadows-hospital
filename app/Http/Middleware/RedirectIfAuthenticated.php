<?php
namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class RedirectIfAuthenticated
{
    public function handle(Request $request, Closure $next, string ...$guards): Response
    {
        $guards = empty($guards) ? [null] : $guards;

        foreach ($guards as $guard) {
            if (Auth::guard($guard)->check()) {
                $role = Auth::user()->role;

                return redirect(match($role) {
                    'personnel_officer' => route('personnel.dashboard'),
                    'charge_nurse'      => route('charge-nurse.dashboard'),
                    'medical_director'  => route('director.dashboard'),
                    default             => route('personnel.dashboard'),
                });
            }
        }

        return $next($request);
    }
}
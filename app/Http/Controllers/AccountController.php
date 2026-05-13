<?php
namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Staff;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AccountController extends Controller
{
    public function index()
    {
        $accounts = User::orderBy('name')
            ->get()
            ->map(fn($u) => [
                'id'           => $u->id,
                'name'         => $u->name,
                'email'        => $u->email,
                'role'         => $u->role,
                'staff_number' => $u->staff_number,
                'created_at'   => $u->created_at?->toDateString(),
                'staff'        => $u->staff_number
                    ? Staff::where('staff_number', $u->staff_number)->first(['staff_number','first_name','last_name'])
                    : null,
            ]);

        $staff = Staff::orderBy('last_name')->get(['staff_number','first_name','last_name']);

        return response()->json([
            'accounts' => $accounts,
            'staff'    => $staff,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'         => 'required|string|max:100',
            'email'        => 'required|email|unique:users,email',
            'password'     => 'required|string|min:8',
            'role'         => 'required|in:personnel_officer,charge_nurse,medical_director',
            'staff_number' => 'nullable|string|exists:staff,staff_number',
        ]);

        User::create([
            'name'         => $validated['name'],
            'email'        => $validated['email'],
            'password'     => Hash::make($validated['password']),
            'role'         => $validated['role'],
            'staff_number' => $validated['staff_number'] ?? null,
        ]);

        return response()->json(['message' => 'Account created.']);
    }

    public function update(Request $request, int $id)
    {
        $user = User::findOrFail($id);

        $validated = $request->validate([
            'name'         => 'required|string|max:100',
            'email'        => 'required|email|unique:users,email,' . $id,
            'role'         => 'required|in:personnel_officer,charge_nurse,medical_director',
            'staff_number' => 'nullable|string|exists:staff,staff_number',
            'password'     => 'nullable|string|min:8',
        ]);

        $user->name         = $validated['name'];
        $user->email        = $validated['email'];
        $user->role         = $validated['role'];
        $user->staff_number = $validated['staff_number'] ?? null;

        if (!empty($validated['password'])) {
            $user->password = Hash::make($validated['password']);
        }

        $user->save();

        return response()->json(['message' => 'Account updated.']);
    }

    public function destroy(int $id)
    {
        User::findOrFail($id)->delete();
        return response()->json(['message' => 'Account deleted.']);
    }
}
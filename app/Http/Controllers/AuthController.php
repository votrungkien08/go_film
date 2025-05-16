<?php

namespace App\Http\Controllers;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
class AuthController extends Controller
{
      public function register(Request $request)
      {
        try{
            $validated = $request->validate([
              'name' => 'required|string|max:255',
              'email' => 'required|string|email|max:255|unique:user',
              'password' => 'required|string|min:8|confirmed',
              'points' => 'nullable|integer|min:0',
              'secret_key' => 'nullable|string',
            ]);

          $role = 'user'; // Mặc định là user
          if ($request->secret_key === env('ADMIN_SECRET_KEY', 'default_secret')) {
              $role = 'admin'; // Gán role admin nếu secret_key đúng
          }
        $points = $validated['points'] ?? 0;
          $user = User::create([
              'name' => $validated['name'],
              'email' => $validated['email'],
              'password' => Hash::make($validated['password']),
              'points' => $points,
              'role' => $role,
          ]);

          $token = $user->createToken('auth_token')->plainTextToken;

          return response()->json([
              'message' => 'Đăng ký thành công',
              'user' => $user->only(['id', 'name', 'email', 'points', 'role']),
              'token' => $token,
          ], 201);
        }
        catch(\Exception $e){
            return response()->json([
                'message' => 'register fialed',
                'error' => $e->getMessage(),
            ], 500);
        }
      }

    public function login(Request $request)
    {
        try {
            $credentials = $request->validate([
                'email' => 'required|email',
                'password' => 'required|string',
                'remember' => 'nullable|boolean', // Thêm tham số remember
            ]);

            if (Auth::attempt(['email' => $credentials['email'], 'password' => $credentials['password']])) {
                $user = Auth::user();

                // Tạo token
                $token = $user->createToken('auth_token', [], $credentials['remember'] ? null : now()->addHours(1))->plainTextToken;

                return response()->json([
                    'message' => 'Login successful',
                    'user' => $user->only(['id', 'name', 'email', 'points', 'role']),
                    'token' => $token,
                ]);
            }

            return response()->json([
                'message' => 'Email or password is incorrect',
            ], 401);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Login failed',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Đăng xuất thành công',
        ], 200);
    }
}
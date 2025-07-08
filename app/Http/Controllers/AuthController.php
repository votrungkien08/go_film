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
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'email' => 'required|string|email|max:255|unique:user',
                'password' => 'required|string|min:8|confirmed',
                'points' => 'nullable|integer|min:0',
                'secret_key' => 'nullable|string',
            ]);

            $role = 'user';
            if ($request->secret_key === env('ADMIN_SECRET_KEY', 'default_secret')) {
                $role = 'admin';
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
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'register fialed',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function login(Request $request)
    {
        try {
            \Log::info('Login request:', $request->all());
            $credentials = $request->validate([
                'email' => 'required|email',
                'password' => 'required|string',
                'remember' => 'nullable|boolean',
            ]);
            \Log::info('Credentials:', $credentials);
            if (Auth::attempt(['email' => $credentials['email'], 'password' => $credentials['password']])) {
                $user = Auth::user();
                \Log::info('User authenticated:', $user->toArray());
                $token = $user->createToken('auth_token')->plainTextToken;
                \Log::info('Token created:', ['token' => $token]);
                return response()->json([
                    'message' => 'Đăng nhập thành công',
                    'user' => $user->only(['id', 'name', 'email', 'points', 'role']),
                    'token' => $token,
                ]);
            }
            \Log::info('Auth attempt failed');
            return response()->json([
                'message' => 'Email hoặc mật khẩu không đúng',
            ], 401);
        } catch (\Exception $e) {
            \Log::error('Login error:', ['error' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            return response()->json([
                'message' => 'Đăng nhập thất bại',
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

    public function getUser(Request $request)
    {
        try {
            $user = $request->user();
            return response()->json([
                'message' => 'Fetch thông tin người dùng thành công',
                'user' => $user->only(['id', 'name', 'email', 'points', 'role']),
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Fetch thông tin người dùng thất bại',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
    public function getAllUser(Request $request)
    {
        try {
            $user = User::all();
            return response()->json([
                'message' => 'Fetch thông tin người dùng thành công',
                'user' => $user,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Fetch thông tin người dùng thất bại',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
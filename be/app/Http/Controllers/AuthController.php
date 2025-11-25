<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use  Illuminate\Support\Facades\Log;
use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;
use Laravel\Socialite\Facades\Socialite;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'email' => 'required|string|email|max:255|unique:user',
                'password' => 'required|string|min:8|confirmed',
            ]);

            $role = 'user';
            if ($request->secret_key === env('ADMIN_SECRET_KEY', 'default_secret')) {
                $role = 'admin';
            }
            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => bcrypt($validated['password']),
                'role' => $role,
            ]);
            return response()->json([
                'message' => 'Đăng ký thành công',
                'user' => $user->only(['id', 'name', 'email', 'role']),
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Email đã được đăng ký vui lòng nhập email khác',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required|string|min:8',
        ]);
        $credentials = $request->only('email', 'password');
        $token =  auth('api')->attempt($credentials);
        if (!$token) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }
        $user = Auth::guard('api')->user();
        return response()->json([
            'message' => 'Đăng nhập thành công',
            'user' => $user,
            'authorisation' => [
                'token' => $token,
                'type' => 'bearer',
            ]
        ], 200);
        Log::info('JWT Token Created:', ['token' => $token]);
        return $this->createNewToken($token);
    }

    public function googleLogin(Request $request)
    {
        try {
            $googleUser = Socialite::driver('google')->stateless()->userFromToken($request->token);
            $email = $googleUser->email;

            $user = User::where('email', $email)->first();

            if (!$user) {
                $user = User::create([
                    'name' => $googleUser->name,
                    'email' => $googleUser->email,
                    'google_id' => $googleUser->id,
                    'password' => bcrypt(uniqid()),
                    'role' => 'user',
                ]);
            }
            Auth::login($user);
            $token = JWTAuth::fromUser($user);
            return response()->json([
                'message' => 'Đăng nhập bằng Google thành công',
                'user' => $user,
                'authorisation' => [
                    'token' => $token,
                    'type' => 'bearer',
                ]
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Lỗi khi đăng nhập bằng Google',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    protected function createNewToken($token)
    {
        return response()->json([
            'access_token' => $token,
            'token_type' => 'bearer',
            'expires_in' => Auth::factory()->getTTL() * 60,
            'user' => auth('api')->user()
        ]);
    }

    public function profile()
    {
        return response()->json(Auth::user());
    }
    public function refresh()
    {
        return $this->createNewToken(Auth::refresh());
    }
    public function logout()
    {
        Auth::logout();
        return response()->json([
            'message' => 'Đăng xuất thành công',
        ], 200);
    }
    public function getAllUser(Request $request)
    {
        try {
            $user = User::all();
            return response()->json([
                'message' => 'Lấy thông tin người dùng thành công',
                'user' => $user,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Lấy thông tin người dùng thất bại',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
    // public function getAllUser(Request $request)
    // {
    //     try {
    //         $user = User::all();
    //         return response()->json([
    //             'message' => 'User details fetched successfully',
    //             'user' => $user,
    //         ], 200);
    //     } catch (\Exception $e) {
    //         return response()->json([
    //             'message' => 'Failed to fetch user details',
    //             'error' => $e->getMessage(),
    //         ], 500);
    //     }
    // }

    public function updateUser(Request $request, $id)
    {
        try {
            $user = User::findOrFail($id);
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'email' => 'required|string|email|max:255|unique:user,email,' . $user->id,
                'role' => 'required|in:user,admin',
            ]);

            $user->update($validated);

            return response()->json([
                'message' => 'Cập nhật người dùng thành công',
                'user' => $user->only(['id', 'name', 'email', 'role']),
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Cập nhật người dùng thất bại',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
    public function deleteUser($id)
    {
        try {
            if (Auth::user()->role !== 'admin') {
                return response()->json([
                    'message' => 'Bạn không có quyền xoá người dùng',
                ], 403);
            }
            $user = User::findOrFail($id);
            $user->delete();

            return response()->json([
                'message' => 'Xoá người dùng thành công',
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Xoá người dùng thất bại',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
    public function addUser(Request $request)
    {
        try {
            if (Auth::user()->role !== 'admin') {
                return response()->json([
                    'message' => 'Bạn không có quyền thêm người dùng',
                ], 403);
            }
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'email' => 'required|string|email|max:255|unique:user',
                'password' => 'required|string|min:8|confirmed',
                'role' => 'required|in:user,admin',
            ]);

            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => Hash::make($validated['password']),
                'role' => $validated['role'],
            ]);

            return response()->json([
                'message' => 'Thêm người dùng thành công',
                'user' => $user->only(['id', 'name', 'email', 'role']),
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Thêm người dùng thất bại',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function resetPassword(Request $request)
    {
        try {
            $request->validate([
                'token' => 'required',
                'email' => 'required|email',
                'password' => 'required|min:8|confirmed',
            ]);

            $status = Password::reset(
                $request->only('email', 'password', 'password_confirmation', 'token'),
                function ($user, $password) {
                    $user->forceFill([
                        'password' => Hash::make($password),
                    ])->save();
                }
            );

            if ($status === Password::PASSWORD_RESET) {
                return response()->json([
                    'message' => 'Đổi mật khẩu thành công!',
                    'status' => $status,
                ]);
            } else {
                return response()->json([
                    'message' => 'Không thể đặt lại mật khẩu.',
                    'error' => __($status),
                ], 400);
            }
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Đã xảy ra lỗi khi đặt lại mật khẩu.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
    public function sendResetLinkEmail(Request $request)
    {
        try {
            $request->validate([
                'email' => 'required|email',
            ]);

            $status = Password::sendResetLink(
                $request->only('email'),
            );

            if ($status === Password::RESET_LINK_SENT) {
                return response()->json([
                    'message' => 'Đã gửi email đặt lại mật khẩu!',
                    'status' => $status,
                ]);
            } else {
                return response()->json([
                    'message' => 'Không thể gửi email đặt lại mật khẩu.',
                    'error' => __($status),
                ], 400);
            }
        } catch (\Exception $e) {
            Log::error('Reset password error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Đã xảy ra lỗi khi gửi email khôi phục mật khẩu.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}

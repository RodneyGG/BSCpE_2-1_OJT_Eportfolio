<?php
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CompanyController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\BlockController;
use App\Http\Controllers\Api\AccountSetupController;
use App\Http\Controllers\Api\PasswordResetController;
use App\Http\Controllers\Api\ActivityLogController;
// Public routes
Route::post('/login', [AuthController::class, 'login']);
Route::get('/companies', [CompanyController::class, 'index']);
Route::get('/block', [BlockController::class, 'show']);
Route::post('/setup-account', [AccountSetupController::class, 'complete']);
Route::post('/forgot-password', [PasswordResetController::class, 'request']);
Route::post('/reset-password', [PasswordResetController::class, 'complete']);
// Google OAuth
Route::get('/google/callback', [\App\Http\Controllers\Api\GoogleOAuthController::class, 'callback']);
use App\Http\Controllers\Api\DocumentController;
use App\Http\Controllers\Api\NotificationController;
// Protected routes (require Sanctum token)
Route::middleware('auth:sanctum')->group(function () {
    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::patch('/profile', [AuthController::class, 'updateProfile']);
    Route::post('/change-password', [AuthController::class, 'changePassword']);
    Route::patch('/admin/block', [BlockController::class, 'update'])->middleware('role:admin');
    Route::get('/students', [UserController::class, 'index']);
    // Google Auth
    Route::get('/google/auth', [\App\Http\Controllers\Api\GoogleOAuthController::class, 'redirect']);
    Route::get('/google/status', [\App\Http\Controllers\Api\GoogleOAuthController::class, 'status']);
    // Companies
    Route::get('/companies/{company}', [CompanyController::class, 'show']);
    Route::patch('/companies/{company}/address', [CompanyController::class, 'updateAddress']);
    Route::delete('/admin/companies/{company}', [CompanyController::class, 'destroy'])->middleware('role:admin');
    Route::post('/admin/companies/sync', [CompanyController::class, 'sync'])->middleware('role:admin');
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::patch('/notifications/read-all', [NotificationController::class, 'markAllAsRead']);
    Route::patch('/notifications/{notification}/read', [NotificationController::class, 'markAsRead']);
    
    // Documents
    Route::post('/documents/upload', [DocumentController::class, 'upload']);
    Route::get('/documents/mine', [DocumentController::class, 'mine']);
    Route::delete('/documents/{document}', [DocumentController::class, 'destroy']);
    Route::get('/documents/pending', [DocumentController::class, 'pending'])->middleware('role:admin,prof');
    Route::patch('/documents/{document}/review', [DocumentController::class, 'review'])->middleware('role:admin,prof');
    // OJT Submission Checklist (admin + prof)
    Route::get('/admin/checklist', [UserController::class, 'checklist'])->middleware('role:admin,prof');
    // User management (admin only)
    Route::get('/admin/users', [UserController::class, 'index'])->middleware('role:admin');
    Route::post('/admin/users', [UserController::class, 'store'])->middleware('role:admin');
    Route::patch('/admin/users/{user}/reset-password', [UserController::class, 'resetPassword'])->middleware('role:admin');
    Route::patch('/admin/users/{user}/toggle-review', [UserController::class, 'toggleReview'])->middleware('role:admin');
    Route::patch('/admin/users/{user}/deactivate', [UserController::class, 'deactivate'])->middleware('role:admin');
    Route::patch('/admin/users/{user}/reactivate', [UserController::class, 'reactivate'])->middleware('role:admin');
    Route::get('/admin/users/{user}', [UserController::class, 'show'])->middleware('role:admin,prof');
    Route::post('/admin/users/{user}/resend-setup', [UserController::class, 'resendSetup'])->middleware('role:admin');
    Route::delete('/admin/users/{user}', [UserController::class, 'destroy'])->middleware('role:admin');
    Route::get('/admin/activity-logs', [ActivityLogController::class, 'index'])->middleware('role:admin');
});
<?php

use App\Http\Controllers\Api\AccountSetupController;
use App\Http\Controllers\Api\ActivityLogController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BlockController;
use App\Http\Controllers\Api\CompanyController;
use App\Http\Controllers\Api\DeploymentController;
use App\Http\Controllers\Api\DocumentController;
use App\Http\Controllers\Api\GoogleOAuthController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\PasswordResetController;
use App\Http\Controllers\Api\UserController;
use Illuminate\Support\Facades\Route;

// Public routes
Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:10,1');
Route::get('/companies', [CompanyController::class, 'index']);
Route::get('/block', [BlockController::class, 'show']);
Route::post('/setup-account', [AccountSetupController::class, 'complete'])->middleware('throttle:10,1');
Route::post('/forgot-password', [PasswordResetController::class, 'request'])->middleware('throttle:5,1');
Route::post('/reset-password', [PasswordResetController::class, 'complete'])->middleware('throttle:10,1');

// Google OAuth Public Callback
Route::get('/google/callback', [GoogleOAuthController::class, 'callback']);

// Protected routes (require Sanctum token)
Route::middleware('auth:sanctum')->group(function () {
    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::patch('/profile', [AuthController::class, 'updateProfile']);
    Route::post('/profile/picture', [AuthController::class, 'uploadProfilePicture']);
    Route::delete('/profile/picture', [AuthController::class, 'deleteProfilePicture']);
    Route::post('/change-password', [AuthController::class, 'changePassword']);
    Route::get('/students', [UserController::class, 'index']);
    
    // Google Auth
    Route::get('/google/auth', [GoogleOAuthController::class, 'redirect']);
    Route::get('/google/status', [GoogleOAuthController::class, 'status']);
    Route::delete('/google/disconnect', [GoogleOAuthController::class, 'disconnect']);

    // Companies
    Route::get('/companies/{company}', [CompanyController::class, 'show']);
    Route::patch('/companies/{company}/address', [CompanyController::class, 'updateAddress']);
    Route::delete('/admin/companies/{company}', [CompanyController::class, 'destroy'])->middleware('role:admin');
    Route::post('/admin/companies/sync', [CompanyController::class, 'sync'])->middleware('role:admin');
    Route::get('/admin/companies/roster-sheet-url', [CompanyController::class, 'getRosterSheetUrl'])->middleware('role:admin');
    Route::patch('/admin/companies/roster-sheet-url', [CompanyController::class, 'updateRosterSheetUrl'])->middleware('role:admin');
    // Notifications
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::patch('/notifications/read-all', [NotificationController::class, 'markAllAsRead']);
    Route::patch('/notifications/{notification}/read', [NotificationController::class, 'markAsRead']);
    Route::delete('/notifications/{notification}', [NotificationController::class, 'destroy']);

    // Documents
    Route::post('/documents/upload', [DocumentController::class, 'upload']);
    Route::get('/documents/mine', [DocumentController::class, 'mine']);
    Route::delete('/documents/{document}', [DocumentController::class, 'destroy']);
    Route::get('/documents/pending', [DocumentController::class, 'pending'])->middleware('role:admin,prof');
    Route::patch('/documents/{document}/review', [DocumentController::class, 'review'])->middleware('role:admin,prof');

    // Deployments
    Route::get('/deployments/mine', [DeploymentController::class, 'mine']);
    Route::patch('/deployments/{deployment}/confirm', [DeploymentController::class, 'confirm']);
    Route::patch('/deployments/{deployment}/override', [DeploymentController::class, 'studentOverride']);
    Route::patch('/deployments/{deployment}', [DeploymentController::class, 'update']);
    Route::get('/admin/deployments/export', [DeploymentController::class, 'exportCsv'])->middleware('role:admin,prof');

    // OJT Submission Checklist (admin + prof)
    Route::get('/admin/checklist', [UserController::class, 'checklist'])->middleware('role:admin,prof');

    // User & Admin Management
    Route::patch('/admin/block', [BlockController::class, 'update'])->middleware('role:admin');
    Route::get('/admin/users', [UserController::class, 'index'])->middleware('role:admin');
    Route::post('/admin/users', [UserController::class, 'store'])->middleware('role:admin');
    Route::get('/admin/students/bulk-import/preview', [UserController::class, 'previewBulkImport'])->middleware('role:admin');
    Route::post('/admin/students/bulk-import/commit', [UserController::class, 'commitBulkImport'])->middleware('role:admin');
    Route::post('/admin/students/bulk-import/preview-file', [UserController::class, 'previewBulkImportFile'])->middleware('role:admin');
    Route::post('/admin/students/bulk-import/commit-file', [UserController::class, 'commitBulkImportFile'])->middleware('role:admin');    Route::patch('/admin/users/{user}/reset-password', [UserController::class, 'resetPassword'])->middleware('role:admin');
    Route::patch('/admin/users/{user}/toggle-review', [UserController::class, 'toggleReview'])->middleware('role:admin');
    Route::patch('/admin/users/{user}/deactivate', [UserController::class, 'deactivate'])->middleware('role:admin');
    Route::patch('/admin/users/{user}/reactivate', [UserController::class, 'reactivate'])->middleware('role:admin');
    Route::get('/admin/users/{user}', [UserController::class, 'show'])->middleware('role:admin,prof');
    Route::patch('/admin/deployments/{deployment}/override', [DeploymentController::class, 'adminOverride'])->middleware('role:admin');
    Route::post('/admin/users/{user}/resend-setup', [UserController::class, 'resendSetup'])->middleware('role:admin');
    Route::delete('/admin/users/{user}', [UserController::class, 'destroy'])->middleware('role:admin');
    Route::get('/admin/activity-logs', [ActivityLogController::class, 'index'])->middleware('role:admin');
    Route::patch('/admin/users/{user}/company', [UserController::class, 'updateCompany'])->middleware('role:admin');
});
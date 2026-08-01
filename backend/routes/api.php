<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CompanyController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\BlockController;

// Public routes
Route::post('/login', [AuthController::class, 'login']);
Route::get('/companies', [CompanyController::class, 'index']);
Route::get('/block', [BlockController::class, 'show']);
// Google OAuth
Route::get('/google/callback', [\App\Http\Controllers\Api\GoogleOAuthController::class, 'callback']);

use App\Http\Controllers\Api\DocumentController;

// Protected routes (require Sanctum token)
Route::middleware('auth:sanctum')->group(function () {
    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::patch('/profile', [AuthController::class, 'updateProfile']);
    Route::post('/change-password', [AuthController::class, 'changePassword']);
    Route::post('/select-company', [AuthController::class, 'selectCompany']);
    Route::patch('/admin/block', [BlockController::class, 'update'])->middleware('role:admin');
    Route::get('/students', [UserController::class, 'index']);

    // Google Auth
    Route::get('/google/auth', [\App\Http\Controllers\Api\GoogleOAuthController::class, 'redirect']);

    // Companies
    Route::get('/companies/{company}', [CompanyController::class, 'show']);
    Route::patch('/companies/{company}/address', [CompanyController::class, 'updateAddress']);

    // Documents
    Route::post('/documents/upload', [DocumentController::class, 'upload']);
    Route::get('/documents/mine', [DocumentController::class, 'mine']);
    Route::get('/documents/pending', [DocumentController::class, 'pending'])->middleware('role:prof');
    Route::patch('/documents/{document}/review', [DocumentController::class, 'review'])->middleware('role:admin,prof');

    // User management (admin + prof)
    Route::get('/admin/users', [UserController::class, 'index'])->middleware('role:admin,prof');
    Route::post('/admin/users', [UserController::class, 'store'])->middleware('role:admin,prof');
    Route::patch('/admin/users/{user}/reset-password', [UserController::class, 'resetPassword'])->middleware('role:admin,prof');
    Route::patch('/admin/users/{user}/toggle-review', [UserController::class, 'toggleReview'])->middleware('role:prof');
    Route::patch('/admin/users/{user}/deactivate', [UserController::class, 'deactivate'])->middleware('role:admin,prof');
    Route::patch('/admin/users/{user}/reactivate', [UserController::class, 'reactivate'])->middleware('role:admin,prof');
    Route::get('/admin/users/{user}', [UserController::class, 'show'])->middleware('role:admin,prof');
});
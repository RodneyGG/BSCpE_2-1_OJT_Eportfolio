<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CompanyController;
use Illuminate\Support\Facades\Route;

// Public routes
Route::post('/login', [AuthController::class, 'login']);
Route::get('/companies', [CompanyController::class, 'index']);

// Google OAuth
Route::get('/google/callback', [\App\Http\Controllers\Api\GoogleOAuthController::class, 'callback']);

use App\Http\Controllers\Api\DocumentController;

// Protected routes (require Sanctum token)
Route::middleware('auth:sanctum')->group(function () {
    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/change-password', [AuthController::class, 'changePassword']);
    Route::post('/select-company', [AuthController::class, 'selectCompany']);

    // Google Auth
    Route::get('/google/auth', [\App\Http\Controllers\Api\GoogleOAuthController::class, 'redirect']);

    // Companies
    Route::get('/companies/{company}', [CompanyController::class, 'show']);
    Route::patch('/companies/{company}/address', [CompanyController::class, 'updateAddress']);

    // Documents
    Route::post('/documents/upload', [DocumentController::class, 'upload']);
    Route::get('/documents/mine', [DocumentController::class, 'mine']);
    Route::get('/documents/pending', [DocumentController::class, 'pending'])->middleware('role:prof');
    Route::patch('/documents/{document}/review', [DocumentController::class, 'review'])->middleware('role:prof');
});
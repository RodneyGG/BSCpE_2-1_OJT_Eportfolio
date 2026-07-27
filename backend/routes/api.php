<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CompanyController;
use Illuminate\Support\Facades\Route;

// Public routes
Route::post('/login', [AuthController::class, 'login']);

use App\Http\Controllers\Api\DocumentController;

// Protected routes (require Sanctum token)
Route::middleware('auth:sanctum')->group(function () {
    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/change-password', [AuthController::class, 'changePassword']);
    Route::post('/select-company', [AuthController::class, 'selectCompany']);

    // Companies
    Route::get('/companies', [CompanyController::class, 'index']);
    Route::get('/companies/{company}', [CompanyController::class, 'show']);
    Route::patch('/companies/{company}/address', [CompanyController::class, 'updateAddress']);

    // Documents
    Route::post('/documents/upload', [DocumentController::class, 'upload']);
});

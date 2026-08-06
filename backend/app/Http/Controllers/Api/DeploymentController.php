<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ConfirmDeploymentRequest;
use App\Models\Deployment;
use App\Services\DeploymentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DeploymentController extends Controller
{
    protected DeploymentService $deploymentService;

    public function __construct(DeploymentService $deploymentService)
    {
        $this->deploymentService = $deploymentService;
    }

    public function mine(Request $request): JsonResponse
    {
        $deployment = $this->deploymentService->getForUser($request->user());

        return response()->json([
            'deployment' => $deployment,
        ]);
    }

    public function confirm(ConfirmDeploymentRequest $request, Deployment $deployment): JsonResponse
    {
        $updated = $this->deploymentService->confirm(
            $deployment,
            $request->user(),
            $request->validated()
        );

        return response()->json([
            'message' => 'Deployment confirmed successfully',
            'deployment' => $updated,
        ]);
    }
}
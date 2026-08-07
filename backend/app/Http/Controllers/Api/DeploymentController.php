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

    public function update(ConfirmDeploymentRequest $request, Deployment $deployment): JsonResponse
    {
        $updated = $this->deploymentService->update(
            $deployment,
            $request->user(),
            $request->validated()
        );
        return response()->json([
            'message' => 'Deployment updated successfully',
            'deployment' => $updated,
        ]);
    }
    public function adminOverride(ConfirmDeploymentRequest $request, Deployment $deployment): JsonResponse
    {
        $updated = $this->deploymentService->adminOverride(
            $deployment,
            $request->validated()
        );
        return response()->json([
            'message' => 'Deployment updated by admin',
            'deployment' => $updated,
        ]);
    }
    public function export(): \Symfony\Component\HttpFoundation\StreamedResponse
    {
    $csvData = $this->deploymentService->exportConfirmedCsv();
    $filename = 'confirmed_deployments_' . now()->format('Y-m-d_His') . '.csv';

    return response()->streamDownload(function () use ($csvData) {
        echo $csvData;
    }, $filename, [
        'Content-Type' => 'text/csv; charset=UTF-8',
        'Cache-Control' => 'no-cache, no-store, must-revalidate',
        'Pragma' => 'no-cache',
        'Expires' => '0',
    ]);
    }
    /**
     * Export confirmed deployments as CSV.
     */
    public function exportCsv()
    {
        $csvData = $this->deploymentService->exportConfirmedCsv();

        return response($csvData, 200, [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="confirmed_deployments_' . now()->format('Y-m-d') . '.csv"',
        ]);
    }
}
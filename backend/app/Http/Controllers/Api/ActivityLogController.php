<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
class ActivityLogController extends Controller
{
    /**
     * Returns the most recent activity log entries, newest first.
     * Admin only (route middleware). Capped at 200 rows — this app's
     * activity volume (admin-driven user management actions only,
     * not high-frequency events) makes a hard limit simpler than
     * introducing pagination as a one-off pattern in this codebase.
     */
    public function index(Request $request)
    {
        $logs = ActivityLog::with([
                'actor:id,name,email',
                'target:id,name,email',
            ])
            ->orderBy('created_at', 'desc')
            ->limit(200)
            ->get();
        return response()->json($logs);
    }
}
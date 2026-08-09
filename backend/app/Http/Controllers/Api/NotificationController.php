<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Notification;

class NotificationController extends Controller
{
    public function index(Request $request)
    {
        // Cleanup expired read notifications (older than 5 seconds)
        Notification::where('user_id', $request->user()->id)
            ->whereNotNull('read_at')
            ->where('read_at', '<', now()->subSeconds(5))
            ->delete();

        $notifications = Notification::where('user_id', $request->user()->id)
            ->orderBy('created_at', 'desc')
            ->limit(50)
            ->get();
            
        $unreadCount = Notification::where('user_id', $request->user()->id)
            ->where('is_read', false)
            ->count();
            
        return response()->json([
            'notifications' => $notifications,
            'unread_count' => $unreadCount
        ]);
    }

    public function markAsRead(Request $request, Notification $notification)
    {
        if ($notification->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $notification->update([
            'is_read' => true,
            'read_at' => now(),
        ]);

        return response()->json([
            'notification' => $notification
        ]);
    }

    public function markAllAsRead(Request $request)
    {
        Notification::where('user_id', $request->user()->id)
            ->where('is_read', false)
            ->update([
                'is_read' => true,
                'read_at' => now(),
            ]);

        return response()->json([
            'message' => 'All notifications marked as read'
        ]);
    }

    public function destroy(Request $request, Notification $notification)
    {
        if ($notification->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $notification->delete();

        return response()->json([
            'message' => 'Notification deleted successfully'
        ]);
    }
}

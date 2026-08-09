<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class CookieAuthMiddleware
{
    public function handle(Request $request, Closure $next)
    {
        // 1. Extract Bearer token from HttpOnly cookie
        if ($token = $request->cookie('access_token')) {
            $request->headers->set('Authorization', 'Bearer ' . $token);
        }

        // 2. CSRF Protection for mutating requests
        if (in_array($request->method(), ['POST', 'PUT', 'PATCH', 'DELETE'])) {
            $exemptRoutes = ['api/login', 'api/setup-account', 'api/forgot-password', 'api/reset-password'];
            
            if (!$request->is(...$exemptRoutes)) {
                $csrfCookie = $request->cookie('csrf_token');
                $csrfHeader = $request->header('X-CSRF-TOKEN');
                
                if (!$csrfCookie || !$csrfHeader || !hash_equals($csrfCookie, $csrfHeader)) {
                    return response()->json(['message' => 'CSRF token mismatch'], 419);
                }
            }
        }

        return $next($request);
    }
}

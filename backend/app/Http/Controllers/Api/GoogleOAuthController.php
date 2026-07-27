<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\GoogleOAuthToken;
use Google\Client;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class GoogleOAuthController extends Controller
{
    protected Client $client;

    public function __construct()
    {
        $this->client = new Client();
        $this->client->setClientId(config('services.google_drive.client_id'));
        $this->client->setClientSecret(config('services.google_drive.client_secret'));
        $this->client->setRedirectUri(config('app.url') . '/api/google/callback');
        $this->client->addScope(\Google\Service\Drive::DRIVE);
        $this->client->setAccessType('offline');
        $this->client->setPrompt('consent');
    }

    /**
     * Generate Google OAuth login URL.
     */
    public function redirect(Request $request): JsonResponse
    {
        if (!$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $authUrl = $this->client->createAuthUrl();

        return response()->json([
            'auth_url' => $authUrl,
        ]);
    }

    /**
     * Handle the OAuth callback and save the token.
     */
    public function callback(Request $request)
    {
        $code = $request->query('code');

        if (!$code) {
            return response()->json(['message' => 'No authorization code provided'], 400);
        }

        $accessToken = $this->client->fetchAccessTokenWithAuthCode($code);

        if (array_key_exists('error', $accessToken)) {
            return response()->json(['message' => 'Error fetching access token', 'error' => $accessToken], 400);
        }

        // We assume we want to store one global token for the system, so we can use the first record or just create one.
        GoogleOAuthToken::truncate();

        GoogleOAuthToken::create([
            'access_token' => $accessToken['access_token'],
            'refresh_token' => $accessToken['refresh_token'] ?? null, // Refresh token is only given on first authorization
            'expires_in' => $accessToken['expires_in'],
            'created' => $accessToken['created'],
        ]);

        return response()->json([
            'message' => 'Google Drive authorized successfully! You can close this tab and return to the dashboard.',
        ]);
    }
}

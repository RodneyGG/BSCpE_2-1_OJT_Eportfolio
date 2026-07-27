<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'google_drive' => [
        'folder_id' => env('GOOGLE_DRIVE_FOLDER_ID'),
        'credentials' => [
            'type' => env('GOOGLE_DRIVE_TYPE', 'service_account'),
            'project_id' => env('GOOGLE_DRIVE_PROJECT_ID'),
            'private_key_id' => env('GOOGLE_DRIVE_PRIVATE_KEY_ID'),
            'private_key' => str_replace('\\n', "\n", env('GOOGLE_DRIVE_PRIVATE_KEY', '')),
            'client_email' => env('GOOGLE_DRIVE_CLIENT_EMAIL'),
            'client_id' => env('GOOGLE_DRIVE_CLIENT_ID'),
            'auth_uri' => env('GOOGLE_DRIVE_AUTH_URI', 'https://accounts.google.com/o/oauth2/auth'),
            'token_uri' => env('GOOGLE_DRIVE_TOKEN_URI', 'https://oauth2.googleapis.com/token'),
            'auth_provider_x509_cert_url' => env('GOOGLE_DRIVE_AUTH_PROVIDER_CERT_URL', 'https://www.googleapis.com/oauth2/v1/certs'),
            'client_x509_cert_url' => env('GOOGLE_DRIVE_CLIENT_CERT_URL'),
            'universe_domain' => env('GOOGLE_DRIVE_UNIVERSE_DOMAIN', 'googleapis.com'),
        ],
    ],

];

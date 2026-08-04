<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class AccountSetupMail extends Mailable
{
    use Queueable, SerializesModels;

    public string $setupUrl;

    /**
     * Create a new message instance.
     */
    public function __construct(
        public User $user,
        string $plainToken,
    ) {
        $this->setupUrl = rtrim(config('app.url'), '/') . '/setup-account?' . http_build_query([
            'uid' => $user->id,
            'token' => $plainToken,
        ]);
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Set Up Your OJT E-Portfolio Account',
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            markdown: 'emails.account-setup',
            with: [
                'name' => $this->user->name,
                'setupUrl' => $this->setupUrl,
            ],
        );
    }
}
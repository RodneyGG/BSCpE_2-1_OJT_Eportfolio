<?php
namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class PasswordResetMail extends Mailable
{
    use Queueable, SerializesModels;

    public string $resetUrl;

    /**
     * Create a new message instance.
     */
    public function __construct(
        public User $user,
        string $plainToken,
    ) {
        $this->resetUrl = rtrim(config('app.url'), '/') . '/reset-password?' . http_build_query([
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
            subject: 'Reset Your OJT E-Portfolio Password',
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            markdown: 'emails.password-reset',
            with: [
                'name' => $this->user->name,
                'resetUrl' => $this->resetUrl,
            ],
        );
    }
}
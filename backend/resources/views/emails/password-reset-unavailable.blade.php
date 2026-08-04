@component('mail::message')
# Password Reset Request Received
Hi {{ $name }},
We received a request to reset the password for your OJT E-Portfolio account. Self-service password reset isn't available for admin or professor accounts.
Please contact your system administrator directly to have your password reset.
If you didn't request this, you can safely ignore this email — no changes have been made to your account.
Thanks,<br>
{{ config('app.name') }}
@endcomponent
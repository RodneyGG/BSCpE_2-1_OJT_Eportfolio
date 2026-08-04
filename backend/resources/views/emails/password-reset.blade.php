@component('mail::message')
# Reset Your Password
Hi {{ $name }},
We received a request to reset your password on the OJT E-Portfolio system. Click the button below to choose a new password.
@component('mail::button', ['url' => $resetUrl])
Reset My Password
@endcomponent
This link will expire in **1 hour**. If it expires before you use it, you can request a new one from the login page.
If you didn't request a password reset, you can safely ignore this email — your password will not be changed.
Thanks,<br>
{{ config('app.name') }}
@endcomponent
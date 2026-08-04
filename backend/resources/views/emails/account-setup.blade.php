@component('mail::message')
# Welcome to the OJT E-Portfolio

Hi {{ $name }},

An account has been created for you on the OJT E-Portfolio system. To get started, set your password using the button below.

@component('mail::button', ['url' => $setupUrl])
Set Up My Account
@endcomponent

This link will expire in **7 days**. If it expires before you use it, ask your administrator to resend the setup email.

If you weren't expecting this email, you can safely ignore it.

Thanks,<br>
{{ config('app.name') }}
@endcomponent
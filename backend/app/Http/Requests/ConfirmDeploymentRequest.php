<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ConfirmDeploymentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // ownership checked in DeploymentService::confirm
    }

    public function rules(): array
    {
        return [
            'role' => ['nullable', 'string', 'max:255'],
            'supervisor_name' => ['nullable', 'string', 'max:255'],
            'supervisor_contact' => ['nullable', 'string', 'max:255'],
            'start_date' => ['nullable', 'date'],
            'end_date' => ['nullable', 'date', 'after_or_equal:start_date'],
        ];
    }
}
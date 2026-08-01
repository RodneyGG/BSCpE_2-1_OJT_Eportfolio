<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UploadDocumentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'document' => ['required', 'file', 'mimes:pdf', 'max:10240'],
            'document_type' => ['required', 'string'],
            'claimed_hours' => ['required_if:document_type,dtr', 'nullable', 'numeric', 'min:0', 'max:9999.99'],

        ];
    }
}
<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'name' => is_string($this->input('name')) ? trim($this->input('name')) : $this->input('name'),
            'phone' => is_string($this->input('phone')) && trim($this->input('phone')) !== ''
                ? preg_replace('/[\s-]+/', '', $this->input('phone'))
                : null,
        ]);
    }

    /**
     * Only name & phone are editable. Role, status and email are never accepted here.
     *
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'min:2', 'max:100'],
            // Indonesian phone format: 08xxxxxxxx or +628xxxxxxxx (9–13 digits after the prefix "0"/"+62").
            'phone' => ['nullable', 'string', 'regex:/^(\+62|0)8[0-9]{7,12}$/'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'phone.regex' => 'Format nomor HP tidak valid (contoh: 081234567890 atau +6281234567890).',
        ];
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return ['name' => 'nama', 'phone' => 'nomor HP'];
    }
}

<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
class Deployment extends Model
{
    use HasFactory;
    protected $fillable = [
        'user_id',
        'company_id',
        'role',
        'supervisor_name',
        'supervisor_contact',
        'start_date',
        'end_date',
        'source',
        'status',
        'detected_at',
        'confirmed_at',
        'confirmed_by',
        'is_manually_overridden',
    ];
    protected function casts(): array
    {
        return [
            'start_date' => 'date',
            'end_date' => 'date',
            'detected_at' => 'datetime',
            'confirmed_at' => 'datetime',
            'is_manually_overridden' => 'boolean',
        ];
    }
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }
    public function confirmedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'confirmed_by');
    }
    public function isPendingConfirmation(): bool
    {
        return $this->status === 'pending_confirmation';
    }
    public function isConfirmed(): bool
    {
        return $this->status === 'confirmed';
    }
    public function isManual(): bool
    {
        return $this->source === 'manual';
    }
    public function isManuallyOverridden(): bool
    {
        return $this->is_manually_overridden === true;
    }
}
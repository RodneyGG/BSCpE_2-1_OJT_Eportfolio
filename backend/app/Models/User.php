<?php
namespace App\Models;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Relations\HasMany;
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'company_id',
        'ojt_role',
        'ojt_supervisor',
        'emergency_contact_name',
        'emergency_contact_number',
        'hours_rendered',
        'required_hours',
        'ojt_start_date',
        'ojt_end_date',
        'must_change_password',
        'can_review',
        'is_active',
    ];
    protected $hidden = [
        'password',
        'remember_token',
    ];
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'must_change_password' => 'boolean',
            'can_review' => 'boolean',
            'is_active' => 'boolean',
            'hours_rendered' => 'decimal:2',
        ];
    }
    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }
    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }
    public function isProfessor(): bool
    {
        return $this->role === 'prof';
    }
    public function isStudent(): bool
    {
        return $this->role === 'normal';
    }
    public function documents(): HasMany
    {
        return $this->hasMany(Document::class);
    }
    public function accountSetupToken(): HasOne
    {
        return $this->hasOne(AccountSetupToken::class);
    }
    public function deployments(): HasMany
    {
    return $this->hasMany(Deployment::class);
    }
}
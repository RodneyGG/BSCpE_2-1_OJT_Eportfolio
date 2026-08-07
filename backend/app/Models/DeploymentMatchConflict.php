<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DeploymentMatchConflict extends Model
{
    protected $fillable = [
        'user_id',
        'candidate_deployment_ids',
        'resolved_at',
    ];

    protected function casts(): array
    {
        return [
            'candidate_deployment_ids' => 'array',
            'resolved_at' => 'datetime',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}

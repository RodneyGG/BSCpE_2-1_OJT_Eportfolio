<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Block extends Model
{
    use HasFactory;

    protected $fillable = [
        'block_code',
        'block_name',
        'adviser_name',
        'adviser_document_file_id',
        'adviser_document_link',
    ];
}
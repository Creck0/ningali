<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email')->unique();
            $table->string('password');
            $table->enum('role', ['admin', 'approver']);
            $table->foreignId('region_id')->nullable()->constrained('regions')->nullOnDelete();
            // Only relevant when role = approver: 1 = level 1 (e.g. direct supervisor), 2 = level 2 (e.g. dept head)
            $table->unsignedTinyInteger('approval_level')->nullable();
            $table->rememberToken();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};

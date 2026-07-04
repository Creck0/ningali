<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('booking_approvals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('booking_id')->constrained('bookings')->cascadeOnDelete();
            $table->foreignId('approver_id')->constrained('users');
            $table->unsignedTinyInteger('level'); // 1 or 2
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
            $table->string('note')->nullable();
            $table->timestamp('decided_at')->nullable();
            $table->timestamps();

            $table->unique(['booking_id', 'level']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('booking_approvals');
    }
};

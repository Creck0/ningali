<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('vehicles', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique(); // e.g. VH-001
            $table->string('plate_number');
            $table->enum('type', ['passenger', 'goods']); // angkutan orang / angkutan barang
            $table->enum('ownership', ['owned', 'rented']);
            $table->string('rental_company')->nullable();
            $table->foreignId('region_id')->nullable()->constrained('regions')->nullOnDelete();
            $table->enum('status', ['available', 'in_use', 'maintenance'])->default('available');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('vehicles');
    }
};

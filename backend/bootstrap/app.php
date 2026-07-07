<?php

use App\Http\Middleware\EnsureRole;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;
use Throwable;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__ . '/../routes/web.php',
        api: __DIR__ . '/../routes/api.php',
        commands: __DIR__ . '/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->alias([
            'role' => EnsureRole::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        $exceptions->render(function (Throwable $e, Request $request) {
            if (! $request->is('api/*') && ! $request->expectsJson()) {
                return null; // biarkan Laravel handle halaman error web/blade seperti biasa
            }

            // Error validasi -> tetap kasih detail field mana yang salah, ini aman ditampilkan
            if ($e instanceof ValidationException) {
                return response()->json([
                    'message' => 'Data yang dikirim tidak valid.',
                    'errors' => $e->errors(),
                ], 422);
            }

            if ($e instanceof AuthenticationException) {
                return response()->json([
                    'message' => 'Sesi tidak valid, silakan login kembali.',
                ], 401);
            }

            if ($e instanceof AuthorizationException) {
                return response()->json([
                    'message' => 'Anda tidak memiliki akses untuk melakukan aksi ini.',
                ], 403);
            }

            if ($e instanceof ModelNotFoundException || $e instanceof NotFoundHttpException) {
                return response()->json([
                    'message' => 'Data yang diminta tidak ditemukan.',
                ], 404);
            }

            // HTTP exception lain (403, 405, dsb) -> tampilkan pesannya, biasanya sudah aman
            if ($e instanceof HttpExceptionInterface) {
                return response()->json([
                    'message' => $e->getMessage() ?: 'Terjadi kesalahan pada server.',
                ], $e->getStatusCode());
            }

            // Semua error tak terduga lainnya (termasuk QueryException / DB connection refused)
            // -> jangan pernah bocorkan pesan asli/stack trace ke client
            report($e);

            return response()->json([
                'message' => 'Terjadi kesalahan pada server. Silakan coba lagi nanti.',
            ], 500);
        });
    })->create();

<?php

declare(strict_types=1);

namespace Core\Api;

use Throwable;

/**
 * Gestionnaire standardisé des réponses HTTP de l'API.
 * Règle d'or : Retourne toujours un statut HTTP 200 avec 3 arguments minimum dans le corps JSON.
 */
class Response
{
    /**
     * Émet une réponse JSON standardisée avec HTTP 200.
     *
     * @param bool $success Statut booléen de l'opération
     * @param int $code Code statut métier (200, 400, 404, 500)
     * @param mixed|null $data Données de retour en cas de succès
     * @param string|null $error Message explicite en cas d'erreur
     * @return void
     */
    public static function json(bool $success, int $code, mixed $data = null, ?string $error = null): void
    {
        http_response_code(200);
        header('Content-Type: application/json; charset=utf-8');

        $payload = [
            'success' => $success,
            'code' => $code,
        ];

        if ($success) {
            $payload['data'] = $data ?? [];
        } else {
            $payload['error'] = $error ?? 'Une erreur est survenue';
            if ($data !== null) {
                $payload['data'] = $data;
            }
        }

        echo json_encode($payload, JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
        exit;
    }

    /**
     * Raccourci pour une réponse JSON de succès.
     *
     * @param mixed $data Données retournées
     * @param int $code Code statut (200 par défaut)
     * @return void
     */
    public static function success(mixed $data = [], int $code = 200): void
    {
        self::json(true, $code, $data);
    }

    /**
     * Raccourci pour une réponse JSON d'erreur client.
     *
     * @param string $error Message d'erreur
     * @param int $code Code erreur (400, 401, 403, 404, 429)
     * @param mixed|null $data Données contextuelles facultatives
     * @return void
     */
    public static function error(string $error, int $code = 400, mixed $data = null): void
    {
        self::json(false, $code, $data, $error);
    }

    /**
     * Gère une erreur interne serveur (HTTP 500) avec cloisonnement hermétique en production.
     *
     * @param string $message Message d'erreur explicite en environnement de développement
     * @param Throwable|null $exception Exception d'origine facultative
     * @return void
     */
    public static function serverError(string $message = 'Une erreur interne est survenue', ?Throwable $exception = null): void
    {
        $env = Config::get('APP_ENV', 'development');
        $errorId = Logger::error($message, $exception);

        if ($env === 'production') {
            // RG-41 : Cloisonnement strict en production, aucune trace de stack ni message interne divulgué
            self::json(false, 500, ['error_id' => $errorId], "Une erreur interne est survenue. Code d'incident : {$errorId}");
        }

        $debugData = ['error_id' => $errorId];
        if ($exception !== null) {
            $debugData['exception'] = $exception->getMessage();
            $debugData['file'] = $exception->getFile();
            $debugData['line'] = $exception->getLine();
        }

        self::json(false, 500, $debugData, $message);
    }
}

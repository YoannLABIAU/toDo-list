<?php

declare(strict_types=1);

namespace Core\Api;

use Throwable;

/**
 * Service centralisé de journalisation pour l'audit de sécurité et les exceptions applicatives.
 */
class Logger
{
    /**
     * @var string Répertoire de stockage des journaux
     */
    private static string $logsDir = '';

    /**
     * Initialise et retourne le chemin absolu du répertoire des logs.
     *
     * @return string Chemin du dossier logs/
     */
    private static function getLogsDir(): string
    {
        if (empty(self::$logsDir)) {
            self::$logsDir = dirname(__DIR__, 2) . '/logs';
        }

        if (!is_dir(self::$logsDir)) {
            mkdir(self::$logsDir, 0777, true);
        }

        return self::$logsDir;
    }

    /**
     * Consigne un événement d'audit de sécurité dans logs/security.log.
     *
     * @param string $eventType Type d'événement (ex: RATE_LIMIT_EXCEEDED, CSRF_VIOLATION, IDOR_ATTEMPT, AUTH_FAILURE)
     * @param string $message Description concise de l'incident
     * @param array<string, mixed> $context Métadonnées additionnelles
     * @param string $level Gravité (INFO, WARNING, ALERT, CRITICAL)
     * @return void
     */
    public static function security(
        string $eventType,
        string $message,
        array $context = [],
        string $level = 'WARNING'
    ): void {
        $logsDir = self::getLogsDir();
        $logFile = $logsDir . '/security.log';

        $ip = $_SERVER['HTTP_X_FORWARDED_FOR'] ?? $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';
        if (str_contains($ip, ',')) {
            $parts = explode(',', $ip);
            $ip = trim($parts[0]);
        }

        $userId = Session::getUserId();
        $route = $_SERVER['REQUEST_URI'] ?? '/';

        $entry = [
            'timestamp' => date('Y-m-d H:i:s'),
            'level' => strtoupper($level),
            'event' => strtoupper($eventType),
            'ip' => $ip,
            'user_id' => $userId,
            'route' => $route,
            'details' => $message,
            'context' => $context,
        ];

        file_put_contents(
            $logFile,
            json_encode($entry, JSON_UNESCAPED_UNICODE) . "\n",
            FILE_APPEND | LOCK_EX
        );
    }

    /**
     * Consigne une erreur ou exception applicative dans logs/app.log et retourne un identifiant de corrélation unique.
     *
     * @param string $message Message descriptif
     * @param Throwable|null $exception Exception associée
     * @param array<string, mixed> $context Contexte additionnel
     * @return string Identifiant unique d'erreur généré
     */
    public static function error(
        string $message,
        ?Throwable $exception = null,
        array $context = []
    ): string {
        $logsDir = self::getLogsDir();
        $logFile = $logsDir . '/app.log';

        $errorId = 'sec-' . bin2hex(random_bytes(8));

        $entry = [
            'timestamp' => date('Y-m-d H:i:s'),
            'error_id' => $errorId,
            'message' => $message,
            'route' => $_SERVER['REQUEST_URI'] ?? '/',
            'user_id' => Session::getUserId(),
            'context' => $context,
        ];

        if ($exception !== null) {
            $entry['exception'] = [
                'type' => get_class($exception),
                'message' => $exception->getMessage(),
                'file' => $exception->getFile(),
                'line' => $exception->getLine(),
                'trace' => $exception->getTraceAsString(),
            ];
        }

        file_put_contents(
            $logFile,
            json_encode($entry, JSON_UNESCAPED_UNICODE) . "\n",
            FILE_APPEND | LOCK_EX
        );

        return $errorId;
    }
}

<?php

declare(strict_types=1);

namespace Core\Api;

use PDO;

/**
 * Service de limitation de débit (Rate Limiting) basé sur SQLite.
 */
class RateLimiter
{
    /**
     * Vérifie si une clé a dépassé le quota de requêtes autorisées.
     *
     * @param string $key Clé unique identifiant l'action et le client
     * @param int $maxAttempts Nombre maximal de tentatives
     * @param int $decaySeconds Durée de la fenêtre en secondes (900s = 15min)
     * @return bool Vrai si la requête doit être bloquée
     */
    public static function isRateLimited(string $key, int $maxAttempts = 5, int $decaySeconds = 900): bool
    {
        $pdo = Database::getInstance();
        $now = date('Y-m-d H:i:s');

        // Nettoyage des entrées expirées pour cette clé
        $stmt = $pdo->prepare('DELETE FROM rate_limits WHERE expires_at < :now');
        $stmt->execute([':now' => $now]);

        $stmt = $pdo->prepare('SELECT attempts, expires_at FROM rate_limits WHERE rate_key = :key LIMIT 1');
        $stmt->execute([':key' => $key]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$row) {
            return false;
        }

        $isLimited = (int) $row['attempts'] >= $maxAttempts;
        if ($isLimited) {
            Logger::security(
                'RATE_LIMIT_EXCEEDED',
                "Dépassement du quota de tentatives pour la clé : {$key}",
                ['key' => $key, 'attempts' => (int) $row['attempts'], 'expires_at' => $row['expires_at']],
                'WARNING'
            );
        }

        return $isLimited;
    }

    /**
     * Incrémente le compteur d'échecs pour une clé donnée.
     *
     * @param string $key
     * @param int $decaySeconds
     * @return void
     */
    public static function hit(string $key, int $decaySeconds = 900): void
    {
        $pdo = Database::getInstance();
        $now = date('Y-m-d H:i:s');
        $expiresAt = date('Y-m-d H:i:s', time() + $decaySeconds);

        $stmt = $pdo->prepare('SELECT id, attempts FROM rate_limits WHERE rate_key = :key LIMIT 1');
        $stmt->execute([':key' => $key]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($row) {
            $update = $pdo->prepare(<<<SQL
                UPDATE rate_limits 
                SET attempts = attempts + 1, 
                    last_attempt_at = :now, 
                    expires_at = :expires_at 
                WHERE id = :id
            SQL);
            $update->execute([
                ':now' => $now,
                ':expires_at' => $expiresAt,
                ':id' => $row['id']
            ]);
        } else {
            $insert = $pdo->prepare(<<<SQL
                INSERT INTO rate_limits (rate_key, attempts, last_attempt_at, expires_at)
                VALUES (:key, 1, :now, :expires_at)
            SQL);
            $insert->execute([
                ':key' => $key,
                ':now' => $now,
                ':expires_at' => $expiresAt
            ]);
        }
    }

    /**
     * Réinitialise le compteur d'une clé (ex: après connexion réussie).
     *
     * @param string $key
     * @return void
     */
    public static function clear(string $key): void
    {
        $pdo = Database::getInstance();
        $stmt = $pdo->prepare('DELETE FROM rate_limits WHERE rate_key = :key');
        $stmt->execute([':key' => $key]);
    }

    /**
     * Réinitialise l'ensemble de la table de limitation de débit.
     *
     * @return void
     */
    public static function resetAll(): void
    {
        $pdo = Database::getInstance();
        $pdo->exec('DELETE FROM rate_limits');
    }

    /**
     * Détermine l'adresse IP du client.
     *
     * @return string
     */
    public static function getClientIp(): string
    {
        return $_SERVER['HTTP_X_FORWARDED_FOR'] ?? $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';
    }
}

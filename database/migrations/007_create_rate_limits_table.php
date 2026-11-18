<?php

declare(strict_types=1);

/**
 * Migration pour la création de la table rate_limits dédiée à la limitation de débit.
 *
 * @param PDO $pdo
 * @return void
 */
function runRateLimitsMigration(PDO $pdo): void
{
    $pdo->exec(<<<SQL
    CREATE TABLE IF NOT EXISTS rate_limits (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        rate_key VARCHAR(150) NOT NULL UNIQUE,
        attempts INTEGER NOT NULL DEFAULT 1,
        last_attempt_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        expires_at DATETIME NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_rate_limits_key ON rate_limits(rate_key);
    CREATE INDEX IF NOT EXISTS idx_rate_limits_expires ON rate_limits(expires_at);
SQL);
}

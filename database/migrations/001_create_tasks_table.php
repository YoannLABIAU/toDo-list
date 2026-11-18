<?php

declare(strict_types=1);

/**
 * Migration pour la création de la table tasks et ses index.
 *
 * @param PDO $pdo
 * @return void
 */
function runTaskMigration(PDO $pdo): void
{
    $sql = <<<SQL
    CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title VARCHAR(255) NOT NULL,
        due_date DATE NULL,
        completed INTEGER NOT NULL DEFAULT 0,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_tasks_completed ON tasks(completed);
    CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
SQL;

    $pdo->exec($sql);
}

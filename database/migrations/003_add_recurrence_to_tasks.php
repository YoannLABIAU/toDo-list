<?php

declare(strict_types=1);

/**
 * Migration pour ajouter la colonne recurrence à la table tasks.
 *
 * @param PDO $pdo
 * @return void
 */
function runRecurrenceMigration(PDO $pdo): void
{
    $columns = $pdo->query('PRAGMA table_info(tasks)')->fetchAll(PDO::FETCH_ASSOC);
    $hasRecurrence = false;
    foreach ($columns as $column) {
        if (($column['name'] ?? '') === 'recurrence') {
            $hasRecurrence = true;
            break;
        }
    }

    if (!$hasRecurrence) {
        $pdo->exec("ALTER TABLE tasks ADD COLUMN recurrence VARCHAR(20) NOT NULL DEFAULT 'none';");
        $pdo->exec('CREATE INDEX IF NOT EXISTS idx_tasks_recurrence ON tasks(recurrence);');
    }
}

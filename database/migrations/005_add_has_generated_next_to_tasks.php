<?php

declare(strict_types=1);

/**
 * Migration 005 : Ajout de la colonne 'has_generated_next' à la table 'tasks'.
 *
 * @param PDO $db
 * @return void
 */
function runHasGeneratedNextMigration(PDO $db): void
{
    $stmt = $db->query("PRAGMA table_info(tasks)");
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    $existingColumns = array_column($columns, 'name');

    if (!in_array('has_generated_next', $existingColumns, true)) {
        $db->exec("ALTER TABLE tasks ADD COLUMN has_generated_next INTEGER DEFAULT 0;");
    }
}

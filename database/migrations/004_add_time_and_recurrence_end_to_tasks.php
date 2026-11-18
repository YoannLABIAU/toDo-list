<?php

declare(strict_types=1);

/**
 * Migration 004 : Ajout des colonnes 'due_time' et 'recurrence_end_date' à la table 'tasks'.
 *
 * @param PDO $db
 * @return void
 */
function runTimeAndRecurrenceEndMigration(PDO $db): void
{
    $stmt = $db->query("PRAGMA table_info(tasks)");
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    $existingColumns = array_column($columns, 'name');

    if (!in_array('due_time', $existingColumns, true)) {
        $db->exec("ALTER TABLE tasks ADD COLUMN due_time VARCHAR(5) DEFAULT NULL;");
    }

    if (!in_array('recurrence_end_date', $existingColumns, true)) {
        $db->exec("ALTER TABLE tasks ADD COLUMN recurrence_end_date DATE DEFAULT NULL;");
    }
}

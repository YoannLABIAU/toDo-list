<?php

declare(strict_types=1);

/**
 * Migration pour la création de la table categories et la liaison avec tasks.
 *
 * @param PDO $pdo
 * @return void
 */
function runCategoryMigration(PDO $pdo): void
{
    $pdo->exec(<<<SQL
    CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name VARCHAR(50) NOT NULL UNIQUE COLLATE NOCASE,
        color VARCHAR(20) NOT NULL DEFAULT 'indigo',
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_categories_name ON categories(name);
SQL);

    // Vérifier si la colonne category_id existe déjà dans tasks
    $columns = $pdo->query('PRAGMA table_info(tasks)')->fetchAll(PDO::FETCH_ASSOC);
    $hasCategoryId = false;
    foreach ($columns as $column) {
        if (($column['name'] ?? '') === 'category_id') {
            $hasCategoryId = true;
            break;
        }
    }

    if (!$hasCategoryId) {
        $pdo->exec('ALTER TABLE tasks ADD COLUMN category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL;');
        $pdo->exec('CREATE INDEX IF NOT EXISTS idx_tasks_category_id ON tasks(category_id);');
    }
}

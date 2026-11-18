<?php

declare(strict_types=1);

/**
 * Migration pour la création des tables d'authentification (users, password_resets)
 * et le rattachement de user_id aux tâches et catégories.
 *
 * @param PDO $pdo
 * @return void
 */
function runAuthMigration(PDO $pdo): void
{
    // 1. Table users
    $pdo->exec(<<<SQL
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        username VARCHAR(100) NOT NULL UNIQUE COLLATE NOCASE,
        email VARCHAR(255) NOT NULL UNIQUE COLLATE NOCASE,
        password_hash VARCHAR(255) NOT NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
SQL);

    // 2. Table password_resets
    $pdo->exec(<<<SQL
    CREATE TABLE IF NOT EXISTS password_resets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        otp_code VARCHAR(10) NOT NULL,
        expires_at DATETIME NOT NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_resets_user_id ON password_resets(user_id);
SQL);

    // 3. Utilisateur par défaut pour assurer la rétrocompatibilité
    $stmt = $pdo->query('SELECT COUNT(*) as cnt FROM users WHERE id = 1');
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    if ((int)($row['cnt'] ?? 0) === 0) {
        $defaultHash = password_hash('Admin123!', PASSWORD_BCRYPT);
        $insert = $pdo->prepare('INSERT INTO users (id, first_name, last_name, username, email, password_hash) VALUES (1, "Admin", "User", "admin", "admin@todo-list.fr", :hash)');
        $insert->execute([':hash' => $defaultHash]);
    }

    // 4. Colonne user_id sur tasks
    $taskColumns = $pdo->query('PRAGMA table_info(tasks)')->fetchAll(PDO::FETCH_ASSOC);
    $hasTaskUserId = false;
    foreach ($taskColumns as $col) {
        if (($col['name'] ?? '') === 'user_id') {
            $hasTaskUserId = true;
            break;
        }
    }
    if (!$hasTaskUserId) {
        $pdo->exec('ALTER TABLE tasks ADD COLUMN user_id INTEGER DEFAULT 1;');
        $pdo->exec('CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);');
    }

    // 5. Colonne user_id sur categories
    $catColumns = $pdo->query('PRAGMA table_info(categories)')->fetchAll(PDO::FETCH_ASSOC);
    $hasCatUserId = false;
    foreach ($catColumns as $col) {
        if (($col['name'] ?? '') === 'user_id') {
            $hasCatUserId = true;
            break;
        }
    }
    if (!$hasCatUserId) {
        $pdo->exec('ALTER TABLE categories ADD COLUMN user_id INTEGER DEFAULT 1;');
        $pdo->exec('CREATE INDEX IF NOT EXISTS idx_categories_user_id ON categories(user_id);');
    }
}

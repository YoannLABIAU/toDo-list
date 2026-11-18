<?php

declare(strict_types=1);

namespace Core\Api;

use PDO;
use PDOException;

/**
 * Singleton de gestion de la connexion PDO à la base de données.
 */
class Database
{
    /**
     * @var PDO|null Instance unique PDO
     */
    private static ?PDO $instance = null;

    /**
     * @var string Chemin par défaut du fichier SQLite
     */
    private static string $dbPath = __DIR__ . '/../../database/todo_list.sqlite';

    /**
     * Constructeur privé pour empêcher l'instanciation directe.
     */
    private function __construct()
    {
    }

    /**
     * Empêche le clonage du singleton.
     */
    private function __clone()
    {
    }

    /**
     * Récupère l'instance unique PDO.
     *
     * @return PDO Connexion PDO active
     */
    public static function getInstance(): PDO
    {
        if (self::$instance === null) {
            $configuredPath = Config::get('DB_PATH', 'database/todo_list.sqlite');
            if (!str_starts_with($configuredPath, '/') && !preg_match('#^[A-Za-z]:#', $configuredPath)) {
                self::$dbPath = dirname(__DIR__, 2) . '/' . ltrim($configuredPath, '/');
            } else {
                self::$dbPath = $configuredPath;
            }

            $dir = dirname(self::$dbPath);
            if (!is_dir($dir)) {
                mkdir($dir, 0777, true);
            }

            try {
                self::$instance = new PDO('sqlite:' . self::$dbPath);
                self::$instance->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
                self::$instance->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
                
                // RG-39 : Optimisation de concurrence SQLite (mode WAL, synchronous NORMAL, timeout 5s)
                self::$instance->exec('PRAGMA journal_mode = WAL;');
                self::$instance->exec('PRAGMA synchronous = NORMAL;');
                self::$instance->exec('PRAGMA busy_timeout = 5000;');
                self::$instance->exec('PRAGMA foreign_keys = ON;');
                
                self::runMigrations();
            } catch (PDOException $e) {
                http_response_code(200);
                header('Content-Type: application/json; charset=utf-8');
                echo json_encode([
                    'success' => false,
                    'code' => 500,
                    'error' => 'Erreur de connexion à la base de données : ' . $e->getMessage()
                ], JSON_THROW_ON_ERROR);
                exit;
            }
        }

        return self::$instance;
    }

    /**
     * Retourne le chemin absolu du fichier de base de données SQLite.
     *
     * @return string Chemin de la BDD
     */
    public static function getDbPath(): string
    {
        return self::$dbPath;
    }

    /**
     * Exécute les migrations pour initialiser le schéma si nécessaire.
     *
     * @return void
     */
    public static function runMigrations(): void
    {
        if (self::$instance === null) {
            return;
        }

        $migration1 = __DIR__ . '/../../database/migrations/001_create_tasks_table.php';
        if (file_exists($migration1)) {
            require_once $migration1;
            if (function_exists('runTaskMigration')) {
                runTaskMigration(self::$instance);
            }
        }

        $migration2 = __DIR__ . '/../../database/migrations/002_create_categories_table.php';
        if (file_exists($migration2)) {
            require_once $migration2;
            if (function_exists('runCategoryMigration')) {
                runCategoryMigration(self::$instance);
            }
        }

        $migration3 = __DIR__ . '/../../database/migrations/003_add_recurrence_to_tasks.php';
        if (file_exists($migration3)) {
            require_once $migration3;
            if (function_exists('runRecurrenceMigration')) {
                runRecurrenceMigration(self::$instance);
            }
        }

        $migration4 = __DIR__ . '/../../database/migrations/004_add_time_and_recurrence_end_to_tasks.php';
        if (file_exists($migration4)) {
            require_once $migration4;
            if (function_exists('runTimeAndRecurrenceEndMigration')) {
                runTimeAndRecurrenceEndMigration(self::$instance);
            }
        }

        $migration5 = __DIR__ . '/../../database/migrations/005_add_has_generated_next_to_tasks.php';
        if (file_exists($migration5)) {
            require_once $migration5;
            if (function_exists('runHasGeneratedNextMigration')) {
                runHasGeneratedNextMigration(self::$instance);
            }
        }

        $migration6 = __DIR__ . '/../../database/migrations/006_create_auth_tables.php';
        if (file_exists($migration6)) {
            require_once $migration6;
            if (function_exists('runAuthMigration')) {
                runAuthMigration(self::$instance);
            }
        }

        $migration7 = __DIR__ . '/../../database/migrations/007_create_rate_limits_table.php';
        if (file_exists($migration7)) {
            require_once $migration7;
            if (function_exists('runRateLimitsMigration')) {
                runRateLimitsMigration(self::$instance);
            }
        }
    }

    /**
     * Réinitialise complètement la base pour les tests E2E / QA.
     *
     * @return void
     */
    public static function resetDatabase(): void
    {
        $pdo = self::getInstance();
        $pdo->exec('DROP TABLE IF EXISTS rate_limits;');
        $pdo->exec('DROP TABLE IF EXISTS password_resets;');
        $pdo->exec('DROP TABLE IF EXISTS tasks;');
        $pdo->exec('DROP TABLE IF EXISTS categories;');
        $pdo->exec('DROP TABLE IF EXISTS users;');
        self::runMigrations();
    }
}

<?php

declare(strict_types=1);

namespace Module\Auth\AuthApi;

use Core\Api\Database;
use Core\Api\Logger;
use Core\Api\Response;
use Core\Api\Session;
use PDO;
use Throwable;

/**
 * Contrôleur de synchronisation et de migration des données locales (Guest Mode) vers la base de données.
 */
class SyncController
{
    /**
     * POST /api/v1/sync/import-local : Importe les catégories et tâches locales du visiteur dans son compte.
     *
     * @return void
     */
    public function importLocal(): void
    {
        $userId = Session::getUserId();
        if ($userId === null) {
            Response::error('Authentification requise pour synchroniser les données.', 401);
            return;
        }

        $raw = file_get_contents('php://input');
        $payload = json_decode($raw, true) ?? [];

        $categories = is_array($payload['categories'] ?? null) ? $payload['categories'] : [];
        $tasks = is_array($payload['tasks'] ?? null) ? $payload['tasks'] : [];

        $pdo = Database::getInstance();

        try {
            $pdo->beginTransaction();

            $categoryMap = []; // [local_id => db_id]
            $importedCategories = 0;
            $importedTasks = 0;

            // 1. Importation des catégories
            $findCatStmt = $pdo->prepare('SELECT id FROM categories WHERE name = :name AND user_id = :user_id LIMIT 1');
            $insertCatStmt = $pdo->prepare('INSERT INTO categories (name, color, user_id, created_at) VALUES (:name, :color, :user_id, :created_at)');

            foreach ($categories as $cat) {
                $name = trim((string)($cat['name'] ?? ''));
                $color = trim((string)($cat['color'] ?? 'indigo'));
                $localId = isset($cat['local_id']) ? (int)$cat['local_id'] : (isset($cat['id']) ? (int)$cat['id'] : null);

                if ($name === '') {
                    continue;
                }

                // Vérifier si une catégorie avec ce nom existe déjà pour cet utilisateur
                $findCatStmt->execute([':name' => $name, ':user_id' => $userId]);
                $existingId = $findCatStmt->fetchColumn();

                if ($existingId !== false && $existingId !== null) {
                    if ($localId !== null) {
                        $categoryMap[$localId] = (int)$existingId;
                    }
                } else {
                    $insertCatStmt->execute([
                        ':name' => $name,
                        ':color' => $color !== '' ? $color : 'indigo',
                        ':user_id' => $userId,
                        ':created_at' => date('Y-m-d H:i:s'),
                    ]);
                    $newCatId = (int)$pdo->lastInsertId();
                    if ($localId !== null) {
                        $categoryMap[$localId] = $newCatId;
                    }
                    $importedCategories++;
                }
            }

            // 2. Importation des tâches
            $insertTaskStmt = $pdo->prepare(<<<SQL
                INSERT INTO tasks (title, due_date, due_time, category_id, recurrence, recurrence_end_date, completed, has_generated_next, user_id, created_at)
                VALUES (:title, :due_date, :due_time, :category_id, :recurrence, :recurrence_end_date, :completed, :has_generated_next, :user_id, :created_at)
            SQL);

            foreach ($tasks as $task) {
                $title = trim((string)($task['title'] ?? ''));
                if ($title === '') {
                    continue;
                }

                $dueDate = !empty($task['due_date']) ? (string)$task['due_date'] : null;
                $dueTime = !empty($task['due_time']) ? (string)$task['due_time'] : null;
                $recurrence = !empty($task['recurrence']) ? (string)$task['recurrence'] : 'none';
                $recurrenceEndDate = !empty($task['recurrence_end_date']) ? (string)$task['recurrence_end_date'] : null;
                $completed = !empty($task['completed']) ? 1 : 0;
                $hasGeneratedNext = !empty($task['has_generated_next']) ? 1 : 0;

                // Résolution de la catégorie associée
                $catLocalId = isset($task['category_local_id']) ? (int)$task['category_local_id'] : (isset($task['category_id']) ? (int)$task['category_id'] : null);
                $dbCategoryId = ($catLocalId !== null && isset($categoryMap[$catLocalId])) ? $categoryMap[$catLocalId] : null;

                $insertTaskStmt->execute([
                    ':title' => $title,
                    ':due_date' => $dueDate,
                    ':due_time' => $dueTime,
                    ':category_id' => $dbCategoryId,
                    ':recurrence' => $recurrence,
                    ':recurrence_end_date' => $recurrenceEndDate,
                    ':completed' => $completed,
                    ':has_generated_next' => $hasGeneratedNext,
                    ':user_id' => $userId,
                    ':created_at' => date('Y-m-d H:i:s'),
                ]);

                $importedTasks++;
            }

            $pdo->commit();

            Logger::security(
                'DATA_MIGRATED',
                "Migration réussie des données locales : {$importedTasks} tâche(s), {$importedCategories} catégorie(s)",
                ['user_id' => $userId, 'tasks' => $importedTasks, 'categories' => $importedCategories],
                'INFO'
            );

            Response::success([
                'imported_categories' => $importedCategories,
                'imported_tasks' => $importedTasks,
                'message' => 'Données locales synchronisées avec succès.'
            ], 200);
        } catch (Throwable $e) {
            if ($pdo->inTransaction()) {
                $pdo->rollBack();
            }
            Response::serverError('Échec de la synchronisation des données locales : ' . $e->getMessage(), $e);
        }
    }
}

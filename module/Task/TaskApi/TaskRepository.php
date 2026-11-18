<?php

declare(strict_types=1);

namespace Module\Task\TaskApi;

use Core\Api\Database;
use PDO;

/**
 * Repository pour les opérations de persistance SQL de l'entité Task avec support des catégories et de la récurrence.
 */
class TaskRepository
{
    /**
     * @var PDO Instance PDO de connexion
     */
    private PDO $db;

    /**
     * Initialise le repository avec la connexion BDD.
     */
    public function __construct()
    {
        $this->db = Database::getInstance();
    }

    /**
     * Récupère la liste des tâches avec filtres optionnels de statut, de catégorie, de recherche et de tri.
     *
     * @param string|null $filter 'all' | 'todo' | 'completed'
     * @param int|null $categoryId Identifiant de la catégorie ou null pour toutes
     * @param string|null $search Terme de recherche textuelle sur le titre
     * @param string|null $sort 'due_asc' | 'name_asc' | 'name_desc'
     * @return array<int, array<string, mixed>>
     */
    public function findAll(?string $filter = null, ?int $categoryId = null, ?string $search = null, ?string $sort = 'due_asc', ?int $userId = null): array
    {
        $sql = 'SELECT tasks.id, tasks.title, tasks.due_date, tasks.due_time, tasks.completed, tasks.category_id, 
                       tasks.recurrence, tasks.recurrence_end_date, tasks.has_generated_next, tasks.user_id,
                       categories.name AS category_name, categories.color AS category_color,
                       tasks.created_at, tasks.updated_at 
                FROM tasks 
                LEFT JOIN categories ON tasks.category_id = categories.id 
                WHERE 1=1';

        $params = [];

        if ($userId !== null) {
            $sql .= ' AND tasks.user_id = :user_id';
            $params[':user_id'] = $userId;
        }

        if ($filter === 'todo') {
            $sql .= ' AND tasks.completed = 0';
        } elseif ($filter === 'completed') {
            $sql .= ' AND tasks.completed = 1';
        }

        if ($categoryId !== null) {
            $sql .= ' AND tasks.category_id = :category_id';
            $params[':category_id'] = $categoryId;
        }

        if ($search !== null && trim($search) !== '') {
            $sql .= ' AND tasks.title LIKE :search';
            $params[':search'] = '%' . trim($search) . '%';
        }

        if ($sort === 'name_asc') {
            $sql .= ' ORDER BY tasks.completed ASC, tasks.title COLLATE NOCASE ASC, tasks.id ASC';
        } elseif ($sort === 'name_desc') {
            $sql .= ' ORDER BY tasks.completed ASC, tasks.title COLLATE NOCASE DESC, tasks.id ASC';
        } else {
            // Tri par défaut RG-21 : Délai restant le plus court en tête
            $sql .= ' ORDER BY tasks.completed ASC, 
                               CASE WHEN tasks.due_date IS NULL THEN 1 ELSE 0 END ASC, 
                               tasks.due_date ASC, 
                               CASE WHEN tasks.due_time IS NULL THEN \'23:59\' ELSE tasks.due_time END ASC, 
                               tasks.id ASC';
        }

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);

        $results = [];
        while ($row = $stmt->fetch()) {
            $results[] = Task::fromArray($row)->toArray();
        }

        return $results;
    }

    /**
     * Recherche une tâche par son identifiant avec sa catégorie associée.
     *
     * @param int $id
     * @return array<string, mixed>|null
     */
    public function findById(int $id): ?array
    {
        $sql = 'SELECT tasks.id, tasks.title, tasks.due_date, tasks.due_time, tasks.completed, tasks.category_id, 
                       tasks.recurrence, tasks.recurrence_end_date, tasks.has_generated_next, tasks.user_id,
                       categories.name AS category_name, categories.color AS category_color,
                       tasks.created_at, tasks.updated_at 
                FROM tasks 
                LEFT JOIN categories ON tasks.category_id = categories.id 
                WHERE tasks.id = :id';

        $stmt = $this->db->prepare($sql);
        $stmt->execute([':id' => $id]);
        $row = $stmt->fetch();

        if (!$row) {
            return null;
        }

        return Task::fromArray($row)->toArray();
    }

    /**
     * Crée une nouvelle tâche avec catégorie, récurrence, horaire, fin de récurrence et utilisateur optionnels.
     *
     * @param string $title
     * @param string|null $dueDate
     * @param int|null $categoryId
     * @param string $recurrence 'none' | 'daily' | 'weekly' | 'monthly'
     * @param string|null $dueTime 'HH:MM'
     * @param string|null $recurrenceEndDate 'YYYY-MM-DD'
     * @param int|null $userId
     * @return array<string, mixed>
     */
    public function create(
        string $title, 
        ?string $dueDate = null, 
        ?int $categoryId = null, 
        string $recurrence = 'none',
        ?string $dueTime = null,
        ?string $recurrenceEndDate = null,
        ?int $userId = 1
    ): array {
        // RG-14 & RG-20 : Si récurrente ou horaire ciblé sans date, la date du jour est appliquée par défaut
        if (($recurrence !== 'none' || ($dueTime !== null && trim($dueTime) !== '')) && ($dueDate === null || trim($dueDate) === '')) {
            $dueDate = date('Y-m-d');
        }

        $stmt = $this->db->prepare(
            'INSERT INTO tasks (title, due_date, due_time, completed, category_id, recurrence, recurrence_end_date, user_id, created_at, updated_at) 
             VALUES (:title, :due_date, :due_time, 0, :category_id, :recurrence, :recurrence_end_date, :user_id, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)'
        );
        $stmt->execute([
            ':title' => $title,
            ':due_date' => $dueDate ?: null,
            ':due_time' => $dueTime ?: null,
            ':category_id' => $categoryId ?: null,
            ':recurrence' => $recurrence ?: 'none',
            ':recurrence_end_date' => $recurrenceEndDate ?: null,
            ':user_id' => $userId ?: 1,
        ]);

        $newId = (int)$this->db->lastInsertId();
        return $this->findById($newId) ?? [];
    }

    /**
     * Met à jour le titre, l'échéance, la catégorie, la récurrence, l'horaire et la fin de récurrence d'une tâche.
     *
     * @param int $id
     * @param string $title
     * @param string|null $dueDate
     * @param int|null $categoryId
     * @param string $recurrence
     * @param string|null $dueTime
     * @param string|null $recurrenceEndDate
     * @return array<string, mixed>|null
     */
    public function update(
        int $id, 
        string $title, 
        ?string $dueDate = null, 
        ?int $categoryId = null, 
        string $recurrence = 'none',
        ?string $dueTime = null,
        ?string $recurrenceEndDate = null
    ): ?array {
        $task = $this->findById($id);
        if ($task === null) {
            return null;
        }

        if (($recurrence !== 'none' || ($dueTime !== null && trim($dueTime) !== '')) && ($dueDate === null || trim($dueDate) === '')) {
            $dueDate = date('Y-m-d');
        }

        $stmt = $this->db->prepare(
            'UPDATE tasks 
             SET title = :title, due_date = :due_date, due_time = :due_time, 
                 category_id = :category_id, recurrence = :recurrence, recurrence_end_date = :recurrence_end_date,
                 updated_at = CURRENT_TIMESTAMP 
             WHERE id = :id'
        );
        $stmt->execute([
            ':title' => $title,
            ':due_date' => $dueDate ?: null,
            ':due_time' => $dueTime ?: null,
            ':category_id' => $categoryId ?: null,
            ':recurrence' => $recurrence ?: 'none',
            ':recurrence_end_date' => $recurrenceEndDate ?: null,
            ':id' => $id,
        ]);

        return $this->findById($id);
    }

    /**
     * Inverse l'état d'achèvement d'une tâche.
     * RG-15 : Si la tâche devient terminée et est récurrente, génère automatiquement la prochaine occurrence
     * RG-19 : Arrêt de récurrence si la prochaine occurrence dépasse recurrence_end_date.
     *
     * @param int $id
     * @return array<string, mixed>|null
     */
    public function toggle(int $id): ?array
    {
        $task = $this->findById($id);
        if ($task === null) {
            return null;
        }

        $wasCompleted = !empty($task['completed']);
        $newStatus = $wasCompleted ? 0 : 1;

        $stmt = $this->db->prepare(
            'UPDATE tasks 
             SET completed = :completed, updated_at = CURRENT_TIMESTAMP 
             WHERE id = :id'
        );
        $stmt->execute([
            ':completed' => $newStatus,
            ':id' => $id,
        ]);

        $updatedTask = $this->findById($id);
        if ($updatedTask === null) {
            return null;
        }

        // Si la tâche vient d'être marquée comme terminée et possède une récurrence active
        if (!$wasCompleted && !empty($task['recurrence']) && $task['recurrence'] !== 'none') {
            // RG-24 : Si cette occurrence a déjà généré sa descendance (ex: décoche/recoche), ne pas recréer de doublon
            if (!empty($task['has_generated_next'])) {
                $updatedTask['recurrence_generated'] = false;
                $updatedTask['recurrence_ended'] = false;
                return $updatedTask;
            }

            $nextDate = $this->calculateNextDueDate($task['due_date'], $task['recurrence']);

            // RG-19 : Vérification de la date de fin de récurrence
            if (!empty($task['recurrence_end_date']) && $nextDate > $task['recurrence_end_date']) {
                $updatedTask['recurrence_generated'] = false;
                $updatedTask['recurrence_ended'] = true;
            } else {
                // Garde-fou d'intégrité : vérifier si une tâche active avec même titre et date existe déjà
                $checkStmt = $this->db->prepare(
                    'SELECT id FROM tasks WHERE title = :title AND due_date = :due_date AND completed = 0 LIMIT 1'
                );
                $checkStmt->execute([
                    ':title' => $task['title'],
                    ':due_date' => $nextDate,
                ]);
                $existingNext = $checkStmt->fetch();

                if ($existingNext) {
                    $updatedTask['recurrence_generated'] = false;
                    $updatedTask['recurrence_ended'] = false;
                } else {
                    $nextTask = $this->create(
                        $task['title'],
                        $nextDate,
                        $task['category_id'],
                        $task['recurrence'],
                        $task['due_time'] ?? null,
                        $task['recurrence_end_date'] ?? null,
                        isset($task['user_id']) ? (int) $task['user_id'] : 1
                    );

                    $updatedTask['recurrence_generated'] = true;
                    $updatedTask['recurrence_ended'] = false;
                    $updatedTask['next_task'] = $nextTask;
                }

                // Marquer l'occurrence courante comme ayant généré sa suivante
                $genStmt = $this->db->prepare('UPDATE tasks SET has_generated_next = 1 WHERE id = :id');
                $genStmt->execute([':id' => $id]);
                $updatedTask['has_generated_next'] = true;
            }
        } else {
            $updatedTask['recurrence_generated'] = false;
            $updatedTask['recurrence_ended'] = false;
        }

        return $updatedTask;
    }

    /**
     * Calcule la prochaine date d'échéance selon la fréquence de récurrence.
     *
     * @param string|null $currentDueDate
     * @param string $recurrence
     * @return string
     */
    private function calculateNextDueDate(?string $currentDueDate, string $recurrence): string
    {
        $baseDate = $currentDueDate && $currentDueDate !== '' ? $currentDueDate : date('Y-m-d');
        $time = strtotime($baseDate);
        if ($time === false) {
            $time = time();
        }

        return match ($recurrence) {
            'daily' => date('Y-m-d', strtotime('+1 day', $time)),
            'weekly' => date('Y-m-d', strtotime('+7 days', $time)),
            'monthly' => date('Y-m-d', strtotime('+1 month', $time)),
            default => date('Y-m-d', $time),
        };
    }

    /**
     * Supprime définitivement une tâche.
     *
     * @param int $id
     * @return bool
     */
    public function delete(int $id): bool
    {
        $stmt = $this->db->prepare('DELETE FROM tasks WHERE id = :id');
        $stmt->execute([':id' => $id]);
        return $stmt->rowCount() > 0;
    }
}

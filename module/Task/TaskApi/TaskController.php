<?php

declare(strict_types=1);

namespace Module\Task\TaskApi;

use Core\Api\Database;
use Core\Api\Logger;
use Core\Api\Response;
use Core\Api\Session;

/**
 * Contrôleur HTTP pour l'API REST des tâches avec support des catégories.
 */
class TaskController
{
    /**
     * @var TaskRepository
     */
    private TaskRepository $repository;

    /**
     * Initialise le contrôleur avec son repository.
     */
    public function __construct()
    {
        $this->repository = new TaskRepository();
    }

    /**
     * GET /api/v1/tasks : Liste des tâches filtrées par statut, catégorie, recherche et tri.
     *
     * @return void
     */
    public function index(): void
    {
        $filter = isset($_GET['filter']) ? (string)$_GET['filter'] : null;
        if ($filter !== null && !in_array($filter, ['all', 'todo', 'completed'], true)) {
            Response::error("Valeur de filtre invalide ('all', 'todo', 'completed' attendu).", 400);
            return;
        }

        $categoryId = isset($_GET['category_id']) && $_GET['category_id'] !== '' && $_GET['category_id'] !== 'all'
            ? (int)$_GET['category_id']
            : null;

        $search = isset($_GET['search']) ? trim((string)$_GET['search']) : null;
        $sort = isset($_GET['sort']) && in_array((string)$_GET['sort'], ['due_asc', 'name_asc', 'name_desc'], true)
            ? (string)$_GET['sort']
            : 'due_asc';

        $userId = Session::getUserId();
        $tasks = $this->repository->findAll($filter, $categoryId, $search, $sort, $userId);
        Response::success($tasks);
    }

    /**
     * POST /api/v1/tasks : Création d'une nouvelle tâche avec catégorie optionnelle.
     *
     * @return void
     */
    public function create(): void
    {
        $payload = $this->getJsonInput();

        $title = isset($payload['title']) ? trim((string)$payload['title']) : '';
        $dueDate = isset($payload['due_date']) && trim((string)$payload['due_date']) !== '' 
            ? trim((string)$payload['due_date']) 
            : null;

        $categoryId = isset($payload['category_id']) && $payload['category_id'] !== '' && $payload['category_id'] !== null
            ? (int)$payload['category_id']
            : null;

        $recurrence = isset($payload['recurrence']) && in_array((string)$payload['recurrence'], ['none', 'daily', 'weekly', 'monthly'], true)
            ? (string)$payload['recurrence']
            : 'none';

        $dueTime = isset($payload['due_time']) && trim((string)$payload['due_time']) !== '' 
            ? trim((string)$payload['due_time']) 
            : null;

        $recurrenceEndDate = isset($payload['recurrence_end_date']) && trim((string)$payload['recurrence_end_date']) !== '' 
            ? trim((string)$payload['recurrence_end_date']) 
            : null;

        // Validation RG-01
        if ($title === '' || mb_strlen($title) > 255) {
            Response::error('Le titre de la tâche est obligatoire (entre 1 et 255 caractères).', 400);
            return;
        }

        // Validation RG-02
        if ($dueDate !== null && !$this->isValidDate($dueDate)) {
            Response::error('Format de date d\'échéance invalide (format attendu : YYYY-MM-DD).', 400);
            return;
        }

        // Validation RG-20 (Heure)
        if ($dueTime !== null && !preg_match('/^([01]\d|2[0-3]):[0-5]\d$/', $dueTime)) {
            Response::error('Format d\'horaire invalide (format attendu : HH:MM).', 400);
            return;
        }

        // Validation RG-19 (Date fin récurrence)
        if ($recurrenceEndDate !== null && !$this->isValidDate($recurrenceEndDate)) {
            Response::error('Format de date de fin de récurrence invalide (format attendu : YYYY-MM-DD).', 400);
            return;
        }

        $userId = Session::getUserId() ?? 1;
        $task = $this->repository->create($title, $dueDate, $categoryId, $recurrence, $dueTime, $recurrenceEndDate, $userId);
        Response::success($task, 200);
    }

    /**
     * PUT /api/v1/tasks/{id} : Mise à jour d'une tâche existante.
     *
     * @param string $id
     * @return void
     */
    public function update(string $id): void
    {
        $taskId = (int)$id;
        if ($taskId <= 0) {
            Response::error('Identifiant de tâche invalide.', 400);
            return;
        }

        $currentUserId = Session::getUserId();
        $existing = $this->repository->findById($taskId);
        if ($existing === null) {
            Response::error('Tâche introuvable avec l\'identifiant : ' . $taskId, 404);
            return;
        }

        if ($currentUserId !== null && isset($existing['user_id']) && (int)$existing['user_id'] !== $currentUserId) {
            Logger::security(
                'IDOR_ATTEMPT',
                "Tentative de modification non autorisée de la tâche {$taskId} appartenant à l'utilisateur {$existing['user_id']}",
                ['task_id' => $taskId, 'owner_id' => $existing['user_id'], 'attempt_by' => $currentUserId],
                'ALERT'
            );
            Response::error('Action non autorisée sur cette tâche.', 403);
            return;
        }

        $payload = $this->getJsonInput();

        $title = isset($payload['title']) ? trim((string)$payload['title']) : '';
        $dueDate = isset($payload['due_date']) && trim((string)$payload['due_date']) !== '' 
            ? trim((string)$payload['due_date']) 
            : null;

        $categoryId = array_key_exists('category_id', $payload) && $payload['category_id'] !== '' && $payload['category_id'] !== null
            ? (int)$payload['category_id']
            : null;

        $recurrence = isset($payload['recurrence']) && in_array((string)$payload['recurrence'], ['none', 'daily', 'weekly', 'monthly'], true)
            ? (string)$payload['recurrence']
            : 'none';

        $dueTime = isset($payload['due_time']) && trim((string)$payload['due_time']) !== '' 
            ? trim((string)$payload['due_time']) 
            : null;

        $recurrenceEndDate = isset($payload['recurrence_end_date']) && trim((string)$payload['recurrence_end_date']) !== '' 
            ? trim((string)$payload['recurrence_end_date']) 
            : null;

        // Validation RG-01
        if ($title === '' || mb_strlen($title) > 255) {
            Response::error('Le titre de la tâche est obligatoire (entre 1 et 255 caractères).', 400);
            return;
        }

        // Validation RG-02
        if ($dueDate !== null && !$this->isValidDate($dueDate)) {
            Response::error('Format de date d\'échéance invalide (format attendu : YYYY-MM-DD).', 400);
            return;
        }

        // Validation RG-20 (Heure)
        if ($dueTime !== null && !preg_match('/^([01]\d|2[0-3]):[0-5]\d$/', $dueTime)) {
            Response::error('Format d\'horaire invalide (format attendu : HH:MM).', 400);
            return;
        }

        // Validation RG-19 (Date fin récurrence)
        if ($recurrenceEndDate !== null && !$this->isValidDate($recurrenceEndDate)) {
            Response::error('Format de date de fin de récurrence invalide (format attendu : YYYY-MM-DD).', 400);
            return;
        }

        $task = $this->repository->update($taskId, $title, $dueDate, $categoryId, $recurrence, $dueTime, $recurrenceEndDate);
        if ($task === null) {
            Response::error('Tâche introuvable avec l\'identifiant : ' . $taskId, 404);
            return;
        }

        Response::success($task, 200);
    }

    /**
     * PATCH /api/v1/tasks/{id}/toggle : Bascule de l'état d'achèvement.
     *
     * @param string $id
     * @return void
     */
    public function toggle(string $id): void
    {
        $taskId = (int)$id;
        if ($taskId <= 0) {
            Response::error('Identifiant de tâche invalide.', 400);
            return;
        }

        $currentUserId = Session::getUserId();
        $existing = $this->repository->findById($taskId);
        if ($existing === null) {
            Response::error('Tâche introuvable avec l\'identifiant : ' . $taskId, 404);
            return;
        }

        if ($currentUserId !== null && isset($existing['user_id']) && (int)$existing['user_id'] !== $currentUserId) {
            Logger::security(
                'IDOR_ATTEMPT',
                "Tentative de modification non autorisée de la tâche {$taskId} appartenant à l'utilisateur {$existing['user_id']}",
                ['task_id' => $taskId, 'owner_id' => $existing['user_id'], 'attempt_by' => $currentUserId],
                'ALERT'
            );
            Response::error('Action non autorisée sur cette tâche.', 403);
            return;
        }

        $task = $this->repository->toggle($taskId);
        if ($task === null) {
            Response::error('Tâche introuvable avec l\'identifiant : ' . $taskId, 404);
            return;
        }

        Response::success($task, 200);
    }

    /**
     * DELETE /api/v1/tasks/{id} : Suppression définitive d'une tâche.
     *
     * @param string $id
     * @return void
     */
    public function delete(string $id): void
    {
        $taskId = (int)$id;
        if ($taskId <= 0) {
            Response::error('Identifiant de tâche invalide.', 400);
            return;
        }

        $currentUserId = Session::getUserId();
        $existing = $this->repository->findById($taskId);
        if ($existing === null) {
            Response::error('Tâche introuvable avec l\'identifiant : ' . $taskId, 404);
            return;
        }

        if ($currentUserId !== null && isset($existing['user_id']) && (int)$existing['user_id'] !== $currentUserId) {
            Logger::security(
                'IDOR_ATTEMPT',
                "Tentative de modification non autorisée de la tâche {$taskId} appartenant à l'utilisateur {$existing['user_id']}",
                ['task_id' => $taskId, 'owner_id' => $existing['user_id'], 'attempt_by' => $currentUserId],
                'ALERT'
            );
            Response::error('Action non autorisée sur cette tâche.', 403);
            return;
        }

        $deleted = $this->repository->delete($taskId);
        if (!$deleted) {
            Response::error('Tâche introuvable avec l\'identifiant : ' . $taskId, 404);
            return;
        }

        Response::success(['id' => $taskId, 'deleted' => true], 200);
    }

    /**
     * POST /api/v1/test/reset-db : Réinitialisation de la base pour les tests E2E.
     *
     * @return void
     */
    public function resetDb(): void
    {
        Database::resetDatabase();
        Response::success(['reset' => true], 200);
    }

    /**
     * Récupère et décode le payload JSON entrant.
     *
     * @return array<string, mixed>
     */
    private function getJsonInput(): array
    {
        $raw = file_get_contents('php://input');
        if (empty($raw)) {
            return $_POST;
        }

        $decoded = json_decode($raw, true);
        return is_array($decoded) ? $decoded : [];
    }

    /**
     * Valide le format strict d'une date ISO YYYY-MM-DD.
     *
     * @param string $date
     * @return bool
     */
    private function isValidDate(string $date): bool
    {
        $d = \DateTimeImmutable::createFromFormat('Y-m-d', $date);
        return $d && $d->format('Y-m-d') === $date;
    }
}

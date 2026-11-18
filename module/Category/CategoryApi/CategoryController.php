<?php

declare(strict_types=1);

namespace Module\Category\CategoryApi;

use Core\Api\Response;

/**
 * Contrôleur HTTP pour l'API REST des catégories.
 */
class CategoryController
{
    /**
     * @var CategoryRepository
     */
    private CategoryRepository $repository;

    /**
     * Initialise le contrôleur.
     */
    public function __construct()
    {
        $this->repository = new CategoryRepository();
    }

    /**
     * GET /api/v1/categories : Liste de toutes les catégories.
     *
     * @return void
     */
    public function index(): void
    {
        $categories = $this->repository->findAll();
        Response::success($categories);
    }

    /**
     * POST /api/v1/categories : Création d'une catégorie.
     *
     * @return void
     */
    public function create(): void
    {
        $payload = $this->getJsonInput();

        $name = isset($payload['name']) ? trim((string)$payload['name']) : '';
        $color = isset($payload['color']) && trim((string)$payload['color']) !== '' 
            ? trim((string)$payload['color']) 
            : 'indigo';

        // Validation RG-08
        if ($name === '' || mb_strlen($name) > 50) {
            Response::error('Le nom de la catégorie est obligatoire (1 à 50 caractères).', 400);
            return;
        }

        // Vérification de l'unicité
        $existing = $this->repository->findByName($name);
        if ($existing !== null) {
            Response::error('Une catégorie portant ce nom existe déjà.', 400);
            return;
        }

        $allowedColors = ['indigo', 'blue', 'emerald', 'purple', 'amber', 'rose', 'slate'];
        if (!in_array($color, $allowedColors, true)) {
            $color = 'indigo';
        }

        $category = $this->repository->create($name, $color);
        Response::success($category, 200);
    }

    /**
     * DELETE /api/v1/categories/{id} : Suppression d'une catégorie.
     *
     * @param string $id
     * @return void
     */
    public function delete(string $id): void
    {
        $categoryId = (int)$id;
        if ($categoryId <= 0) {
            Response::error('Identifiant de catégorie invalide.', 400);
            return;
        }

        $deleted = $this->repository->delete($categoryId);
        if (!$deleted) {
            Response::error('Catégorie introuvable avec l\'identifiant : ' . $categoryId, 404);
            return;
        }

        Response::success(['id' => $categoryId, 'deleted' => true], 200);
    }

    /**
     * Récupère le payload JSON.
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
}

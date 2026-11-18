<?php

declare(strict_types=1);

namespace Module\Category\CategoryApi;

use Core\Api\Database;
use PDO;

/**
 * Repository pour les opérations de persistance SQL de l'entité Category.
 */
class CategoryRepository
{
    /**
     * @var PDO
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
     * Récupère toutes les catégories ordonnées par nom.
     *
     * @return array<int, array<string, mixed>>
     */
    public function findAll(): array
    {
        $stmt = $this->db->query('SELECT id, name, color, created_at FROM categories ORDER BY name ASC');
        $results = [];
        while ($row = $stmt->fetch()) {
            $results[] = Category::fromArray($row)->toArray();
        }

        return $results;
    }

    /**
     * Recherche une catégorie par son identifiant.
     *
     * @param int $id
     * @return array<string, mixed>|null
     */
    public function findById(int $id): ?array
    {
        $stmt = $this->db->prepare('SELECT id, name, color, created_at FROM categories WHERE id = :id');
        $stmt->execute([':id' => $id]);
        $row = $stmt->fetch();

        return $row ? Category::fromArray($row)->toArray() : null;
    }

    /**
     * Recherche une catégorie par son nom (insensible à la casse).
     *
     * @param string $name
     * @return array<string, mixed>|null
     */
    public function findByName(string $name): ?array
    {
        $stmt = $this->db->prepare('SELECT id, name, color, created_at FROM categories WHERE LOWER(name) = LOWER(:name)');
        $stmt->execute([':name' => $name]);
        $row = $stmt->fetch();

        return $row ? Category::fromArray($row)->toArray() : null;
    }

    /**
     * Crée une nouvelle catégorie.
     *
     * @param string $name
     * @param string $color
     * @return array<string, mixed>
     */
    public function create(string $name, string $color = 'indigo'): array
    {
        $stmt = $this->db->prepare('INSERT INTO categories (name, color, created_at) VALUES (:name, :color, CURRENT_TIMESTAMP)');
        $stmt->execute([
            ':name' => $name,
            ':color' => $color,
        ]);

        $newId = (int)$this->db->lastInsertId();
        return $this->findById($newId) ?? [];
    }

    /**
     * Supprime définitivement une catégorie.
     * Les tâches rattachées passent automatiquement à category_id = NULL.
     *
     * @param int $id
     * @return bool
     */
    public function delete(int $id): bool
    {
        // En SQLite, s'assurer que les clés étrangères mettent category_id à NULL
        $this->db->prepare('UPDATE tasks SET category_id = NULL WHERE category_id = :id')->execute([':id' => $id]);

        $stmt = $this->db->prepare('DELETE FROM categories WHERE id = :id');
        $stmt->execute([':id' => $id]);
        return $stmt->rowCount() > 0;
    }
}

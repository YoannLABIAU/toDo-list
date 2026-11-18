<?php

declare(strict_types=1);

namespace Module\Category\CategoryApi;

/**
 * Modèle / DTO représentant une entité Catégorie.
 */
class Category
{
    /**
     * @param int|null $id
     * @param string $name
     * @param string $color
     * @param string|null $createdAt
     */
    public function __construct(
        private ?int $id,
        private string $name,
        private string $color = 'indigo',
        private ?string $createdAt = null
    ) {
    }

    /**
     * @return int|null
     */
    public function getId(): ?int
    {
        return $this->id;
    }

    /**
     * @return string
     */
    public function getName(): string
    {
        return $this->name;
    }

    /**
     * @return string
     */
    public function getColor(): string
    {
        return $this->color;
    }

    /**
     * @return string|null
     */
    public function getCreatedAt(): ?string
    {
        return $this->createdAt;
    }

    /**
     * Convertit l'entité en tableau associatif sérialisable en JSON.
     *
     * @return array<string, mixed>
     */
    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'color' => $this->color,
            'created_at' => $this->createdAt,
        ];
    }

    /**
     * Crée une instance Category depuis une ligne de BDD.
     *
     * @param array<string, mixed> $data
     * @return self
     */
    public static function fromArray(array $data): self
    {
        return new self(
            isset($data['id']) ? (int)$data['id'] : null,
            (string)($data['name'] ?? ''),
            (string)($data['color'] ?? 'indigo'),
            isset($data['created_at']) ? (string)$data['created_at'] : null
        );
    }
}

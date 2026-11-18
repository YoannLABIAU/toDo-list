<?php

declare(strict_types=1);

namespace Module\Task\TaskApi;

/**
 * Modèle / DTO représentant une entité Tâche enrichie avec catégorie et récurrence.
 */
class Task
{
    /**
     * @param int|null $id
     * @param string $title
     * @param string|null $dueDate
     * @param bool $completed
     * @param int|null $categoryId
     * @param string|null $categoryName
     * @param string|null $categoryColor
     * @param string $recurrence 'none' | 'daily' | 'weekly' | 'monthly'
     * @param string|null $dueTime 'HH:MM'
     * @param string|null $recurrenceEndDate 'YYYY-MM-DD'
     * @param string|null $createdAt
     * @param string|null $updatedAt
     */
    public function __construct(
        private ?int $id,
        private string $title,
        private ?string $dueDate = null,
        private bool $completed = false,
        private ?int $categoryId = null,
        private ?string $categoryName = null,
        private ?string $categoryColor = null,
        private string $recurrence = 'none',
        private ?string $dueTime = null,
        private ?string $recurrenceEndDate = null,
        private bool $hasGeneratedNext = false,
        private ?int $userId = 1,
        private ?string $createdAt = null,
        private ?string $updatedAt = null
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
    public function getTitle(): string
    {
        return $this->title;
    }

    /**
     * @return string|null
     */
    public function getDueDate(): ?string
    {
        return $this->dueDate;
    }

    /**
     * @return bool
     */
    public function isCompleted(): bool
    {
        return $this->completed;
    }

    /**
     * @return int|null
     */
    public function getCategoryId(): ?int
    {
        return $this->categoryId;
    }

    /**
     * @return string|null
     */
    public function getCategoryName(): ?string
    {
        return $this->categoryName;
    }

    /**
     * @return string|null
     */
    public function getCategoryColor(): ?string
    {
        return $this->categoryColor;
    }

    /**
     * @return string
     */
    public function getRecurrence(): string
    {
        return $this->recurrence;
    }

    /**
     * @return string|null
     */
    public function getDueTime(): ?string
    {
        return $this->dueTime;
    }

    /**
     * @return string|null
     */
    public function getRecurrenceEndDate(): ?string
    {
        return $this->recurrenceEndDate;
    }

    /**
     * @return bool
     */
    public function hasGeneratedNext(): bool
    {
        return $this->hasGeneratedNext;
    }

    /**
     * @return string|null
     */
    public function getCreatedAt(): ?string
    {
        return $this->createdAt;
    }

    /**
     * @return int|null
     */
    public function getUserId(): ?int
    {
        return $this->userId;
    }

    /**
     * @return string|null
     */
    public function getUpdatedAt(): ?string
    {
        return $this->updatedAt;
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
            'title' => $this->title,
            'due_date' => $this->dueDate,
            'completed' => $this->completed,
            'category_id' => $this->categoryId,
            'category_name' => $this->categoryName,
            'category_color' => $this->categoryColor,
            'recurrence' => $this->recurrence,
            'due_time' => $this->dueTime,
            'recurrence_end_date' => $this->recurrenceEndDate,
            'has_generated_next' => $this->hasGeneratedNext,
            'user_id' => $this->userId,
            'created_at' => $this->createdAt,
            'updated_at' => $this->updatedAt,
        ];
    }

    /**
     * Crée une instance Task depuis une ligne de BDD.
     *
     * @param array<string, mixed> $data
     * @return self
     */
    public static function fromArray(array $data): self
    {
        return new self(
            isset($data['id']) ? (int)$data['id'] : null,
            (string)($data['title'] ?? ''),
            isset($data['due_date']) && $data['due_date'] !== '' ? (string)$data['due_date'] : null,
            !empty($data['completed']),
            isset($data['category_id']) && $data['category_id'] !== null && $data['category_id'] !== '' ? (int)$data['category_id'] : null,
            isset($data['category_name']) && $data['category_name'] !== '' ? (string)$data['category_name'] : null,
            isset($data['category_color']) && $data['category_color'] !== '' ? (string)$data['category_color'] : null,
            isset($data['recurrence']) && $data['recurrence'] !== '' ? (string)$data['recurrence'] : 'none',
            isset($data['due_time']) && $data['due_time'] !== '' ? (string)$data['due_time'] : null,
            isset($data['recurrence_end_date']) && $data['recurrence_end_date'] !== '' ? (string)$data['recurrence_end_date'] : null,
            !empty($data['has_generated_next']),
            isset($data['user_id']) && $data['user_id'] !== null ? (int)$data['user_id'] : 1,
            isset($data['created_at']) ? (string)$data['created_at'] : null,
            isset($data['updated_at']) ? (string)$data['updated_at'] : null
        );
    }
}

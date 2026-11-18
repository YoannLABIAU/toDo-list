<?php

declare(strict_types=1);

namespace Module\Auth\AuthApi;

/**
 * Entité représentant un utilisateur de l'application.
 */
class User
{
    /**
     * @param int|null $id Identifiant unique
     * @param string $firstName Prénom
     * @param string $lastName Nom de famille
     * @param string $username Identifiant / Pseudo
     * @param string $email Adresse e-mail
     * @param string $passwordHash Hash du mot de passe
     * @param string $createdAt Date de création ISO8601
     */
    public function __construct(
        private ?int $id,
        private string $firstName,
        private string $lastName,
        private string $username,
        private string $email,
        private string $passwordHash,
        private string $createdAt = ''
    ) {
        if ($this->createdAt === '') {
            $this->createdAt = date('Y-m-d H:i:s');
        }
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getFirstName(): string
    {
        return $this->firstName;
    }

    public function getLastName(): string
    {
        return $this->lastName;
    }

    public function getUsername(): string
    {
        return $this->username;
    }

    public function getEmail(): string
    {
        return $this->email;
    }

    public function getPasswordHash(): string
    {
        return $this->passwordHash;
    }

    public function getCreatedAt(): string
    {
        return $this->createdAt;
    }

    /**
     * Convertit l'entité en tableau associatif sécurisé (sans le hash de mot de passe).
     *
     * @return array<string, mixed>
     */
    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'first_name' => $this->firstName,
            'last_name' => $this->lastName,
            'username' => $this->username,
            'email' => $this->email,
            'created_at' => $this->createdAt,
        ];
    }

    /**
     * Instancie un objet User à partir d'un tableau associatif.
     *
     * @param array<string, mixed> $data
     * @return self
     */
    public static function fromArray(array $data): self
    {
        return new self(
            isset($data['id']) ? (int) $data['id'] : null,
            (string) ($data['first_name'] ?? ''),
            (string) ($data['last_name'] ?? ''),
            (string) ($data['username'] ?? ''),
            (string) ($data['email'] ?? ''),
            (string) ($data['password_hash'] ?? ''),
            (string) ($data['created_at'] ?? '')
        );
    }
}

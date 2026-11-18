<?php

declare(strict_types=1);

namespace Module\Auth\AuthApi;

use Core\Api\Database;
use PDO;

/**
 * Repository pour les entités Utilisateur et la gestion des réinitialisations de mot de passe.
 */
class UserRepository
{
    private PDO $pdo;

    public function __construct()
    {
        $this->pdo = Database::getInstance();
    }

    /**
     * Recherche un utilisateur par son identifiant unique.
     *
     * @param int $id
     * @return User|null
     */
    public function findById(int $id): ?User
    {
        $stmt = $this->pdo->prepare('SELECT * FROM users WHERE id = :id LIMIT 1');
        $stmt->execute([':id' => $id]);
        $row = $stmt->fetch();

        return $row ? User::fromArray($row) : null;
    }

    /**
     * Recherche un utilisateur par son identifiant ou son adresse email.
     *
     * @param string $identifier Identifiant ou adresse email
     * @return User|null
     */
    public function findByUsernameOrEmail(string $identifier): ?User
    {
        $stmt = $this->pdo->prepare('SELECT * FROM users WHERE username = :ident OR email = :ident LIMIT 1');
        $stmt->execute([':ident' => trim($identifier)]);
        $row = $stmt->fetch();

        return $row ? User::fromArray($row) : null;
    }

    /**
     * Recherche un utilisateur par son adresse email.
     *
     * @param string $email
     * @return User|null
     */
    public function findByEmail(string $email): ?User
    {
        $stmt = $this->pdo->prepare('SELECT * FROM users WHERE email = :email LIMIT 1');
        $stmt->execute([':email' => trim($email)]);
        $row = $stmt->fetch();

        return $row ? User::fromArray($row) : null;
    }

    /**
     * Recherche un utilisateur par son nom d'utilisateur.
     *
     * @param string $username
     * @return User|null
     */
    public function findByUsername(string $username): ?User
    {
        $stmt = $this->pdo->prepare('SELECT * FROM users WHERE username = :username LIMIT 1');
        $stmt->execute([':username' => trim($username)]);
        $row = $stmt->fetch();

        return $row ? User::fromArray($row) : null;
    }

    /**
     * Enregistre un nouvel utilisateur en base de données.
     *
     * @param User $user
     * @return User
     */
    public function create(User $user): User
    {
        $stmt = $this->pdo->prepare(<<<SQL
            INSERT INTO users (first_name, last_name, username, email, password_hash, created_at)
            VALUES (:first_name, :last_name, :username, :email, :password_hash, :created_at)
        SQL);

        $stmt->execute([
            ':first_name' => $user->getFirstName(),
            ':last_name' => $user->getLastName(),
            ':username' => $user->getUsername(),
            ':email' => $user->getEmail(),
            ':password_hash' => $user->getPasswordHash(),
            ':created_at' => $user->getCreatedAt(),
        ]);

        $id = (int) $this->pdo->lastInsertId();

        return new User(
            $id,
            $user->getFirstName(),
            $user->getLastName(),
            $user->getUsername(),
            $user->getEmail(),
            $user->getPasswordHash(),
            $user->getCreatedAt()
        );
    }

    /**
     * Met à jour le mot de passe d'un utilisateur.
     *
     * @param int $userId
     * @param string $newPasswordHash
     * @return bool
     */
    public function updatePassword(int $userId, string $newPasswordHash): bool
    {
        $stmt = $this->pdo->prepare('UPDATE users SET password_hash = :hash WHERE id = :id');
        return $stmt->execute([
            ':hash' => $newPasswordHash,
            ':id' => $userId,
        ]);
    }

    /**
     * Crée une entrée de réinitialisation de mot de passe avec code OTP.
     *
     * @param int $userId
     * @param string $otpCode
     * @param int $validityMinutes
     * @return bool
     */
    public function createPasswordReset(int $userId, string $otpCode, int $validityMinutes = 15): bool
    {
        // Supprimer les anciens codes non utilisés pour cet utilisateur
        $this->deletePasswordResets($userId);

        $expiresAt = date('Y-m-d H:i:s', time() + ($validityMinutes * 60));
        $createdAt = date('Y-m-d H:i:s');

        $stmt = $this->pdo->prepare(<<<SQL
            INSERT INTO password_resets (user_id, otp_code, expires_at, created_at)
            VALUES (:user_id, :otp_code, :expires_at, :created_at)
        SQL);

        return $stmt->execute([
            ':user_id' => $userId,
            ':otp_code' => $otpCode,
            ':expires_at' => $expiresAt,
            ':created_at' => $createdAt,
        ]);
    }

    /**
     * Vérifie la validité d'un code OTP pour un email donné.
     *
     * @param string $email
     * @param string $otpCode
     * @return int|null ID de l'utilisateur si le code est valide, sinon null
     */
    public function verifyPasswordReset(string $email, string $otpCode): ?int
    {
        $now = date('Y-m-d H:i:s');
        $stmt = $this->pdo->prepare(<<<SQL
            SELECT pr.user_id 
            FROM password_resets pr
            JOIN users u ON u.id = pr.user_id
            WHERE u.email = :email 
              AND pr.otp_code = :otp_code 
              AND pr.expires_at >= :now
            ORDER BY pr.id DESC 
            LIMIT 1
        SQL);

        $stmt->execute([
            ':email' => trim($email),
            ':otp_code' => trim($otpCode),
            ':now' => $now,
        ]);

        $row = $stmt->fetch();
        return $row ? (int) $row['user_id'] : null;
    }

    /**
     * Supprime les demandes de réinitialisation pour un utilisateur.
     *
     * @param int $userId
     * @return void
     */
    public function deletePasswordResets(int $userId): void
    {
        $stmt = $this->pdo->prepare('DELETE FROM password_resets WHERE user_id = :user_id');
        $stmt->execute([':user_id' => $userId]);
    }
}

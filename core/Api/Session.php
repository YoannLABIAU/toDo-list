<?php

declare(strict_types=1);

namespace Core\Api;

/**
 * Service de gestion de la session utilisateur sécurisée.
 */
class Session
{
    /**
     * Démarre la session PHP si elle n'est pas déjà active.
     *
     * @return void
     */
    public static function start(): void
    {
        if (session_status() === PHP_SESSION_NONE) {
            if (php_sapi_name() === 'cli') {
                @session_start(['use_cookies' => 0]);
                return;
            }

            $lifetime = 86400 * 7; // 7 jours de validité cookie
            session_set_cookie_params([
                'lifetime' => $lifetime,
                'path' => '/',
                'domain' => '',
                'secure' => isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on',
                'httponly' => true,
                'samesite' => 'Lax'
            ]);
            session_start();

            // RG-37 : Expiration après 24 heures sans activité
            $maxInactivity = 86400; // 24 heures
            if (isset($_SESSION['last_activity']) && (time() - (int)$_SESSION['last_activity'] > $maxInactivity)) {
                self::destroy();
                return;
            }
            $_SESSION['last_activity'] = time();
        }
    }

    /**
     * Régénère l'identifiant de session pour prévenir la fixation de session.
     *
     * @return void
     */
    public static function regenerate(): void
    {
        self::start();
        if (session_status() === PHP_SESSION_ACTIVE) {
            session_regenerate_id(true);
        }
    }

    /**
     * Définit l'identifiant de l'utilisateur connecté.
     *
     * @param int $userId ID de l'utilisateur
     * @return void
     */
    public static function setUserId(int $userId): void
    {
        self::start();
        $_SESSION['user_id'] = $userId;
    }

    /**
     * Récupère l'ID de l'utilisateur connecté.
     *
     * @return int|null
     */
    public static function getUserId(): ?int
    {
        self::start();
        return isset($_SESSION['user_id']) ? (int) $_SESSION['user_id'] : null;
    }

    /**
     * Vérifie si un utilisateur est connecté.
     *
     * @return bool
     */
    public static function isAuthenticated(): bool
    {
        return self::getUserId() !== null;
    }

    /**
     * Détruit la session courante (déconnexion).
     *
     * @return void
     */
    public static function destroy(): void
    {
        self::start();
        $_SESSION = [];
        if (ini_get('session.use_cookies')) {
            $params = session_get_cookie_params();
            setcookie(
                session_name(),
                '',
                time() - 42000,
                $params['path'],
                $params['domain'],
                $params['secure'],
                $params['httponly']
            );
        }
        session_destroy();
    }
}

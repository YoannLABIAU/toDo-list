<?php

declare(strict_types=1);

namespace Core\Api;

/**
 * Service de protection contre les attaques Cross-Site Request Forgery (CSRF).
 */
class Csrf
{
    /**
     * Récupère ou génère le jeton CSRF de la session active.
     *
     * @return string
     */
    public static function getToken(): string
    {
        Session::start();
        if (empty($_SESSION['csrf_token'])) {
            $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
        }

        return (string) $_SESSION['csrf_token'];
    }

    /**
     * Valide le jeton CSRF transmis par le client.
     *
     * @param string|null $token
     * @return bool
     */
    public static function validate(?string $token): bool
    {
        Session::start();
        $stored = $_SESSION['csrf_token'] ?? null;

        if (!$stored || !$token) {
            return false;
        }

        return hash_equals((string) $stored, (string) $token);
    }

    /**
     * Récupère le jeton CSRF depuis les en-têtes HTTP ou le payload de requête.
     *
     * @return string|null
     */
    public static function extractTokenFromRequest(): ?string
    {
        // 1. En-tête HTTP standard X-CSRF-Token
        $header = $_SERVER['HTTP_X_CSRF_TOKEN'] ?? null;
        if ($header !== null && trim($header) !== '') {
            return trim($header);
        }

        // 2. Paramètre POST standard
        if (!empty($_POST['csrf_token'])) {
            return trim((string) $_POST['csrf_token']);
        }

        // 3. Payload JSON php://input
        $raw = file_get_contents('php://input');
        if ($raw) {
            $data = json_decode($raw, true);
            if (is_array($data) && !empty($data['csrf_token'])) {
                return trim((string) $data['csrf_token']);
            }
        }

        return null;
    }
}

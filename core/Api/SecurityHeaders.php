<?php

declare(strict_types=1);

namespace Core\Api;

/**
 * Service appliquant les en-têtes HTTP de sécurité stricts aux réponses serveur.
 */
class SecurityHeaders
{
    /**
     * Applique les en-têtes HTTP de sécurité standard.
     *
     * @return void
     */
    public static function apply(): void
    {
        if (headers_sent()) {
            return;
        }

        header('X-Frame-Options: DENY');
        header('X-Content-Type-Options: nosniff');
        header('Referrer-Policy: strict-origin-when-cross-origin');
        header("Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:; connect-src 'self';");
    }
}

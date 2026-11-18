<?php

declare(strict_types=1);

namespace Core\Api;

/**
 * Gestionnaire de configuration basé sur le fichier .env.
 */
class Config
{
    /**
     * @var array<string, string> Cache des variables d'environnement chargées
     */
    private static array $env = [];

    /**
     * @var bool Indicateur de chargement
     */
    private static bool $loaded = false;

    /**
     * Charge le fichier .env à la racine du projet.
     *
     * @param string|null $customPath Chemin personnalisé facultatif
     * @return void
     */
    public static function load(?string $customPath = null): void
    {
        if (self::$loaded && $customPath === null) {
            return;
        }

        $path = $customPath ?? dirname(__DIR__, 2) . '/.env';

        if (file_exists($path) && is_readable($path)) {
            $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
            if ($lines !== false) {
                foreach ($lines as $line) {
                    $trimmed = trim($line);
                    if ($trimmed === '' || str_starts_with($trimmed, '#')) {
                        continue;
                    }
                    if (str_contains($trimmed, '=')) {
                        [$key, $value] = explode('=', $trimmed, 2);
                        $key = trim($key);
                        $value = trim($value);
                        // Retirer d'éventuels guillemets
                        if ((str_starts_with($value, '"') && str_ends_with($value, '"')) ||
                            (str_starts_with($value, "'") && str_ends_with($value, "'"))) {
                            $value = substr($value, 1, -1);
                        }
                        self::$env[$key] = $value;
                        $_ENV[$key] = $value;
                    }
                }
            }
        }

        self::$loaded = true;
    }

    /**
     * Récupère la valeur d'une clé de configuration.
     *
     * @param string $key Clé de configuration
     * @param mixed $default Valeur par défaut
     * @return mixed
     */
    public static function get(string $key, mixed $default = null): mixed
    {
        if (!self::$loaded) {
            self::load();
        }

        return self::$env[$key] ?? $_ENV[$key] ?? getenv($key) ?: $default;
    }

    /**
     * Définit ou surcharge temporairement une clé de configuration (utile pour les tests).
     *
     * @param string $key Clé de configuration
     * @param mixed $value Nouvelle valeur
     * @return void
     */
    public static function set(string $key, mixed $value): void
    {
        if (!self::$loaded) {
            self::load();
        }
        self::$env[$key] = (string) $value;
        $_ENV[$key] = (string) $value;
        putenv("{$key}={$value}");
    }
}

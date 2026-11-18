<?php

declare(strict_types=1);

namespace Core\Api;

/**
 * Routeur léger et déclaratif pour l'API et les vues modulaires.
 */
class Router
{
    /**
     * @var array<string, array<string, callable>> Liste des routes enregistrées par méthode HTTP
     */
    private array $routes = [
        'GET' => [],
        'POST' => [],
        'PUT' => [],
        'PATCH' => [],
        'DELETE' => [],
    ];

    /**
     * Enregistre une route GET.
     *
     * @param string $path
     * @param callable $handler
     * @return void
     */
    public function get(string $path, callable $handler): void
    {
        $this->routes['GET'][$path] = $handler;
    }

    /**
     * Enregistre une route POST.
     *
     * @param string $path
     * @param callable $handler
     * @return void
     */
    public function post(string $path, callable $handler): void
    {
        $this->routes['POST'][$path] = $handler;
    }

    /**
     * Enregistre une route PUT.
     *
     * @param string $path
     * @param callable $handler
     * @return void
     */
    public function put(string $path, callable $handler): void
    {
        $this->routes['PUT'][$path] = $handler;
    }

    /**
     * Enregistre une route PATCH.
     *
     * @param string $path
     * @param callable $handler
     * @return void
     */
    public function patch(string $path, callable $handler): void
    {
        $this->routes['PATCH'][$path] = $handler;
    }

    /**
     * Enregistre une route DELETE.
     *
     * @param string $path
     * @param callable $handler
     * @return void
     */
    public function delete(string $path, callable $handler): void
    {
        $this->routes['DELETE'][$path] = $handler;
    }

    /**
     * Dispatche la requête courante en fonction de la méthode et du chemin.
     *
     * @param string $method Méthode HTTP courante
     * @param string $uri URI demandée
     * @return void
     */
    public function dispatch(string $method, string $uri): void
    {
        $path = parse_url($uri, PHP_URL_PATH) ?? '/';

        // Nettoyer les slashes superflus
        $path = rtrim($path, '/');
        if ($path === '') {
            $path = '/';
        }

        $method = strtoupper($method);

        if (!isset($this->routes[$method])) {
            Response::error('Méthode HTTP non supportée', 400);
            return;
        }

        foreach ($this->routes[$method] as $routePattern => $handler) {
            $regex = preg_replace('/\{([a-zA-Z0-9_]+)\}/', '(?P<$1>[^/]+)', $routePattern);
            $regex = '#^' . $regex . '$#';

            if (preg_match($regex, $path, $matches)) {
                $params = array_filter($matches, 'is_string', ARRAY_FILTER_USE_KEY);
                call_user_func_array($handler, $params);
                return;
            }
        }

        // Si la route commence par /api/, retourner un JSON 404
        if (str_starts_with($path, '/api/')) {
            Response::error('Endpoint introuvable : ' . $path, 404);
            return;
        }

        // Sinon, 404 standard
        http_response_code(404);
        echo 'Page non trouvée';
        exit;
    }
}

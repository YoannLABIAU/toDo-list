<?php

declare(strict_types=1);

require_once __DIR__ . '/vendor/autoload.php';

use Core\Api\Csrf;
use Core\Api\Logger;
use Core\Api\Response;
use Core\Api\Router;
use Core\Api\SecurityHeaders;
use Module\Auth\AuthApi\AuthController;
use Module\Auth\AuthApi\SyncController;
use Module\Category\CategoryApi\CategoryController;
use Module\Task\TaskApi\TaskController;

// 1. Application systématique des en-têtes HTTP de sécurité (RG-36)
SecurityHeaders::apply();

// 2. Contrôle de sécurité global anti-CSRF (RG-35)
$requestMethod = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$requestUri = $_SERVER['REQUEST_URI'] ?? '/';
$path = parse_url($requestUri, PHP_URL_PATH) ?? '/';

if (in_array($requestMethod, ['POST', 'PUT', 'PATCH', 'DELETE'], true)) {
    // Exemptions : Réinitialisation de base pour tests isolés Playwright
    if ($path !== '/api/v1/test/reset-db') {
        $token = Csrf::extractTokenFromRequest();
        if (!Csrf::validate($token)) {
            Logger::security(
                'CSRF_VIOLATION',
                'Rejet de requête mutative : Jeton CSRF absent ou invalide',
                ['method' => $requestMethod, 'path' => $path],
                'ALERT'
            );
            Response::error('Jeton CSRF invalide ou expiré.', 403);
            exit;
        }
    }
}

// Initialisation du routeur
$router = new Router();
$authController = new AuthController();
$syncController = new SyncController();
$taskController = new TaskController();
$categoryController = new CategoryController();

// Routes API REST pour le module Auth
$router->get('/api/v1/auth/csrf', [$authController, 'csrf']);
$router->post('/api/v1/auth/register', [$authController, 'register']);
$router->post('/api/v1/auth/login', [$authController, 'login']);
$router->post('/api/v1/auth/logout', [$authController, 'logout']);
$router->get('/api/v1/auth/me', [$authController, 'me']);
$router->post('/api/v1/auth/forgot-password', [$authController, 'forgotPassword']);
$router->post('/api/v1/auth/reset-password', [$authController, 'resetPassword']);
$router->post('/api/v1/sync/import-local', [$syncController, 'importLocal']);

// Routes API REST pour le module Category
$router->get('/api/v1/categories', [$categoryController, 'index']);
$router->post('/api/v1/categories', [$categoryController, 'create']);
$router->delete('/api/v1/categories/{id}', [$categoryController, 'delete']);

// Routes API REST pour le module Task
$router->get('/api/v1/tasks', [$taskController, 'index']);
$router->post('/api/v1/tasks', [$taskController, 'create']);
$router->put('/api/v1/tasks/{id}', [$taskController, 'update']);
$router->patch('/api/v1/tasks/{id}/toggle', [$taskController, 'toggle']);
$router->delete('/api/v1/tasks/{id}', [$taskController, 'delete']);
$router->post('/api/v1/test/reset-db', [$taskController, 'resetDb']);

// Route principale UI
$router->get('/', function () {
    require __DIR__ . '/core/Ui/layout.php';
});

// Exécution du dispatch
$router->dispatch($_SERVER['REQUEST_METHOD'] ?? 'GET', $_SERVER['REQUEST_URI'] ?? '/');

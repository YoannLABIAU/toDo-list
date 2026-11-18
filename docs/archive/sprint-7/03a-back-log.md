# Journal d'Implémentation Backend : Sprint 7

## 1. Réalisations Techniques

### Configuration SQLite Concurrente (RG-39)
- Fichier modifié : `core/Api/Database.php`
- Directives PRAGMA appliquées systématiquement à l'initialisation PDO :
  - `PRAGMA journal_mode = WAL;` (Write-Ahead Logging pour autoriser les lectures simultanées sans blocage par les écritures).
  - `PRAGMA synchronous = NORMAL;` (Meilleur compromis performance / intégrité en mode WAL).
  - `PRAGMA busy_timeout = 5000;` (Attente automatique jusqu'à 5 secondes en cas de verrou concurrent).
  - `PRAGMA foreign_keys = ON;` (Intégrité référentielle préservée).
- Ajout de la méthode d'accès `Database::getDbPath(): string`.

### Service Centralisé de Journalisation & Audit (RG-40)
- Fichier créé : `core/Api/Logger.php`
- Méthode `Logger::security(string $eventType, string $message, array $context, string $level)` :
  - Génère et consigne des entrées JSON unifiées horodatées dans `logs/security.log` avec IP, User ID, route et contexte.
- Méthode `Logger::error(string $message, ?Throwable $exception, array $context): string` :
  - Génère un identifiant d'incident unique `error_id` (`sec-xxxxxxxx`), consigne l'exception complète dans `logs/app.log` et retourne le code incident.
- Intégration des alertes de sécurité :
  - `RateLimiter.php` : Log `RATE_LIMIT_EXCEEDED` en cas de dépassement de quota (429).
  - `index.php` : Log `CSRF_VIOLATION` en cas de jeton manquant ou corrompu (403).
  - `AuthController.php` : Log `AUTH_FAILURE` en cas d'identifiant/mot de passe invalide, et `AUTH_SUCCESS` lors de la connexion réussie.
  - `TaskController.php` : Log `IDOR_ATTEMPT` en cas de tentative d'accès à la ressource d'un tiers (403).

### Sauvegarde à Chaud SQLite & Rotation (RG-40)
- Fichier créé : `core/Api/BackupService.php`
  - Exécution de `VACUUM INTO 'database/backups/backup-{timestamp}.sqlite'` sans arrêt de la base.
  - Rotation automatique avec rétention configurable (7 jours par défaut).
- Fichier CLI créé : `scripts/backup-database.php`
  - Exécutable via `php scripts/backup-database.php`, consigne le résultat dans `logs/security.log`.

### Cloisonnement Hermétique en Production (RG-41)
- Fichier modifié : `core/Api/Response.php`
  - Méthode `Response::serverError(string $message, ?Throwable $exception)` :
    - En mode `APP_ENV=production` : masque l'intégralité des traces techniques et SQL, retourne un identifiant d'incident `error_id` corrélé aux logs serveur.
    - En environnement de test / local : expose les informations de débogage pour faciliter la maintenance.

---

## 2. Vérifications de Syntaxe
Toutes les classes PHP ont été validées avec succès via `php -l` :
- `core/Api/Database.php` : OK
- `core/Api/Logger.php` : OK
- `core/Api/BackupService.php` : OK
- `core/Api/Response.php` : OK
- `core/Api/RateLimiter.php` : OK
- `index.php` : OK
- `module/Auth/AuthApi/AuthController.php` : OK
- `module/Task/TaskApi/TaskController.php` : OK
- `scripts/backup-database.php` : OK

---

## 3. Handoff pour le Dev-Front (@dev-front)
Les services backend, le cloisonnement des erreurs et les logs d'audit sont opérationnels. Tu peux désormais implémenter :
1. L'anti-rebond `ButtonLock.ts` sur les boutons d'action mutative UI.
2. Le composant `NetworkMonitor.ts` pour la gestion des événements hors-ligne / en-ligne (`banner-offline` et `toast-online`).

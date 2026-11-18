# Backend Log : Lot 6 - Durcissement Sécuritaire & Protection Anti-Brute-Force

## 1. Travaux Réalisés
- **Middleware & Limitation de Débit (Rate Limiting - RG-34) :**
  - Création de la migration [database/migrations/007_create_rate_limits_table.php](file:///c:/laragon/www/todo-list/database/migrations/007_create_rate_limits_table.php) (`rate_limits`).
  - Implémentation de [core/Api/RateLimiter.php](file:///c:/laragon/www/todo-list/core/Api/RateLimiter.php) avec contrôle par IP/identifiant, expiration glissante de 15 minutes, et réinitialisation après succès ou lors de `resetDatabase()`.
  - Intégration sur `/api/v1/auth/login` (seuil de 5 échecs consécutifs, blocage HTTP `429 Too Many Requests`) et sur `/api/v1/auth/forgot-password`.
- **Protection Anti-CSRF Globale (RG-35) :**
  - Implémentation de [core/Api/Csrf.php](file:///c:/laragon/www/todo-list/core/Api/Csrf.php) : génération cryptographique (`random_bytes(32)`), validation avec `hash_equals()`.
  - Injection automatique du jeton dans le gabarit HTML via `<meta name="csrf-token" content="...">` dans [core/Ui/layout.php](file:///c:/laragon/www/todo-list/core/Ui/layout.php).
  - Contrôle strict dans [index.php](file:///c:/laragon/www/todo-list/index.php) sur toutes les requêtes d'écriture (`POST`, `PUT`, `PATCH`, `DELETE`) exigeant l'en-tête `X-CSRF-Token` (rejet `403 Forbidden` en cas d'absence/invalidité).
  - Endpoint `GET /api/v1/auth/csrf` mis à disposition des clients API.
- **En-têtes HTTP de Sécurité Stricts (RG-36) :**
  - Implémentation de [core/Api/SecurityHeaders.php](file:///c:/laragon/www/todo-list/core/Api/SecurityHeaders.php) diffusant `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin` et `Content-Security-Policy`.
- **Renforcement du Cycle de Vie des Sessions (RG-37) :**
  - Mise à niveau de [core/Api/Session.php](file:///c:/laragon/www/todo-list/core/Api/Session.php) : régénération systématique d'ID de cookie (`session_regenerate_id(true)`) lors de l'authentification et de l'inscription pour interdire la fixation de session.
  - Expiration automatique de session après 24 heures d'inactivité.

---

## 2. Handoff
- **Pour le Dev-Front :** Les API et la protection CSRF sont en place. Tu dois désormais injecter l'en-tête `X-CSRF-Token` dans tous les services clients frontend (`AuthService.ts`, `TaskService.ts`, `CategoryService.ts`) en lisant la balise `<meta name="csrf-token">`.

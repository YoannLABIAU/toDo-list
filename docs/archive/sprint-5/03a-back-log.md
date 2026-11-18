# Backend Log : Lot 5 - Authentification & Sécurité

## 1. Travaux Réalisés
- **Gestionnaire de Configuration (.env) :**
  - Fichiers `.env` et `.env.example` initialisés avec `DB_PATH`, `APP_ENV`, `MAIL_DRIVER`, `MAIL_FROM`, `MAIL_LOG_PATH` et `SESSION_SECRET`.
  - Implémentation de `Core\Api\Config` avec méthode `Config::get(string $key, mixed $default = null)`.
- **Sessions & Mailer Sécurisés :**
  - `Core\Api\Session` : Gestion sécurisée des sessions HTTPOnly / SameSite Lax, contrôle d'authentification et destruction de session.
  - `Core\Api\Mailer` : Émission d'e-mails pour l'OTP en mode `log` (`database/mail.log`) ou fonction native PHP `mail()`.
- **Base de Données & Migration 006 :**
  - Création de [database/migrations/006_create_auth_tables.php](file:///c:/laragon/www/todo-list/database/migrations/006_create_auth_tables.php) créant `users` et `password_resets`, et associant `user_id` à `tasks` et `categories`.
  - Initialisation automatique d'un utilisateur par défaut (`id=1`, `username='admin'`) assurant la non-régression intégrale des sprints 1 à 4.
  - Intégration dans `Core\Api\Database`.
- **Entité & Repository Auth :**
  - `Module\Auth\AuthApi\User` : DTO sérialisable avec masquage systématique du hash de mot de passe.
  - `Module\Auth\AuthApi\UserRepository` : Gestion des requêtes préparées pour la recherche par identifiant / email (insensible à la casse), création, mise à jour de mot de passe, génération et vérification d'OTP 6 chiffres expirant à 15 min.
- **Contrôleur REST Auth :**
  - Implémentation de `Module\Auth\AuthApi\AuthController` respectant la norme JSON 3 arguments HTTP 200.
  - Validation stricte des mots de passe (RG-29 : min 8 chars, 1 majuscule, 1 minuscule, 1 chiffre) et confirmation identique.
  - Unicité email et identifiant (RG-28).
  - Génération d'OTP sécurisé et réinitialisation de mot de passe (RG-32).
- **Isolation des tâches et catégories :**
  - `TaskRepository` et `TaskController` filtrent par `user_id` de session courante et vérifient les droits de modification/suppression.

---

## 2. Endpoints Disponibles et Testés

| Méthode | URL | Description | Statut HTTP |
|---|---|---|:---:|
| `POST` | `/api/v1/auth/register` | Inscription nouvel utilisateur & connexion immédiate | 200 (Code 201) |
| `POST` | `/api/v1/auth/login` | Authentification par identifiant ou email + mot de passe | 200 |
| `POST` | `/api/v1/auth/logout` | Déconnexion et destruction de session | 200 |
| `GET` | `/api/v1/auth/me` | Récupération de l'utilisateur connecté ou null | 200 |
| `POST` | `/api/v1/auth/forgot-password` | Demande d'OTP 6 chiffres par email | 200 |
| `POST` | `/api/v1/auth/reset-password` | Vérification de l'OTP et changement de mot de passe | 200 |

---

## 3. Handoff
- **Pour le Dev-Front :** Les API sont prêtes, respectent la norme JSON, tu peux câbler l'UI et les formulaires d'authentification.

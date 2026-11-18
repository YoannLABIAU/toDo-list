# Architecture Technique : Lot 5 - Authentification & Sécurité

## 1. Modèle de Données (MCD) et Script SQL

### Table `users`
| Table | Colonne | Type SQL | Contraintes (PK, FK) | Description |
|---|---|---|---|---|
| `users` | `id` | `INTEGER` | PK, Auto Increment | Identifiant unique utilisateur |
| `users` | `first_name` | `TEXT` | NOT NULL | Prénom de l'utilisateur |
| `users` | `last_name` | `TEXT` | NOT NULL | Nom de famille |
| `users` | `username` | `TEXT` | NOT NULL, UNIQUE | Identifiant unique (insensible à la casse) |
| `users` | `email` | `TEXT` | NOT NULL, UNIQUE | Adresse électronique unique |
| `users` | `password_hash` | `TEXT` | NOT NULL | Hash sécurisé du mot de passe (PASSWORD_BCRYPT/DEFAULT) |
| `users` | `created_at` | `TEXT` | NOT NULL | Horodatage de création ISO8601 |

### Table `password_resets`
| Table | Colonne | Type SQL | Contraintes (PK, FK) | Description |
|---|---|---|---|---|
| `password_resets` | `id` | `INTEGER` | PK, Auto Increment | Identifiant de la demande de réinitialisation |
| `password_resets` | `user_id` | `INTEGER` | FK users(id) ON DELETE CASCADE | Référence à l'utilisateur |
| `password_resets` | `otp_code` | `TEXT` | NOT NULL | Code numérique à 6 chiffres |
| `password_resets` | `expires_at` | `TEXT` | NOT NULL | Date/heure d'expiration (+15 min) |
| `password_resets` | `created_at` | `TEXT` | NOT NULL | Date/heure d'émission |

### Évolution Tables `tasks` et `categories`
- Ajout de la colonne `user_id INTEGER DEFAULT 1 REFERENCES users(id) ON DELETE CASCADE` dans `tasks` et `categories`.

**Script de Migration (`database/migrations/006_create_auth_tables.php`) :**
```sql
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    username TEXT NOT NULL COLLATE NOCASE UNIQUE,
    email TEXT NOT NULL COLLATE NOCASE UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS password_resets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    otp_code TEXT NOT NULL,
    expires_at TEXT NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

---

## 2. Arborescence Modulaire

```text
├── .env / .env.example                                      # Configuration d'environnement
├── core/
│   ├── Api/
│   │   ├── Config.php                                       # Chargeur du fichier .env
│   │   ├── Session.php                                      # Gestionnaire de session sécurisée
│   │   ├── Mailer.php                                       # Émission d'emails / journalisation
│   │   └── Database.php                                     # Migration 006 intégrée
├── module/
│   ├── Auth/
│   │   ├── AuthApi/
│   │   │   ├── User.php                                     # Modèle entité Utilisateur
│   │   │   ├── UserRepository.php                           # Requêtes PDO utilisateurs & OTP
│   │   │   └── AuthController.php                           # Contrôleur REST d'authentification
│   │   └── xxUi/
│   │       ├── auth-view.php                                # Vues Modale/Composants Auth
│   │       ├── AuthService.ts                               # Client API TypeScript
│   │       └── AuthComponent.ts                             # Contrôleur DOM & formulaires
```

---

## 3. Contrats d'API (Endpoints)

Toutes les réponses HTTP retournent un code 200 normalisé `{ success, code, data | error }`.

| ID API | Endpoint | Méthode | Payload attendu (JSON) | Réponse JSON (Status 200) |
|---|---|---|---|---|
| `API-AUTH-01` | `/api/v1/auth/register` | `POST` | `{"first_name": "string", "last_name": "string", "username": "string", "email": "string", "password": "string", "password_confirm": "string"}` | `{"success": true, "code": 201, "data": {"user": {"id": 1, "username": "...", "email": "..."}}}` |
| `API-AUTH-02` | `/api/v1/auth/login` | `POST` | `{"username_or_email": "string", "password": "string"}` | `{"success": true, "code": 200, "data": {"user": {"id": 1, "username": "...", "email": "..."}}}` |
| `API-AUTH-03` | `/api/v1/auth/logout` | `POST` | `{}` | `{"success": true, "code": 200, "data": {"message": "Déconnexion réussie."}}` |
| `API-AUTH-04` | `/api/v1/auth/me` | `GET` | *(aucun)* | `{"success": true, "code": 200, "data": {"user": {"id": 1, "username": "..."} \| null}}` |
| `API-AUTH-05` | `/api/v1/auth/forgot-password` | `POST` | `{"email": "string"}` | `{"success": true, "code": 200, "data": {"message": "Si l'adresse existe, un code OTP a été envoyé.", "otp_preview"?: "123456"}}` |
| `API-AUTH-06` | `/api/v1/auth/reset-password` | `POST` | `{"email": "string", "otp": "string", "new_password": "string", "new_password_confirm": "string"}` | `{"success": true, "code": 200, "data": {"message": "Mot de passe réinitialisé avec succès."}}` |

---

## 4. Instructions de passage de relais (Handoff)
- **Pour le Dev-Back :** Implémente la logique PHP Vanilla et le SQL dans `core/Api/` et `module/Auth/AuthApi/` en respectant scrupuleusement ces contrats d'API et la gestion de la configuration `.env`.

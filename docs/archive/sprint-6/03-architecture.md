# Architecture Technique : Lot 6 - Durcissement Sécuritaire & Protection Anti-Brute-Force

## 1. Modèle de Données (MCD) et Script SQL

### Table `rate_limits`
| Table | Colonne | Type SQL | Contraintes (PK, FK) | Description |
|---|---|---|---|---|
| `rate_limits` | `id` | `INTEGER` | PK, Auto Increment | Identifiant unique |
| `rate_limits` | `rate_key` | `TEXT` | NOT NULL, UNIQUE | Clé identifiant l'action + IP + cible (ex: `login:127.0.0.1`) |
| `rate_limits` | `attempts` | `INTEGER` | NOT NULL DEFAULT 1 | Nombre de tentatives échouées |
| `rate_limits` | `last_attempt_at` | `DATETIME` | NOT NULL | Horodatage de la dernière tentative |
| `rate_limits` | `expires_at` | `DATETIME` | NOT NULL | Horodatage de fin de blocage / expiration de la fenêtre |

**Script de Migration (`database/migrations/007_create_rate_limits_table.php`) :**
```sql
CREATE TABLE IF NOT EXISTS rate_limits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    rate_key VARCHAR(150) NOT NULL UNIQUE,
    attempts INTEGER NOT NULL DEFAULT 1,
    last_attempt_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_rate_limits_key ON rate_limits(rate_key);
CREATE INDEX IF NOT EXISTS idx_rate_limits_expires ON rate_limits(expires_at);
```

---

## 2. Arborescence Modulaire

```text
├── core/
│   ├── Api/
│   │   ├── Csrf.php                                         # Génération et validation des tokens CSRF
│   │   ├── RateLimiter.php                                  # Contrôleur SQLite de limitation de débit
│   │   ├── SecurityHeaders.php                              # Injection des en-têtes HTTP stricts
│   │   ├── Session.php                                      # Invalidation inactivité 24h & régénération
│   │   └── Database.php                                     # Migration 007 intégrée
├── module/
│   ├── Auth/
│   │   ├── AuthApi/
│   │   │   └── AuthController.php                           # Intégration RateLimiting & CSRF endpoint
│   │   └── xxUi/
│   │       ├── AuthService.ts                               # Injection du header X-CSRF-Token
│   │       └── AuthComponent.ts                             # Gestion des erreurs HTTP 429
│   ├── Task/
│   │   └── xxUi/
│   │       └── TaskService.ts                               # Injection du header X-CSRF-Token
│   └── Category/
│       └── xxUi/
│           └── CategoryService.ts                           # Injection du header X-CSRF-Token
```

---

## 3. Contrats d'API (Endpoints)

| ID API | Endpoint | Méthode | Payload attendu | Réponse JSON (Status 200) |
|---|---|---|---|---|
| `API-AUTH-CSRF` | `/api/v1/auth/csrf` | `GET` | *(aucun)* | `{"success": true, "code": 200, "data": {"csrf_token": "64_chars_hex"}}` |
| `API-RATE-LIMIT` | *(Sur blocage `/login`, etc.)* | `*` | *(quelconque)* | `{"success": false, "code": 429, "error": "Trop de tentatives..."}` |
| `API-CSRF-ERROR` | *(Sur échec token CSRF)* | `POST/PUT/DEL` | *(sans token)* | `{"success": false, "code": 403, "error": "Jeton CSRF invalide ou expiré."}` |

---

## 4. Instructions de passage de relais (Handoff)
- **Pour le Dev-Back :** Implémente `Core\Api\Csrf`, `Core\Api\RateLimiter`, `Core\Api\SecurityHeaders`, la migration 007 et la vérification des requêtes mutatives.

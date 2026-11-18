# Architecture Technique : Lot 7 - Haute Disponibilité, Résilience SQLite & Observabilité

## 1. Modèle de Données (MCD) et Configuration SQLite

Ce sprint ne nécessite pas de nouvelle table métier, mais un durcissement de l'infrastructure SQLite via des `PRAGMA` d'optimisation concurrente et un service d'archivage à chaud.

### Paramétrage de la Connexion SQLite (`core/Api/Database.php`) :
À l'ouverture de la connexion PDO SQLite, les directives suivantes sont appliquées systématiquement :
```sql
PRAGMA journal_mode = WAL;
PRAGMA synchronous = NORMAL;
PRAGMA busy_timeout = 5000;
PRAGMA foreign_keys = ON;
```

### Mécanisme de Sauvegarde à Chaud (`scripts/backup-database.php` & `core/Api/BackupService.php`) :
Utilisation de la commande native SQLite sans coupure de service :
```sql
VACUUM INTO 'database/backups/backup-{Y-m-d_His}.sqlite';
```

---

## 2. Arborescence Modulaire

```
todo-list/
├── core/
│   ├── Api/
│   │   ├── Database.php          # Ajout des PRAGMA WAL, synchronous=NORMAL, busy_timeout=5000
│   │   ├── Logger.php            # Service singleton de journalisation (logs/security.log et logs/app.log)
│   │   ├── BackupService.php     # Service de sauvegarde à chaud via VACUUM INTO avec rotation
│   │   ├── Response.php          # Cloisonnement hermétique APP_ENV=production avec error_id
│   │   ├── RateLimiter.php       # Enregistrement des dépassements dans Logger::security()
│   │   ├── Csrf.php              # Enregistrement des rejets CSRF dans Logger::security()
│   │   └── Session.php
│   └── Ui/
│       ├── ButtonLock.ts         # Wrapper asynchrone anti-rebond (disabled, spinner SVG, restoration)
│       ├── NetworkMonitor.ts     # Détection offline/online avec banner-offline et toast-online
│       ├── Toast.ts
│       └── layout.php            # Emplacement réservé pour banner-offline
├── module/
│   ├── Auth/
│   │   ├── AuthApi/
│   │   │   └── AuthController.php # Log d'audit sur échec login / forgot / reset
│   │   └── xxUi/
│   │       └── AuthUi.ts          # Application de ButtonLock sur soumission login/register/forgot
│   ├── Task/
│   │   ├── TaskApi/
│   │   │   └── TaskController.php # Log d'audit sur rejet IDOR (403)
│   │   └── xxUi/
│   │       └── TaskUi.ts          # Application de ButtonLock sur ajout et modification de tâche
│   └── Category/
│       ├── CategoryApi/
│       │   └── CategoryController.php # Log d'audit sur rejet IDOR (403)
│       └── xxUi/
│           └── CategoryUi.ts      # Application de ButtonLock sur création de catégorie
├── scripts/
│   └── backup-database.php       # Script d'exécution CLI de sauvegarde avec rétention
└── logs/
    ├── security.log              # Fichier horodaté d'audit des alertes et violations de sécurité
    └── app.log                   # Journal des exceptions applicatives et erreurs internes
```

---

## 3. Contrats d'API (Endpoints)

Toutes les réponses de l'API conservent impérativement le statut HTTP 200 normalisé `{ success, code, data | error }`.

| ID API | Endpoint / Action | Méthode | Payload attendu (JSON) | Réponse JSON (Status 200) |
|---|---|---|---|---|
| `API-SEC-01` | *Toute route mutative avec erreur 500 en dev* | `*` | `N/A` | `{"success": false, "code": "INTERNAL_ERROR", "error": "SQLSTATE[...]", "trace": "..."}` |
| `API-SEC-02` | *Toute route mutative avec erreur 500 en production (`APP_ENV=production`)* | `*` | `N/A` | `{"success": false, "code": "INTERNAL_ERROR", "error": "Une erreur interne est survenue. Code d'incident : sec-xxxxxxxx", "error_id": "sec-xxxxxxxx"}` |
| `API-CLI-01` | `php scripts/backup-database.php` (CLI) | `CLI` | `Arguments facultatifs` | Sortie console textuelle : `[INFO] Sauvegarde créée avec succès : database/backups/backup-2026-11-18_163000.sqlite` |

### Format de journalisation de sécurité (`logs/security.log`) :
```json
{"timestamp":"2026-11-18 16:30:00","level":"WARNING","event":"RATE_LIMIT_EXCEEDED","ip":"127.0.0.1","user_id":null,"route":"/api/v1/auth/login","details":"Max attempts reached"}
{"timestamp":"2026-11-18 16:30:15","level":"CRITICAL","event":"CSRF_VIOLATION","ip":"127.0.0.1","user_id":42,"route":"/api/v1/tasks/create","details":"Missing or invalid CSRF token"}
{"timestamp":"2026-11-18 16:30:30","level":"ALERT","event":"IDOR_ATTEMPT","ip":"127.0.0.1","user_id":12,"route":"/api/v1/tasks/delete","details":"Attempt to delete task 999 owned by another user"}
```

---

## 4. Instructions de passage de relais (Handoff)
- **Pour le Dev-Back :** 
  1. Configurer les PRAGMA SQLite (`WAL`, `synchronous=NORMAL`, `busy_timeout=5000`) dans `core/Api/Database.php`.
  2. Créer le service `core/Api/Logger.php` avec méthodes `security()` et `error()`.
  3. Mettre à jour `core/Api/Response.php` pour cloisonner les messages d'erreurs internes en mode `APP_ENV=production` avec génération d'`error_id`.
  4. Créer `core/Api/BackupService.php` et le script CLI `scripts/backup-database.php`.
  5. Intégrer les traces d'audit de sécurité dans `RateLimiter.php`, `index.php` (CSRF), `AuthController.php`, `TaskController.php`, et `CategoryController.php`.
  6. Rédiger le rapport technique dans `docs/current-sprint/03a-back-log.md`.

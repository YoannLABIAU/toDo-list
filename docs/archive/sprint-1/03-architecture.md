# Architecture Technique : Sprint 1 - MVP To-Do List

## 1. Modèle de Données (MCD) et Script SQL

### Table : `tasks`
| Table | Colonne | Type SQL | Contraintes (PK, FK, Défaut) | Description |
|---|---|---|---|---|
| `tasks` | `id` | `INTEGER` | PK, AUTO_INCREMENT (ou AUTOINCREMENT en SQLite) | Identifiant unique de la tâche |
| `tasks` | `title` | `VARCHAR(255)` | NOT NULL | Libellé de la tâche |
| `tasks` | `due_date` | `DATE` | NULL | Date d'échéance optionnelle (YYYY-MM-DD) |
| `tasks` | `completed` | `INTEGER` | NOT NULL DEFAULT 0 | Statut : 0 = À faire, 1 = Terminée |
| `tasks` | `created_at` | `DATETIME` | NOT NULL DEFAULT CURRENT_TIMESTAMP | Date et heure de création |
| `tasks` | `updated_at` | `DATETIME` | NOT NULL DEFAULT CURRENT_TIMESTAMP | Date et heure de dernière modification |

### Script de Migration (`/database/migrations/001_create_tasks_table.php`) :
```sql
CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title VARCHAR(255) NOT NULL,
    due_date DATE NULL,
    completed INTEGER NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_tasks_completed ON tasks(completed);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
```

---

## 2. Arborescence Modulaire

Le projet sépare strictement l'infrastructure système (`core/`), la logique métier API (`module/Task/TaskApi/`), l'interface utilisateur (`module/Task/taskUi/`), la base de données (`database/`) et le point d'entrée public (`public/`) :

```
todo-list/
├── core/
│   ├── Api/
│   │   ├── Database.php          # Singleton de connexion PDO SQLite/MySQL
│   │   ├── Response.php          # Standardisation JSON (HTTP 200, {success, code, data/error})
│   │   └── Router.php            # Routeur d'API & dispatch des routes
│   └── Ui/
│       └── layout.php            # Shell HTML5 principal Tailwind & conteneur Toasts/Modales
├── database/
│   ├── migrations/
│   │   └── 001_create_tasks_table.php  # Définition et exécution du schéma
│   └── DatabaseManager.php       # Utilitaires de migration et reset pour les tests QA
├── module/
│   └── Task/
│       ├── TaskApi/
│       │   ├── Task.php          # Modèle / Entité Task
│       │   ├── TaskRepository.php # Requêtes préparées PDO pour le CRUD
│       │   └── TaskController.php # Endpoints HTTP et validation des inputs
│       └── taskUi/
│           ├── task-view.php     # Vue du composant To-Do List (data-testid)
│           ├── TaskService.ts    # Client API Vanilla TS (fetch)
│           └── TaskComponent.ts  # Contrôleur DOM (filtres, modales, toasts, CRUD)
├── public/
│   ├── css/
│   │   └── style.css             # Feuille de styles compilée par Tailwind
│   ├── js/
│   │   └── app.js                # Bundle JavaScript compilé depuis TypeScript
│   └── index.php                 # Point d'entrée unique HTTP
├── src/
│   ├── css/
│   │   └── input.css             # Directives Tailwind CSS (@tailwind base, etc.)
│   └── ts/
│       └── app.ts                # Point d'entrée TypeScript (initialisation des modules)
└── tests/
    └── e2e/
        └── sprint1-tasks.spec.ts # Tests Playwright E2E avec isolation de la BDD
```

---

## 3. Contrats d'API (Endpoints)

> **Règle d'or :** Tous les endpoints renvoient systématiquement un code HTTP **200**, le statut effectif de la requête étant transmis dans le payload JSON sous la clé `code` (`200`, `400`, `404`, `500`).

| ID API | Endpoint | Méthode | Payload attendu (JSON) | Réponse JSON (Status HTTP 200) |
|---|---|---|---|---|
| `API-TASK-01` | `/api/v1/tasks` | `GET` | Aucun (Query param optionnel : `?filter=all\|todo\|completed`) | `{"success": true, "code": 200, "data": [{"id": 1, "title": "Exemple", "due_date": "2026-11-20", "completed": false, "created_at": "...", "updated_at": "..."}]}` |
| `API-TASK-02` | `/api/v1/tasks` | `POST` | `{"title": "string (1-255)", "due_date": "YYYY-MM-DD" \| null}` | `{"success": true, "code": 200, "data": {"id": 1, "title": "Exemple", "due_date": "2026-11-20", "completed": false, ...}}` |
| `API-TASK-03` | `/api/v1/tasks/{id}` | `PUT` | `{"title": "string (1-255)", "due_date": "YYYY-MM-DD" \| null}` | `{"success": true, "code": 200, "data": {"id": 1, "title": "Modifié", "due_date": null, "completed": false, ...}}` |
| `API-TASK-04` | `/api/v1/tasks/{id}/toggle` | `PATCH` | `{}` | `{"success": true, "code": 200, "data": {"id": 1, "completed": true}}` |
| `API-TASK-05` | `/api/v1/tasks/{id}` | `DELETE` | `{}` | `{"success": true, "code": 200, "data": {"id": 1, "deleted": true}}` |
| `API-TASK-06` | `/api/v1/test/reset-db` | `POST` | `{}` | `{"success": true, "code": 200, "data": {"reset": true}}` *(Réservé environnement dev/test)* |

### Format d'erreur standard :
En cas d'erreur de validation ou ressource introuvable :
```json
{
  "success": false,
  "code": 400,
  "error": "Le titre de la tâche est obligatoire (entre 1 et 255 caractères)."
}
```

---

## 4. Instructions de passage de relais (Handoff)
- **Pour le Dev-Back :** Implémente le Core (`Database.php`, `Response.php`, `Router.php`), les migrations SQL, et le module `TaskApi` (`Task.php`, `TaskRepository.php`, `TaskController.php`) en respectant strictement ces contrats JSON à 3 arguments et le typage PHP 8.5 strict.

# Architecture Technique : Sprint 2 - V2 Organisation & Catégorisation

## 1. Modèle de Données (MCD) et Script SQL

### Table : `categories`
| Table | Colonne | Type SQL | Contraintes | Description |
|---|---|---|---|---|
| `categories` | `id` | `INTEGER` | PK, AUTOINCREMENT | Identifiant unique de la catégorie |
| `categories` | `name` | `VARCHAR(50)` | NOT NULL UNIQUE | Nom de la catégorie (insensible à la casse) |
| `categories` | `color` | `VARCHAR(20)` | NOT NULL DEFAULT 'indigo' | Code couleur sémantique ('blue', 'emerald', 'purple', 'amber', 'rose', 'slate', 'indigo') |
| `categories` | `created_at` | `DATETIME` | NOT NULL DEFAULT CURRENT_TIMESTAMP | Date de création |

### Table : `tasks` (Évolution)
| Table | Colonne | Type SQL | Contraintes | Description |
|---|---|---|---|---|
| `tasks` | `category_id` | `INTEGER` | NULL, FK `categories(id)` ON DELETE SET NULL | Identifiant de la catégorie associée (optionnelle) |

### Script de Migration (`/database/migrations/002_create_categories_table.php`) :
```sql
CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(50) NOT NULL UNIQUE COLLATE NOCASE,
    color VARCHAR(20) NOT NULL DEFAULT 'indigo',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_categories_name ON categories(name);

-- Ajout de la colonne category_id sur tasks (si non présente)
-- ALTER TABLE tasks ADD COLUMN category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_tasks_category_id ON tasks(category_id);
```

---

## 2. Arborescence Modulaire

```
todo-list/
├── database/
│   └── migrations/
│       ├── 001_create_tasks_table.php
│       └── 002_create_categories_table.php # Migration schéma Sprint 2
├── module/
│   ├── Category/
│   │   ├── CategoryApi/
│   │   │   ├── Category.php                # Modèle DTO
│   │   │   ├── CategoryRepository.php      # Persistance PDO (create, findAll, findById, delete)
│   │   │   └── CategoryController.php      # Endpoints REST
│   │   └── xxUi/
│   │       ├── CategoryService.ts          # Client API HTTP
│   │       └── category-modal.php          # Vue modale gestion des catégories
│   └── Task/
│       ├── TaskApi/
│       │   ├── Task.php                    # Enrichi avec category_id, category_name, category_color
│       │   ├── TaskRepository.php          # Requêtes avec jointure LEFT JOIN categories et filtre category_id
│       │   └── TaskController.php          # Gestion et validation du paramètre category_id
│       └── xxUi/
│           ├── types.ts                    # Interfaces enrichies Task & Category
│           ├── TaskService.ts              # Appels avec category_id et filtre catégorie
│           └── TaskComponent.ts            # Gestion UI (badges, filtres combinés, sélection)
```

---

## 3. Contrats d'API (Endpoints)

> **Règle d'or :** Tous les endpoints renvoient systématiquement un code HTTP **200**, avec la structure JSON normalisée `{ "success": bool, "code": int, "data": ... | "error": ... }`.

### Nouveaux Endpoints Catégories :
| ID API | Endpoint | Méthode | Payload attendu (JSON) | Réponse JSON (Status HTTP 200) |
|---|---|---|---|---|
| `API-CAT-01` | `/api/v1/categories` | `GET` | Aucun | `{"success": true, "code": 200, "data": [{"id": 1, "name": "Travail", "color": "blue"}]}` |
| `API-CAT-02` | `/api/v1/categories` | `POST` | `{"name": "string (1-50)", "color": "string"}` | `{"success": true, "code": 200, "data": {"id": 1, "name": "Travail", "color": "blue"}}` |
| `API-CAT-03` | `/api/v1/categories/{id}` | `DELETE` | Aucun | `{"success": true, "code": 200, "data": {"id": 1, "deleted": true}}` |

### Endpoints Tâches Évolués (Non-régression garantie) :
| ID API | Endpoint | Méthode | Payload attendu (JSON) | Réponse JSON (Status HTTP 200) |
|---|---|---|---|---|
| `API-TASK-01` | `/api/v1/tasks` | `GET` | Query params : `?filter=all\|todo\|completed&category_id={id}` | `{"success": true, "code": 200, "data": [{"id": 1, "title": "...", "due_date": "...", "completed": false, "category_id": 1, "category_name": "Travail", "category_color": "blue"}]}` |
| `API-TASK-02` | `/api/v1/tasks` | `POST` | `{"title": "...", "due_date": "..." \| null, "category_id": int \| null}` | `{"success": true, "code": 200, "data": {"id": 1, ..., "category_id": 1, ...}}` |
| `API-TASK-03` | `/api/v1/tasks/{id}` | `PUT` | `{"title": "...", "due_date": "..." \| null, "category_id": int \| null}` | `{"success": true, "code": 200, "data": {"id": 1, ..., "category_id": 1, ...}}` |

---

## 4. Instructions de passage de relais (Handoff)
- **Pour le Dev-Back :** Implémente la migration `002_create_categories_table.php`, le module `CategoryApi`, et enrichis `TaskApi` pour gérer `category_id` (jointure avec `categories` et suppression en cascade `ON DELETE SET NULL`). Documente dans `/docs/current-sprint/03a-back-log.md`.

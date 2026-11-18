# Architecture Technique : Sprint 3 - V3 Automatisation & Récurrence

## 1. Modèle de Données (MCD) et Script SQL

### Évolution de la Table : `tasks`
| Table | Colonne | Type SQL | Contraintes | Description |
|---|---|---|---|---|
| `tasks` | `recurrence` | `VARCHAR(20)` | NOT NULL DEFAULT 'none' | Règle de récurrence : `'none'`, `'daily'`, `'weekly'`, `'monthly'` |

### Script de Migration (`/database/migrations/003_add_recurrence_to_tasks.php`) :
```sql
-- Ajout de la colonne recurrence avec valeur par défaut 'none'
ALTER TABLE tasks ADD COLUMN recurrence VARCHAR(20) NOT NULL DEFAULT 'none';
CREATE INDEX IF NOT EXISTS idx_tasks_recurrence ON tasks(recurrence);
```

---

## 2. Arborescence Modulaire

```
todo-list/
├── database/
│   └── migrations/
│       ├── 001_create_tasks_table.php
│       ├── 002_create_categories_table.php
│       └── 003_add_recurrence_to_tasks.php  # Migration Sprint 3
├── module/
│   └── Task/
│       ├── TaskApi/
│       │   ├── Task.php                     # Ajout de la propriété recurrence
│       │   ├── TaskRepository.php           # create/update avec recurrence, gestion transactionnelle toggle + auto-création
│       │   └── TaskController.php           # Validation de recurrence et orchestration
│       └── xxUi/
│           ├── types.ts                     # RecurrenceType: 'none' | 'daily' | 'weekly' | 'monthly'
│           ├── TaskService.ts               # Transmission du champ recurrence
│           └── TaskComponent.ts             # Badges de récurrence, calculs d'alertes délais (overdue/today)
```

---

## 3. Logique de Calcul de la Prochaine Occurrence

Lors de l'appel à `PATCH /api/v1/tasks/{id}/toggle` :
1. Si la tâche passe de `completed = 0` à `completed = 1` et que `recurrence !== 'none'` :
   - Base de calcul : `$baseDate = $task['due_date'] ?? date('Y-m-d')`.
   - Calcul de la prochaine échéance :
     - `daily` : `date('Y-m-d', strtotime('+1 day', strtotime($baseDate)))`
     - `weekly` : `date('Y-m-d', strtotime('+7 days', strtotime($baseDate)))`
     - `monthly` : `date('Y-m-d', strtotime('+1 month', strtotime($baseDate)))`
   - Insertion immédiate d'une nouvelle tâche avec les mêmes propriétés (`title`, `category_id`, `recurrence`) et la nouvelle échéance, avec `completed = 0`.
2. La réponse JSON 200 retourne la tâche basculée ainsi que les détails de l'occurrence générée le cas échéant.

---

## 4. Contrats d'API (Endpoints)

> **Règle d'or :** Statut HTTP 200 systématique avec structure standard `{ "success": bool, "code": int, "data": ... | "error": ... }`.

| ID API | Endpoint | Méthode | Payload attendu (JSON) | Réponse JSON (Status HTTP 200) |
|---|---|---|---|---|
| `API-TASK-01` | `/api/v1/tasks` | `GET` | Query params : `?filter=all\|todo\|completed&category_id={id}` | `{"success": true, "code": 200, "data": [{"id": 1, ..., "recurrence": "weekly"}]}` |
| `API-TASK-02` | `/api/v1/tasks` | `POST` | `{"title": "...", "due_date": "..." \| null, "category_id": int \| null, "recurrence": "none"\|"daily"\|"weekly"\|"monthly"}` | `{"success": true, "code": 200, "data": {"id": 1, ..., "recurrence": "weekly"}}` |
| `API-TASK-03` | `/api/v1/tasks/{id}` | `PUT` | `{"title": "...", "due_date": "..." \| null, "category_id": int \| null, "recurrence": "none"\|"daily"\|"weekly"\|"monthly"}` | `{"success": true, "code": 200, "data": {"id": 1, ..., "recurrence": "daily"}}` |
| `API-TASK-04` | `/api/v1/tasks/{id}/toggle` | `PATCH` | `{}` | `{"success": true, "code": 200, "data": {"id": 1, "completed": true, "recurrence_generated": true, "next_task": {...}}}` |

---

## 5. Instructions de passage de relais (Handoff)
- **Pour le Dev-Back :** Implémente la migration `003_add_recurrence_to_tasks.php`, mets à jour `Database.php`, `Task.php`, `TaskRepository.php` et `TaskController.php` pour persister `recurrence` et exécuter le calcul automatique d'occurrence lors de `toggle`. Documente dans `/docs/current-sprint/03a-back-log.md`.

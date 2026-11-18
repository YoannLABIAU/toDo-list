# Architecture Technique : Lot 8 - Mode Invité (LocalStorage) & Migration BDD à l'Inscription

## 1. Modèle de Données et Stratégie de Stockage

### A. Données Côté Client (Mode Invité / Non Connecté)
En mode non connecté, les entités sont conservées dans le `localStorage` du navigateur du visiteur :
- Clé `todo_guest_categories` : Tableau JSON d'objets catégorie `{ id: number, name: string, color: string }`.
- Clé `todo_guest_tasks` : Tableau JSON d'objets tâche `{ id: number, title: string, due_date: string|null, due_time: string|null, category_id: number|null, recurrence: string, recurrence_end_date: string|null, completed: number, user_id: null, created_at: string }`.

### B. Données Côté Serveur (Mode Connecté)
Aucune modification du schéma de base de données relationnelle SQLite n'est requise. Les tables `tasks` et `categories` existantes sont utilisées directement, rattachées au `user_id` de la session.

---

## 2. Arborescence Modulaire

```
todo-list/
├── core/
│   └── Ui/
│       ├── LocalStorageService.ts # Service d'abstraction de gestion du localStorage invité
│       └── layout.php             # Modale de confirmation de migration et badge invité
├── module/
│   ├── Auth/
│   │   ├── AuthApi/
│   │   │   └── SyncController.php # Contrôleur d'importation en masse des données locales
│   │   └── xxUi/
│   │       ├── AuthComponent.ts   # Déclenchement de la modale de migration post-inscription
│   │       └── auth-view.php      # Intégration du dialogue de confirmation de migration
│   ├── Task/
│   │   └── xxUi/
│   │       └── TaskComponent.ts   # Bascule transparente Mode Invité (Local) <-> Mode Connecté (API)
│   └── Category/
│       └── xxUi/
│           └── CategoryService.ts # Support du mode local invité
└── index.php                      # Déclaration de la route POST /api/v1/sync/import-local
```

---

## 3. Contrats d'API (Endpoints)

Toutes les réponses de l'API conservent impérativement le statut HTTP 200 normalisé `{ success, code, data | error }`.

| ID API | Endpoint | Méthode | Headers | Payload attendu (JSON) | Réponse JSON (Status 200) |
|---|---|---|---|---|---|
| `API-SYNC-01` | `/api/v1/sync/import-local` | `POST` | `X-CSRF-Token` | `{ "categories": [...], "tasks": [...] }` | `{"success": true, "code": 200, "data": {"imported_categories": 1, "imported_tasks": 2, "message": "..."}}` |

### Détail du Payload `POST /api/v1/sync/import-local` :
```json
{
  "categories": [
    { "local_id": 1, "name": "Personnel", "color": "rose" }
  ],
  "tasks": [
    {
      "title": "Acheter des fruits",
      "due_date": "2026-11-20",
      "due_time": "10:00",
      "category_local_id": 1,
      "recurrence": "weekly",
      "recurrence_end_date": null,
      "completed": 0
    }
  ]
}
```

### Logique Transactionnelle Backend (`SyncController.php`) :
1. Vérification que l'utilisateur est authentifié (`Session::getUserId() !== null`), sinon retour code `401 Unauthorized`.
2. Démarrage d'une transaction SQLite (`$pdo->beginTransaction()`).
3. Pour chaque catégorie locale :
   - Recherche si l'utilisateur possède déjà une catégorie portant ce nom.
   - Si non trouvée, insertion dans `categories` avec `user_id`.
   - Mémorisation de la correspondance `$categoryMap[local_id] = db_id`.
4. Pour chaque tâche locale :
   - Résolution du `category_id` via `$categoryMap`.
   - Insertion dans la table `tasks` rattachée au `user_id` de la session.
5. Validation de la transaction (`$pdo->commit()`).
6. Journalisation dans `Logger::security('DATA_MIGRATED', ...)` pour l'audit.

---

## 4. Instructions de passage de relais (Handoff)
- **Pour le Dev-Back :** Implémente le contrôleur `SyncController.php` avec gestion de transaction PDO, enregistre la route dans `index.php`, valide les entrées et documente dans `docs/current-sprint/03a-back-log.md`.

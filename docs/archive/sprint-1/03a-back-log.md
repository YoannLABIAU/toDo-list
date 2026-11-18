# Rapport d'Implémentation Backend : Sprint 1 - MVP To-Do List

## 1. Résumé des Réalisations
- **Core API :**
  - `core/Api/Database.php` : Singleton PDO avec pilote SQLite (`database/todo_list.sqlite`), gestion des transactions, intégrité référentielle et initialisation automatique du schéma.
  - `core/Api/Response.php` : Rendu standardisé des réponses JSON renvoyant systématiquement le statut HTTP 200 et la structure à 3 arguments `{ "success": bool, "code": int, "data": ... | "error": ... }`.
  - `core/Api/Router.php` : Routeur RESTful léger prenant en charge les paramètres dynamiques d'URL et les méthodes HTTP (GET, POST, PUT, PATCH, DELETE).
- **Migration Base de Données :**
  - `database/migrations/001_create_tasks_table.php` : Création de la table `tasks` avec index sur `completed` et `due_date`.
- **Module Task (`module/Task/TaskApi/`) :**
  - `Task.php` : DTO / Modèle représentant l'entité Task avec conversion bidirectionnelle Array/JSON.
  - `TaskRepository.php` : Requêtes préparées PDO pour lister (avec filtre), créer, mettre à jour, basculer le statut et supprimer.
  - `TaskController.php` : Contrôleur validant strictement les règles de gestion `RG-01` (titre obligatoire, 1-255 caractères) et `RG-02` (date ISO YYYY-MM-DD optionnelle).
- **Contrôle Qualité :**
  - Vérification syntaxique stricte validée (`php -l`) sans aucune erreur ni avertissement.
  - Tests d'intégration curl validés sur l'ensemble des endpoints.

## 2. Endpoints Disponibles et Testés

| Méthode | Endpoint | Description | Statut |
|---|---|---|---|
| `GET` | `/api/v1/tasks` | Liste des tâches (paramètre query optionnel `?filter=all\|todo\|completed`) | 200 OK |
| `POST` | `/api/v1/tasks` | Création d'une tâche (`title`, `due_date`) | 200 OK |
| `PUT` | `/api/v1/tasks/{id}` | Modification d'une tâche existante (`title`, `due_date`) | 200 OK |
| `PATCH` | `/api/v1/tasks/{id}/toggle` | Bascule de l'état d'achèvement (À faire / Terminée) | 200 OK |
| `DELETE` | `/api/v1/tasks/{id}` | Suppression définitive d'une tâche | 200 OK |
| `POST` | `/api/v1/test/reset-db` | Réinitialisation complète de la table pour les tests E2E | 200 OK |

## 3. Instructions de passage de relais (Handoff)
- **Pour le Dev-Front :** Les API sont prêtes, fonctionnelles, testées et respectent scrupuleusement la norme JSON HTTP 200. Tu peux câbler l'UI dans `module/Task/taskUi/` et `core/Ui/` avec les attributs `data-testid` requis.

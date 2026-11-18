# Rapport d'Implémentation Backend : Sprint 2 - V2 Organisation & Catégorisation

## 1. Résumé des Réalisations
- **Migration & Schéma BDD :**
  - `database/migrations/002_create_categories_table.php` : Création de la table `categories` (nom unique `COLLATE NOCASE`, couleur, horodatage) et ajout de la clé étrangère `category_id` sur la table `tasks`.
  - Mise à jour de `core/Api/Database.php` pour exécuter la nouvelle migration et réinitialiser proprement `categories` et `tasks` dans `resetDatabase()`.
- **Module Category (`module/Category/CategoryApi/`) :**
  - `Category.php` : Modèle DTO pour les catégories.
  - `CategoryRepository.php` : Opérations CRUD préparées PDO (`findAll`, `findById`, `findByName`, `create`, `delete` avec dissociation automatique des tâches).
  - `CategoryController.php` : Endpoints avec validation stricte `RG-08` (nom obligatoire 1-50 caractères, unicité) et `RG-09` (palette de couleurs).
- **Module Task (`module/Task/TaskApi/`) :**
  - Enrichissement de `Task.php` avec les propriétés `category_id`, `category_name`, `category_color`.
  - `TaskRepository.php` : Jointure `LEFT JOIN categories` et gestion du filtrage combiné `category_id` et statut.
  - `TaskController.php` : Prise en charge de `category_id` à la création, modification et consultation.
- **Routage REST (`index.php`) :**
  - `GET /api/v1/categories` -> `CategoryController::index()`
  - `POST /api/v1/categories` -> `CategoryController::create()`
  - `DELETE /api/v1/categories/{id}` -> `CategoryController::delete($id)`
- **Vérifications :**
  - `php -l` validé sans aucune erreur.
  - Tests d'intégration curl validés sur les nouveaux endpoints et la dissociation sécurisée.

## 2. Endpoints Disponibles et Testés

| Méthode | Endpoint | Description | Statut |
|---|---|---|---|
| `GET` | `/api/v1/categories` | Liste de toutes les catégories ordonnées par nom | 200 OK |
| `POST` | `/api/v1/categories` | Création d'une catégorie (`name`, `color`) | 200 OK |
| `DELETE` | `/api/v1/categories/{id}` | Suppression d'une catégorie et dissociation des tâches | 200 OK |
| `GET` | `/api/v1/tasks` | Tâches filtrées par statut et/ou `?category_id={id}` | 200 OK |
| `POST` | `/api/v1/tasks` | Création de tâche avec `category_id` optionnel | 200 OK |
| `PUT` | `/api/v1/tasks/{id}` | Modification de tâche avec `category_id` optionnel | 200 OK |

## 3. Instructions de passage de relais (Handoff)
- **Pour le Dev-Front :** Les API pour les catégories et l'association aux tâches sont prêtes, testées et respectent la norme JSON HTTP 200. Tu peux intégrer l'interface (panneau/modale de gestion des catégories, sélecteurs dans les formulaires, badges colorés et filtre de catégorie).

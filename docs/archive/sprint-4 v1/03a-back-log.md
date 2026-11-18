# 03a - Journal de Développement Backend (Sprint 4)

**Auteur :** @dev-back  
**Date :** 18 Novembre 2026  
**Statut :** Terminé  

---

## 1. Objectifs Backend Réalisés

- **Migration BDD (`database/migrations/004_add_time_and_recurrence_end_to_tasks.php`) :**
  - Ajout des colonnes `due_time VARCHAR(5) DEFAULT NULL` et `recurrence_end_date DATE DEFAULT NULL` sur la table `tasks`.
  - Intégration dans `core/Api/Database.php` pour l'exécution automatique.
- **Modèle `Task` :**
  - Ajout des propriétés `$dueTime` et `$recurrenceEndDate` avec leurs getters.
  - Sérialisation JSON et désérialisation depuis SQLite (`toArray()` et `fromArray()`).
- **Repository `TaskRepository` :**
  - Sélection des nouveaux champs dans toutes les requêtes (`due_time`, `recurrence_end_date`).
  - **RG-21 (Tri par défaut) :** Ordonnancement par urgence temporelle (délai restant le plus court en tête) :
    ```sql
    ORDER BY tasks.completed ASC, 
             CASE WHEN tasks.due_date IS NULL THEN 1 ELSE 0 END ASC, 
             tasks.due_date ASC, 
             CASE WHEN tasks.due_time IS NULL THEN '23:59' ELSE tasks.due_time END ASC, 
             tasks.id ASC
    ```
  - **RG-22 (Recherche) & RG-23 (Tri) :** Prise en compte des filtres `$search` (`LIKE :search`) et `$sort` (`name_asc`, `name_desc`, `due_asc`).
  - **RG-19 (Fin de récurrence) :** Dans `toggle()`, calcul de `$nextDate` et vérification : si `$nextDate > $task['recurrence_end_date']`, aucune création n'est effectuée et l'API renvoie `recurrence_generated = false` et `recurrence_ended = true`.
- **Contrôleur `TaskController` :**
  - Prise en charge des query params `search` et `sort` dans `index()`.
  - Validation du format horaire `HH:MM` (`preg_match('/^([01]\d|2[0-3]):[0-5]\d$/')`) et de la date ISO `YYYY-MM-DD` dans `create()` et `update()`.
  - Normalisation des réponses sous statut HTTP 200 `{ success, code, data | error }`.

---

## 2. Fichiers Modifiés & Créés

- `database/migrations/004_add_time_and_recurrence_end_to_tasks.php` (Créé)
- `core/Api/Database.php` (Modifié)
- `module/Task/TaskApi/Task.php` (Modifié)
- `module/Task/TaskApi/TaskRepository.php` (Modifié)
- `module/Task/TaskApi/TaskController.php` (Modifié)

---

## 3. Validation

- Syntaxe PHP validée à 100% sans erreur (`php -l`).
- Tests curl vérifiés :
  - Création avec horaire et date de fin de récurrence.
  - Toggle 1 : Génération de l'occurrence suivante avec transmission de l'horaire et de la date de fin.
  - Toggle 2 : Dépassement de la date de fin -> Arrêt de la récurrence validé (`recurrence_ended: true`, `recurrence_generated: false`).
  - Recherche textuelle (`search=Medecin` et absence de résultat).

Le relais est transmis au **@dev-front**.

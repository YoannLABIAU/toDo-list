# 03a - Journal de Développement Backend (Sprint 3 - Correctifs)

**Auteur :** @dev-back  
**Date :** 18 Novembre 2026  
**Statut :** Terminé  

---

## 1. Objectifs Backend Réalisés

- **Migration BDD (`database/migrations/005_add_has_generated_next_to_tasks.php`) :**
  - Ajout de la colonne `has_generated_next INTEGER DEFAULT 0` sur la table `tasks`.
  - Intégration dans `core/Api/Database.php` (`runHasGeneratedNextMigration()`).
- **Modèle `Task` :**
  - Ajout de la propriété `$hasGeneratedNext` (booléen) et de l'accesseur `hasGeneratedNext()`.
  - Intégration dans `toArray()` et `fromArray()`.
- **Repository `TaskRepository` :**
  - Sélection de `tasks.has_generated_next` dans `findAll` et `findById`.
  - **RG-24 (Verrouillage anti-duplication de récurrence) :**
    - Lors de l'achèvement d'une tâche récurrente (`toggle()`), vérification préalable de `empty($task['has_generated_next'])`. Si la tâche a déjà généré sa tâche fille, aucune recréation n'est effectuée (`recurrence_generated: false`).
    - Garde-fou d'intégrité SQL : vérification qu'aucune tâche active (`completed = 0`) avec le même titre et la même date d'échéance calculée n'existe déjà.
    - Lors de la 1ère génération, mise à jour atomique `has_generated_next = 1`.
    - Si la tâche est ultérieurement décochée (`completed = 0`), son drapeau `has_generated_next` reste à `1`.

---

## 2. Fichiers Modifiés & Créés

- `database/migrations/005_add_has_generated_next_to_tasks.php` (Créé)
- `core/Api/Database.php` (Modifié)
- `module/Task/TaskApi/Task.php` (Modifié)
- `module/Task/TaskApi/TaskRepository.php` (Modifié)

---

## 3. Validation

- Syntaxe PHP validée à 100% sans erreur (`php -l`).
- Test API curl vérifié : Toggle 1 (complétion initiale) -> occurrence fille générée (`recurrence_generated: true`), Toggle 2 (décocher) -> repasse à `completed: false`, Toggle 3 (recocher) -> repasse à `completed: true` mais `recurrence_generated: false`, aucune tâche fille dupliquée.

Le relais est transmis au **@dev-front**.

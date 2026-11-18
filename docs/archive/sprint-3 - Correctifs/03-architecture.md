# 03 - Architecture & Spécifications Techniques (Sprint 3 - Correctifs)

**Auteur :** @architect  
**Date :** 18 Novembre 2026  
**Statut :** Validé  

---

## 1. Évolution de la Base de Données

Un nouveau script de migration `database/migrations/005_add_has_generated_next_to_tasks.php` est introduit :
```sql
ALTER TABLE tasks ADD COLUMN has_generated_next INTEGER DEFAULT 0;
```
Cette colonne mémorise si la tâche a déjà généré sa tâche fille suivante, empêchant toute création multiple lors de bascules répétées ("décocher / recocher").

---

## 2. Logique Backend (TaskRepository)

Dans la méthode `toggle(int $id)` :
1. Mise à jour de l'état `completed` (0 ou 1).
2. Si la tâche passe à `completed = 1` :
   - Vérifier si `recurrence !== 'none'` ET `has_generated_next == 0`.
   - Si les deux conditions sont réunies :
     - Calcul de `$nextDate`.
     - Vérification de la date limite `recurrence_end_date`.
     - Vérification préventive en base : `SELECT id FROM tasks WHERE title = :title AND due_date = :due_date AND completed = 0`.
     - Si aucun doublon : création de la nouvelle tâche.
     - Mise à jour de la tâche parente : `UPDATE tasks SET has_generated_next = 1 WHERE id = :id`.
3. Si la tâche est décochée (`completed = 0`), la valeur `has_generated_next` est préservée à `1`.

---

## 3. Architecture UI (Modale de Création)

- **Composant Modale :**
  - `<div data-testid="modal-add-task" class="hidden fixed inset-0 z-50 ...">`
  - Contient le formulaire `#add-task-form` avec les sélecteurs existants.
- **Déclencheur d'ouverture :**
  - Bouton `<button id="btn-open-add-task" data-testid="btn-open-add-task" ...>` placé dans l'en-tête de page.
- **Gestionnaire JavaScript (`TaskComponent.ts`) :**
  - Méthodes publiques `openAddModal()` et `closeAddModal()`.
  - Exposition globale `window.todoApp.openAddModal()`.

---

Le relais est transmis au **@dev-back** pour l'implémentation backend et de la migration.

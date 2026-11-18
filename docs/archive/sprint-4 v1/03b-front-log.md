# 03b - Journal de Développement Frontend (Sprint 4)

**Auteur :** @dev-front  
**Date :** 18 Novembre 2026  
**Statut :** Terminé  

---

## 1. Objectifs Frontend Réalisés

- **Types (`types.ts`) :**
  - Ajout des champs optionnels `due_time?: string | null`, `recurrence_end_date?: string | null` et `recurrence_ended?: boolean` sur l'interface `Task`.
- **Service API (`TaskService.ts`) :**
  - Méthode `getTasks()` étendue pour prendre en compte les paramètres de requête `search` et `sort` (`due_asc`, `name_asc`, `name_desc`).
  - Méthodes `createTask()` et `updateTask()` enrichies des paramètres `dueTime` et `recurrenceEndDate`.
- **Gabarit Vue (`task-view.php`) :**
  - Ajout du champ horaire `input-task-due-time` (type `time`) et du champ de fin de récurrence `input-task-recurrence-end` (type `date`) dans le formulaire d'ajout.
  - Ajout du champ horaire `input-edit-task-due-time` et fin de récurrence `input-edit-task-recurrence-end` dans la modale d'édition.
  - Intégration de la barre d'outils au-dessus des filtres : champ de recherche textuelle instantanée `input-search-tasks` et sélecteur de tri `select-task-sort`.
- **Composant UI (`TaskComponent.ts`) :**
  - Liaison dynamique des champs et synchronisation avec les états `currentSearch` et `currentSort` (`due_asc` par défaut).
  - Événement `input` sur la barre de recherche et `change` sur le tri rechargeant la liste de façon fluide.
  - Affichage de l'horaire ciblé `task-due-time-${task.id}` dans le badge d'échéance de la tâche (`à HH:MM`).
  - Toast dédié lors de l'arrêt de la récurrence : *"Tâche terminée ! Fin de la plage de récurrence atteinte."*
- **Compilation :** `npm run build` exécuté avec succès (code 0).

---

## 2. Fichiers Modifiés

- `module/Task/xxUi/types.ts`
- `module/Task/xxUi/TaskService.ts`
- `module/Task/xxUi/task-view.php`
- `module/Task/xxUi/TaskComponent.ts`
- `public/js/` (bundle ES modules compilé)
- `public/css/style.css` (recompilé)

---

## 3. Validation

- Build TypeScript sans warning ni erreur.
- Présence de tous les `data-testid` requis pour les tests UAT.

Le relais est transmis au **@qa-uat**.

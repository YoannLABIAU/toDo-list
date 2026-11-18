# 03b - Journal de Développement Frontend (Sprint 3)

**Auteur :** @dev-front  
**Date :** 18 Novembre 2026  
**Statut :** Terminé  

---

## 1. Objectifs Frontend Réalisés

- **Types TypeScript (`types.ts`) :**
  - Ajout du type `RecurrenceType = 'none' | 'daily' | 'weekly' | 'monthly'`.
  - Extension de l'interface `Task` avec `recurrence: RecurrenceType`, `recurrence_generated?: boolean` et `next_task?: Task`.
- **Service API (`TaskService.ts`) :**
  - Mise à jour des signatures de `createTask` et `updateTask` pour accepter et envoyer le paramètre `recurrence` (par défaut `'none'`).
- **Vue HTML/PHP (`task-view.php`) :**
  - Intégration du sélecteur `select-task-recurrence` (options : Aucune, Quotidienne, Hebdomadaire, Mensuelle) dans le formulaire d'ajout.
  - Intégration du sélecteur `select-edit-task-recurrence` dans la modale d'édition de tâche.
- **Composant UI (`TaskComponent.ts`) :**
  - Liaison des éléments de sélection de récurrence (formulaire d'ajout et modale de modification).
  - Gestion de l'affichage du badge de récurrence `task-recurrence-badge-${task.id}` affichant un icône de cycle et le libellé en français (Quotidienne, Hebdomadaire, Mensuelle).
  - Calcul dynamique de la date du jour `todayStr` (`YYYY-MM-DD`).
  - Détection et affichage des alertes visuelles d'échéance :
    - Badge rouge `task-overdue-badge-${task.id}` ("En retard") si tâche non terminée et `due_date < todayStr`.
    - Badge ambre `task-today-badge-${task.id}` ("Aujourd'hui") si tâche non terminée et `due_date === todayStr`.
  - Notification Toast dédiée en cas de récurrence régénérée automatiquement à la suite d'un toggle.
- **Compilation :**
  - Exécution réussie de `npm run build` (TypeScript `tsc` + Tailwind CSS).

---

## 2. Fichiers Modifiés

- `module/Task/xxUi/types.ts`
- `module/Task/xxUi/TaskService.ts`
- `module/Task/xxUi/task-view.php`
- `module/Task/xxUi/TaskComponent.ts`
- `public/js/` (fichiers compilés)
- `public/css/style.css` (recompilé)

---

## 3. Validation

- Build compilé à 100% sans erreur ni warning TS.
- Tous les sélecteurs et badges possèdent les `data-testid` requis pour les tests E2E.

Le relais est transmis au **@qa-uat**.

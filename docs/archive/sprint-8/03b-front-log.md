# Journal de Développement Frontend - Sprint 8 (Mode Invité LocalStorage & Migration)

**Auteur :** @dev-front  
**Date :** 18/11/2026  
**Statut :** TERMINE  

---

## 1. Objectifs & Scope Frontend

Implémentation des fonctionnalités Frontend du Sprint 8 :
- **RG-43 & RG-44 (Mode Invité / Visiteur non connecté) :** Stockage local dans `localStorage` (`todo_guest_tasks`, `todo_guest_categories`). Affichage d'un badge visible "Mode Hors-Ligne (Données locales)" (`[data-testid="badge-guest-mode"]`).
- **RG-45 & RG-46 (Proposition de migration des données à l'inscription) :** Détection de données locales lors d'un `register` réussi. Affichage d'une modale de confirmation dédiée (`[data-testid="modal-migrate-data"]`) indiquant le nombre de tâches locales. Import atomique via `POST /api/v1/sync/import-local` en cas de validation, puis purge du `localStorage`.
- **RG-47 (Mode Connecté Exclusif BDD) :** Lorsque l'utilisateur est authentifié, l'application interagit exclusivement avec l'API REST serveur SQLite. Le badge invité est masqué.

---

## 2. Fichiers créés et modifiés

### A. Création du service LocalStorage
- **[core/Ui/LocalStorageService.ts](file:///c:/laragon/www/todo-list/core/Ui/LocalStorageService.ts)** :
  - Gestion du CRUD local (`getGuestTasks`, `saveGuestTasks`, `getGuestCategories`, `saveGuestCategories`).
  - `createGuestTask`, `updateGuestTask`, `deleteGuestTask`, `toggleGuestTask` avec génération de la récurrence automatique locale et détection de fin de plage.
  - `createGuestCategory`, `deleteGuestCategory` (avec déclassement des tâches associées).
  - `getFilteredAndSortedGuestTasks` : filtrage par statut ('all' | 'todo' | 'completed'), catégorie, recherche textuelle insensible à la casse, et tri par échéance la plus proche ou alphabétique.
  - `hasGuestData()`, `getGuestTaskCount()`, `clearGuestData()`.

### B. Mises à jour Vues UI
- **[module/Task/xxUi/task-view.php](file:///c:/laragon/www/todo-list/module/Task/xxUi/task-view.php)** :
  - Ajout du badge d'information `[data-testid="badge-guest-mode"]` dans l'en-tête de la To-Do List.
- **[module/Auth/xxUi/auth-view.php](file:///c:/laragon/www/todo-list/module/Auth/xxUi/auth-view.php)** :
  - Ajout de la modale `[data-testid="modal-migrate-data"]` avec le compteur `[data-testid="migrate-task-count"]`, le bouton de validation `[data-testid="btn-confirm-migration"]` et le bouton d'ignorance `[data-testid="btn-skip-migration"]`.

### C. Mises à jour des Composants TypeScript
- **[core/Ui/CsrfHelper.ts](file:///c:/laragon/www/todo-list/core/Ui/CsrfHelper.ts)** :
  - Ajout de la méthode `refreshCsrfToken()` pour mettre à jour la balise `<meta name="csrf-token">` après inscription ou connexion.
- **[module/Task/xxUi/types.ts](file:///c:/laragon/www/todo-list/module/Task/xxUi/types.ts)** :
  - Ajout de `user_id?: number | null;` et `has_generated_next?: number | boolean;`.
- **[module/Auth/xxUi/AuthComponent.ts](file:///c:/laragon/www/todo-list/module/Auth/xxUi/AuthComponent.ts)** :
  - Branchement du flux post-inscription : si `LocalStorageService.hasGuestData()` est vrai, ouverture de `modal-migrate-data`.
  - Envoi des données vers `POST /api/v1/sync/import-local` avec gestion des headers CSRF sécurisés.
  - Vidage du `localStorage` et rafraîchissement des tâches/catégories.
- **[module/Task/xxUi/TaskComponent.ts](file:///c:/laragon/www/todo-list/module/Task/xxUi/TaskComponent.ts)** :
  - Gestion de `currentUser`, méthode `isGuest()` et `updateGuestBadge()`.
  - Branchement transparent de toutes les actions (chargement, ajout, édition, bascule, suppression) vers `LocalStorageService` en mode invité, ou vers l'API en mode connecté.
- **[src/ts/app.ts](file:///c:/laragon/www/todo-list/src/ts/app.ts)** :
  - Liaison dynamique entre `AuthComponent` et `TaskComponent.setCurrentUser(user)`.

---

## 3. Validation de la compilation

- `npm run build` exécuté avec succès :
  - `tsc` : 0 erreur de typage.
  - `tailwindcss` : Rebuilding sans avertissement bloquant.

# 03a - Journal de Développement Backend (Sprint 3)

**Auteur :** @dev-back  
**Date :** 18 Novembre 2026  
**Statut :** Terminé  

---

## 1. Objectifs Backend Réalisés

- **Migration BDD :**
  - Ajout du script de migration `database/migrations/003_add_recurrence_to_tasks.php` qui ajoute la colonne `recurrence VARCHAR(20) DEFAULT 'none'` à la table `tasks`.
  - Intégration de l'exécution automatique de cette migration dans `core/Api/Database.php`.
- **Modèle `Task` :**
  - Ajout de la propriété `$recurrence` (`'none'`, `'daily'`, `'weekly'`, `'monthly'`) avec accesseur `getRecurrence()`.
  - Prise en compte de la récurrence dans `toArray()` et `fromArray()`.
- **Repository `TaskRepository` :**
  - Sélection du champ `tasks.recurrence` dans `findAll` et `findById`.
  - Méthode `create` : support du paramètre `$recurrence`. RG-14 : Si la récurrence est différente de `'none'` et qu'aucune date d'échéance n'est renseignée, la date du jour (`date('Y-m-d')`) est appliquée par défaut.
  - Méthode `update` : mise à jour du champ `recurrence`.
  - Méthode `toggle` : lorsqu'une tâche récurrente est marquée comme terminée (`completed = true`), calcul automatique de la prochaine échéance (`+1 day`, `+7 days`, `+1 month`) par rapport à l'échéance courante et insertion immédiate d'une nouvelle tâche non complétée (`completed = 0`) conservant le titre, la catégorie et la récurrence. La réponse enrichie inclut `recurrence_generated: true` et `next_task`.
- **Contrôleur `TaskController` :**
  - Validation et transmission de la valeur `recurrence` lors de la création (`POST /api/v1/tasks`) et de la modification (`PUT /api/v1/tasks/{id}`).
  - Réponses formatées strictement au statut HTTP 200 avec structure `{ success, code, data/error }`.

---

## 2. Fichiers Modifiés & Créés

- `database/migrations/003_add_recurrence_to_tasks.php` (Créé)
- `core/Api/Database.php` (Modifié)
- `module/Task/TaskApi/Task.php` (Modifié)
- `module/Task/TaskApi/TaskRepository.php` (Modifié)
- `module/Task/TaskApi/TaskController.php` (Modifié)

---

## 3. Validation

- Syntaxe PHP validée sans erreur (`php -l`).
- Test API curl vérifié : création avec récurrence `weekly` (initialisation de la date d'échéance automatique à aujourd'hui si vide), et bascule d'état (`toggle`) avec création automatique de la prochaine occurrence à J+7.
- Endpoint de réinitialisation de test `/api/v1/test/reset-db` testé avec succès.

Le relais est transmis au **@dev-front**.

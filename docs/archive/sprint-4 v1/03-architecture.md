# 03 - Architecture & Spécifications Techniques (Sprint 4)

**Auteur :** @architect  
**Date :** 18 Novembre 2026  
**Statut :** Validé  

---

## 1. Schéma de Données & Migration SQLite

Un nouveau script de migration `database/migrations/004_add_time_and_recurrence_end_to_tasks.php` est introduit.

### Nouvelles colonnes sur la table `tasks` :
- `due_time VARCHAR(5) DEFAULT NULL` : Stocke l'horaire au format `HH:MM` (ex: `14:30`).
- `recurrence_end_date DATE DEFAULT NULL` : Stocke la date limite de récurrence au format `YYYY-MM-DD` (ex: `2027-01-18`).

### Logique SQL de Migration :
```sql
ALTER TABLE tasks ADD COLUMN due_time VARCHAR(5) DEFAULT NULL;
ALTER TABLE tasks ADD COLUMN recurrence_end_date DATE DEFAULT NULL;
```

---

## 2. Conception Backend

### 2.1 Requête d'Ordonnancement par Défaut (RG-21)
Le tri par défaut classe les tâches actives par ordre d'urgence temporelle décroissante (délai restant le plus court en tête) :
```sql
ORDER BY 
    tasks.completed ASC,
    CASE WHEN tasks.due_date IS NULL THEN 1 ELSE 0 END ASC,
    tasks.due_date ASC,
    CASE WHEN tasks.due_time IS NULL THEN '23:59' ELSE tasks.due_time END ASC,
    tasks.id ASC
```

### 2.2 Règles de Calcul & Arrêt de la Récurrence (RG-19)
Lors du `toggle` d'une tâche récurrente achevée :
1. Calcul de la date suivante `$nextDueDate` (`+1 day`, `+7 days`, `+1 month`).
2. Si `$task['recurrence_end_date'] !== null` et `$nextDueDate > $task['recurrence_end_date']` :
   - Fin de la plage atteinte : Aucune nouvelle tâche n'est insérée.
   - Réponse : `{ "recurrence_generated": false, "recurrence_ended": true }`.
3. Sinon :
   - Insertion de la nouvelle occurrence en recopiant `due_time` et `recurrence_end_date`.
   - Réponse : `{ "recurrence_generated": true, "next_task": { ... } }`.

### 2.3 Contrats d'API REST (HTTP 200)

- **GET `/api/v1/tasks?filter={all|todo|completed}&category_id={id}&search={query}&sort={due_asc|name_asc|name_desc}`**
- **POST `/api/v1/tasks`** : Body JSON `{ title, due_date, due_time, category_id, recurrence, recurrence_end_date }`
- **PUT `/api/v1/tasks/{id}`** : Body JSON `{ title, due_date, due_time, category_id, recurrence, recurrence_end_date }`
- **PATCH `/api/v1/tasks/{id}/toggle`**

---

## 3. Conception Frontend

1. **Recherche en temps réel :**
   - Écoute de l'événement `input` sur `input-search-tasks` avec rafraîchissement réactif de la liste.
2. **Sélecteur de tri :**
   - Déclencheur sur `change` de `select-task-sort` modifiant la requête API ou l'ordonnancement.
3. **Affichage enrichi des échéances :**
   - Intégration de l'heure dans le badge date : `YYYY-MM-DD <span data-testid="task-due-time-${task.id}">HH:MM</span>`.

---

Le relais est transmis au **@dev-back** pour l'implémentation du backend et de la migration.

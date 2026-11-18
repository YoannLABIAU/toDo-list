# 02 - Spécifications Métier & Critères d'Acceptation UAT (Sprint 4)

**Auteur :** @po (Product Owner)  
**Date :** 18 Novembre 2026  
**Statut :** Validé  

---

## 1. Règles de Gestion (RG) Détaillées

### RG-19 : Plage de Récurrence & Date de Fin
- Le champ `recurrence_end_date` (format `YYYY-MM-DD`) est facultatif. Il n'a de sens que si `recurrence` est différent de `none`.
- Si `recurrence_end_date` est renseigné, il doit être chronologiquement supérieur ou égal à la date d'échéance initiale `due_date`.
- **Règle d'arrêt :** Lors de l'achèvement d'une tâche récurrente (`toggle`), la prochaine occurrence est calculée (`+1 day`, `+7 days`, `+1 month`). Si cette nouvelle date dépasse la date de fin définie (`nextDueDate > recurrence_end_date`), aucune nouvelle tâche n'est créée.
- La réponse API renvoie `recurrence_generated: false` avec une mention explicite, et l'interface affiche un toast : *"Tâche terminée ! Fin de la plage de récurrence atteinte."*

### RG-20 : Ciblage Horaire Précis (`due_time`)
- Un champ optionnel `due_time` (format `HH:MM`, 24h) peut être associé à l'échéance.
- Si un horaire est renseigné sans date d'échéance, la date du jour (`today`) est automatiquement appliquée comme date de référence.
- L'horaire est préservé lors de la régénération automatique des tâches récurrentes.
- Sur la ligne de tâche, le badge d'échéance affiche la date et l'horaire si présent (ex : `2026-11-18 14:30`).

### RG-21 : Tri Intelligent par Temps Restant le Plus Court (Par Défaut)
- Par défaut, l'affichage des tâches ordonne les éléments actifs (`completed = 0`) selon l'urgence temporelle :
  1. Tâches ayant une échéance dépassée ou imminente en tête (les dates antérieures ou aujourd'hui avec heure la plus proche en premier).
  2. Tâches futures ordonnées chronologiquement de la plus proche à la plus lointaine.
  3. Tâches sans échéance fixée positionnées en fin de liste.
- Les tâches terminées restent consultables selon les filtres d'état.

### RG-22 : Recherche Textuelle Dynamique
- Un champ de recherche textuelle `input-search-tasks` permet de filtrer en temps réel les tâches dont le titre contient le mot ou les caractères saisis (insensible à la casse).
- La recherche s'applique en combinaison avec les filtres d'état (Toutes, À faire, Terminées) et les filtres de catégorie.

### RG-23 : Sélection du Mode de Tri
- Un sélecteur `select-task-sort` permet à l'utilisateur de modifier le critère d'ordonnancement de la vue :
  - `due_asc` : **Échéance la plus proche** (Par défaut).
  - `name_asc` : **Nom de tâche (A → Z)**.
  - `name_desc` : **Nom de tâche (Z → A)**.

---

## 2. Attributs UI Obligatoires (`data-testid`)

| Élement | `data-testid` | Type / Description |
| :--- | :--- | :--- |
| Champ Heure (Ajout) | `input-task-due-time` | `<input type="time">` |
| Champ Heure (Édition) | `input-edit-task-due-time` | `<input type="time">` |
| Date fin récurrence (Ajout) | `input-task-recurrence-end` | `<input type="date">` |
| Date fin récurrence (Édition) | `input-edit-task-recurrence-end` | `<input type="date">` |
| Champ de recherche | `input-search-tasks` | `<input type="search">` |
| Sélecteur de tri | `select-task-sort` | `<select>` (`due_asc`, `name_asc`, `name_desc`) |
| Heure sur badge tâche | `task-due-time-{id}` | Élément inline affichant l'horaire `HH:MM` |

---

## 3. Personas & Scénarios de Recette Utilisateur (UAT)

### Persona 1 : Maxime (Mission temporaire & rendez-vous précis)
1. Maxime crée une tâche "Standup quotidien" pour aujourd'hui avec un horaire ciblé à `09:30`, récurrence quotidienne (`daily`), et une date de fin de récurrence fixée à demain (`today + 1 jour`).
2. Il constate l'affichage de l'échéance avec l'heure `09:30` et le badge "Quotidienne".
3. Il valide le standup du jour : une occurrence pour demain est automatiquement créée à `09:30`.
4. Le lendemain, Maxime valide cette 2e occurrence : la prochaine échéance calculée dépasserait la date de fin autorisée. Aucune 3e occurrence n'est créée, et un toast informe que la plage est arrivée à son terme.

### Persona 2 : Camille (Gestion d'une longue liste, recherche et tri)
1. Camille dispose d'une liste de plusieurs tâches hétérogènes (avec échéances différentes, avec et sans heure, et titres variés).
2. Elle vérifie que par défaut, les tâches sont triées avec l'échéance la plus proche en haut.
3. Elle utilise le champ de recherche textuelle pour taper un mot-clé précis : seule la tâche correspondante reste affichée instantanément.
4. Elle sélectionne le tri par nom (A-Z) : l'ensemble des tâches se réorganise par ordre alphabétique.

---

Le relais est transmis à **@architect** pour les spécifications techniques et de migration.

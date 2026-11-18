# Sprint Actif : Sprint 1 - MVP To-Do List (Gestion élémentaire des tâches)
**Objectif principal :** Mettre en place le socle fonctionnel permettant à l'utilisateur de gérer ses tâches quotidiennes à travers un CRUD complet, le suivi du statut d'achèvement, une date d'échéance optionnelle et des filtres de vue dynamiques.

## 1. Périmètre Macro (User Stories)
| ID | Fonctionnalité ciblée | Description métier | Priorité |
|---|---|---|---|
| `US-LOT1-01` | Création d'une tâche | Permettre à l'utilisateur d'ajouter rapidement une tâche avec un libellé obligatoire et optionnellement une date d'échéance | Haute |
| `US-LOT1-02` | Modification d'une tâche | Permettre à l'utilisateur d'éditer le libellé et/ou la date d'échéance d'une tâche existante | Haute |
| `US-LOT1-03` | Suppression d'une tâche | Permettre à l'utilisateur de supprimer définitivement une tâche avec confirmation préalable | Haute |
| `US-LOT1-04` | Changement d'état (Terminée / À faire) | Permettre de cocher une tâche comme terminée ou de la réactiver d'un simple clic | Haute |
| `US-LOT1-05` | Date d'échéance optionnelle | Pouvoir renseigner ou effacer une date d'échéance pour une tâche et l'afficher clairement dans la vue | Moyenne |
| `US-LOT1-06` | Filtrage dynamique de la vue | Proposer un système d'onglets ou boutons de filtrage pour afficher : Toutes les tâches, Seulement celles à faire, ou Seulement celles terminées | Haute |

## 2. Hors Périmètre (Exclusions strictes)
- Aucune gestion de catégories, répertoires ou tags (reporté au Sprint 2 / V2).
- Aucune gestion de tâches récurrentes ou planifiées automatiquement (reporté au Sprint 3 / V3).
- Pas de système multi-utilisateurs complexe, inscription ou gestion des rôles (application mono-utilisateur personnelle pour le MVP).
- Pas de sous-tâches ni de listes imbriquées.
- Pas de rappels par email ni de notifications push Web.
- Pas de glisser-déposer (drag & drop) pour réorganiser manuellement l'ordre des tâches.

## 3. Instructions de passage de relais (Handoff)
- **Pour le PO :** À partir de ce scope, rédige les spécifications fonctionnelles détaillées et les règles de gestion métier dans `02-specs-metier.md`.

# Sprint Actif : Sprint 2 - V2 Organisation & Catégorisation (Catégories / Tags)
**Objectif principal :** Permettre à l'utilisateur de structurer et classer ses tâches grâce à des catégories personnalisées avec code couleur, et de filtrer rapidement ses tâches par catégorie en plus des filtres d'état existants.

## 1. Périmètre Macro (User Stories)
| ID | Fonctionnalité ciblée | Description métier | Priorité |
|---|---|---|---|
| `US-LOT2-01` | Gestion des catégories | Permettre de créer, renommer et supprimer des catégories avec un choix de couleur parmi une palette définie | Haute |
| `US-LOT2-02` | Association de catégorie à une tâche | Permettre d'attribuer (ou de retirer) une catégorie à une tâche lors de son ajout ou de sa modification | Haute |
| `US-LOT2-03` | Affichage visuel du badge catégorie | Afficher un badge coloré distinctif avec le nom de la catégorie sur chaque élément de tâche de la liste | Haute |
| `US-LOT2-04` | Filtrage par catégorie | Permettre de filtrer la liste des tâches par catégorie sélectionnée (Toutes les catégories ou une catégorie précise) | Haute |
| `US-LOT2-05` | Intégrité et dissociation sécurisée | En cas de suppression d'une catégorie, conserver les tâches associées en passant leur catégorie à "Non classée" (null) | Moyenne |

## 2. Hors Périmètre (Exclusions strictes)
- Aucune gestion de récurrence de tâches ni alertes de délais (reporté au Sprint 3 / V3).
- Pas de hiérarchie ni de sous-catégories imbriquées (catégorisation à plat pour garder la simplicité).
- Pas de système multi-utilisateurs ni de droits d'accès partagés.
- Pas de glisser-déposer de tâches entre colonnes ou catégories (Kanban).
- Pas de recherche full-text multi-critères avancée en dehors du filtre par catégorie.

## 3. Instructions de passage de relais (Handoff)
- **Pour le PO :** À partir de ce scope, rédige les spécifications fonctionnelles détaillées et les règles de gestion métier dans `02-specs-metier.md`.

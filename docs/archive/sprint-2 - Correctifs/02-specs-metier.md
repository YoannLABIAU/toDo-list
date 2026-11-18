# Spécifications Fonctionnelles : Sprint 2 - V2 Organisation & Catégorisation (Catégories / Tags)

## 1. Règles de Gestion (RG) et Cas Limites

| ID RG | ID US Liée | Description de la règle métier | Comportement en cas d'erreur / Cas limite |
|---|---|---|---|
| `RG-08` | `US-LOT2-01` | Le nom d'une catégorie est obligatoire, doit comporter entre 1 et 50 caractères (après trim), et doit être unique (insensible à la casse). | Si vide : bloquer et afficher toast d'erreur : *"Le nom de la catégorie est obligatoire (1 à 50 caractères)."* Si doublon : afficher toast d'erreur : *"Une catégorie portant ce nom existe déjà."* |
| `RG-09` | `US-LOT2-01` | Chaque catégorie possède une couleur parmi une palette prédéfinie (bleu, émeraude, violet, ambre, rose, ardoise). | Par défaut si non spécifié : couleur `indigo`. |
| `RG-10` | `US-LOT2-02` | L'assignation d'une catégorie à une tâche est optionnelle. Elle s'effectue via un sélecteur (`select`) dans le formulaire d'ajout et dans la modale d'édition. | L'option par défaut est "Sans catégorie" (valeur `null`). |
| `RG-11` | `US-LOT2-03` | Toute tâche rattachée à une catégorie affiche un badge visuel contenant le nom et les teintes de la catégorie correspondante. | Si la tâche n'a pas de catégorie, aucun badge n'est affiché. |
| `RG-12` | `US-LOT2-04` | Un sélecteur de filtre de catégorie permet de n'afficher que les tâches de la catégorie choisie ou toutes. Ce filtre se combine avec les filtres d'état existants (Toutes, À faire, Terminées). | Si aucune tâche ne correspond à la combinaison filtre d'état + filtre de catégorie, afficher l'état vide (`tasks-empty-state`). |
| `RG-13` | `US-LOT2-05` | La suppression d'une catégorie supprime la catégorie mais ne supprime JAMAIS les tâches rattachées. Les tâches associées passent automatiquement à la catégorie `null`. | Confirmation requise avant suppression. Toast de succès : *"Catégorie supprimée avec succès."* |

---

## 2. Éléments d'Interface et Testabilité

> **Règle absolue de non-régression :** Tous les `data-testid` du Sprint 1 (`input-task-title`, `input-task-due-date`, `btn-task-submit`, `filter-all`, `filter-todo`, `filter-completed`, `task-list`, `task-item-{id}`, `task-checkbox-{id}`, `task-title-{id}`, `task-due-date-{id}`, `btn-task-edit-{id}`, `btn-task-delete-{id}`, `modal-edit-task`, `modal-delete-task`, `tasks-empty-state`, `toast-notification`) sont strictement préservés.

| Composant / Vue | Élément UI | Attribut `data-testid` | Comportement UX attendu |
|---|---|---|---|
| **En-tête / Barre d'outils** | Bouton ouvrir gestion catégories | `btn-manage-categories` | Ouvre la modale de gestion des catégories. |
| **Modale Catégories** | Conteneur de la modale | `modal-categories` | Modale listant les catégories et formulaire de création. |
| **Modale Catégories** | Champ nom de catégorie | `input-category-name` | Champ texte réactif avec focus. |
| **Modale Catégories** | Sélecteur de couleur | `select-category-color` | Sélecteur déroulant des couleurs disponibles. |
| **Modale Catégories** | Bouton ajout catégorie | `btn-category-submit` | Crée la catégorie et met à jour la liste. |
| **Modale Catégories** | Ligne de catégorie | `category-item-{id}` | Élément de liste avec badge couleur et bouton supprimer. |
| **Modale Catégories** | Bouton supprimer catégorie | `btn-category-delete-{id}` | Supprime la catégorie avec confirmation. |
| **Modale Catégories** | Bouton fermer modale | `btn-close-categories-modal` | Ferme la modale de gestion des catégories. |
| **Formulaire Tâche** | Sélecteur de catégorie | `select-task-category` | Liste déroulante des catégories disponibles pour l'ajout. |
| **Modale Édition Tâche** | Sélecteur de catégorie édition | `select-edit-task-category` | Pré-sélectionne la catégorie actuelle de la tâche (ou vide). |
| **Ligne de tâche** | Badge de catégorie | `task-category-badge-{id}` | Badge pill coloré affichant le nom de la catégorie. |
| **Filtres** | Sélecteur filtre par catégorie | `select-category-filter` | Sélecteur permettant de filtrer par catégorie active. |

---

## 3. Scénarios de Recette Utilisateur (UAT)

- **Persona 1 (Utilisateur nominal - Thomas) :**
  - **Objectif :** Organiser ses tâches professionnelles et personnelles avec des catégories et filtrer l'affichage.
  - **Parcours attendu :**
    1. Thomas ouvre le gestionnaire de catégories via `btn-manage-categories`.
    2. Il crée la catégorie *"Travail"* (couleur bleue) puis la catégorie *"Personnel"* (couleur émeraude).
    3. Il ferme la modale via `btn-close-categories-modal`.
    4. Dans le formulaire d'ajout, il sélectionne *"Travail"* dans `select-task-category` et saisit *"Finaliser la présentation"*, puis valide.
    5. Il sélectionne *"Personnel"* et saisit *"Acheter un cadeau"*, puis valide.
    6. Il constate la présence du badge `task-category-badge-{id}` avec le texte "Travail" sur la première tâche et "Personnel" sur la seconde.
    7. Il sélectionne *"Travail"* dans le filtre `select-category-filter` : seule la tâche *"Finaliser la présentation"* est visible.
    8. Il sélectionne *"Personnel"* dans le filtre : seule la tâche *"Acheter un cadeau"* est visible.
    9. Il remet le filtre sur "Toutes les catégories" : les deux tâches sont visibles.
    10. Il ouvre la modale d'édition de la première tâche, change sa catégorie en *"Personnel"* et valide : le badge devient "Personnel".

- **Persona 2 (Cas d'erreur et intégrité des données - Sophie) :**
  - **Objectif :** Tester la validation des doublons/champs vides et vérifier qu'une suppression de catégorie n'efface pas les tâches.
  - **Parcours attendu :**
    1. Sophie ouvre `modal-categories` et clique sur `btn-category-submit` avec un nom vide : toast d'erreur bloquant.
    2. Elle saisit *"Urgent"* et valide : la catégorie est créée avec succès.
    3. Elle tente de créer à nouveau *"Urgent"* : refusé avec toast d'erreur *"Une catégorie portant ce nom existe déjà."*.
    4. Elle ferme la modale et crée une tâche *"Payer les impôts"* rattachée à *"Urgent"*.
    5. Elle rouvre `modal-categories` et supprime la catégorie *"Urgent"* via `btn-category-delete-{id}`.
    6. Elle ferme la modale et vérifie que la tâche *"Payer les impôts"* est **toujours présente** dans la liste, et qu'aucun badge `task-category-badge-{id}` n'est plus présent (catégorie réinitialisée à null).

---

## 4. Instructions de passage de relais (Handoff)
- **Pour l'Architecte :** Définis le schéma de la table `categories`, la relation FK ou nullable dans `tasks`, le script de migration SQL `002_create_categories_table.php`, l'arborescence du module `Category` et les contrats d'API normalisés HTTP 200 dans `/docs/current-sprint/03-architecture.md`.

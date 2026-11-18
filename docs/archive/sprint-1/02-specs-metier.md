# Spécifications Fonctionnelles : Sprint 1 - MVP To-Do List

## 1. Règles de Gestion (RG) et Cas Limites

| ID RG | ID US Liée | Description de la règle métier | Comportement en cas d'erreur / Cas limite |
|---|---|---|---|
| `RG-01` | `US-LOT1-01`, `US-LOT1-02` | Le titre de la tâche est obligatoire. Il doit comporter entre 1 et 255 caractères (après suppression des espaces superflus aux extrémités). | Bloquer la soumission, appliquer une bordure rouge sur le champ et afficher un toast d'erreur : *"Le titre de la tâche est obligatoire."* |
| `RG-02` | `US-LOT1-01`, `US-LOT1-05` | La date d'échéance est optionnelle. Si elle est renseignée, elle doit être une date valide au format ISO (`YYYY-MM-DD`). | Si le format est invalide, afficher un toast d'erreur : *"Format de date d'échéance invalide."* |
| `RG-03` | `US-LOT1-01` | Toute nouvelle tâche créée possède par défaut le statut "À faire" (`completed = false`). Elle est affichée en tête de liste. | En cas d'erreur serveur, afficher un toast d'erreur explicite et conserver la saisie dans le formulaire. Toast de succès si OK : *"Tâche créée avec succès."* |
| `RG-04` | `US-LOT1-02` | L'utilisateur peut modifier le titre et/ou la date d'échéance d'une tâche existante via une modale d'édition. L'échéance peut être effacée. | Si le titre modifié est vide, la validation est bloquée avec toast d'erreur. Si l'utilisateur clique sur "Annuler" ou à l'extérieur de la modale, aucune modification n'est persistée. Toast de succès : *"Tâche modifiée avec succès."* |
| `RG-05` | `US-LOT1-03` | La suppression d'une tâche est une action destructrice définitive. Elle exige obligatoirement une confirmation utilisateur dans une modale modale dédiée. | Si l'utilisateur clique sur "Annuler", la modale se ferme et la tâche est conservée. Si confirmé, suppression définitive en BDD, retrait de la vue et toast de succès : *"Tâche supprimée avec succès."* |
| `RG-06` | `US-LOT1-04` | L'utilisateur peut basculer l'état d'achèvement d'une tâche en cochant/décochant la case associée (À faire <-> Terminée). | L'état visuel est mis à jour immédiatement (barré/grisé pour terminé). Toast discret de succès : *"Statut de la tâche mis à jour."* |
| `RG-07` | `US-LOT1-06` | Le filtrage permet de n'afficher que les tâches correspondant au filtre sélectionné : "Toutes" (défaut), "À faire", ou "Terminées". Le basculement est instantané. | Si aucune tâche ne correspond au filtre actif, afficher un composant d'état vide convivial (*"Aucune tâche trouvée pour ce filtre"*). |

## 2. Éléments d'Interface et Testabilité

| Composant / Vue | Élément UI | Attribut `data-testid` | Comportement UX attendu |
|---|---|---|---|
| **Formulaire d'ajout** | Champ de saisie du titre | `input-task-title` | Champ texte réactif, focusable, avec placeholder indicatif. |
| **Formulaire d'ajout** | Champ de sélection de date | `input-task-due-date` | Sélecteur de date natif HTML5 optionnel. |
| **Formulaire d'ajout** | Bouton de validation d'ajout | `btn-task-submit` | Clic ou validation par touche "Entrée". Loader pendant la requête. |
| **Filtres de statut** | Bouton filtre "Toutes" | `filter-all` | Actif par défaut, classe visuelle d'onglet sélectionné. |
| **Filtres de statut** | Bouton filtre "À faire" | `filter-todo` | Affiche uniquement les tâches non terminées. |
| **Filtres de statut** | Bouton filtre "Terminées" | `filter-completed` | Affiche uniquement les tâches terminées. |
| **Liste des tâches** | Conteneur global de la liste | `task-list` | Conteneur vertical réactif. |
| **Ligne de tâche** | Conteneur individuel de tâche | `task-item-{id}` | Élément de liste avec ombre douce, bordure et transition fluide. |
| **Ligne de tâche** | Checkbox statut achèvement | `task-checkbox-{id}` | Case à cocher ou bouton toggle interactif. Inverse l'état. |
| **Ligne de tâche** | Titre affiché de la tâche | `task-title-{id}` | Texte normal si à faire, texte barré/atténué si terminée. |
| **Ligne de tâche** | Date d'échéance affichée | `task-due-date-{id}` | Badge discret avec date lisible. Absent si non renseignée. |
| **Ligne de tâche** | Bouton d'édition | `btn-task-edit-{id}` | Ouvre la modale d'édition avec les données de la tâche pré-remplies. |
| **Ligne de tâche** | Bouton de suppression | `btn-task-delete-{id}` | Ouvre la modale de confirmation de suppression. |
| **Modale d'édition** | Conteneur de la modale | `modal-edit-task` | Modale centrée avec overlay obscurcissant l'arrière-plan. |
| **Modale d'édition** | Champ titre à modifier | `input-edit-task-title` | Pré-rempli avec le titre actuel de la tâche. |
| **Modale d'édition** | Champ date à modifier | `input-edit-task-due-date` | Pré-rempli avec l'échéance actuelle (ou vide). |
| **Modale d'édition** | Bouton enregistrer modif | `btn-confirm-edit-task` | Soumet la modification vers l'API. |
| **Modale d'édition** | Bouton annuler édition | `btn-cancel-edit-task` | Ferme la modale sans sauvegarder. |
| **Modale de suppression** | Conteneur de la modale | `modal-delete-task` | Modale d'avertissement avec texte d'explication clair. |
| **Modale de suppression** | Bouton confirmer suppression | `btn-confirm-delete-task` | Bouton rouge/danger. Supprime la tâche et ferme la modale. |
| **Modale de suppression** | Bouton annuler suppression | `btn-cancel-delete-task` | Ferme la modale sans supprimer la tâche. |
| **État vide** | Bloc état vide | `tasks-empty-state` | Visible uniquement si la liste affichée est vide pour le filtre actif. |
| **Notifications** | Toast de notification | `toast-notification` | Notification temporaire (auto-dismiss après 3s) en haut ou bas d'écran. |

## 3. Scénarios de Recette Utilisateur (UAT)

- **Persona 1 (Utilisateur nominal - Claire) :**
  - **Objectif :** Gérer et organiser ses tâches de la journée de bout en bout.
  - **Parcours attendu :**
    1. Claire ouvre l'application. La base étant vide, elle voit le message d'état vide (`tasks-empty-state`).
    2. Elle saisit *"Préparer la réunion client"* avec une date d'échéance dans `input-task-title` et `input-task-due-date`, puis clique sur `btn-task-submit`.
    3. La tâche apparaît immédiatement dans `task-list` avec son titre et son échéance, accompagnée d'un toast de confirmation.
    4. Elle ajoute une seconde tâche *"Acheter des fournitures"* sans date d'échéance.
    5. Elle coche *"Préparer la réunion client"* via `task-checkbox-{id}` : la tâche est barrée visuellement et marquée comme terminée.
    6. Elle clique sur le bouton d'édition (`btn-task-edit-{id}`) de *"Acheter des fournitures"*, modifie le titre en *"Acheter des stylos et blocs-notes"*, et enregistre via `btn-confirm-edit-task`. La mise à jour est immédiate.
    7. Elle clique sur `filter-todo` : seule la tâche *"Acheter des stylos et blocs-notes"* reste visible.
    8. Elle clique sur `filter-completed` : seule la tâche *"Préparer la réunion client"* est visible.
    9. Elle revient sur `filter-all` : les deux tâches sont visibles.
    10. Elle supprime la tâche terminée en cliquant sur `btn-task-delete-{id}`, puis confirme dans la modale via `btn-confirm-delete-task`. La tâche disparaît définitivement.

- **Persona 2 (Cas d'erreur / maladroit - Marc) :**
  - **Objectif :** Vérifier la résilience aux erreurs de saisie et la prévention des suppressions accidentelles.
  - **Parcours attendu :**
    1. Marc tente de soumettre le formulaire d'ajout avec un titre vide (ou ne contenant que des espaces) en cliquant sur `btn-task-submit`.
    2. L'application bloque la requête, met le champ en surbrillance rouge et affiche un toast d'erreur (`toast-notification`). Aucune tâche parasite n'est créée.
    3. Marc ajoute une tâche valide *"Relancer le fournisseur"*.
    4. Marc clique sur éditer (`btn-task-edit-{id}`), efface totalement le libellé et tente de sauvegarder : l'enregistrement est refusé avec un toast d'erreur.
    5. Marc clique alors sur `btn-cancel-edit-task` : la modale se ferme et le titre initial reste intact.
    6. Marc clique par mégarde sur le bouton de suppression (`btn-task-delete-{id}`) : la modale de confirmation (`modal-delete-task`) s'affiche.
    7. Pris de panique, Marc clique sur `btn-cancel-delete-task` : la modale disparaît et la tâche est toujours bien présente dans la liste.

## 4. Instructions de passage de relais (Handoff)
- **Pour l'Architecte :** À partir de ces règles de gestion et de ces éléments d'interface, définis le MCD, le script de migration SQL, l'arborescence des modules (`module/Task/TaskApi` et `taskUi`) et les contrats d'API normalisés (code HTTP 200) dans `/docs/current-sprint/03-architecture.md`.

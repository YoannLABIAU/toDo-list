# Spécifications Fonctionnelles : Sprint 3 - V3 Automatisation & Récurrence

## 1. Règles de Gestion (RG) et Cas Limites

| ID RG | ID US Liée | Description de la règle métier | Comportement en cas d'erreur / Cas limite |
|---|---|---|---|
| `RG-14` | `US-LOT3-01` | La récurrence est optionnelle. Les valeurs acceptées sont : `none` (défaut), `daily` (quotidienne), `weekly` (hebdomadaire), `monthly` (mensuelle). | Si une récurrence est sélectionnée sans date d'échéance, la date du jour courant (`today`) est automatiquement appliquée comme première échéance. |
| `RG-15` | `US-LOT3-02` | Lorsqu'une tâche récurrente (`daily`, `weekly`, `monthly`) est cochée comme terminée (`completed = 1`), le système marque la tâche actuelle comme terminée ET génère immédiatement une nouvelle tâche avec statut `completed = 0`. | La nouvelle date d'échéance est calculée à partir de l'échéance de la tâche terminée (+1 jour pour `daily`, +7 jours pour `weekly`, +1 mois pour `monthly`). La nouvelle occurrence conserve le titre, la catégorie et la règle de récurrence. Toast de succès informatif : *"Tâche terminée ! Prochaine occurrence générée."* |
| `RG-16` | `US-LOT3-03` | Toute tâche pourvue d'une règle de récurrence affiche un badge visuel distinctif (`task-recurrence-badge-{id}`) avec icône de répétition et fréquence (Quotidienne, Hebdo, Mensuelle). | Si `recurrence === 'none'` ou `null`, aucun badge de récurrence n'est affiché. |
| `RG-17` | `US-LOT3-04` | Alertes de délais calculées dynamiquement selon la date locale : <br>- **En retard** si `due_date < today` et non terminée : badge rouge `task-overdue-badge-{id}` portant la mention *"En retard"*. <br>- **Aujourd'hui** si `due_date === today` et non terminée : badge ambre `task-today-badge-{id}` portant la mention *"Aujourd'hui"*. | Si la tâche est terminée (`completed = 1`), les alertes d'urgence ne s'affichent plus (affichage grisé/neutre). |
| `RG-18` | `US-LOT3-05` | Les tests E2E doivent simuler fidèlement le comportement d'un utilisateur humain : saisie au clavier, sélection des options, observation des badges d'alerte, validation d'achèvement et vérification immédiate de la régénération de la tâche suivante. | Les tests vérifient l'absence de régression sur les sprints 1 et 2 (CRUD, filtres, catégories, suppression sécurisée). |

---

## 2. Éléments d'Interface et Testabilité

> **Règle absolue de non-régression :** Tous les `data-testid` des Sprints 1 et 2 sont strictement préservés.

| Composant / Vue | Élément UI | Attribut `data-testid` | Comportement UX attendu |
|---|---|---|---|
| **Formulaire d'ajout** | Sélecteur de récurrence | `select-task-recurrence` | Menu déroulant (`none`, `daily`, `weekly`, `monthly`). |
| **Modale d'édition** | Sélecteur récurrence édition | `select-edit-task-recurrence` | Pré-sélectionne la récurrence actuelle de la tâche. |
| **Ligne de tâche** | Badge de récurrence | `task-recurrence-badge-{id}` | Badge bleu/ardoise avec icône de boucle et libellé de fréquence. |
| **Ligne de tâche** | Alerte tâche en retard | `task-overdue-badge-{id}` | Badge d'alerte rouge clignotant/soutenu pour tâche dépassée. |
| **Ligne de tâche** | Alerte tâche du jour | `task-today-badge-{id}` | Badge d'alerte ambre/orange indiquant l'échéance du jour. |

---

## 3. Scénarios de Recette Utilisateur (UAT)

- **Persona 1 (Utilisateur nominal - Julien) :**
  - **Objectif :** Mettre en place une tâche récurrente hebdomadaire et surveiller ses alertes de retard.
  - **Parcours attendu :**
    1. Julien crée une tâche récurrente *"Nettoyage des serveurs"*, avec échéance fixée à aujourd'hui et récurrence *"Hebdomadaire"*.
    2. Dans la liste, la tâche affiche le badge d'alerte *"Aujourd'hui"* (`task-today-badge-{id}`) ainsi que le badge récurrence *"Hebdomadaire"* (`task-recurrence-badge-{id}`).
    3. Julien crée une autre tâche urgente *"Payer facture hébergeur"* avec une échéance dépassée (hier) : celle-ci affiche le badge d'alerte *"En retard"* (`task-overdue-badge-{id}`).
    4. Julien coche la tâche *"Nettoyage des serveurs"* comme terminée.
    5. La tâche initiale passe à l'état terminé (barrée), et une nouvelle tâche *"Nettoyage des serveurs"* apparaît automatiquement dans la liste avec statut "À faire", récurrence hebdomadaire et échéance à J+7.
    6. Un toast confirme la génération automatique de la nouvelle occurrence.
    7. Julien bascule sur le filtre "À faire" : la nouvelle occurrence et la tâche en retard sont bien présentes.

- **Persona 2 (Cas limites et modification - Léa) :**
  - **Objectif :** Vérifier qu'une tâche non récurrente ne se duplique pas, puis tester l'ajout d'une récurrence par modification.
  - **Parcours attendu :**
    1. Léa crée une tâche *"Rédiger l'article"* sans récurrence avec une date future.
    2. Elle la coche comme terminée : aucune occurrence supplémentaire n'apparaît.
    3. Elle décoché la tâche pour la repasser "À faire".
    4. Elle clique sur éditer (`btn-task-edit-{id}`), choisit la récurrence *"Quotidienne"* dans `select-edit-task-recurrence` et valide.
    5. Le badge *"Quotidienne"* (`task-recurrence-badge-{id}`) est désormais visible sur la ligne.
    6. Elle coche la tâche : la nouvelle occurrence à J+1 est automatiquement créée.

---

## 4. Instructions de passage de relais (Handoff)
- **Pour l'Architecte :** Définis le schéma de persistance pour `recurrence` dans la table `tasks`, la migration `003_add_recurrence_to_tasks.php`, les algorithmes de calcul de date de prochaine occurrence et les contrats d'API JSON dans `/docs/current-sprint/03-architecture.md`.

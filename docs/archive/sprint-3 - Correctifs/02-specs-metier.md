# 02 - Spécifications Métier & Critères UAT (Sprint 3 - Correctifs)

**Auteur :** @po (Product Owner)  
**Date :** 18 Novembre 2026  
**Statut :** Validé  

---

## 1. Règles de Gestion (RG)

### RG-24 : Verrouillage Anti-Duplication de Récurrence
- **Principe :** Une tâche récurrente donnée ne doit pouvoir générer son occurrence fille qu'une seule et unique fois dans son cycle de vie.
- **Persistance du statut de génération :**
  - La tâche porte un drapeau persistant `has_generated_next` (booléen `0` ou `1`).
  - Lorsque la tâche est cochée pour la première fois (`completed = 1`), si `has_generated_next = 0`, la prochaine occurrence est calculée, créée, et le drapeau passe à `1`.
  - Si la tâche est décochée (`completed = 0`), le drapeau `has_generated_next` **reste à 1** pour mémoriser que sa descendance a déjà été instanciée.
  - Si la tâche est recochée ultérieurement (`completed = 1`), le système constate que `has_generated_next = 1` et ne génère **aucun duplicata**. La réponse API renvoie `recurrence_generated = false`.
- **Garde-fou d'intégrité :**
  - Avant toute création d'occurrence suivante, le système vérifie si une tâche active (`completed = 0`) portant le même titre et la même date d'échéance calculée existe déjà. Si oui, aucune nouvelle tâche n'est créée.

### RG-25 : Modale de Création de Tâche Dédiée
- **Bouton d'ouverture :**
  - Un bouton proéminent "+ Nouvelle tâche" (`data-testid="btn-open-add-task"`) est accessible dans la partie supérieure de l'interface.
- **Organisation de la modale (`data-testid="modal-add-task"`) :**
  - Section 1 : Titre (obligatoire, autofocus).
  - Section 2 : Échéance (date) et horaire optionnel.
  - Section 3 : Catégorisation (menu déroulant avec palette).
  - Section 4 : Récurrence (fréquence et date de fin optionnelle).
  - Actions : Bouton "Annuler" (`btn-cancel-add-task`) et bouton "Créer la tâche" (`btn-task-submit`).
- **Comportement :**
  - Fermeture automatique au clic sur "Annuler", lors de la validation réussie, au clic extérieur ou à l'appui sur Échap.

---

## 2. Attributs UI (`data-testid`)

| Élement | `data-testid` | Description |
| :--- | :--- | :--- |
| Bouton Ouvrir Modale Ajout | `btn-open-add-task` | Bouton principal ouvrant `modal-add-task` |
| Modale Ajout Tâche | `modal-add-task` | Conteneur modal de création |
| Bouton Annuler Ajout | `btn-cancel-add-task` | Bouton de fermeture de la modale d'ajout |
| Inputs Formulaire Ajout | Identiques aux spécifications antérieures | `input-task-title`, `input-task-due-date`, `input-task-due-time`, `select-task-category`, `select-task-recurrence`, `input-task-recurrence-end`, `btn-task-submit` |

---

## 3. Scénarios de Recette UAT

1. **Scénario Verrouillage Récurrence (Bascule répétée) :**
   - Créer une tâche récurrente quotidienne.
   - Cocher la tâche (1ère complétion) : l'occurrence de demain est créée (total = 2 tâches).
   - Décocher la tâche (retour à faire) : toujours 2 tâches.
   - Recocher la tâche (2e complétion) : **aucune 3e tâche n'apparaît** (total toujours = 2 tâches).
2. **Scénario Modale de Création :**
   - Cliquer sur `btn-open-add-task` : la modale `modal-add-task` s'affiche avec tous les champs bien disposés.
   - Cliquer sur `btn-cancel-add-task` : la modale se ferme sans ajouter de tâche.
   - Ré-ouvrir, remplir le formulaire et valider : la modale se referme et la tâche est ajoutée avec succès.

---

Le relais est transmis à **@architect** pour les spécifications techniques.

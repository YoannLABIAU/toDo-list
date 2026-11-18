# 01 - Périmètre Fonctionnel (Scope) - Sprint 3 (Correctifs)

**Projet :** To-Do List Personnelle  
**Sprint :** 3 - Correctifs & Optimisations UX (Anti-duplication des récurrences & Modale de création)  
**Auteur :** @cp (Chef de Projet)  
**Date :** 18 Novembre 2026  
**Statut :** Validé  

---

## 1. Contexte & Problématique

Suite aux retours utilisateurs sur le fonctionnement des tâches récurrentes et l'ergonomie générale :
1. **Anomalie de duplication récurrente :** Lorsqu'une tâche récurrente est validée, l'occurrence suivante est bien générée. En revanche, si l'utilisateur décoche cette tâche (retour à "À faire") puis la recoche (repasse à "Terminé"), une nouvelle occurrence est encore générée, provoquant une multiplication indésirable des tâches identiques pour la même date.
2. **Surcharge visuelle du formulaire d'ajout :** Avec l'ajout successif des catégories, de la récurrence, de l'horaire et de la date limite, le formulaire inline présent en haut de page est devenu trop dense et peu lisible ("fouillis").

---

## 2. Objectifs du Sprint de Correctifs

- **Objectif 1 (Anti-duplication) :**
  - Mémoriser au niveau de la tâche si elle a déjà déclenché la génération de son occurrence suivante (`has_generated_next BOOLEAN DEFAULT 0` ou `next_task_id INT NULL`).
  - Vérifier en base l'existence d'une tâche active non terminée avec le même titre et la même date d'échéance calculée avant toute nouvelle insertion.
  - Interdire formellement toute création de doublon lors de bascules répétées (décocher / recocher).
- **Objectif 2 (Modale de création dédiée) :**
  - Remplacer le formulaire inline surchargé par un bouton d'action principal "+ Nouvelle tâche" (`btn-open-add-task`) ouvrant une modale de création ergonomique et épurée (`modal-add-task`).
  - Organiser les champs de saisie en blocs thématiques aérés :
    1. *Titre de la tâche* (champ large avec autofocus).
    2. *Échéance & Horaire* (grille 2 colonnes : date d'échéance + heure optionnelle).
    3. *Organisation & Catégorie* (sélecteur avec badge visuel).
    4. *Automatisation & Récurrence* (sélecteur de fréquence + date limite de récurrence).
  - Assurer la fermeture fluide (bouton Annuler, touche Échap ou clic extérieur).
- **Objectif 3 (Qualité & Non-régression) :**
  - Mettre à jour et consolider l'ensemble des suites de tests E2E Playwright.

---

Le relais est transmis au **@po** pour la rédaction des règles de gestion et critères de recette.

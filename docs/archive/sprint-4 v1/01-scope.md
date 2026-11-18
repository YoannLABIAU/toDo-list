# 01 - Périmètre Fonctionnel (Scope) - Sprint 4

**Projet :** To-Do List Personnelle  
**Sprint :** 4 (Lot 4 - Planification avancée, Gestion du temps et Recherche)  
**Auteur :** @cp (Chef de Projet)  
**Date :** 18 Novembre 2026  
**Statut :** Validé  

---

## 1. Contexte & Objectifs du Sprint

Le socle initial (Sprint 1 MVP), la gestion des catégories (Sprint 2) et l'automatisation de base des récurrences (Sprint 3) sont en production et validés par les tests E2E.
Ce Sprint 4 a pour objectif de transformer l'application en un véritable gestionnaire de temps et de recherche pour les longues listes de tâches :

1. **Borner les récurrences dans le temps :** Définir une plage temporelle avec date de fin (`recurrence_end_date`) au-delà de laquelle la récurrence s'arrête automatiquement.
2. **Recherche et tri alphabétique :** Filtrer rapidement une tâche par mot-clé et pouvoir trier les tâches par nom.
3. **Tri intelligent par temps restant le plus court (par défaut) :** Présenter les tâches les plus urgentes / au délai le plus court en tête de liste.
4. **Ciblage horaire précis :** Permettre d'associer un horaire optionnel (`due_time`) à l'échéance d'une tâche.

---

## 2. User Stories (US)

- **US-LOT4-01 : Plage de récurrence avec date de fin**
  - *En tant qu'utilisateur*, je souhaite définir une date de fin de récurrence (ex: jusqu'au 18/01/2027) afin que mes tâches périodiques ne se génèrent que sur la période souhaitée.
- **US-LOT4-02 : Ciblage horaire de l'échéance**
  - *En tant qu'utilisateur*, je souhaite pouvoir préciser une heure facultative pour l'échéance de ma tâche (ex: 14:30) afin de mieux rythmer ma journée.
- **US-LOT4-03 : Tri par défaut par temps restant le plus court**
  - *En tant qu'utilisateur*, je souhaite que ma liste soit ordonnée par défaut selon l'urgence temporelle (tâches en retard et les plus imminentes en premier, tâches sans date en fin).
- **US-LOT4-04 : Recherche et filtrage par libellé de tâche**
  - *En tant qu'utilisateur*, je souhaite rechercher une tâche en tapant son nom dans une barre de recherche pour retrouver immédiatement un élément dans une longue liste.
- **US-LOT4-05 : Tri personnalisé par nom**
  - *En tant qu'utilisateur*, je souhaite pouvoir choisir d'ordonner ma liste par nom (alphabétique A-Z ou Z-A) en plus du tri par échéance.

---

## 3. Critères d'Acceptation & Exclusions

### Critères d'acceptation :
- Une tâche récurrente dont la date calculée de la prochaine occurrence dépasse `recurrence_end_date` ne doit plus générer de nouvelle tâche au `toggle`.
- Le champ horaire est facultatif. S'il est renseigné, il s'affiche à côté de la date d'échéance (ex: `2026-11-18 à 14:30`).
- Le tri par défaut place en tête les tâches actives ayant le délai restant le plus court. Les tâches terminées restent consultables ou se placent en cohérence selon les filtres.
- La recherche par texte filtre la liste instantanément dès la saisie.
- Le sélecteur de tri permet d'alterner entre : "Échéance la plus proche" (défaut), "Nom (A-Z)", "Nom (Z-A)".
- Tous les tests existants des Sprints 1, 2 et 3 doivent continuer de réussir à 100% (non-régression).

### Exclusions strictes du Sprint 4 :
- Pas de synchronisation avec des calendriers externes (Google Calendar, iCal).
- Pas de rappels par push notification système ou email.
- Pas de sous-tâches hiérarchiques.

---

Le relais est transmis au **@po** pour la formalisation des spécifications métier détaillées et des critères UAT.

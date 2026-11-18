# Sprint Actif : Sprint 3 - V3 Automatisation & Récurrence (Tâches récurrentes & Alertes de délais)
**Objectif principal :** Automatiser la réapparition des tâches périodiques (quotidiennes, hebdomadaires, mensuelles) lors de leur complétion et mettre en évidence les échéances critiques grâce à des alertes visuelles de retard et d'urgence.

## 1. Périmètre Macro (User Stories)
| ID | Fonctionnalité ciblée | Description métier | Priorité |
|---|---|---|---|
| `US-LOT3-01` | Définition de la récurrence | Permettre à l'utilisateur de choisir une fréquence de récurrence (Aucune, Quotidienne, Hebdomadaire, Mensuelle) pour une tâche | Haute |
| `US-LOT3-02` | Génération automatique d'occurrence | Lorsqu'une tâche récurrente avec échéance est marquée comme terminée, générer automatiquement la prochaine occurrence non terminée avec la date recalculée | Haute |
| `US-LOT3-03` | Indicateurs visuels de récurrence | Afficher un badge descriptif sur les tâches récurrentes (icône de répétition et fréquence) | Moyenne |
| `US-LOT3-04` | Alertes visuelles de délais et de retard | Mettre en avant visuellement les tâches "En retard" (date dépassée) et "Aujourd'hui" par un code couleur d'alerte | Haute |
| `US-LOT3-05` | Recette E2E orientée utilisateur | Couvrir les scénarios avec des interactions utilisateur réalistes (saisie formulaire, validation, vérification des alertes, filtres et récurrence) | Haute |

## 2. Hors Périmètre (Exclusions strictes)
- Aucun démon serveur / cron arrière-plan externe (la génération de la récurrence s'opère de façon déterministe lors de l'action de complétion utilisateur).
- Pas de notifications push navigateur ni d'alertes par email/SMS.
- Pas de moteur de récurrence complexe RRULE (uniquement les fréquences standards : Quotidienne, Hebdomadaire, Mensuelle).
- Pas de synchronisation calendrier externe (Google Calendar, Outlook, iCal).

## 3. Instructions de passage de relais (Handoff)
- **Pour le PO :** À partir de ce scope et de l'exigence de vérifications utilisateurs immersives, rédige les spécifications fonctionnelles détaillées, les règles de calcul des dates, les `data-testid` et les scénarios UAT dans `02-specs-metier.md`.

# Roadmap du Projet To-Do List

Ce document présente la vision globale, le découpage par lots fonctionnels et le suivi d'avancement des versions de l'application To-Do List.

---

## Vue d'Ensemble des Jalons

```
[Sprint 1 : MVP] ----> [Sprint 2 : V2] ----> [Sprint 3 : V3] ----> [Sprint 4 : V4] ----> [Sprint 5 : V5] ----> [Sprint 6 : V6] ----> [Sprint 7 : V7] ----> [Sprint 8 : V8]
 Socle CRUD & Filtres    Catégories & Tags     Tâches récurrentes    Planification & Tri     Auth & Sécurité     Durcissement & RateLimit  Résilience & Backup   Invité & Sync BDD
    (TERMINÉ)               (TERMINÉ)              (TERMINÉ)                 (TERMINÉ)            (TERMINÉ)            (TERMINÉ)              (TERMINÉ)             (EN COURS)
```

---

## Lot 1 : MVP - Gestion Élémentaire des Tâches (Sprint 1)
**Statut :** `TERMINÉ` (Validé par QA le 17/11/2026)  
**Archive :** [docs/archive/sprint-1/](file:///c:/laragon/www/todo-list/docs/archive/sprint-1/)  
**Objectif :** Disposer d'un socle applicatif fonctionnel permettant de gérer ses tâches quotidiennes en toute simplicité.

- [x] **CRUD Tâches :** Création, consultation, édition et suppression de tâches.
- [x] **Gestion du Statut :** Marquer une tâche comme terminée ou à faire.
- [x] **Échéance :** Date d'échéance optionnelle lors de la création et de la modification.
- [x] **Vues Filtrées :** Filtrage dynamique des tâches (Toutes, À faire, Terminées).
- [x] **Validation Qualité :** 100% des tests End-to-End Playwright validés (`8/8 passed`).

---

## Lot 2 : V2 - Organisation & Catégorisation (Sprint 2)
**Statut :** `TERMINÉ` (Validé par QA le 18/11/2026)  
**Archive :** [docs/archive/sprint-2/](file:///c:/laragon/www/todo-list/docs/archive/sprint-2/)  
**Objectif :** Structurer ses listes de tâches à l'aide de catégories et d'étiquettes visuelles.

- [x] **Gestion des Catégories / Tags :** Création, suppression et personnalisation de tags avec palette de couleurs.
- [x] **Association :** Assigner ou retirer une catégorie à une tâche (ajout et édition).
- [x] **Filtres Avancés :** Filtrer la vue des tâches par catégorie via menu déroulant réactif.
- [x] **Indicateurs visuels :** Badges colorés de catégories dans la liste des tâches.
- [x] **Intégrité des données :** Préservation des tâches en cas de suppression de leur catégorie.
- [x] **Validation Qualité :** 100% des tests E2E Playwright validés (`14/14 passed` cumulés).

---

## Lot 3 : V3 - Automatisation & Récurrence (Sprint 3 & Correctifs)
**Statut :** `TERMINÉ` (Validé par QA le 18/11/2026)  
**Archives :** [docs/archive/sprint-3/](file:///c:/laragon/www/todo-list/docs/archive/sprint-3/) et [docs/archive/sprint-3 - Correctifs/](file:///c:/laragon/www/todo-list/docs/archive/sprint-3%20-%20Correctifs/)  
**Objectif :** Automatiser la réapparition des tâches périodiques, sécuriser le cycle de vie des récurrences et améliorer l'ergonomie.

- [x] **Règles de Récurrence :** Support des fréquences quotidienne (`daily`), hebdomadaire (`weekly`) et mensuelle (`monthly`).
- [x] **Génération Automatique :** Génération immédiate et automatique de la prochaine occurrence active non terminée lors du passage à "Terminé" (calcul J+1, J+7 ou +1 mois).
- [x] **Verrouillage Anti-duplication (Correctif RG-24) :** Idempotence totale du statut de tâche (`has_generated_next`) interdisant toute démultiplication d'occurrences en cas de bascules répétées (cocher/décocher/recocher).
- [x] **Modale Ergonomique d'Ajout (Correctif RG-25) :** Déplacement du formulaire dense dans une modale dédiée (`modal-add-task`) accessible via un bouton d'action primaire « + Nouvelle tâche ».
- [x] **Alertes de Délais :** Badges d'urgence visuels ("En retard" en rouge si échéance passée, "Aujourd'hui" en ambre si échéance du jour).
- [x] **Badges de Périodicité :** Affichage d'un indicateur de récurrence dédié avec icône sur chaque tâche.
- [x] **Validation Qualité :** 100% des tests E2E Playwright validés (`24/24 passed` cumulés, zéro régression).

---

## Lot 4 : V4 - Planification Avancée, Gestion du Temps & Recherche (Sprint 4)
**Statut :** `TERMINÉ` (Validé par QA le 18/11/2026)  
**Archive :** [docs/archive/sprint-4/](file:///c:/laragon/www/todo-list/docs/archive/sprint-4/)  
**Objectif :** Définir des plages de récurrence bornées, cibler des horaires précis et rechercher/trier dans des longues listes.

- [x] **Plage de Récurrence :** Date limite de fin de récurrence (`recurrence_end_date`) arrêtant automatiquement la création de nouvelles occurrences.
- [x] **Ciblage Horaire Précis :** Prise en charge d'un horaire facultatif (`due_time`, format `HH:MM`) avec affichage inline sur l'échéance.
- [x] **Tri par Défaut par Temps Restant :** Ordonnancement automatique des tâches actives plaçant le délai restant le plus court en tête.
- [x] **Recherche Textuelle Instantanée :** Barre de recherche réactive filtrant les tâches par nom en temps réel.
- [x] **Sélecteur de Tri :** Choix d'ordonnancement dynamique entre échéance la plus proche et tri alphabétique (A-Z ou Z-A).
- [x] **Validation Qualité :** 100% des tests E2E Playwright validés (`22/22 passed` cumulés, zéro régression).

---

## Lot 5 : V5 - Authentification, Sécurité & Isolation des Utilisateurs (Sprint 5)
**Statut :** `TERMINÉ` (Validé par QA le 18/11/2026)  
**Archive :** [docs/archive/sprint-5/](file:///c:/laragon/www/todo-list/docs/archive/sprint-5/)  
**Objectif :** Sécuriser l'application accessible sur Internet avec inscription, connexion, mot de passe oublié via OTP et isolation des données par utilisateur.

- [x] **Configuration d'Environnement (`.env`) :** Prise en charge des variables d'environnement (`DB_PATH`, `APP_ENV`, `MAIL_DRIVER`, `MAIL_FROM`, `SESSION_SECRET`).
- [x] **Inscription Autonome :** Création de compte avec Nom, Prénom, Email unique, Identifiant unique et mot de passe sécurisé.
- [x] **Pré-proposition d'Identifiant :** Suggestion automatique et instantanée d'identifiant basée sur le prénom et le nom (ex: "Lucas" "Martin" -> "lmartin") modifiable librement.
- [x] **Contrôle de Robustesse & Confirmation :** Validation stricte du mot de passe (8+ caractères, 1 majuscule, 1 minuscule, 1 chiffre) avec jauge visuelle et confirmation identique.
- [x] **Authentification Sécurisée & Sessions :** Connexion par identifiant ou email, gestion de session HTTPOnly / SameSite Lax, et déconnexion en un clic.
- [x] **Mot de Passe Oublié (OTP par Mail) :** Demande de réinitialisation par email avec génération d'un code OTP à 6 chiffres valable 15 minutes, journalisation/envoi et application sécurisée du nouveau mot de passe.
- [x] **Isolation Stricte des Données Utilisateur :** Rattachement des tâches et catégories par `user_id`, interdisant toute fuite ou manipulation croisée entre comptes.
- [x] **Validation Qualité :** 100% des tests E2E Playwright validés (`27/27 passed` cumulés, zéro régression).

---

## Lot 6 : V6 - Durcissement Sécuritaire & Protection Anti-Brute-Force (Sprint 6)
**Statut :** `TERMINÉ` (Validé par QA le 18/11/2026)  
**Archive :** [docs/archive/sprint-6/](file:///c:/laragon/www/todo-list/docs/archive/sprint-6/)  
**Origine :** Recommandations de l'Audit Qualité & Sécurité ([docs/05-qa-axe-robustesse.md](file:///c:/laragon/www/todo-list/docs/05-qa-axe-robustesse.md))  
**Objectif :** Protéger l'application exposée sur Internet contre les attaques automatisées par force brute, le vol de session et les attaques CSRF.

- [x] **Limitation de Débit (Rate Limiting) :** Middleware anti-brute-force limitant les requêtes en rafale sur l'authentification et l'OTP (seuil de 5 tentatives échouées / 15 min, code `429 Too Many Requests`).
- [x] **Protection CSRF Globale :** Jeton `X-CSRF-Token` requis sur toutes les requêtes d'écriture (`POST`, `PUT`, `DELETE`, `PATCH`).
- [x] **En-têtes de Sécurité HTTP :** Émission systématique des headers stricts (`Content-Security-Policy`, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`).
- [x] **Régénération d'ID de Session :** Invalidation et régénération systématique de l'identifiant de cookie (`session_regenerate_id(true)`) lors du login pour contrer les attaques par fixation de session.
- [x] **Politique d'Expiration par Inactivité :** Expiration automatique de session après 24 heures sans activité.
- [x] **Validation Qualité :** 100% des tests E2E Playwright validés (`36/36 passed` cumulés, zéro régression).

---

## Lot 7 : V7 - Haute Disponibilité, Résilience SQLite & Observabilité (Sprint 7)
**Statut :** `TERMINÉ` (Validé par QA le 18/11/2026)  
**Archive :** [docs/archive/sprint-7/](file:///c:/laragon/www/todo-list/docs/archive/sprint-7/)  
**Origine :** Recommandations de l'Audit Qualité & Sécurité ([docs/05-qa-axe-robustesse.md](file:///c:/laragon/www/todo-list/docs/05-qa-axe-robustesse.md))  
**Objectif :** Garantir la robustesse de l'expérience utilisateur sous charge, optimiser la concurrence BDD et instaurer des mécanismes de sauvegarde et de journalisation étanches.

- [x] **Anti-Rebond & Concurrence UI (Debounce / State Disable) :** Verrouillage immédiat des boutons d'action au premier clic (`disabled = true` + micro-spinner SVG) pour interdire toute double création de ressource.
- [x] **Résilience Concurrente SQLite (Mode WAL) :** Activation de `PRAGMA journal_mode = WAL;`, `PRAGMA synchronous = NORMAL;`, et `PRAGMA busy_timeout = 5000;` pour éliminer les verrous d'écriture bloquant les lectures.
- [x] **Sauvegarde Automatisée à Chaud :** Script programmé de sauvegarde de base de données à chaud (`VACUUM INTO`) et rotation des journaux.
- [x] **Cloisonnement & Journalisation d'Audit :** En mode production (`APP_ENV=production`), masquage hermétique de tout détail d'erreur système et journalisation horodatée des événements de sécurité dans `logs/security.log`.
- [x] **Résilience Réseau Offline :** Détection de la perte réseau (`navigator.onLine`) et notification informative non bloquante.
- [x] **Validation Qualité :** 100% des tests E2E Playwright validés (`41/41 passed` cumulés, zéro régression).

---

## Lot 8 : V8 - Mode Invité (LocalStorage) & Migration BDD à l'Inscription (Sprint 8)
**Statut :** `TERMINÉ` (Validé par QA le 18/11/2026)  
**Archive :** [docs/archive/sprint-8/](file:///c:/laragon/www/todo-list/docs/archive/sprint-8/)  
**Objectif :** Permettre l'utilisation intégrale de la To-Do List sans connexion préalable (stockage local navigateur), et proposer la synchronisation/importation contrôlée de ces données locales en base de données lors de la création de compte.

- [x] **Mode Invité Déconnecté (LocalStorage) :** Utilisation sans compte avec stockage autonome dans le `localStorage` du navigateur (tâches, statuts, catégories, récurrences).
- [x] **Bannière d'Information Mode Invité :** Notification claire dans l'interface indiquant que les données sont locales (`[data-testid="badge-guest-mode"]`).
- [x] **Modale de Confirmation de Migration :** Lors de l'inscription d'un visiteur possédant des données locales, proposition explicite d'importer les données locales dans son nouveau compte en base de données (`[data-testid="modal-migrate-data"]`).
- [x] **Endpoint de Synchronisation / Import en Masse :** Endpoint API dédié `POST /api/v1/sync/import-local` pour importer atomiquement les catégories et tâches locales rattachées au nouvel utilisateur avec transaction PDO.
- [x] **Mode Connecté Exclusif BDD :** Dès que l'utilisateur est authentifié, bascule transparente et exclusive sur l'API et la base de données SQLite (aucun mélange avec les données locales).
- [x] **Validation Qualité :** 100% des tests E2E Playwright validés (`71/71 passed` cumulés, zéro régression).

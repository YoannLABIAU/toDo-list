# To-Do List - Application Web Personnelle

Application web personnelle de gestion de tâches (To-Do List) conçue avec une architecture modulaire Vanilla, légère, performante et sans frameworks lourds.

## Statut du Projet

- **Sprint 1 (MVP) :** `TERMINÉ & VALIDÉ` (8/8 tests passés).
- **Sprint 2 (V2 - Catégories & Tags) :** `TERMINÉ & VALIDÉ` (14/14 tests passés cumulés).
- **Sprint 3 (V3 - Automatisation & Récurrence) :** `TERMINÉ & VALIDÉ` (19/19 tests passés cumulés).
- **Sprint 4 (V4 - Planification, Gestion du temps & Recherche) :** `TERMINÉ & VALIDÉ` (22/22 tests passés cumulés).
- **Sprint 3 Correctifs (Anti-duplication & Modale d'ajout) :** `TERMINÉ & VALIDÉ` (24/24 tests passés cumulés).
- **Sprint 5 (V5 - Authentification, Sécurité & Isolation) :** `TERMINÉ & VALIDÉ` (27/27 tests passés cumulés).
- **Sprint 6 (V6 - Durcissement Sécuritaire & Protection Anti-Brute-Force) :** `TERMINÉ & VALIDÉ` (36/36 tests passés cumulés).
- **Sprint 7 (V7 - Haute Disponibilité, Résilience SQLite & Observabilité) :** `TERMINÉ & VALIDÉ` (41/41 tests passés cumulés).
- **Sprint 8 (V8 - Mode Invité LocalStorage & Migration post-inscription) :** `TERMINÉ & VALIDÉ` (71/71 tests passés cumulés).
- **Suivi global :** Consulter [ROADMAP.md](file:///c:/laragon/www/todo-list/docs/ROADMAP.md) et les archives [docs/archive/](file:///c:/laragon/www/todo-list/docs/archive/).

## Stack Technique

- **Environnement & Serveur :** Laragon (Windows), PHP 8.5 strict (`declare(strict_types=1);`).
- **Base de données :** SQLite via PDO pur avec requêtes préparées (`database/todo_list.sqlite`).
- **Backend :** Vanilla PHP modulaire (`module/Task/TaskApi/`, `module/Category/CategoryApi/` et `core/Api/`).
- **Frontend :** Vanilla TypeScript ES2022, HTML5 sémantique, Tailwind CSS (`module/Task/xxUi/`, `module/Category/xxUi/` et `core/Ui/`).
- **Assurance Qualité & E2E :** Playwright (`tests/e2e/`), Allure Report.

## Fonctionnalités Disponibles

### Sprint 1 (MVP) :
- **Gestion des tâches :** Création, modification et suppression définitive avec modale de confirmation.
- **Suivi du statut :** Bascule en un clic entre l'état "À faire" et "Terminée".
- **Date d'échéance :** Échéance optionnelle au format ISO avec badge visuel.
- **Filtrage réactif :** Onglets "Toutes", "À faire", et "Terminées" avec gestion d'état vide.
- **Ergonomie :** Modales de dialogue légères, surbrillance des erreurs et notifications toasts temporaires.

### Sprint 2 (V2 - Organisation & Catégorisation) :
- **Gestion des catégories / tags :** Création et suppression de catégories personnalisées avec palette de couleurs (`indigo`, `blue`, `emerald`, `purple`, `amber`, `rose`, `slate`).
- **Association aux tâches :** Attribution ou retrait d'une catégorie lors de l'ajout ou de l'édition d'une tâche.
- **Badges colorés :** Affichage d'un badge élégant pour chaque tâche classée.
- **Filtrage par catégorie :** Filtre réactif permettant d'isoler une catégorie, cumulable avec les filtres d'état.
- **Intégrité garantie :** La suppression d'une catégorie ne supprime jamais les tâches associées (déclassement automatique vers "Sans catégorie").

### Sprint 3 (V3 - Automatisation & Récurrence & Correctifs) :
- **Périodicités configurables :** Prise en charge des récurrences Quotidienne (`daily`), Hebdomadaire (`weekly`) et Mensuelle (`monthly`) à la création ou lors de la modification de tâche.
- **Auto-génération à l'achèvement :** Dès qu'une tâche récurrente est cochée "Terminée", l'occurrence suivante est automatiquement générée non complétée à J+1, J+7 ou +1 mois selon la périodicité.
- **Verrouillage anti-duplication :** Le drapeau atomique `has_generated_next` garantit qu'une bascule répétée (cocher / décocher / recocher) ne démultiplie jamais les occurrences de tâche.
- **Modale de création dédiée :** Formulaire de saisie complet encapsulé dans une modale épurée accessible via le bouton « + Nouvelle tâche ».
- **Alertes visuelles d'urgence :**
  - Badge rouge `En retard` si la tâche n'est pas terminée et son échéance est dépassée.
  - Badge ambre `Aujourd'hui` pour les tâches à réaliser le jour même.
- **Badges de périodicité :** Indicateur visuel distinctif arborant le libellé de récurrence sur chaque tâche concernée.

### Sprint 4 (V4 - Planification Avancée, Gestion du Temps & Recherche) :
- **Plage de récurrence (Date de fin) :** Définition d'une date limite optionnelle (`recurrence_end_date`) arrêtant automatiquement la création d'occurrences avec message informatif dédié.
- **Ciblage horaire précis :** Champ heure optionnel (`due_time`, format `HH:MM`) affiché directement dans le badge d'échéance.
- **Tri par défaut par temps restant le plus court :** Ordonnancement automatique des tâches actives mettant en tête l'échéance la plus urgente / imminente.
- **Recherche textuelle instantanée :** Champ de recherche réactif permettant d'isoler une tâche par mot-clé en temps réel.
- **Sélecteur de tri :** Alternance en un clic entre le tri par échéance la plus proche et les tris alphabétiques par nom (A-Z et Z-A).

### Sprint 5 (V5 - Authentification, Sécurité & Isolation) :
- **Configuration d'environnement (.env) :** Paramétrage modulaire (`DB_PATH`, `APP_ENV`, `MAIL_DRIVER`, `MAIL_FROM`, `SESSION_SECRET`).
- **Inscription avec pré-proposition d'identifiant :** Saisie Nom/Prénom avec génération automatique instantanée de l'identifiant (ex: `lmartin`), email unique et validation de robustesse du mot de passe (8+ car., maj, min, chiffre).
- **Connexion & Sessions sécurisées :** Authentification par identifiant ou email, cookies HTTPOnly / SameSite Lax et déconnexion en un clic.
- **Récupération de mot de passe par OTP :** Code OTP à 6 chiffres valable 15 minutes envoyé par mail ou consigné dans les logs, permettant la réinitialisation sécurisée d'un mot de passe oublié.
- **Isolation stricte des données :** Séparation stricte des tâches et catégories par `user_id` en base de données et dans les contrôleurs d'API.

### Sprint 6 (V6 - Durcissement Sécuritaire & Protection Anti-Brute-Force) :
- **Rate Limiting Anti-Brute-Force :** Verrouillage automatique des requêtes d'authentification et de réinitialisation de mot de passe en cas d'échecs répétés (seuil de 5 tentatives échouées par fenêtre glissante de 15 min, code `429 Too Many Requests`).
- **Protection Anti-CSRF Globale :** Jeton cryptographique CSRF injecté via `<meta name="csrf-token">` et transmis automatiquement par en-tête HTTP `X-CSRF-Token` sur toutes les requêtes mutatives (`POST`, `PUT`, `PATCH`, `DELETE`).
- **En-têtes de Sécurité HTTP Stricts :** Émission systématique des headers de sécurité (`Content-Security-Policy`, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`).
- **Durcissement des Sessions :** Régénération systématique du cookie de session lors de l'authentification (`session_regenerate_id(true)`) et expiration automatique de la session après 24 heures d'inactivité.

### Sprint 7 (V7 - Haute Disponibilité, Résilience SQLite & Observabilité) :
- **Anti-Rebond & Concurrence UI :** Verrouillage systématique de tous les boutons d'action mutative au premier clic (`disabled = true`, opacité, micro-spinner SVG) pour empêcher les multi-soumissions involontaires.
- **Résilience Concurrente SQLite (Mode WAL & Timeout) :** Activation des directives `PRAGMA journal_mode = WAL;`, `PRAGMA synchronous = NORMAL;` et `PRAGMA busy_timeout = 5000;` permettant des lectures non bloquées par les écritures concurrentes.
- **Sauvegarde à Chaud & Rotation :** Script CLI `scripts/backup-database.php` exploitant `VACUUM INTO` sans interruption de service avec rétention automatique des archives.
- **Observabilité & Journalisation d'Audit :** Fichier `logs/security.log` consignant les alertes structurées de sécurité (brute force, violation CSRF, IDOR), et `logs/app.log` pour les erreurs système.
- **Cloisonnement Hermétique en Production :** En mode `APP_ENV=production`, masquage étanche des détails sensibles (secrets, traces SQL) avec génération d'identifiant d'incident `error_id` corrélé aux logs serveur.
- **Résilience Réseau & Mode Hors-Ligne :** Détection native des états `offline` et `online` avec affichage d'un bandeau d'alerte en haut d'écran et toast de rétablissement de connexion.

### Sprint 8 (V8 - Mode Invité LocalStorage & Migration BDD) :
- **Mode Invité Déconnecté (LocalStorage) :** Utilisation complète sans compte avec persistance locale dans `localStorage` (`todo_guest_tasks`, `todo_guest_categories`). Support intégral du filtrage, tri, recherche et récurrence locale.
- **Bannière d'Information Mode Invité :** Badge discret et informatif `[data-testid="badge-guest-mode"]` signalant le stockage local dans le navigateur.
- **Modale de Confirmation de Migration :** Dès l'inscription d'un visiteur possédant des données locales, détection automatique et affichage de la modale `[data-testid="modal-migrate-data"]` avec compteur de tâches à transférer.
- **Import Atomique Sécurisé :** Route `POST /api/v1/sync/import-local` opérant une transaction PDO atomique rattachant les catégories et tâches importées au nouvel utilisateur, suivie de la purge du `localStorage`.
- **Mode Connecté Exclusif BDD :** Dès la connexion, l'application interagit exclusivement avec SQLite sans aucune écriture résiduelle dans le stockage local.

## Architecture Modulaire

1. **Modularité applicative (`./module/`) :**
   - Module `Auth` : `module/Auth/AuthApi/` (Backend) et `module/Auth/xxUi/` (Frontend)
   - Module `Task` : `module/Task/TaskApi/` (Backend) et `module/Task/xxUi/` (Frontend)
   - Module `Category` : `module/Category/CategoryApi/` (Backend) et `module/Category/xxUi/` (Frontend)
2. **Cœur système (`./core/`) :** Configuration `.env` (`Config.php`), Sessions sécurisées (`Session.php`), Mailer (`Mailer.php`), Routeur REST, connexion PDO singleton (`Database.php`), formatteur JSON (`Response.php`) et layout principal (`core/Ui/`).
3. **Contrat d'API normalisé :** Réponses JSON systématiquement en statut HTTP 200 au format standard `{ success, code, data | error }`.

## Commandes Utiles

```bash
# Compilation Frontend (TypeScript + Tailwind CSS)
npm run build

# Mode Watch pour le développement CSS
npm run watch

# Exécution de l'ensemble des tests E2E (cumulatifs Sprint 1 + Sprint 2)
npm test

# Exécution des tests avec rapport Allure
npm run test:allure
```

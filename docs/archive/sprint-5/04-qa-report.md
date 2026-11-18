STATUT: VALIDATED

# Rapport de Recette UAT & Tests E2E - Sprint 5 (Authentification & Sécurité)

## 1. Synthèse de la validation
- **Date d'exécution :** 18 Novembre 2026
- **Environnement testé :** Production locale Laragon (Apache, PHP 8.5.12, SQLite avec foreign keys, configuration `.env`, TypeScript Vanilla ES2022, Tailwind CSS)
- **Suite de tests :** Playwright E2E (`npm test`)
- **Résultat global :** **27 / 27 tests réussis (100% de succès, 0 régression)**

---

## 2. Couverture des Règles de Gestion du Sprint (RG-26 à RG-33)

| Règle | Libellé | Résultat E2E | Observations |
| :--- | :--- | :---: | :--- |
| **RG-26** | **Configuration `.env`** | **CONFORME** | Chargement autonome des paramètres critiques (`DB_PATH`, `APP_ENV`, `MAIL_DRIVER`, etc.) avec repli sécurisé via `Core\Api\Config`. |
| **RG-27** | **Pré-proposition d'identifiant en temps réel** | **CONFORME** | Dès la saisie de « Lucas » et « Martin », l'identifiant « lmartin » est instantanément suggéré dans le champ tout en restant éditable. |
| **RG-28** | **Unicité stricte email et identifiant** | **CONFORME** | Rejet immédiat avec message explicite (« Cette adresse email est déjà associée à un compte ») en cas de doublon. |
| **RG-29** | **Sûreté du mot de passe et confirmation** | **CONFORME** | Vérification des 4 critères (8+ caractères, 1 majuscule, 1 minuscule, 1 chiffre) et concordance stricte avec la confirmation. Jauge dynamique réactive en UI. |
| **RG-30** | **Connexion sécurisée** | **CONFORME** | Authentification par identifiant ou email + mot de passe haché (Bcrypt). Message d'erreur neutre en cas d'identifiants invalides. |
| **RG-31** | **Déconnexion de session** | **CONFORME** | Destruction immédiate du cookie de session serveur et bascule de l'interface vers l'état visiteur. |
| **RG-32** | **Mot de passe oublié via code OTP par mail** | **CONFORME** | Émission d'un code OTP à 6 chiffres expirable à 15 minutes, consigné dans `database/mail.log` ou envoyé par mail, réinitialisation effective du mot de passe. |
| **RG-33** | **Isolation stricte des données par utilisateur** | **CONFORME** | Les tâches créées par l'utilisateur A (Alice) sont strictement invisibles pour l'utilisateur B (Bob) connecté. Contrôle des droits en base et à l'API. |

---

## 3. Détail d'exécution de la suite complète Playwright

```text
Running 27 tests using 1 worker

[1/27]  [chromium] › tests/e2e/sprint1-tasks.spec.ts: Vue initiale vide -> PASSED
[2/27]  [chromium] › tests/e2e/sprint1-tasks.spec.ts: Création tâche avec/sans échéance -> PASSED
[3/27]  [chromium] › tests/e2e/sprint1-tasks.spec.ts: Bascule statut terminée/à faire -> PASSED
[4/27]  [chromium] › tests/e2e/sprint1-tasks.spec.ts: Modification via modale -> PASSED
[5/27]  [chromium] › tests/e2e/sprint1-tasks.spec.ts: Suppression avec modale confirmation -> PASSED
[6/27]  [chromium] › tests/e2e/sprint1-tasks.spec.ts: Filtrage dynamique vue -> PASSED
[7/27]  [chromium] › tests/e2e/sprint1-tasks.spec.ts: Persona 1 UAT (Claire - Nominal) -> PASSED
[8/27]  [chromium] › tests/e2e/sprint1-tasks.spec.ts: Persona 2 UAT (Marc - Erreurs/Annulations) -> PASSED
[9/27]  [chromium] › tests/e2e/sprint2-categories.spec.ts: Gestion des catégories -> PASSED
[10/27] [chromium] › tests/e2e/sprint2-categories.spec.ts: Association catégorie création/badge -> PASSED
[11/27] [chromium] › tests/e2e/sprint2-categories.spec.ts: Modification tâche changement catégorie -> PASSED
[12/27] [chromium] › tests/e2e/sprint2-categories.spec.ts: Filtrage par catégorie -> PASSED
[13/27] [chromium] › tests/e2e/sprint2-categories.spec.ts: Persona 1 UAT (Thomas - Nominal) -> PASSED
[14/27] [chromium] › tests/e2e/sprint2-categories.spec.ts: Persona 2 UAT (Sophie - Intégrité) -> PASSED
[15/27] [chromium] › tests/e2e/sprint3-correctifs.spec.ts: Ergonomie modale de création -> PASSED
[16/27] [chromium] › tests/e2e/sprint3-correctifs.spec.ts: Anti-duplication RG-24 (cocher/décocher/recocher) -> PASSED
[17/27] [chromium] › tests/e2e/sprint3-recurrence.spec.ts: Persona Julien (Routine hebdo J+7) -> PASSED
[18/27] [chromium] › tests/e2e/sprint3-recurrence.spec.ts: Persona Léa (Retards & régénération J+1) -> PASSED
[19/27] [chromium] › tests/e2e/sprint3-recurrence.spec.ts: Cas limites non-récurrent -> PASSED
[20/27] [chromium] › tests/e2e/sprint3-recurrence.spec.ts: RG-14 sans échéance -> PASSED
[21/27] [chromium] › tests/e2e/sprint3-recurrence.spec.ts: Filtrage avec tâches récurrentes -> PASSED
[22/27] [chromium] › tests/e2e/sprint4-planning-search.spec.ts: Persona Maxime (Horaire & fin de plage) -> PASSED
[23/27] [chromium] › tests/e2e/sprint4-planning-search.spec.ts: Persona Camille (Recherche & tri) -> PASSED
[24/27] [chromium] › tests/e2e/sprint4-planning-search.spec.ts: Modification tâche horaire & récurrence -> PASSED
[25/27] [chromium] › tests/e2e/sprint5-auth.spec.ts: Persona 1 UAT (Lucas - Parcours nominal complet) -> PASSED
[26/27] [chromium] › tests/e2e/sprint5-auth.spec.ts: Persona 2 UAT (Emma - Erreurs & Mot de passe oublié OTP) -> PASSED
[27/27] [chromium] › tests/e2e/sprint5-auth.spec.ts: RG-33 (Isolation stricte données entre utilisateurs) -> PASSED

Total: 27 passed (100%) en 49.0s
```

---

## 4. Conclusion
L'ensemble des critères d'acceptation fonctionnels et techniques du Sprint 5 sont parfaitement respectés, sans dégradation des acquis des 4 sprints antérieurs.

Statut officiel : **VALIDATED**.
Transmission au Chef de Projet (@cp) pour la clôture officielle du sprint.

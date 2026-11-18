# Rapport d'Audit Qualité, Robustesse & Sécurité (QA)

**Date d'audit :** 18 Novembre 2026  
**Auditeur :** Ingénieur QA / Testeur UAT (`@qa-uat`)  
**Couverture de tests :** Tests E2E automatisés Playwright (`tests/e2e/security-robustness.spec.ts`) + Revue de code d'infrastructure.

---

## 1. Synthèse des Tests E2E Exécutés & Résultats

Les tests d'intrusion et de robustesse ont couvert 6 axes majeurs :

| Axe de Test | Vecteur Audité | Résultat | Analyse QA |
| :--- | :--- | :---: | :--- |
| **XSS (Cross-Site Scripting)** | Injections de balises `<script>`, `onerror`, `onload` dans titres, catégories, nom/prénom. | **SUCCÈS** | Les charges utiles sont neutralisées grâce à l'échappement HTML systématique (`div.textContent`) et l'interpolation sécurisée. |
| **Injections SQL** | Injections SQL `' OR 1=1 --`, `UNION SELECT`, `DROP TABLE` dans les filtres, la recherche et l'API login. | **SUCCÈS** | Toutes les requêtes PDO utilisent des requêtes préparées avec paramètres nommés. Aucune corruption ni fuite détectée. |
| **IDOR & Contrôle d'Accès** | Tentatives de modification/suppression de ressources d'un utilisateur tiers via l'API REST. | **SUCCÈS** | Le backend rejette fermement les requêtes frauduleuses avec code `403 Forbidden` (`Action non autorisée sur cette tâche`). |
| **Validation des Limites** | Payloads géants (>255 caractères), dates invalides (ex: 2026-13-45), chaînes Unicode et émojis. | **SUCCÈS** | Le rejet des longueurs et formats invalides est rigoureux (Code 400). Les caractères Unicode et émojis sont supportés sans altération. |
| **Burst & Brute Force** | Requêtes en rafale sur `/api/v1/auth/login` et `/api/v1/auth/forgot-password`. | **ATTENTION** | Le serveur résiste sans crash (HTTP 200/400 constants), mais **aucun mécanisme de limitation de débit (Rate Limiting) n'est actif**. |
| **Concurrence & Double-Clic** | Clics simultanés multiples sur la soumission de formulaires UI. | **ATTENTION** | Bien qu'aucun crash n'ait lieu, un double-clic très rapide peut envoyer deux requêtes consécutives si le bouton n'est pas verrouillé dès le premier événement. |

---

## 2. Définition des Axes d'Amélioration Prioritaires

À l'issue de cet audit approfondi, 4 axes majeurs d'amélioration sont recommandés pour porter l'application aux standards d'entreprise :

---

### Axe 1 : Sécurité Applicative Avancée & Protection contre les Attaques par Force Brute (Haute Priorité)

1. **Rate Limiting (Limitation de débit) sur l'Authentification :**
   - **Constat :** Les endpoints sensibles (`/api/v1/auth/login`, `/api/v1/auth/forgot-password`, `/api/v1/auth/reset-password`) acceptent un nombre illimité de requêtes par minute.
   - **Risque :** Attaques par dictionnaire ou force brute sur les mots de passe et tentative d'énumération des codes OTP à 6 chiffres (1 000 000 de combinaisons).
   - **Recommandation :** Mise en place d'un middleware de limitation de débit (ex: max 5 tentatives échouées de login par tranche de 15 minutes par IP/identifiant avec code HTTP `429 Too Many Requests`).
2. **Protection CSRF & Renforcement des Sessions :**
   - **Constat :** Les sessions utilisent le flag `SameSite=Lax`.
   - **Recommandation :** Génération d'un jeton anti-CSRF injecté dans l'en-tête `X-CSRF-Token` lors des requêtes d'écriture (`POST`, `PUT`, `DELETE`, `PATCH`), et régénération automatique de l'ID de session (`session_regenerate_id(true)`) à la connexion pour interdire la fixation de session.
3. **En-têtes de Sécurité HTTP (Security Headers) :**
   - **Recommandation :** Émission systématique des headers de sécurité dans `index.php` ou `.htaccess` :
     - `Content-Security-Policy` (CSP)
     - `X-Content-Type-Options: nosniff`
     - `X-Frame-Options: DENY`
     - `Referrer-Policy: strict-origin-when-cross-origin`

---

### Axe 2 : Robustesse de l'Expérience Utilisateur & Concurrence UI (Moyenne Priorité)

1. **Verrouillage Anti-Rebond (Debounce & State Disable) :**
   - **Constat :** Lors d'une latence réseau, un utilisateur impatient peut cliquer à répétition sur les boutons de validation.
   - **Recommandation :** Désactiver immédiatement le bouton déclencheur (`disabled = true`), appliquer une opacité réduite et afficher un micro-spinner SVG jusqu'au retour de la promesse `fetch`.
2. **Gestion Hors-Ligne & Reconnextion Réseau (Offline Resilience) :**
   - **Recommandation :** Détecter la perte de connexion (`navigator.onLine`) et notifier l'utilisateur par un toast d'alerte spécifique plutôt qu'une erreur réseau générique.

---

### Axe 3 : Résilience de la Base de Données SQLite & Monitoring (Moyenne Priorité)

1. **Activation du mode WAL (Write-Ahead Logging) :**
   - **Constat :** En mode par défaut, SQLite verrouille l'intégralité du fichier de base lors d'une écriture.
   - **Recommandation :** Activer `PRAGMA journal_mode = WAL;` et `PRAGMA synchronous = NORMAL;` pour permettre des lectures concurrentes transparentes pendant les écritures, optimisant la vitesse et évitant les erreurs `database is locked`.
2. **Sauvegarde Automatisée & Rotation des Logs :**
   - **Recommandation :** Script de sauvegarde quotidienne à chaud (`VACUUM INTO 'database/backups/backup-YYYY-MM-DD.sqlite'`) et rotation des journaux d'emails et d'erreurs (`database/mail.log`, `logs/app.log`).

---

### Axe 4 : Observabilité & Mode Production Hermétique (Moyenne Priorité)

1. **Masquage strict des détails d'exception :**
   - Si `APP_ENV=production`, aucune trace d'exception interne (traces SQL, chemins de fichiers serveur) ne doit être divulguée dans le payload JSON. Seul un identifiant d'erreur unique doit être retourné pour corrélation avec les logs serveur.
2. **Journalisation centralisée des événements de sécurité :**
   - Trace horodatée des échecs d'authentification répétés, demandes de réinitialisation OTP et blocages IDOR.

---

## 3. Conclusion & Passage de relais au Chef de Projet (@cp)

L'application démontre déjà une excellente imperméabilité face aux injections SQL, XSS et aux attaques d'usurpation IDOR.  
Pour hisser l'application au niveau de robustesse d'entreprise (« Enterprise-Grade »), ces axes d'amélioration doivent être intégrés dans la feuille de route du projet.

**Transmission à @cp :** Analyse ce document et planifie les lots / sprints correspondants dans `ROADMAP.md`.

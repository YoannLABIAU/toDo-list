# Spécifications Fonctionnelles : Lot 7 - Haute Disponibilité, Résilience SQLite & Observabilité

## 1. Règles de Gestion (RG) et Cas Limites

| ID RG | ID US Liée | Description de la règle métier | Comportement en cas d'erreur / Cas limite |
|---|---|---|---|
| `RG-38` | `US-LOT7-01` | **Anti-Rebond & Concurrence UI (State Disable) :** Dès le premier clic sur un bouton d'action asynchrone mutative (création/mise à jour de tâche, création de catégorie, connexion, inscription, réinitialisation de mot de passe), le bouton passe immédiatement en état `disabled=true`, une classe visuelle `opacity-50 cursor-not-allowed` est appliquée et un spinner SVG d'attente remplace temporairement le pictogramme/texte. Tout clic supplémentaire pendant la requête est bloqué. | À la fin de la requête (succès ou échec réseau/serveur), le bouton est systématiquement réactivé (`disabled=false`) et son libellé initial est restauré. |
| `RG-39` | `US-LOT7-02` | **Résilience Concurrente SQLite (Mode WAL & Busy Timeout) :** La connexion PDO SQLite active systématiquement le mode Write-Ahead Logging via `PRAGMA journal_mode = WAL;`, `PRAGMA synchronous = NORMAL;`, ainsi qu'un délai d'attente d'accès concurrent `PRAGMA busy_timeout = 5000;`. | Si un verrou persiste plus de 5 secondes, une exception standardifiée est levée sans corruption de fichier. |
| `RG-40` | `US-LOT7-03` | **Journalisation d'Audit de Sécurité & Sauvegarde à Chaud :** Tout événement critique (tentative d'authentification échouée, déclenchement du rate limiting 429, tentative de falsification CSRF 403, tentative d'accès non autorisé IDOR 403) est consigné dans `logs/security.log` au format structuré `[DATE] [SEVERITY] [EVENT_TYPE] { ip, user_id, route, details }`. Un script utilitaire `scripts/backup-database.php` permet de déclencher une sauvegarde à chaud de SQLite (`VACUUM INTO`) dans `database/backups/`. | Si le répertoire de logs ou de backups n'existe pas, il est auto-généré avec les permissions appropriées. |
| `RG-41` | `US-LOT7-04` | **Cloisonnement Hermétique en Production :** Lorsque `APP_ENV=production` dans le `.env`, aucune trace d'exception (stack trace, chemin de fichier serveur, requête SQL) n'est renvoyée au client dans le payload JSON. Seul un message générique accompagné d'un identifiant unique de corrélation (`error_id` / UUID v4) est communiqué à l'utilisateur, tandis que l'exception complète est tracée dans `logs/app.log`. | En environnement `development` ou `test`, la trace d'erreur détaillée reste disponible pour faciliter le débogage. |
| `RG-42` | `US-LOT7-05` | **Résilience Réseau & Détection Hors-Ligne :** L'interface écoute les événements de connectivité du navigateur (`offline` et `online`). En cas de perte de connexion, un bandeau flottant d'avertissement `banner-offline` est affiché en haut de page. Lors du rétablissement de la connexion, le bandeau disparaît et un toast d'information `toast-online` confirme le retour en ligne. | Les boutons d'action restent protégés par l'anti-rebond et affichent un toast d'erreur réseau explicite si une soumission est tentée hors-ligne. |

---

## 2. Éléments d'Interface et Testabilité

| Composant / Vue | Élément UI | Attribut `data-testid` | Comportement UX attendu |
|---|---|---|---|
| **Bandeau Connectivité** | Bandeau d'alerte hors-ligne | `banner-offline` | Visible uniquement lorsque `navigator.onLine === false`. Style ambre/jaune d'avertissement fixé en haut de l'écran. |
| **Notification Réseau** | Toast de retour en ligne | `toast-online` | Apparaît 3 secondes lors de l'événement `online` avec icône verte de rétablissement. |
| **Formulaire Tâche (Ajout)** | Bouton de validation d'ajout | `btn-submit-task` | Verrouillé (`disabled`) dès le 1er clic avec spinner SVG rotatif. Réactivé dès la réponse. |
| **Formulaire Tâche (Édition)** | Bouton de sauvegarde d'édition | `btn-save-edit-task` | Verrouillé (`disabled`) dès le 1er clic avec spinner SVG rotatif. Réactivé dès la réponse. |
| **Formulaire Catégorie** | Bouton d'ajout catégorie | `btn-submit-category` | Verrouillé (`disabled`) pendant la création d'une catégorie. |
| **Formulaire Auth (Login)** | Bouton de connexion | `btn-submit-login` | Verrouillé (`disabled`) pendant l'authentification avec spinner SVG. |
| **Formulaire Auth (Register)** | Bouton d'inscription | `btn-submit-register` | Verrouillé (`disabled`) pendant la création de compte. |
| **Formulaire Auth (Forgot)** | Bouton demande OTP | `btn-submit-forgot` | Verrouillé (`disabled`) pendant l'envoi de la demande OTP. |

---

## 3. Scénarios de Recette Utilisateur (UAT)

### Persona 1 : Hélène (Utilisatrice mobile nomade en réseau instable)
- **Objectif :** Être informée de l'état de sa connectivité sans perdre ses données ni être bloquée de manière obscure.
- **Parcours :**
  1. Hélène est connectée sur son espace personnel.
  2. Sa connexion réseau faiblit ou se coupe (déclenchement de l'événement `offline`).
  3. Le bandeau `banner-offline` apparaît en tête d'écran avec le message clair « Connexion réseau perdue. Les modifications locales sont suspendues. ».
  4. Dès que la connexion revient (`online`), le bandeau s'efface immédiatement et un toast `toast-online` s'affiche « Connexion rétablie. ».

### Persona 2 : Damien (Utilisateur impatient générant des multi-clics frénétiques)
- **Objectif :** Créer une tâche et une catégorie sans provoquer de doublons accidentels causés par des clics répétés.
- **Parcours :**
  1. Damien remplit le formulaire de création de tâche.
  2. Il clique frénétiquement 4 fois d'affilée sur « Ajouter la tâche » (`btn-submit-task`).
  3. Dès le tout premier clic, le bouton passe en état désactivé avec spinner SVG et ignore les clics 2, 3 et 4.
  4. Une seule et unique tâche est créée et ajoutée à la liste.
  5. Le formulaire se ferme et le bouton est prêt pour une future utilisation.

---

## 4. Instructions de passage de relais (Handoff)
- **Pour l'Architecte :** À partir de ces règles de gestion (RG-38 à RG-42), conçois l'architecture technique, les ajustements PDO SQLite (WAL, timeouts), le système de logging de sécurité/production et l'anti-rebond TypeScript dans `/docs/current-sprint/03-architecture.md`.

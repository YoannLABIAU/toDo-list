# Spécifications Fonctionnelles : Lot 6 - Durcissement Sécuritaire & Protection Anti-Brute-Force

## 1. Règles de Gestion (RG) et Cas Limites
| ID RG | ID US Liée | Description de la règle métier | Comportement en cas d'erreur / Cas limite |
|---|---|---|---|
| `RG-34` | `US-LOT6-01` | **Rate Limiting Anti-Brute-Force** : Les tentatives d'authentification (`login`, `forgot-password`, `reset-password`) sont plafonnées à 5 échecs consécutifs par fenêtre de 15 minutes par adresse IP / cible. | Dès la 6e tentative dans la fenêtre, renvoyer immédiatement une réponse normalisée avec code `429` (« Trop de tentatives de connexion échouées. Veuillez patienter 15 minutes avant de réessayer. »). Une authentification réussie réinitialise le compteur. |
| `RG-35` | `US-LOT6-02` | **Protection Anti-CSRF Globale** : Un jeton cryptographique anti-falsification est généré par session et injecté dans le DOM (`<meta name="csrf-token">`). Toutes les requêtes HTTP d'écriture (`POST`, `PUT`, `PATCH`, `DELETE`) doivent transmettre l'en-tête `X-CSRF-Token` correspondant. | Si le jeton est absent ou invalide, bloquer la requête avec code `403` (« Jeton CSRF invalide ou expiré. »). L'endpoint d'isolation de test (`/api/v1/test/reset-db`) reste exempté pour Playwright. |
| `RG-36` | `US-LOT6-03` | **En-têtes de Sécurité HTTP** : Le serveur émet sur chaque réponse les en-têtes standard (`X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Content-Security-Policy`). | Prévient les attaques par clickjacking, mime-sniffing et injection de ressources tierces non autorisées. |
| `RG-37` | `US-LOT6-04` | **Renforcement de Session** : Lors de la connexion et de l'inscription, l'identifiant de session est régénéré (`session_regenerate_id(true)`). Après 24h sans activité, la session expire automatiquement. | Si une session est expirée lors d'un appel à une ressource privée, détruire la session et renvoyer code `401 Unauthorized` ou `user: null`. |

## 2. Éléments d'Interface et Testabilité
| Composant / Vue | Élément UI | Attribut `data-testid` | Comportement UX attendu |
|---|---|---|---|
| **Layout / Head** | Balise meta CSRF | *(balise meta)* `<meta name="csrf-token" content="...">` | Contient le jeton cryptographique lu par le client HTTP TypeScript. |
| **Vue Connexion** | Message d'alerte Rate Limit | `#auth-form-error` | Affiche clairement l'avertissement de blocage temporaire (HTTP 429) avec le délai d'attente. |
| **Client Frontend** | Header `X-CSRF-Token` | *(en-tête HTTP)* `X-CSRF-Token` | Automatiquement injecté dans tous les appels `fetch()` mutatifs via un intercepteur ou une méthode centralisée. |

## 3. Scénarios de Recette Utilisateur (UAT)
- **Persona 1 (Utilisateur nominal sous protection CSRF - Victor) :**
  1. Victor navigue sur l'application. La balise `<meta name="csrf-token">` est générée côté serveur.
  2. Victor s'inscrit, se connecte, crée une tâche et la modifie : chaque appel API transmet le header `X-CSRF-Token` valide de manière transparente.
  3. Les opérations s'exécutent sans friction avec des réponses de succès.
  4. L'identifiant de session de Victor a été régénéré à sa connexion, le protégeant contre toute fixation de session.

- **Persona 2 (Attaquant / Brute-Force & CSRF - Alex) :**
  1. Alex tente d'exécuter une attaque par force brute sur la connexion avec de mauvais mots de passe : après 5 tentatives consécutives échouées, la 6e tentative est immédiatement bloquée avec le code `429` et le message de verrouillage temporaire.
  2. Alex tente d'envoyer une requête forgée de création ou suppression de tâche (`POST /api/v1/tasks`) sans jeton CSRF ou avec un jeton invalide : la requête est immédiatement rejetée avec le code `403`.
  3. Les en-têtes HTTP de sécurité (`X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`) empêchent l'intégration du site dans une iframe malveillante.

## 4. Instructions de passage de relais (Handoff)
- **Pour l'Architecte :** À partir de ces règles de gestion, définis le MCD et les API dans `/docs/current-sprint/03-architecture.md`.

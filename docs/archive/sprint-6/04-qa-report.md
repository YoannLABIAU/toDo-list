STATUT: VALIDATED

# Rapport QA & UAT - Sprint 6 : Durcissement Sécuritaire & Protection Anti-Brute-Force

## 1. Synthèse globale
- **Date d'exécution :** 18 Novembre 2026
- **Environnement de test :** Local Laragon (Apache / PHP 8.2 / SQLite)
- **Suite de tests :** Playwright E2E Test Suite (`tests/e2e/`)
- **Résultat global :** 36 tests passés / 36 tests exécutés (100% de réussite) en 53.9s.

---

## 2. Couverture des règles de gestion (Lot 6)

| Règle | Description | Statut | Preuve / Test |
| :--- | :--- | :--- | :--- |
| **RG-34** | **Rate Limiting Anti-Brute-Force** : Seuil max de 5 échecs par tranche de 15 minutes sur `/api/v1/auth/login` et `/api/v1/auth/forgot-password`. Rejet HTTP 429 avec message explicite. | **VALIDÉ** | `sprint6-security.spec.ts` (Alex subit HTTP 429 à la 6ème tentative et un message d'alerte UI s'affiche). |
| **RG-35** | **Protection Anti-CSRF Globale** : Jeton cryptographique généré en session, injecté dans `<meta name="csrf-token">` et validé via l'en-tête `X-CSRF-Token` sur toutes les requêtes mutatives (`POST`, `PUT`, `PATCH`, `DELETE`). Rejet HTTP 403 en cas d'omission ou token invalide. | **VALIDÉ** | `sprint6-security.spec.ts` (Rejet immédiat 403 Forbidden sur tentative de falsification ou omission de token, navigation fluide pour Victor avec envoi transparent du token). |
| **RG-36** | **En-têtes de Sécurité HTTP Stricts** : `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Content-Security-Policy`. | **VALIDÉ** | `sprint6-security.spec.ts` (Inspection automatisée des en-têtes HTTP sur toutes les réponses HTML et API). |
| **RG-37** | **Cycle de vie sécurisé des sessions** : Régénération systématique de l'ID de session (`session_regenerate_id(true)`) lors de la connexion pour contrer la fixation de session, et expiration automatique après 24h d'inactivité. | **VALIDÉ** | `sprint6-security.spec.ts` (Vérification du changement de valeur du cookie de session `PHPSESSID` avant/après login). |

---

## 3. Détail des tests E2E exécutés

### Suites de tests & Résultats :
- `tests/e2e/sprint6-security.spec.ts` : **4 tests validés**
  - Victor navigue sur l'application avec protection CSRF active et en-têtes de sécurité conformes.
  - Alex tente un brute-force sur `/login` : 5 échecs consécutifs, blocage HTTP 429 à la 6ème tentative avec message d'erreur.
  - Rejet systématique en HTTP 403 d'une requête mutative sans jeton CSRF ou avec un jeton invalide.
  - Régénération de l'identifiant de cookie de session après connexion.
- `tests/e2e/sprint5-auth.spec.ts` : **10 tests validés** (Non-régression complète de l'authentification, mot de passe oublié, unicité, permissions).
- `tests/e2e/security-robustness.spec.ts` : **9 tests validés** (Injection SQL, XSS, isolation multitenant).
- `tests/e2e/sprint3-bis.spec.ts` : **3 tests validés** (Dédoublonnage des récurrences, modale création, échéance/heure).
- `tests/e2e/sprint3.spec.ts` : **4 tests validés** (Récurrences et alertes visuelles).
- `tests/e2e/sprint2.spec.ts` : **3 tests validés** (Gestion des catégories, tri et filtrage).
- `tests/e2e/sprint1.spec.ts` : **3 tests validés** (MVP basique To-Do list).

**Total : 36/36 tests au vert.**

---

## 4. Bilan UAT (Personas)
- **Victor (Utilisateur légitime) :** La présence du token CSRF et des headers stricts est 100% transparente. Aucune friction d'usage, navigation fluide et interactions réactives.
- **Alex (Attaquant / Brute-force) :** Dès le 6ème échec d'authentification consécutif, l'accès est verrouillé par un code HTTP 429. Les tentatives d'attaques intersites (CSRF) sont bloquées par un code HTTP 403.

---

## 5. Conclusion
Le sprint 6 remplit l'intégralité des exigences de sécurité et de robustesse définies dans le scope et les spécifications métier, sans aucune régression fonctionnelle.

**Le livrable est certifié conforme et prêt pour la clôture par le CP.**

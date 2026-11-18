# Sprint Actif : Lot 6 - Durcissement Sécuritaire & Protection Anti-Brute-Force (Sprint 6)
**Objectif principal :** Sécuriser et durcir l'infrastructure de l'application exposée sur Internet contre les attaques par force brute (Rate Limiting), la falsification de requêtes (CSRF), la fixation de session et le détournement de contenu (Security Headers HTTP).

## 1. Périmètre Macro (User Stories)
| ID | Fonctionnalité ciblée | Description métier | Priorité |
|---|---|---|---|
| `US-LOT6-01` | Limitation de Débit (Rate Limiting) | Protéger les endpoints sensibles d'authentification (`/login`, `/forgot-password`, `/reset-password`) contre les attaques en rafale et par dictionnaire (max 5 échecs par 15 min, code HTTP 429). | Haute |
| `US-LOT6-02` | Protection Anti-CSRF Globale | Exiger et vérifier un jeton anti-falsification (`X-CSRF-Token`) sur toutes les requêtes mutatives (`POST`, `PUT`, `DELETE`, `PATCH`) pour empêcher toute action frauduleuse cross-site. | Haute |
| `US-LOT6-03` | En-têtes HTTP de Sécurité Stricts | Diffuser systématiquement sur chaque réponse HTTP les en-têtes standard de protection navigateur (`CSP`, `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`). | Haute |
| `US-LOT6-04` | Renforcement du Cycle de Vie des Sessions | Régénérer l'identifiant de cookie (`session_regenerate_id(true)`) à la connexion pour contrer la fixation de session, et instaurer une expiration automatique après inactivité prolongée (24h). | Haute |

## 2. Hors Périmètre (Exclusions strictes)
- Intégration de CAPTCHA visuel ou défi proof-of-work (exclu par les consignes).
- Mode WAL et scripts de sauvegarde SQLite (planifiés spécifiquement pour le Sprint 7).
- Authentification multi-facteurs biométrique ou matérielle FIDO2/WebAuthn.
- Système complet de Web Application Firewall (WAF) externe (Cloudflare / AWS WAF).

## 3. Instructions de passage de relais (Handoff)
- **Pour le PO :** À partir de ce scope, rédige les spécifications fonctionnelles détaillées et les règles de gestion métier dans `02-specs-metier.md`.

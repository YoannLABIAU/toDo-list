# Frontend Log : Lot 6 - Durcissement Sécuritaire & Protection Anti-Brute-Force

## 1. Travaux Réalisés
- **Helper Centralisé CSRF (`core/Ui/CsrfHelper.ts`) :**
  - Fonctions typées `getCsrfToken()` extrayant la valeur de `<meta name="csrf-token">` et `getSecurityHeaders()` intégrant automatiquement `X-CSRF-Token` et `Accept: application/json`.
- **Mise à niveau des Services Clients HTTP :**
  - `AuthService.ts` : Transmission transparente du token CSRF sur `/register`, `/login`, `/logout`, `/forgot-password`, `/reset-password`.
  - `TaskService.ts` : Transmission du token CSRF sur `createTask` (`POST`), `updateTask` (`PUT`), `toggleTask` (`PATCH`) et `deleteTask` (`DELETE`).
  - `CategoryService.ts` : Transmission du token CSRF sur `createCategory` (`POST`) et `deleteCategory` (`DELETE`).
- **Affichage et Gestion des Erreurs de Sécurité :**
  - Prise en charge des retours d'erreurs HTTP 429 (« Trop de tentatives de connexion échouées... ») et 403 dans `AuthComponent.ts`.
- **Validation du Build :**
  - Exécution réussie de `npm run build` (code 0, TypeScript strict, styles Tailwind à jour).

---

## 2. Handoff
- **Pour le QA/UAT :** Le front et le back sont câblés, `data-testid` en place. Tu peux lancer Playwright.

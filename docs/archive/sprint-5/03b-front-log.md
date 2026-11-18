# Frontend Log : Lot 5 - Authentification & Sécurité

## 1. Travaux Réalisés
- **Composant Client `AuthService.ts` :**
  - Appels typés et asynchrones vers `/api/v1/auth/me`, `/api/v1/auth/register`, `/api/v1/auth/login`, `/api/v1/auth/logout`, `/api/v1/auth/forgot-password` et `/api/v1/auth/reset-password`.
  - Typage complet avec interface `UserDto` et `ApiResponse<T>`.
- **Composant Contrôleur `AuthComponent.ts` :**
  - Gestion dynamique de l'état utilisateur dans le header (affichage `btn-nav-login` ou profil utilisateur avec bouton `btn-logout`).
  - Implémentation de la modale d'authentification `modal-auth` regroupant 3 vues fluides (Connexion, Inscription, Mot de passe oublié / OTP).
  - **Pré-proposition d'identifiant en temps réel (RG-27) :** Suggestion automatique et instantanée d'identifiant basée sur le prénom et le nom (ex: "Lucas" "Martin" -> "lmartin") sans écraser la saisie si l'utilisateur modifie manuellement le champ.
  - **Indicateur de sûreté du mot de passe (RG-29) :** Jauge dynamique réactive aux 4 critères (8 caractères, 1 majuscule, 1 minuscule, 1 chiffre) et contrôle de concordance de confirmation.
  - **Flux de récupération OTP (RG-32) :** Écran à deux étapes (demande par email -> saisie du code OTP et nouveau mot de passe avec pré-remplissage pour environnements de test).
- **Intégration et Découplage :**
  - Ajout du conteneur `#auth-header-container` dans [module/Task/xxUi/task-view.php](file:///c:/laragon/www/todo-list/module/Task/xxUi/task-view.php).
  - Inclusion modulaire de [module/Auth/xxUi/auth-view.php](file:///c:/laragon/www/todo-list/module/Auth/xxUi/auth-view.php).
  - Câblage dans [src/ts/app.ts](file:///c:/laragon/www/todo-list/src/ts/app.ts) : rafraîchissement automatique de la liste des tâches et des catégories lors de la connexion ou déconnexion.
- **Validation du Build :**
  - Compilation `npm run build` exécutée avec succès (code 0, 0 erreur TypeScript, Tailwind CSS régénéré).

---

## 2. Attributs `data-testid` intégrés

| Attribut | Élément cible |
|---|---|
| `btn-nav-login` | Bouton d'ouverture de l'espace membre / modale auth |
| `btn-logout` | Bouton de déconnexion utilisateur |
| `input-login-username` | Saisie identifiant ou email de connexion |
| `input-login-password` | Saisie mot de passe de connexion |
| `btn-submit-login` | Soumission du formulaire de connexion |
| `link-to-register` | Lien bascule vers l'inscription |
| `link-forgot-password` | Lien bascule vers mot de passe oublié |
| `input-register-firstname` | Saisie prénom |
| `input-register-lastname` | Saisie nom de famille |
| `input-register-username` | Saisie identifiant (avec pré-proposition) |
| `input-register-email` | Saisie email unique |
| `input-register-password` | Saisie mot de passe sécurisé |
| `input-register-password-confirm` | Confirmation mot de passe |
| `btn-submit-register` | Soumission de l'inscription |
| `input-forgot-email` | Saisie email pour réception de l'OTP |
| `btn-submit-forgot-request` | Demande d'envoi de l'OTP |
| `input-forgot-otp` | Saisie code OTP 6 chiffres |
| `input-forgot-new-password` | Saisie nouveau mot de passe |
| `input-forgot-new-password-confirm` | Confirmation nouveau mot de passe |
| `btn-submit-forgot-reset` | Soumission réinitialisation mot de passe |

---

## 3. Handoff
- **Pour le QA/UAT :** Le front et le back sont câblés, `data-testid` en place. Tu peux lancer Playwright.

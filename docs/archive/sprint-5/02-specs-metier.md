# Spécifications Fonctionnelles : Lot 5 - Authentification & Sécurité des Utilisateurs

## 1. Règles de Gestion (RG) et Cas Limites
| ID RG | ID US Liée | Description de la règle métier | Comportement en cas d'erreur / Cas limite |
|---|---|---|---|
| `RG-26` | `US-LOT5-01` | **Configuration d'environnement (.env)** : L'application lit les variables critiques depuis le `.env` (`DB_PATH`, `APP_ENV`, `MAIL_DRIVER`, `MAIL_FROM`, `SESSION_SECRET`). | Si `.env` absent, fallback sécurisé sur des paramètres locaux sans planter l'application. |
| `RG-27` | `US-LOT5-02` | **Pré-proposition d'identifiant** : Lors de la saisie du prénom et du nom dans le formulaire d'inscription, le champ identifiant est automatiquement pré-rempli au format minuscule standardisé (ex: `jdupont`), tout en restant modifiable librement par l'utilisateur. | Si l'utilisateur saisit manuellement son identifiant, la suggestion automatique ne l'écrase plus. |
| `RG-28` | `US-LOT5-02` | **Unicité stricte email et identifiant** : L'adresse email et l'identifiant doivent être uniques en base de données. | Si l'email ou l'identifiant existe déjà, renvoyer un statut 400 avec message explicite (« Cet email est déjà associé à un compte » ou « Cet identifiant est déjà utilisé ») et conserver les champs saisis. |
| `RG-29` | `US-LOT5-02` | **Sûreté du mot de passe & confirmation** : Le mot de passe doit comporter au moins 8 caractères, une majuscule, une minuscule et un chiffre. Le champ de confirmation doit être strictement identique. | Si les critères ne sont pas remplis ou si la confirmation diffère, bloquer l'envoi et afficher une alerte visuelle sous le champ (« Le mot de passe doit contenir au moins 8 caractères, 1 chiffre et 1 majuscule »). |
| `RG-30` | `US-LOT5-03` | **Connexion sécurisée** : L'utilisateur s'identifie avec son identifiant (ou son email) et son mot de passe. La session serveur (cookie HTTPOnly sécurisé) est initiée dès l'authentification réussie. | Si couple identifiant/mdp erroné, message générique sécurisé (« Identifiant ou mot de passe incorrect ») sans divulguer si l'identifiant existe. |
| `RG-31` | `US-LOT5-03` | **Déconnexion** : L'action de déconnexion détruit la session côté serveur et renvoie l'utilisateur vers la vue de connexion. | Si une requête API non authentifiée est reçue sur une ressource privée, refuser l'accès avec code `401 Unauthorized` normalisé. |
| `RG-32` | `US-LOT5-04` | **Mot de passe oublié via OTP par mail** : L'utilisateur saisit son email. Un code OTP à 6 chiffres valide 15 minutes est généré et envoyé par email (simulé ou consigné dans les logs/base en mode local). L'utilisateur saisit le code reçu ainsi que son nouveau mot de passe pour réinitialiser son accès. | Si le code OTP est invalide ou expiré, refuser avec message (« Code OTP invalide ou expiré »). Si l'email n'existe pas, afficher un message neutre (« Si cet email existe, un code a été envoyé ») pour prévenir l'énumération. |
| `RG-33` | `US-LOT5-05` | **Isolation des données utilisateur** : Toutes les tâches et catégories créées sont rattachées à l'utilisateur connecté (`user_id`). Un utilisateur ne peut ni consulter, ni modifier, ni supprimer les tâches ou catégories d'un autre utilisateur. | Tentative d'accès à une ressource d'un tiers bloquée avec code `403 Forbidden` ou `404 Not Found`. |

## 2. Éléments d'Interface et Testabilité
| Composant / Vue | Élément UI | Attribut `data-testid` | Comportement UX attendu |
|---|---|---|---|
| **Auth / Header** | Bouton Se déconnecter | `btn-logout` | Affiche l'identifiant de l'utilisateur connecté et permet la déconnexion en un clic. |
| **Auth / Header** | Bouton Se connecter / S'inscrire | `btn-nav-login` | Ouvre l'écran ou la vue d'authentification lorsque l'utilisateur est déconnecté. |
| **Vue Connexion** | Champ Identifiant / Email | `input-login-username` | Champ texte autofocus pour saisir identifiant ou email. |
| **Vue Connexion** | Champ Mot de passe | `input-login-password` | Champ type `password` avec masque. |
| **Vue Connexion** | Bouton Connexion | `btn-submit-login` | Valide la connexion et redirige vers la vue des tâches de l'utilisateur. |
| **Vue Connexion** | Lien vers Inscription | `link-to-register` | Bascule vers l'onglet ou le formulaire d'inscription. |
| **Vue Connexion** | Lien Mot de passe oublié | `link-forgot-password` | Bascule vers la procédure de récupération OTP. |
| **Vue Inscription** | Champ Nom | `input-register-lastname` | Saisie du nom de famille. |
| **Vue Inscription** | Champ Prénom | `input-register-firstname` | Saisie du prénom (déclenche la pré-proposition d'identifiant avec le nom). |
| **Vue Inscription** | Champ Email | `input-register-email` | Saisie de l'adresse email valide. |
| **Vue Inscription** | Champ Identifiant | `input-register-username` | Pré-rempli automatiquement, éditable. |
| **Vue Inscription** | Champ Mot de passe | `input-register-password` | Saisie du mot de passe avec indicateur visuel de sûreté. |
| **Vue Inscription** | Champ Confirmation mot de passe | `input-register-password-confirm` | Doit concorder avec le mot de passe. |
| **Vue Inscription** | Bouton Valider Inscription | `btn-submit-register` | Crée le compte et connecte automatiquement l'utilisateur. |
| **Vue Mot de passe oublié** | Champ Email de récupération | `input-forgot-email` | Saisie de l'email pour recevoir le code OTP. |
| **Vue Mot de passe oublié** | Bouton Demander OTP | `btn-submit-forgot-request` | Déclenche l'envoi du code OTP. |
| **Vue Mot de passe oublié** | Champ Code OTP | `input-forgot-otp` | Saisie du code OTP à 6 chiffres. |
| **Vue Mot de passe oublié** | Champ Nouveau mot de passe | `input-forgot-new-password` | Saisie du nouveau mot de passe sécurisé. |
| **Vue Mot de passe oublié** | Bouton Réinitialiser mot de passe | `btn-submit-forgot-reset` | Valide la modification et connecte ou renvoie vers la connexion. |
| **Feedback Global** | Toast de notification | `toast-notification` | Affiche les messages de succès, d'information ou d'erreur. |

## 3. Scénarios de Recette Utilisateur (UAT)
- **Persona 1 (Utilisateur nominal - Lucas) :**
  1. Lucas arrive sur l'application en tant que visiteur non authentifié : la vue d'accueil lui présente l'écran de connexion / inscription.
  2. Lucas clique sur « Créer un compte », saisit « Lucas » dans prénom et « Martin » dans nom. L'identifiant « lmartin » est pré-rempli automatiquement.
  3. Il renseigne `lucas.martin@example.com`, définit un mot de passe sécurisé `Secret123!` et le confirme.
  4. Il soumet le formulaire : le compte est créé avec succès, il est automatiquement connecté et accède à sa To-Do List personnelle.
  5. Il crée une tâche personnelle « Préparer présentation ».
  6. Il se déconnecte via `btn-logout` : l'application le ramène sur la page de connexion.

- **Persona 2 (Cas d'erreurs & Mot de passe oublié - Emma) :**
  1. Emma tente de s'inscrire avec un mot de passe faible (`1234`) : l'interface l'avertit et bloque la soumission.
  2. Emma tente de s'inscrire avec un email ou un identifiant déjà existant : un message explicite l'en informe.
  3. Emma tente de se connecter avec un mot de passe erroné : message d'erreur générique `Identifiant ou mot de passe incorrect`.
  4. Emma clique sur « Mot de passe oublié ? », saisit son adresse email et clique sur « Envoyer le code ».
  5. Elle reçoit un code OTP (ex: `123456`), renseigne le code et un nouveau mot de passe sécurisé `NouveauPass2026!`.
  6. Son mot de passe est mis à jour avec succès et elle peut se connecter avec ses nouveaux identifiants.

## 4. Instructions de passage de relais (Handoff)
- **Pour l'Architecte :** À partir de ces règles de gestion, définis le MCD et les API dans `/docs/current-sprint/03-architecture.md`.

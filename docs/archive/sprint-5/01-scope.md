# Sprint Actif : Lot 5 - Authentification & Sécurité des Utilisateurs (Sprint 5)
**Objectif principal :** Sécuriser l'application accessible sur Internet en intégrant un système d'authentification complet (inscription avec pré-proposition d'identifiant, connexion sécurisée, mot de passe oublié via OTP par mail, isolation des données par utilisateur et configuration via `.env`).

## 1. Périmètre Macro (User Stories)
| ID | Fonctionnalité ciblée | Description métier | Priorité |
|---|---|---|---|
| `US-LOT5-01` | Configuration d'environnement (`.env`) | Définir et charger les paramètres système dans un fichier `.env` (chemin BDD SQLite, configuration SMTP/mail pour OTP, secret de session/OTP). | Haute |
| `US-LOT5-02` | Inscription de compte autonome | Permettre à un nouvel utilisateur de créer un compte avec Nom, Prénom, Email (unique), Identifiant pré-calculé (unique, personnalisable), Mot de passe sécurisé et confirmation de mot de passe. | Haute |
| `US-LOT5-03` | Connexion et Déconnexion de session | Permettre à l'utilisateur de s'authentifier par Identifiant (ou Email) + Mot de passe, de maintenir sa session active et de se déconnecter proprement. | Haute |
| `US-LOT5-04` | Récupération de mot de passe (OTP par email) | Permettre la réinitialisation de mot de passe oublié via l'envoi d'un code OTP à usage unique par email avec délai de validité (ex: 15 min). | Haute |
| `US-LOT5-05` | Protection de l'application & Isolation utilisateur | Restreindre l'accès à la To-Do List aux seuls utilisateurs connectés ; isoler strictement les tâches et catégories créées par utilisateur (`user_id`). | Haute |

## 2. Hors Périmètre (Exclusions strictes)
- Intégration de fournisseurs OAuth tiers (Google, GitHub, Apple).
- Authentification multi-facteurs matérielle (WebAuthn / FIDO2).
- Gestion de rôles hiérarchiques complexes (Superadmin, modérateur, gestion d'équipe).
- Profil utilisateur étendu (avatar photo, préférences linguistiques avancées).

## 3. Instructions de passage de relais (Handoff)
- **Pour le PO :** À partir de ce scope, rédige les spécifications fonctionnelles détaillées et les règles de gestion métier dans `02-specs-metier.md`.

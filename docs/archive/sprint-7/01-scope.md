# Sprint Actif : Lot 7 - Haute Disponibilité, Résilience SQLite & Observabilité (Sprint 7)
**Objectif principal :** Sécuriser la concurrence et la résilience opérationnelle de l'application en verrouillant les interactions UI contre les doubles soumissions (anti-rebond), en optimisant les performances concurrentes SQLite (mode WAL), en instaurant la journalisation d'audit de sécurité et le cloisonnement hermétique des erreurs de production, et en informant l'utilisateur en cas de perte de connectivité réseau.

## 1. Périmètre Macro (User Stories)

| ID | Fonctionnalité ciblée | Description métier | Priorité |
|---|---|---|---|
| `US-LOT7-01` | **Anti-Rebond & Concurrence UI (State Disable)** | Désactivation instantanée des boutons d'action (`disabled=true`) et affichage d'un micro-indicateur de chargement dès le premier clic lors de toute soumission asynchrone (création/édition de tâche, création de catégorie, inscription, connexion, mot de passe oublié) pour interdire toute double requête involontaire. | Haute |
| `US-LOT7-02` | **Résilience Concurrente SQLite (Mode WAL)** | Configuration de la base de données SQLite en mode Write-Ahead Logging (`PRAGMA journal_mode = WAL;` et `PRAGMA synchronous = NORMAL;`) pour supprimer les blocages de lecture pendant les opérations d'écriture concurrentes. | Haute |
| `US-LOT7-03` | **Journalisation d'Audit de Sécurité & Rotation** | Journalisation systématique et horodatée des événements de sécurité (échecs d'authentification, déclenchements du rate limiting, rejets CSRF, tentatives d'accès IDOR) dans un fichier dédié `logs/security.log`, avec script de sauvegarde SQLite à chaud (`VACUUM INTO`). | Haute |
| `US-LOT7-04` | **Cloisonnement Hermétique en Production** | En environnement de production (`APP_ENV=production`), masquage strict des détails d'exceptions internes dans les réponses JSON de l'API avec génération d'un identifiant de corrélation (`error_id`) pour l'exploitant. | Haute |
| `US-LOT7-05` | **Résilience Réseau & Notification Hors-Ligne** | Détection automatique des changements d'état réseau du navigateur (`online` / `offline`) avec affichage d'un bandeau ou toast non bloquant prévenant l'utilisateur de l'interruption temporaire d'accès aux services. | Moyenne |

## 2. Hors Périmètre (Exclusions strictes)
- Aucune modification du modèle métier des tâches, catégories ou utilisateurs existants.
- Aucun stockage local complexe en `IndexedDB` avec moteur de synchronisation bi-directionnelle complet (seule la détection et la notification de déconnexion réseau sont ciblées).
- Aucun serveur de messagerie externe ou service tiers de monitoring payant (l'observabilité et les sauvegardes reposent sur l'infrastructure PHP/SQLite locale standard).

## 3. Instructions de passage de relais (Handoff)
- **Pour le PO :** À partir de ce scope, rédige les spécifications fonctionnelles détaillées et les règles de gestion métier dans `02-specs-metier.md`.

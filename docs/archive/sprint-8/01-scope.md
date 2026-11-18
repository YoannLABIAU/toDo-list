# Sprint Actif : Lot 8 - Mode Invité (LocalStorage) & Migration BDD à l'Inscription (Sprint 8)
**Objectif principal :** Rendre l'application immédiatement utilisable par tout visiteur anonyme grâce à un stockage local (`localStorage`) de ses tâches et catégories, et permettre la migration contrôlée et soumise à confirmation de ces données locales vers la base de données lors de la création d'un compte.

## 1. Périmètre Macro (User Stories)

| ID | Fonctionnalité ciblée | Description métier | Priorité |
|---|---|---|---|
| `US-LOT8-01` | **Mode Invité Déconnecté (LocalStorage)** | Lorsqu'un visiteur n'est pas connecté, l'application fonctionne intégralement (CRUD tâches, catégories, récurrences, filtres, tri) en persistant l'ensemble de ses données dans le `localStorage` de son navigateur sans appel BDD. | Haute |
| `US-LOT8-02` | **Indicateur Mode Visiteur / Invité** | Affichage d'un badge ou d'un bandeau informatif discret indiquant à l'utilisateur non connecté qu'il travaille en local sur son navigateur et que ses données ne sont pas synchronisées dans le cloud. | Moyenne |
| `US-LOT8-03` | **Modale de Validation de Migration des Données** | Lorsqu'un visiteur ayant créé des tâches ou catégories locales crée un compte, une modale de confirmation lui propose d'importer ses données locales dans son nouveau compte (« Voulez-vous importer vos X tâches locales ? »). | Haute |
| `US-LOT8-04` | **Synchronisation et Importation en Base** | Si l'utilisateur confirme, les catégories et tâches locales sont injectées en base de données SQLite via une transaction atomique rattachée à son `user_id`, et le stockage local est nettoyé. | Haute |
| `US-LOT8-05` | **Mode Connecté Exclusif BDD** | Dès qu'un utilisateur est authentifié (connexion classique ou après inscription), l'application bascule automatiquement et exclusivement sur l'API et la base de données serveur SQLite. | Haute |

## 2. Hors Périmètre (Exclusions strictes)
- Aucun mécanisme complexe de synchronisation offline permanente bidirectionnelle en tâche de fond (la synchronisation se déclenche uniquement lors de la création de compte).
- Aucune fusion de données locales sur une connexion classique à un compte existant déjà garni (la migration est ciblée sur l'onboarding / création de compte pour éviter les conflits d'écrasement).
- Pas de base de données client complexe (IndexedDB / PouchDB) : le standard `localStorage` (avec sérialisation JSON sécurisée) est ciblé pour sa légèreté et sa robustesse Vanilla.

## 3. Instructions de passage de relais (Handoff)
- **Pour le PO :** À partir de ce scope, rédige les spécifications fonctionnelles détaillées et les règles de gestion métier dans `02-specs-metier.md`.

# Spécifications Fonctionnelles : Lot 8 - Mode Invité (LocalStorage) & Migration BDD à l'Inscription

## 1. Règles de Gestion (RG) et Cas Limites

| ID RG | ID US Liée | Description de la règle métier | Comportement en cas d'erreur / Cas limite |
|---|---|---|---|
| `RG-43` | `US-LOT8-01` | **Stockage Local Autonome pour Visiteur Non Connecté :** Lorsqu'aucun utilisateur n'est authentifié (`currentUser === null`), toutes les opérations d'écriture (création, édition, bascule, suppression de tâches et catégories) s'exécutent localement en mémoire et sont persistées dans le `localStorage` sous les clés `todo_guest_tasks` et `todo_guest_categories`. Aucune requête d'écriture n'est envoyée au serveur. | Si le `localStorage` est inaccessible (mode navigation privée stricte / quota plein), l'application conserve les données en mémoire vive de la session de page en cours. |
| `RG-44` | `US-LOT8-02` | **Indicateur Visuel du Mode Invité :** Lorsqu'un visiteur non connecté consulte l'application, un badge distinctif `badge-guest-mode` (« Mode Invité (Local) ») est affiché dans le bandeau supérieur pour l'informer que ses données sont restreintes à son navigateur. | Dès que l'utilisateur se connecte ou s'inscrit, ce badge disparaît au profit du profil connecté. |
| `RG-45` | `US-LOT8-03` | **Modale de Confirmation de Migration à l'Inscription :** Lors de la création d'un nouveau compte, si le visiteur possède au moins 1 tâche ou 1 catégorie dans son stockage local, une modale de dialogue `modal-migrate-data` s'affiche immédiatement après la création du compte en lui proposant : « Souhaitez-vous importer vos X tâches locales dans votre nouveau compte ? ». L'utilisateur peut accepter (« Importer mes données ») ou refuser (« Ignorer »). | Si l'utilisateur refuse (« Ignorer »), les données locales restent dans le navigateur ou sont archivées sans être injectées en base, et son compte neuf démarre vierge. |
| `RG-46` | `US-LOT8-04` | **Synchronisation et Injection Atomique en Base :** En cas d'acceptation de la migration, le client envoie l'ensemble de ses tâches et catégories locales à l'endpoint `POST /api/v1/sync/import-local`. Le backend insère les catégories (en évitant les doublons de nom), fait correspondre les identifiants de catégories sur les tâches, insère les tâches associées au `user_id` de l'utilisateur, et retourne le bilan de migration. Le `localStorage` est alors vidé (`localStorage.removeItem`). | Si l'import échoue (erreur serveur), les données locales sont conservées dans le `localStorage` pour éviter toute perte de données. |
| `RG-47` | `US-LOT8-05` | **Bascule Exclusive en Mode Base de Données :** Dès qu'une session utilisateur est active (connexion classique ou après inscription/migration), tous les services de données basculent exclusivement sur les appels API REST `/api/v1/tasks` et `/api/v1/categories`. Les données du `localStorage` invité ne sont plus consultées ni modifiées. | Lors de la déconnexion, l'application recharge le `localStorage` invité s'il contient des données préexistantes. |

---

## 2. Éléments d'Interface et Testabilité

| Composant / Vue | Élément UI | Attribut `data-testid` | Comportement UX attendu |
|---|---|---|---|
| **Header Principal** | Badge Mode Invité | `badge-guest-mode` | Visible uniquement si l'utilisateur n'est pas connecté. Stylé en ambre avec icône locale. |
| **Modale Migration** | Conteneur de la modale | `modal-migrate-data` | S'ouvre automatiquement après inscription réussie si des données locales existent. |
| **Modale Migration** | Compteur de tâches à migrer | `migrate-task-count` | Affiche le nombre exact de tâches locales détectées (ex: « 3 tâches locales détectées »). |
| **Modale Migration** | Bouton Confirmer l'import | `btn-confirm-migration` | Envoie les données locales à l'API de synchronisation avec spinner de chargement. |
| **Modale Migration** | Bouton Ignorer / Passer | `btn-skip-migration` | Ferme la modale sans importer et laisse le compte propre. |
| **Toast** | Notification de succès de migration | `toast-notification` | Affiche « Données locales synchronisées avec succès ! ». |

---

## 3. Scénarios de Recette Utilisateur (UAT)

### Persona 1 (Julie, Visiteuse conquise décidant de créer un compte)
- **Objectif :** Tester l'application sans inscription, puis créer un compte et conserver toutes ses tâches locales.
- **Parcours nominal :**
  1. Julie arrive sur le site sans être connectée. Elle voit le badge `badge-guest-mode`.
  2. Elle crée une catégorie « Recettes » et 2 tâches locales (« Tarte aux pommes », « Soupe miso »).
  3. Convaincue par l'application, elle clique sur « Espace Membre » puis « Créer un compte ».
  4. Elle renseigne son nom, prénom, email et mot de passe et valide.
  5. Dès son compte créé, la modale `modal-migrate-data` s'ouvre : « Souhaitez-vous importer vos 2 tâches locales dans votre compte ? ».
  6. Julie clique sur `btn-confirm-migration`.
  7. Ses 2 tâches et sa catégorie sont importées en base de données.
  8. Le stockage local est nettoyé, le badge invité disparaît et Julie retrouve ses tâches rattachées à son compte dans le cloud.

### Persona 2 (Karim, Visiteur créant un compte professionnel neuf)
- **Objectif :** Utiliser le mode invité pour un brouillon personnel, puis créer un compte pro sans y mélanger ses brouillons.
- **Parcours cas d'exclusion :**
  1. Karim crée 1 tâche locale « Test brouillon perso ».
  2. Il clique sur « Créer un compte » pour son usage professionnel.
  3. À l'issue de l'inscription, la modale de migration lui propose d'importer son brouillon.
  4. Karim clique sur « Ignorer » (`btn-skip-migration`).
  5. Son compte professionnel s'ouvre avec un état vide propre (« Aucune tâche existante »).
  6. La base de données de son compte ne contient pas la tâche brouillon.

---

## 4. Instructions de passage de relais (Handoff)
- **Pour l'Architecte :** Définis le contrat d'API `POST /api/v1/sync/import-local`, la structure de la transaction d'import et l'abstraction du repository côté Frontend (pattern Storage Adapter / Service) dans `/docs/current-sprint/03-architecture.md`.

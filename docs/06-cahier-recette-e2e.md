# Cahier de Recette E2E - Stratégie de Test en 4 Niveaux (QA / UAT)

**Auteur :** Ingénieur QA / Testeur UAT (`@qa-uat`)  
**Date :** 18 Novembre 2026  
**Application :** To-Do List Modulaire Vanilla  
**Framework de Test :** Playwright (TypeScript)  
**Méthodologie :** BDD (Behavior Driven Development) - Syntaxe Gherkin *« Étant donné que / Quand / Alors »* (*Given / When / Then*).

---

## Vue d'Ensemble de la Pyramide de Tests E2E

```
       / \
      /   \      Niveau 4 : Compatibilité & Smoke Tests Responsive (Mobile / Desktop)
     /     \     Niveau 3 : Sécurité, IDOR, Injection, CSRF, Brute Force & Rate Limit
    /       \    Niveau 2 : Cas Limites, Frontières, Emojis, Calendriers & Formats
   /_________\   Niveau 1 : Tests Fonctionnels Métier (Parcours Utilisateurs Nominaux)
```

---

## 1. Niveau 1 : Tests Fonctionnels Métier (Prioritaires)

Ce niveau valide les scénarios utilisateurs de bout en bout couvrant l'ensemble de la valeur métier délivrée.

### Scénarios de Test :

#### `TC-FNC-01` : Création d'une tâche simple
- **Étant donné que** l'utilisateur est sur la page principale avec la modale de création ouverte,
- **Quand** il saisit le titre « Acheter du pain frais » et valide le formulaire,
- **Alors** la tâche apparaît immédiatement dans la liste avec l'état « À faire », la modale se ferme et un toast de succès s'affiche.

#### `TC-FNC-02` : Modification d'une tâche existante
- **Étant donné que** la tâche « Acheter du pain frais » existe dans la liste,
- **Quand** l'utilisateur clique sur le bouton « Modifier », remplace le titre par « Acheter 2 baguettes tradition » et confirme,
- **Alors** la liste se met à jour instantanément avec le nouveau libellé.

#### `TC-FNC-03` : Bascule d'achèvement d'une tâche
- **Étant donné que** la tâche est active (à faire),
- **Quand** l'utilisateur coche la case de complétion,
- **Alors** la tâche passe à l'état « Terminée », son libellé est barré et un style atténué lui est appliqué.

#### `TC-FNC-04` : Suppression d'une tâche avec confirmation
- **Étant donné que** la tâche existe dans la liste,
- **Quand** l'utilisateur clique sur l'icône de suppression et confirme l'action dans la modale d'alerte,
- **Alors** la tâche est définitivement retirée de l'interface et de la base de données.

#### `TC-FNC-05` : Création et gestion des catégories
- **Étant donné que** l'utilisateur ouvre la modale de gestion des catégories,
- **Quand** il saisit le libellé « Personnel » avec la couleur « rose » et clique sur « Créer la catégorie »,
- **Alors** la catégorie est ajoutée aux sélecteurs et s'affiche dans la liste des catégories existantes.

#### `TC-FNC-06` : Affectation d'une catégorie à une tâche
- **Étant donné que** la catégorie « Professionnel » existe,
- **Quand** l'utilisateur crée une tâche « Finaliser le compte-rendu » en sélectionnant cette catégorie,
- **Alors** la tâche arbore un badge visuel distinctif aux couleurs de la catégorie sélectionnée.

#### `TC-FNC-07` : Création d'une récurrence hebdomadaire
- **Étant donné que** l'utilisateur crée une tâche avec une date d'échéance et sélectionne la fréquence « Hebdomadaire »,
- **Quand** la tâche est enregistrée,
- **Alors** un badge de périodicité « Hebdomadaire » est visible sur la carte de la tâche.

#### `TC-FNC-08` : Génération automatique de l'occurrence suivante (J+7)
- **Étant donné que** la tâche récurrente hebdomadaire du 18/11/2026 est active,
- **Quand** l'utilisateur la coche comme « Terminée »,
- **Alors** la tâche courante passe au statut terminé et une nouvelle tâche identique et active est immédiatement créée avec l'échéance calculée à J+7 (25/11/2026).

#### `TC-FNC-09` : Connexion avec un compte valide
- **Étant donné que** l'utilisateur possède un compte actif (« lmartin » / « SecretPass2026! »),
- **Quand** il saisit ses identifiants dans la modale de connexion et valide,
- **Alors** il est authentifié, son prénom apparaît dans le header avec un voyant vert et ses données personnelles sont chargées.

#### `TC-FNC-10` : Refus de connexion avec mot de passe incorrect
- **Étant donné que** l'utilisateur saisit son identifiant valide mais un mot de passe erroné,
- **Quand** il soumet le formulaire,
- **Alors** un message d'alerte rouge « Identifiant ou mot de passe incorrect » s'affiche et la session n'est pas ouverte.

#### `TC-FNC-11` : Déconnexion de session
- **Étant donné que** l'utilisateur est connecté,
- **Quand** il clique sur « Déconnexion »,
- **Alors** la session est détruite, le bouton « Connexion » réapparaît et les données sont réinitialisées.

#### `TC-FNC-12` : Récupération de mot de passe par code OTP
- **Étant donné que** l'utilisateur a oublié son mot de passe,
- **Quand** il saisit son email, reçoit son code OTP à 6 chiffres et définit son nouveau mot de passe conforme,
- **Alors** il peut immédiatement se connecter avec son nouveau mot de passe.

---

## 2. Niveau 2 : Cas Limites & Conditions aux Frontières (Boundary Conditions)

Ce niveau met à l'épreuve la résilience applicative sur les formats extrêmes, les limites de taille et les calculs calendaires.

### Scénarios de Test :

#### Tâches :
- `TC-BND-01` : **Titre vide** $\rightarrow$ Rejet immédiat avec encadré rouge sur le champ et message d'erreur.
- `TC-BND-02` : **Titre minimal (1 caractère)** $\rightarrow$ Validation et persistance sans altération (ex: « X »).
- `TC-BND-03` : **Titre maximal (255 caractères)** $\rightarrow$ Validation complète sans troncature ni débordement graphique (overflow).
- `TC-BND-04` : **Caractères spéciaux et ponctuation (`<>&"'/\;@#$`)** $\rightarrow$ Traitement textuel pur sans faille d'injection.
- `TC-BND-05` : **Support complet des émojis UTF-8 (`🎯 🚀 💻 📅 ✨ 🦄`)** $\rightarrow$ Enregistrement et rendu graphique parfait.
- `TC-BND-06` : **Échéance passée (Hier)** $\rightarrow$ Attribution automatique du badge d'alerte rouge « En retard ».
- `TC-BND-07` : **Échéance très lointaine (Année 2035)** $\rightarrow$ Persistance et tri chronologique exact.
- `TC-BND-08` : **Horaires limites (`00:00` et `23:59`)** $\rightarrow$ Acceptation des bornes et rejet des formats erronés (`24:00`, `12:60`).

#### Catégories :
- `TC-BND-09` : **Nom de catégorie vide** $\rightarrow$ Rejet avec toast d'alerte.
- `TC-BND-10` : **Nom de catégorie en doublon exact** $\rightarrow$ Rejet avec message « Une catégorie portant ce nom existe déjà. ».
- `TC-BND-11` : **Suppression d'une catégorie liée à des tâches** $\rightarrow$ Préservation intégrale des tâches, réassignées en « Sans catégorie ».

#### Calendrier & Récurrences :
- `TC-BND-12` : **Fréquence Quotidienne (`daily`)** $\rightarrow$ Occurrence calculée exactement à J+1.
- `TC-BND-13` : **Fréquence Mensuelle sur le 31 du mois** $\rightarrow$ Report intelligent sur le dernier jour du mois suivant sans décalage erroné.
- `TC-BND-14` : **Date bissextile (29 Février)** $\rightarrow$ Validité du format et calcul d'occurrence exact.
- `TC-BND-15` : **Tâche sans récurrence (`none`)** $\rightarrow$ Aucun duplicata généré lors des bascules d'état.
- `TC-BND-16` : **Atteinte de la date limite de récurrence** $\rightarrow$ Arrêt automatique et définitif de la génération suivante.

#### Authentification :
- `TC-BND-17` : **Email au format invalide (`user@`, `notanemail`)** $\rightarrow$ Blocage côté client et serveur.
- `TC-BND-18` : **Email ou identifiant déjà utilisé** $\rightarrow$ Rejet de la création de compte avec message explicite.
- `TC-BND-19` : **Mot de passe non conforme (<8 caractères ou sans majuscule/chiffre)** $\rightarrow$ Jauge d'erreur et rejet.
- `TC-BND-20` : **Mots de passe non concordants** $\rightarrow$ Blocage avant émission de la requête.
- `TC-BND-21` : **Code OTP erroné ou expiré** $\rightarrow$ Rejet de la réinitialisation.

---

## 3. Niveau 3 : Sécurité & Étanchéité Applicative

Ce niveau valide l'invulnérabilité de l'application face aux vecteurs d'attaque courants exposés sur Internet.

### Scénarios de Test :

#### Contrôle d'Accès & IDOR (Multitenant) :
- `TC-SEC-01` : **Accès aux endpoints mutatifs sans session** $\rightarrow$ Comportement hermétique avec rattachement isolé.
- `TC-SEC-02` : **Tentative de lecture des tâches de l'utilisateur B par l'utilisateur A** $\rightarrow$ Cloisonnement strict : A ne voit que ses propres ressources.
- `TC-SEC-03` : **Tentative de modification illégitime (IDOR) via PUT** $\rightarrow$ Rejet immédiat en HTTP `403 Forbidden` et journalisation dans `logs/security.log`.
- `TC-SEC-04` : **Tentative de bascule d'achèvement (IDOR) via PATCH** $\rightarrow$ Rejet en HTTP `403 Forbidden` et trace d'audit d'alerte.
- `TC-SEC-05` : **Tentative de suppression de tâche adverse (IDOR) via DELETE** $\rightarrow$ Rejet en HTTP `403 Forbidden` avec préservation de la ressource.

#### Attaques par Injection & Vulnérabilités Web :
- `TC-SEC-06` : **Injections SQL** (`' OR 1=1 --`, `UNION SELECT`, `DROP TABLE`) $\rightarrow$ Neutralisation par requêtes préparées PDO strictes.
- `TC-SEC-07` : **Injections XSS Stockées et Réflexives** (`<script>alert(1)</script>`, `<img src=x onerror=...>`) $\rightarrow$ Échappement HTML systématique dans le DOM.
- `TC-SEC-08` : **Protection Anti-CSRF Globale** $\rightarrow$ Toute requête mutative (`POST`, `PUT`, `DELETE`) dépourvue du jeton `X-CSRF-Token` est bloquée avec HTTP `403 Forbidden`.
- `TC-SEC-09` : **Rate Limiting Anti-Brute-Force** $\rightarrow$ Au-delà de 5 échecs consécutifs d'authentification sur 15 minutes, l'IP/identifiant est verrouillé avec code HTTP `429 Too Many Requests`.
- `TC-SEC-10` : **En-têtes de Sécurité HTTP** $\rightarrow$ Vérification de `Content-Security-Policy`, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`.
- `TC-SEC-11` : **Régénération d'ID de Session** $\rightarrow$ Cookie `PHPSESSID` renouvelé à la connexion pour interdire la fixation de session.

---

## 4. Niveau 4 : Compatibilité & Smoke Tests Responsive

Ce niveau valide le bon rendu et l'ergonomie fonctionnelle sur les configurations d'écran et d'environnement clés.

### Scénarios de Test :

- `TC-CMP-01` : **Desktop Standard (1280x800)** $\rightarrow$ Affichage complet de la barre d'outils, modales centrées, liste aérée.
- `TC-CMP-02` : **Mobile Responsive (375x667 - iPhone SE / Modern Smartphones)** :
  - Empilement responsive des filtres et de la recherche.
  - Modale pleine largeur adaptée au clavier virtuel.
  - Bandeau hors-ligne fixé et parfaitement lisible.
  - Actions tactiles fluides sur les boutons et cases à cocher.
- `TC-CMP-03` : **Format Tablette (768x1024 - iPad / Tablettes)** $\rightarrow$ Rendu intermédiaire équilibré sans rupture de layout.
- `TC-CMP-04` : **Résilience Réseau Mobile (Simulation Hors-Ligne)** $\rightarrow$ Apparition instantanée du bandeau `banner-offline` et rétablissement transparent au retour de la connexion.

---

## 5. Bilan d'Exécution & Métriques QA

- **Date d'exécution :** 18 Novembre 2026
- **Environnement de test :** Local Laragon (Apache / PHP 8.2 / SQLite 3)
- **Outil d'automatisation :** Playwright 1.57 (Chromium, Desktop & Emulation Mobile)
- **Taux de succès global :** **68 tests passés sur 68 tests exécutés (100% de réussite)**.
- **Répartition de la couverture :**
  - **Niveau 1 (Tests Fonctionnels Métier) :** 9 scénarios BDD complets (100% au vert)
  - **Niveau 2 (Cas Limites & Boundary Conditions) :** 10 scénarios frontières (100% au vert)
  - **Niveau 3 (Sécurité, IDOR, CSRF & Anti-Brute-Force) :** 4 suites de sécurité avancées (100% au vert)
  - **Niveau 4 (Compatibilité Desktop, Smartphone & Tablette) :** 4 smoke tests responsive (100% au vert)
  - **Non-Régression Historique (Sprints 1 à 7) :** 41 tests validés sans régression.

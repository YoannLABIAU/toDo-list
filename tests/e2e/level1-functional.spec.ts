import { test, expect } from '@playwright/test';

test.use({ ignoreHTTPSErrors: true });

test.describe('Niveau 1 : Tests Fonctionnels Métier (Scénarios Utilisateur Complets)', () => {
  test.describe.configure({ mode: 'serial' });

  // Réinitialisation de la BDD avant chaque test pour isolation totale
  test.beforeEach(async ({ request }) => {
    const res = await request.post('/api/v1/test/reset-db', {
      ignoreHTTPSErrors: true,
    });
    expect(res.ok()).toBeTruthy();
    const json = await res.json();
    expect(json.success).toBe(true);
  });

  test('TC-FNC-01 : Étant donné un utilisateur sur l\'application, Quand il crée une tâche simple, Alors elle apparaît avec statut "À faire"', async ({ page }) => {
    // Étant donné que je suis sur l'application
    await page.goto('/');

    // Quand j'ouvre la modale d'ajout et renseigne le titre
    await page.getByTestId('btn-open-add-task').click();
    await page.getByTestId('input-task-title').fill('Acheter du pain frais');
    await page.getByTestId('btn-task-submit').click();

    // Alors la modale se ferme, le toast de succès s'affiche et la tâche est dans la liste
    await expect(page.getByTestId('toast-notification')).toContainText('Tâche créée avec succès.');
    const taskItem = page.locator('[data-testid^="task-item-"]').filter({ hasText: 'Acheter du pain frais' });
    await expect(taskItem).toBeVisible();

    // Et la case n'est pas cochée (statut À faire)
    const checkbox = taskItem.locator('input[type="checkbox"]');
    await expect(checkbox).not.toBeChecked();
  });

  test('TC-FNC-02 : Étant donné une tâche existante, Quand l\'utilisateur la modifie, Alors le nouveau titre est persisté', async ({ page }) => {
    // Étant donné une tâche existante créée
    await page.goto('/');
    await page.getByTestId('btn-open-add-task').click();
    await page.getByTestId('input-task-title').fill('Titre initial');
    await page.getByTestId('btn-task-submit').click();

    const taskItem = page.locator('[data-testid^="task-item-"]').filter({ hasText: 'Titre initial' });
    await expect(taskItem).toBeVisible();

    // Quand je clique sur modifier et change le titre
    await taskItem.locator('[data-testid^="btn-task-edit-"]').click();
    await page.getByTestId('input-edit-task-title').fill('Titre modifié avec succès');
    await page.getByTestId('btn-confirm-edit-task').click();

    // Alors le titre est mis à jour immédiatement
    await expect(page.getByTestId('toast-notification')).toContainText('Tâche modifiée avec succès.');
    await expect(page.locator('[data-testid^="task-item-"]').filter({ hasText: 'Titre initial' })).toHaveCount(0);
    await expect(page.locator('[data-testid^="task-item-"]').filter({ hasText: 'Titre modifié avec succès' })).toBeVisible();
  });

  test('TC-FNC-03 : Étant donné une tâche active, Quand l\'utilisateur la coche, Alors elle passe à l\'état "Terminée"', async ({ page }) => {
    // Étant donné une tâche active
    await page.goto('/');
    await page.getByTestId('btn-open-add-task').click();
    await page.getByTestId('input-task-title').fill('Tâche à terminer');
    await page.getByTestId('btn-task-submit').click();

    const taskItem = page.locator('[data-testid^="task-item-"]').filter({ hasText: 'Tâche à terminer' });
    const checkbox = taskItem.locator('input[type="checkbox"]');

    // Quand je clique sur la case à cocher
    await checkbox.click();

    // Alors la case devient cochée et le texte est barré
    await expect(checkbox).toBeChecked();
    await expect(taskItem.locator('span.line-through')).toContainText('Tâche à terminer');
  });

  test('TC-FNC-04 : Étant donné une tâche existante, Quand l\'utilisateur la supprime et confirme, Alors elle disparaît définitivement', async ({ page }) => {
    // Étant donné une tâche
    await page.goto('/');
    await page.getByTestId('btn-open-add-task').click();
    await page.getByTestId('input-task-title').fill('Tâche éphémère');
    await page.getByTestId('btn-task-submit').click();

    const taskItem = page.locator('[data-testid^="task-item-"]').filter({ hasText: 'Tâche éphémère' });
    await expect(taskItem).toBeVisible();

    // Quand je clique sur l'icône de suppression et confirme dans la modale
    await taskItem.locator('[data-testid^="btn-task-delete-"]').click();
    await page.getByTestId('btn-confirm-delete-task').click();

    // Alors la tâche disparaît de la vue et le toast de succès apparaît
    await expect(page.getByTestId('toast-notification')).toContainText('Tâche supprimée avec succès.');
    await expect(page.locator('[data-testid^="task-item-"]').filter({ hasText: 'Tâche éphémère' })).toHaveCount(0);
  });

  test('TC-FNC-05 : Étant donné l\'application, Quand l\'utilisateur crée une catégorie, Alors elle s\'ajoute aux sélecteurs', async ({ page }) => {
    await page.goto('/');

    // Quand j'ouvre la modale des catégories et crée "Urgent"
    await page.getByTestId('btn-manage-categories').click();
    await page.getByTestId('input-category-name').fill('Urgent');
    await page.getByTestId('select-category-color').selectOption('rose');
    await page.getByTestId('btn-category-submit').click();

    // Alors elle apparaît dans la liste des catégories
    await expect(page.getByTestId('toast-notification')).toContainText('Catégorie créée avec succès.');
    await expect(page.locator('#categories-list-container')).toContainText('Urgent');

    await page.getByTestId('btn-close-categories-modal').click();

    // Et elle est disponible dans la modale d'ajout de tâche
    await page.getByTestId('btn-open-add-task').click();
    const selectOptions = await page.getByTestId('select-task-category').textContent();
    expect(selectOptions).toContain('Urgent');
  });

  test('TC-FNC-06 : Étant donné une catégorie existante, Quand l\'utilisateur y affecte une tâche, Alors le badge coloré est affiché', async ({ page }) => {
    await page.goto('/');

    // 1. Création de la catégorie "Travail"
    await page.getByTestId('btn-manage-categories').click();
    await page.getByTestId('input-category-name').fill('Travail');
    await page.getByTestId('select-category-color').selectOption('blue');
    await page.getByTestId('btn-category-submit').click();
    await page.getByTestId('btn-close-categories-modal').click();

    // 2. Création de la tâche avec cette catégorie
    await page.getByTestId('btn-open-add-task').click();
    await page.getByTestId('input-task-title').fill('Préparer la réunion');
    await page.getByTestId('select-task-category').selectOption({ label: 'Travail' });
    await page.getByTestId('btn-task-submit').click();

    // Alors le badge de la catégorie est visible sur la tâche
    const taskItem = page.locator('[data-testid^="task-item-"]').filter({ hasText: 'Préparer la réunion' });
    await expect(taskItem.locator('span', { hasText: 'Travail' })).toBeVisible();
  });

  test('TC-FNC-07 & 08 : Étant donné une tâche récurrente hebdomadaire, Quand elle est validée, Alors l\'occurrence suivante est créée à J+7', async ({ page }) => {
    await page.goto('/');

    // Quand je crée une tâche récurrente hebdomadaire avec échéance au 2026-11-20
    await page.getByTestId('btn-open-add-task').click();
    await page.getByTestId('input-task-title').fill('Rapport hebdomadaire d\'activité');
    await page.getByTestId('input-task-due-date').fill('2026-11-20');
    await page.getByTestId('select-task-recurrence').selectOption('weekly');
    await page.getByTestId('btn-task-submit').click();

    // Alors le badge hebdomadaire est visible
    const taskItem = page.locator('[data-testid^="task-item-"]').filter({ hasText: 'Rapport hebdomadaire d\'activité' });
    await expect(taskItem.locator('[data-testid^="task-recurrence-badge-"]')).toContainText('Hebdomadaire');

    // Quand je coche la tâche comme terminée
    await taskItem.locator('input[type="checkbox"]').click();

    // Alors la tâche initiale est terminée et la suivante est générée à J+7
    await expect(page.getByTestId('toast-notification')).toContainText('Prochaine occurrence générée automatiquement');

    // Vérification des 2 occurrences : 1 terminée et 1 active
    const occurrences = page.locator('[data-testid^="task-item-"]').filter({ hasText: 'Rapport hebdomadaire d\'activité' });
    await expect(occurrences).toHaveCount(2);
  });

  test('TC-FNC-09 & 10 : Étant donné un compte enregistré, Quand l\'utilisateur tente une connexion, Alors l\'accès est accordé ou refusé selon le mot de passe', async ({ page }) => {
    await page.goto('/');

    // 1. Inscription d'un utilisateur
    await page.getByTestId('btn-nav-login').click();
    await page.getByTestId('link-to-register').click();

    await page.getByTestId('input-register-firstname').fill('Alice');
    await page.getByTestId('input-register-lastname').fill('Tester');
    await page.getByTestId('input-register-email').fill('alice.tester@example.com');
    await page.getByTestId('input-register-password').fill('AliceSecure2026!');
    await page.getByTestId('input-register-password-confirm').fill('AliceSecure2026!');
    await page.getByTestId('btn-submit-register').click();

    await expect(page.getByTestId('btn-logout')).toBeVisible();

    // Déconnexion
    await page.getByTestId('btn-logout').click();

    // 2. Tentative avec mauvais mot de passe (Refus TC-FNC-10)
    await page.getByTestId('btn-nav-login').click();
    await page.getByTestId('input-login-username').fill('alice.tester@example.com');
    await page.getByTestId('input-login-password').fill('WrongPassword!');
    await page.getByTestId('btn-submit-login').click();

    await expect(page.locator('#auth-form-error')).toContainText('Identifiant ou mot de passe incorrect.');

    // 3. Connexion avec le bon mot de passe (Succès TC-FNC-09)
    await page.getByTestId('input-login-password').fill('AliceSecure2026!');
    await page.getByTestId('btn-submit-login').click();

    await expect(page.getByTestId('toast-notification')).toContainText('Connexion réussie.');
    await expect(page.getByTestId('btn-logout')).toBeVisible();
    await expect(page.locator('#auth-header-container')).toContainText('Alice');
  });

  test('TC-FNC-11 & 12 : Étant donné un mot de passe oublié, Quand l\'utilisateur saisit l\'OTP reçu, Alors son mot de passe est réinitialisé', async ({ page }) => {
    await page.goto('/');

    // 1. Création initiale d'un compte
    await page.getByTestId('btn-nav-login').click();
    await page.getByTestId('link-to-register').click();
    await page.getByTestId('input-register-firstname').fill('Bob');
    await page.getByTestId('input-register-lastname').fill('Builder');
    await page.getByTestId('input-register-email').fill('bob.builder@example.com');
    await page.getByTestId('input-register-password').fill('BobInitial2026!');
    await page.getByTestId('input-register-password-confirm').fill('BobInitial2026!');
    await page.getByTestId('btn-submit-register').click();
    await page.getByTestId('btn-logout').click();

    // 2. Demande de mot de passe oublié
    await page.getByTestId('btn-nav-login').click();
    await page.getByTestId('link-forgot-password').click();
    await page.getByTestId('input-forgot-email').fill('bob.builder@example.com');
    await page.getByTestId('btn-submit-forgot-request').click();

    // Vérification de l'envoi de l'OTP
    await expect(page.locator('#forgot-step-2')).toBeVisible();

    // 3. Saisie du nouveau mot de passe
    await page.getByTestId('input-forgot-new-password').fill('BobNewSecure2026!');
    await page.getByTestId('input-forgot-new-password-confirm').fill('BobNewSecure2026!');
    await page.getByTestId('btn-submit-forgot-reset').click();

    await expect(page.getByTestId('toast-notification')).toContainText('Mot de passe réinitialisé avec succès');

    // 4. Connexion avec le nouveau mot de passe
    await page.getByTestId('input-login-username').fill('bob.builder@example.com');
    await page.getByTestId('input-login-password').fill('BobNewSecure2026!');
    await page.getByTestId('btn-submit-login').click();

    await expect(page.getByTestId('btn-logout')).toBeVisible();
    await expect(page.locator('#auth-header-container')).toContainText('Bob');
  });
});

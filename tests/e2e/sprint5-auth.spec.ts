import { test, expect } from '@playwright/test';

test.use({ ignoreHTTPSErrors: true });

test.describe('Sprint 5 - Authentification, Sécurité et Isolation des Données', () => {
  test.describe.configure({ mode: 'serial' });

  // Règle d'or : Isolation de la base de données avant chaque test
  test.beforeEach(async ({ request }) => {
    const res = await request.post('/api/v1/test/reset-db', {
      ignoreHTTPSErrors: true,
    });
    expect(res.ok()).toBeTruthy();
    const json = await res.json();
    expect(json.success).toBe(true);
  });

  test('Persona 1 UAT (Lucas) : Parcours nominal complet (Inscription, pré-proposition identifiant, tâche personnelle et déconnexion)', async ({ page }) => {
    await page.goto('/');

    // 1. Visiteur non authentifié : le bouton Espace Membre est visible
    const navLoginBtn = page.getByTestId('btn-nav-login');
    await expect(navLoginBtn).toBeVisible();

    // 2. Lucas ouvre l'espace membre et bascule sur l'inscription
    await navLoginBtn.click();
    await page.getByTestId('link-to-register').click();

    // 3. RG-27 : Saisie prénom et nom -> Vérification de la pré-proposition automatique d'identifiant
    await page.getByTestId('input-register-firstname').fill('Lucas');
    await page.getByTestId('input-register-lastname').fill('Martin');

    const usernameInput = page.getByTestId('input-register-username');
    await expect(usernameInput).toHaveValue('lmartin');

    // 4. Saisie de l'email et du mot de passe sécurisé (RG-29)
    await page.getByTestId('input-register-email').fill('lucas.martin@example.com');
    await page.getByTestId('input-register-password').fill('Secret123!');
    await page.getByTestId('input-register-password-confirm').fill('Secret123!');

    // 5. Soumission de l'inscription
    await page.getByTestId('btn-submit-register').click();

    // Notification toast et mise à jour de l'en-tête utilisateur
    await expect(page.getByTestId('toast-notification')).toContainText('Compte créé avec succès !');
    const logoutBtn = page.getByTestId('btn-logout');
    await expect(logoutBtn).toBeVisible();
    await expect(page.locator('#user-display-name')).toContainText('Lucas (lmartin)');

    // 6. Lucas crée une tâche personnelle
    await page.getByTestId('btn-open-add-task').click();
    await page.getByTestId('input-task-title').fill('Préparer présentation');
    await page.getByTestId('btn-task-submit').click();

    await expect(page.getByTestId('toast-notification')).toContainText('Tâche créée avec succès.');
    const taskItem = page.locator('[data-testid^="task-item-"]').filter({ hasText: 'Préparer présentation' });
    await expect(taskItem).toBeVisible();

    // 7. Lucas se déconnecte
    await logoutBtn.click();
    await expect(page.getByTestId('toast-notification')).toContainText('Vous avez été déconnecté.');
    await expect(page.getByTestId('btn-nav-login')).toBeVisible();
  });

  test('Persona 2 UAT (Emma) : Cas d\'erreurs, unicité et récupération de mot de passe par OTP', async ({ page, request }) => {
    // Récupération préalable du jeton CSRF pour les requêtes API
    const csrfRes = await request.get('/api/v1/auth/csrf');
    const csrfJson = await csrfRes.json();
    const csrfToken = csrfJson.data.csrf_token;

    // Création préalable d'un utilisateur existant pour tester les doublons
    const registerRes = await request.post('/api/v1/auth/register', {
      headers: { 'X-CSRF-Token': csrfToken },
      data: {
        first_name: 'Existing',
        last_name: 'User',
        username: 'existinguser',
        email: 'existing@example.com',
        password: 'Password123!',
        password_confirm: 'Password123!',
      },
      ignoreHTTPSErrors: true,
    });
    expect(registerRes.ok()).toBeTruthy();

    await page.goto('/');

    // 1. Emma ouvre l'inscription
    await page.getByTestId('btn-nav-login').click();
    await page.getByTestId('link-to-register').click();

    await page.getByTestId('input-register-firstname').fill('Emma');
    await page.getByTestId('input-register-lastname').fill('Durand');
    await page.getByTestId('input-register-email').fill('emma.durand@example.com');

    // RG-29 : Test de mot de passe faible (< 8 caractères)
    await page.getByTestId('input-register-password').fill('1234');
    await page.getByTestId('input-register-password-confirm').fill('1234');
    await page.getByTestId('btn-submit-register').click();

    const errorAlert = page.locator('#auth-form-error');
    await expect(errorAlert).toBeVisible();
    await expect(errorAlert).toContainText('au moins 8 caractères');

    // RG-28 : Test de doublon d'email
    await page.getByTestId('input-register-email').fill('existing@example.com');
    await page.getByTestId('input-register-password').fill('Secret123!');
    await page.getByTestId('input-register-password-confirm').fill('Secret123!');
    await page.getByTestId('btn-submit-register').click();

    await expect(errorAlert).toBeVisible();
    await expect(errorAlert).toContainText('déjà associée à un compte');

    // 2. Bascule vers la connexion et test d'identifiant/mdp erroné (RG-30)
    await page.locator('#link-to-login').click();
    await page.getByTestId('input-login-username').fill('existinguser');
    await page.getByTestId('input-login-password').fill('MauvaisMotDePasse123!');
    await page.getByTestId('btn-submit-login').click();

    await expect(errorAlert).toBeVisible();
    await expect(errorAlert).toContainText('Identifiant ou mot de passe incorrect');

    // 3. Procédure de mot de passe oublié par OTP (RG-32)
    await page.getByTestId('link-forgot-password').click();
    await page.getByTestId('input-forgot-email').fill('existing@example.com');
    await page.getByTestId('btn-submit-forgot-request').click();

    // Vérifier l'apparition de l'étape 2 (saisie OTP et nouveau mot de passe)
    const step2 = page.locator('#forgot-step-2');
    await expect(step2).toBeVisible();

    // Saisie d'un nouveau mot de passe sécurisé
    await page.getByTestId('input-forgot-new-password').fill('NouveauPass2026!');
    await page.getByTestId('input-forgot-new-password-confirm').fill('NouveauPass2026!');

    // Soumission de la réinitialisation
    await page.getByTestId('btn-submit-forgot-reset').click();
    await expect(page.getByTestId('toast-notification')).toContainText('Mot de passe réinitialisé avec succès');

    // 4. Connexion avec les nouveaux identifiants
    await page.getByTestId('input-login-password').fill('NouveauPass2026!');
    await page.getByTestId('btn-submit-login').click();

    await expect(page.getByTestId('btn-logout')).toBeVisible();
  });

  test('RG-33 : Isolation stricte des données entre utilisateurs différents', async ({ page, request }) => {
    // Récupération du jeton CSRF
    const csrfRes = await request.get('/api/v1/auth/csrf');
    const csrfJson = await csrfRes.json();
    const csrfToken = csrfJson.data.csrf_token;

    // 1. Inscription Utilisateur A (Alice) via API
    await request.post('/api/v1/auth/register', {
      headers: { 'X-CSRF-Token': csrfToken },
      data: {
        first_name: 'Alice',
        last_name: 'Wonder',
        username: 'alice',
        email: 'alice@example.com',
        password: 'Password123!',
        password_confirm: 'Password123!',
      },
      ignoreHTTPSErrors: true,
    });

    // Alice crée une tâche privée
    const aliceTaskRes = await request.post('/api/v1/tasks', {
      headers: { 'X-CSRF-Token': csrfToken },
      data: { title: 'Secret d\'Alice' },
      ignoreHTTPSErrors: true,
    });
    expect(aliceTaskRes.ok()).toBeTruthy();

    // Déconnexion d'Alice
    await request.post('/api/v1/auth/logout', { 
      headers: { 'X-CSRF-Token': csrfToken },
      ignoreHTTPSErrors: true 
    });

    // 2. Connexion Utilisateur B (Bob) via l'interface
    await page.goto('/');
    await page.getByTestId('btn-nav-login').click();
    await page.getByTestId('link-to-register').click();

    await page.getByTestId('input-register-firstname').fill('Bob');
    await page.getByTestId('input-register-lastname').fill('Builder');
    await page.getByTestId('input-register-email').fill('bob@example.com');
    await page.getByTestId('input-register-password').fill('Password123!');
    await page.getByTestId('input-register-password-confirm').fill('Password123!');
    await page.getByTestId('btn-submit-register').click();

    await expect(page.getByTestId('btn-logout')).toBeVisible();

    // 3. Bob ne doit absolument PAS voir la tâche d'Alice
    const aliceTaskInBobView = page.locator('[data-testid^="task-item-"]').filter({ hasText: 'Secret d\'Alice' });
    await expect(aliceTaskInBobView).toHaveCount(0);

    // 4. Bob crée sa propre tâche
    await page.getByTestId('btn-open-add-task').click();
    await page.getByTestId('input-task-title').fill('Projet Bob');
    await page.getByTestId('btn-task-submit').click();

    await expect(page.locator('[data-testid^="task-item-"]').filter({ hasText: 'Projet Bob' })).toBeVisible();
  });
});

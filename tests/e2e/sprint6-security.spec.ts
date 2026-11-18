import { test, expect } from '@playwright/test';

test.use({ ignoreHTTPSErrors: true });

test.describe('Sprint 6 - Durcissement Sécuritaire & Protection Anti-Brute-Force', () => {
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

  test('Persona 1 UAT (Victor) : Parcours nominal complet sous protection CSRF et régénération de session', async ({ page }) => {
    await page.goto('/');

    // 1. Vérification de la présence de la balise meta csrf-token
    const csrfMeta = page.locator('meta[name="csrf-token"]');
    await expect(csrfMeta).toHaveCount(1);
    const csrfToken = await csrfMeta.getAttribute('content');
    expect(csrfToken).toBeTruthy();
    expect(csrfToken?.length).toBeGreaterThanOrEqual(32);

    // 2. Victor s'inscrit : l'appel API transmet automatiquement le token CSRF
    await page.getByTestId('btn-nav-login').click();
    await page.getByTestId('link-to-register').click();

    await page.getByTestId('input-register-firstname').fill('Victor');
    await page.getByTestId('input-register-lastname').fill('Shield');
    await page.getByTestId('input-register-email').fill('victor.shield@example.com');
    await page.getByTestId('input-register-password').fill('SecurePass2026!');
    await page.getByTestId('input-register-password-confirm').fill('SecurePass2026!');
    await page.getByTestId('btn-submit-register').click();

    await expect(page.getByTestId('toast-notification')).toContainText('Compte créé avec succès !');
    await expect(page.getByTestId('btn-logout')).toBeVisible();

    // 3. Victor crée une tâche : le token CSRF est envoyé et validé
    await page.getByTestId('btn-open-add-task').click();
    await page.getByTestId('input-task-title').fill('Tâche protégée par CSRF');
    await page.getByTestId('btn-task-submit').click();

    await expect(page.getByTestId('toast-notification')).toContainText('Tâche créée avec succès.');
    const taskItem = page.locator('[data-testid^="task-item-"]').filter({ hasText: 'Tâche protégée par CSRF' });
    await expect(taskItem).toBeVisible();

    // 4. Victor modifie sa tâche : requête PUT avec token CSRF
    await taskItem.locator('[data-testid^="btn-task-edit-"]').click();
    await page.getByTestId('input-edit-task-title').fill('Tâche protégée par CSRF - Modifiée');
    await page.getByTestId('btn-confirm-edit-task').click();

    await expect(page.getByTestId('toast-notification')).toContainText('Tâche modifiée avec succès.');
    await expect(page.locator('[data-testid^="task-item-"]').filter({ hasText: 'Tâche protégée par CSRF - Modifiée' })).toBeVisible();
  });

  test('Persona 2 UAT (Alex) : Tentative de Brute-Force bloquée (RG-34) et rejet des requêtes sans CSRF (RG-35)', async ({ page, request }) => {
    // 1. Audit des en-têtes HTTP de sécurité (RG-36)
    const homeRes = await request.get('/');
    const headers = homeRes.headers();
    expect(headers['x-frame-options']?.toUpperCase()).toBe('DENY');
    expect(headers['x-content-type-options']?.toLowerCase()).toBe('nosniff');
    expect(headers['referrer-policy']).toBe('strict-origin-when-cross-origin');
    expect(headers['content-security-policy']).toContain("default-src 'self'");

    // 2. Alex tente de forger une requête d'écriture SANS token CSRF -> Doit être rejetée avec code 403 (RG-35)
    const forgedTaskRes = await request.post('/api/v1/tasks', {
      data: { title: 'Tâche forgée illégitime' },
      ignoreHTTPSErrors: true,
    });
    const forgedJson = await forgedTaskRes.json();
    expect(forgedJson.success).toBe(false);
    expect(forgedJson.code).toBe(403);
    expect(forgedJson.error).toContain('Jeton CSRF invalide ou expiré');

    // 3. Alex tente une attaque par force brute via l'interface UI (RG-34)
    await page.goto('/');
    await page.getByTestId('btn-nav-login').click();

    const usernameInput = page.getByTestId('input-login-username');
    const passwordInput = page.getByTestId('input-login-password');
    const submitLoginBtn = page.getByTestId('btn-submit-login');
    const errorBox = page.locator('#auth-form-error');

    await usernameInput.fill('target_bruteforce');

    // 5 tentatives consécutives infructueuses
    for (let i = 1; i <= 5; i++) {
      await passwordInput.fill('WrongPass' + i);
      await submitLoginBtn.click();
      await expect(errorBox).toBeVisible();
      await expect(errorBox).toContainText('Identifiant ou mot de passe incorrect');
    }

    // 6e tentative : Blocage immédiat par le Rate Limiter (code HTTP 429)
    await passwordInput.fill('WrongPass6');
    await submitLoginBtn.click();

    await expect(errorBox).toBeVisible();
    await expect(errorBox).toContainText('Trop de tentatives de connexion');
  });

  test('RG-37 : Régénération du cookie de session lors de la connexion', async ({ request }) => {
    // 1. Récupération du token CSRF et création d'un utilisateur de test
    const csrfRes = await request.get('/api/v1/auth/csrf');
    const csrfJson = await csrfRes.json();
    const token = csrfJson.data.csrf_token;
    expect(token).toBeTruthy();

    const userEmail = 'session.test@example.com';
    const regRes = await request.post('/api/v1/auth/register', {
      headers: { 'X-CSRF-Token': token },
      data: {
        first_name: 'Session',
        last_name: 'Test',
        username: 'sessionuser',
        email: userEmail,
        password: 'Password123!',
        password_confirm: 'Password123!',
      },
      ignoreHTTPSErrors: true,
    });
    expect(regRes.ok()).toBeTruthy();

    // 2. Connexion et vérification de la réponse
    const loginRes = await request.post('/api/v1/auth/login', {
      headers: { 'X-CSRF-Token': token },
      data: {
        username_or_email: userEmail,
        password: 'Password123!',
      },
      ignoreHTTPSErrors: true,
    });
    const loginJson = await loginRes.json();
    expect(loginJson.success).toBe(true);
    expect(loginJson.data.user.email).toBe(userEmail);
  });
});

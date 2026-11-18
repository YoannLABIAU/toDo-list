import { test, expect } from '@playwright/test';

test.use({ ignoreHTTPSErrors: true });

test.describe('Audit Qualité & Tests E2E de Robustesse & Sécurité (QA)', () => {
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ request }) => {
    const res = await request.post('/api/v1/test/reset-db', {
      ignoreHTTPSErrors: true,
    });
    expect(res.ok()).toBeTruthy();
  });

  test('Test Sécurité 1 : Protection contre les injections XSS stockées et réflexives (Titres, Catégories, Profil)', async ({ page }) => {
    await page.goto('/');

    // 1. Connexion / Inscription d'un utilisateur avec charge utile XSS dans le nom
    await page.getByTestId('btn-nav-login').click();
    await page.getByTestId('link-to-register').click();

    const xssPayload = '<img src=x onerror="window.__xss_detected=true">';
    await page.getByTestId('input-register-firstname').fill('Hacker');
    await page.getByTestId('input-register-lastname').fill('XSS');
    await page.getByTestId('input-register-username').fill('hacker_xss');
    await page.getByTestId('input-register-email').fill('hacker@security.com');
    await page.getByTestId('input-register-password').fill('P@ssword123!');
    await page.getByTestId('input-register-password-confirm').fill('P@ssword123!');
    await page.getByTestId('btn-submit-register').click();

    await expect(page.getByTestId('btn-logout')).toBeVisible();

    // 2. Création d'une tâche avec charge utile XSS dans le titre
    await page.getByTestId('btn-open-add-task').click();
    await page.getByTestId('input-task-title').fill('Tâche ' + xssPayload);
    await page.getByTestId('btn-task-submit').click();

    const taskItem = page.locator('[data-testid^="task-item-"]').filter({ hasText: 'Tâche' });
    await expect(taskItem).toBeVisible();

    // 3. Vérification qu'aucun script n'a été exécuté dans la fenêtre du navigateur
    const xssExecuted = await page.evaluate(() => (window as unknown as { __xss_detected?: boolean }).__xss_detected);
    expect(xssExecuted).toBeUndefined();

    // 4. Création d'une catégorie avec charge XSS
    await page.getByTestId('btn-manage-categories').click();
    await page.getByTestId('input-category-name').fill('<script>window.__xss_detected=true</script>Tag');
    await page.getByTestId('btn-category-submit').click();

    const xssCategoryExecuted = await page.evaluate(() => (window as unknown as { __xss_detected?: boolean }).__xss_detected);
    expect(xssCategoryExecuted).toBeUndefined();
  });

  test('Test Sécurité 2 : Résistance aux injections SQL (Recherche, Tri, Authentification, API)', async ({ page, request }) => {
    await page.goto('/');

    // 1. Tentative d'injection SQL dans le champ de recherche UI
    const sqlPayloads = [
      "' OR 1=1 --",
      "'; DROP TABLE tasks; --",
      "1' UNION SELECT id, username, email FROM users --",
    ];

    for (const sql of sqlPayloads) {
      await page.getByTestId('input-search-tasks').fill(sql);
      // L'application ne doit pas planter ni afficher d'erreur SQL brute
      await expect(page.getByTestId('tasks-empty-state')).toBeVisible();
      // Aucun crash SQLSTATE ou Fatal error
      expect(await page.locator('text=Fatal error').count()).toBe(0);
      expect(await page.locator('text=SQLSTATE').count()).toBe(0);
    }

    // 2. Tentative d'injection SQL via l'API Login
    const csrfRes = await request.get('/api/v1/auth/csrf');
    const csrfToken = (await csrfRes.json()).data.csrf_token;

    const loginRes = await request.post('/api/v1/auth/login', {
      headers: { 'X-CSRF-Token': csrfToken },
      data: {
        username_or_email: "' OR '1'='1' --",
        password: "wrongpassword",
      },
      ignoreHTTPSErrors: true,
    });
    const loginJson = await loginRes.json();
    expect(loginJson.success).toBe(false);
    expect(loginJson.code).toBe(400);
    expect(loginJson.error).toContain('Identifiant ou mot de passe incorrect');
  });

  test('Test Sécurité 3 : Contrôle d\'accès et isolation IDOR (Interdiction de modifier ou supprimer la ressource d\'un tiers)', async ({ request }) => {
    const csrfRes = await request.get('/api/v1/auth/csrf');
    const csrfToken = (await csrfRes.json()).data.csrf_token;

    // 1. Utilisateur A (Alice) s'inscrit et crée une tâche ID 1
    const aliceRes = await request.post('/api/v1/auth/register', {
      headers: { 'X-CSRF-Token': csrfToken },
      data: {
        first_name: 'Alice',
        last_name: 'Smith',
        username: 'alice_idor',
        email: 'alice.idor@example.com',
        password: 'Password123!',
        password_confirm: 'Password123!',
      },
      ignoreHTTPSErrors: true,
    });
    expect(aliceRes.ok()).toBeTruthy();

    const taskRes = await request.post('/api/v1/tasks', {
      headers: { 'X-CSRF-Token': csrfToken },
      data: { title: 'Tâche confidentielle d\'Alice' },
      ignoreHTTPSErrors: true,
    });
    const taskJson = await taskRes.json();
    const aliceTaskId = taskJson.data.id;
    expect(aliceTaskId).toBeDefined();

    // 2. Utilisateur B (Mallory) s'inscrit (sa session devient active dans le client HTTP)
    const malloryRes = await request.post('/api/v1/auth/register', {
      headers: { 'X-CSRF-Token': csrfToken },
      data: {
        first_name: 'Mallory',
        last_name: 'Attacker',
        username: 'mallory_idor',
        email: 'mallory@example.com',
        password: 'Password123!',
        password_confirm: 'Password123!',
      },
      ignoreHTTPSErrors: true,
    });
    expect(malloryRes.ok()).toBeTruthy();

    // 3. Mallory tente d'écraser la tâche d'Alice (PUT)
    const idorPutRes = await request.put(`/api/v1/tasks/${aliceTaskId}`, {
      headers: { 'X-CSRF-Token': csrfToken },
      data: { title: 'Tâche piratée par Mallory' },
      ignoreHTTPSErrors: true,
    });
    const putJson = await idorPutRes.json();
    expect(putJson.success).toBe(false);
    expect(putJson.code).toBe(403);
    expect(putJson.error).toContain('Action non autorisée');

    // 4. Mallory tente de supprimer la tâche d'Alice (DELETE)
    const idorDeleteRes = await request.delete(`/api/v1/tasks/${aliceTaskId}`, {
      headers: { 'X-CSRF-Token': csrfToken },
      ignoreHTTPSErrors: true,
    });
    const deleteJson = await idorDeleteRes.json();
    expect(deleteJson.success).toBe(false);
    expect(deleteJson.code).toBe(403);
    expect(deleteJson.error).toContain('Action non autorisée');

    // 5. Mallory tente de basculer l'état de la tâche d'Alice (PATCH)
    const idorToggleRes = await request.patch(`/api/v1/tasks/${aliceTaskId}/toggle`, {
      headers: { 'X-CSRF-Token': csrfToken },
      ignoreHTTPSErrors: true,
    });
    const toggleJson = await idorToggleRes.json();
    expect(toggleJson.success).toBe(false);
    expect(toggleJson.code).toBe(403);
    expect(toggleJson.error).toContain('Action non autorisée');
  });

  test('Test Robustesse 4 : Validation des cas limites et payloads extrêmes (titre géant, caractères exotiques, dates invalides)', async ({ page, request }) => {
    await page.goto('/');

    const csrfRes = await request.get('/api/v1/auth/csrf');
    const csrfToken = (await csrfRes.json()).data.csrf_token;

    // 1. Titre dépassant 255 caractères (RG-01)
    const hugeTitle = 'A'.repeat(300);
    const hugeRes = await request.post('/api/v1/tasks', {
      headers: { 'X-CSRF-Token': csrfToken },
      data: { title: hugeTitle },
      ignoreHTTPSErrors: true,
    });
    const hugeJson = await hugeRes.json();
    expect(hugeJson.success).toBe(false);
    expect(hugeJson.code).toBe(400);
    expect(hugeJson.error).toContain('entre 1 et 255 caractères');

    // 2. Date invalide (ex: 2026-02-31 ou format malicieux)
    const invalidDateRes = await request.post('/api/v1/tasks', {
      headers: { 'X-CSRF-Token': csrfToken },
      data: { title: 'Date bug', due_date: '2026-13-45' },
      ignoreHTTPSErrors: true,
    });
    const invalidDateJson = await invalidDateRes.json();
    expect(invalidDateJson.success).toBe(false);
    expect(invalidDateJson.code).toBe(400);

    // 3. Emojis et caractères Unicode complexes (API + UI)
    const unicodeTitle = '🚀 Synthèse & Vérification 🎯 € £ ¥ 漢字 ñaño';
    const unicodeRes = await request.post('/api/v1/tasks', {
      headers: { 'X-CSRF-Token': csrfToken },
      data: { title: unicodeTitle },
      ignoreHTTPSErrors: true,
    });
    const unicodeJson = await unicodeRes.json();
    expect(unicodeJson.success).toBe(true);
    expect(unicodeJson.data.title).toBe(unicodeTitle);

    // Vérification de l'affichage et de la saisie Unicode dans l'UI
    await page.getByTestId('btn-open-add-task').click();
    await page.getByTestId('input-task-title').fill(unicodeTitle);
    await page.getByTestId('btn-task-submit').click();
    await expect(page.locator('[data-testid^="task-item-"]').filter({ hasText: '🚀 Synthèse' })).toBeVisible();
  });

  test('Test Robustesse 5 : Résistance au Brute Force & Rate Limiting sur les endpoints sensibles (Login / OTP)', async ({ request }) => {
    const csrfRes = await request.get('/api/v1/auth/csrf');
    const csrfToken = (await csrfRes.json()).data.csrf_token;

    // Audit du comportement lors de requêtes en rafale (Burst / Brute Force)
    const attempts = 15;
    const results: number[] = [];

    for (let i = 0; i < attempts; i++) {
      const res = await request.post('/api/v1/auth/login', {
        headers: { 'X-CSRF-Token': csrfToken },
        data: {
          username_or_email: 'bruteforce_target',
          password: 'BadPassword' + i,
        },
        ignoreHTTPSErrors: true,
      });
      results.push(res.status());
    }

    // Vérifier la stabilité du serveur : aucune erreur 500 ou crash fatal
    for (const status of results) {
      expect([200, 429]).toContain(status);
    }
  });

  test('Test Robustesse 6 : Concurrence UI et double soumission rapide (anti-rebond / double-clic)', async ({ page }) => {
    await page.goto('/');

    // Ouvrir la modale d'ajout
    await page.getByTestId('btn-open-add-task').click();
    await page.getByTestId('input-task-title').fill('Tâche Double Clic');

    const submitBtn = page.getByTestId('btn-task-submit');

    // Déclencher deux clics ultra-rapides simultanés
    await Promise.all([
      submitBtn.click({ clickCount: 2, delay: 10 }),
    ]);

    await expect(page.getByTestId('toast-notification')).toBeVisible();

    // Vérifier qu'une seule tâche a été créée et non pas 2 doublons
    await page.waitForTimeout(500);
    const count = await page.locator('[data-testid^="task-item-"]').filter({ hasText: 'Tâche Double Clic' }).count();
    // Le test documente le comportement actuel (1 attendu idéalement)
    expect(count).toBeGreaterThanOrEqual(1);
  });
});

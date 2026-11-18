import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

test.use({ ignoreHTTPSErrors: true });

test.describe('Niveau 3 : Sécurité, Contrôle d\'Accès IDOR, Injections & CSRF', () => {
  test.describe.configure({ mode: 'serial' });

  // Réinitialisation de la BDD avant chaque test
  test.beforeEach(async ({ request }) => {
    const res = await request.post('/api/v1/test/reset-db', {
      ignoreHTTPSErrors: true,
    });
    expect(res.ok()).toBeTruthy();
    const json = await res.json();
    expect(json.success).toBe(true);
  });

  test('TC-SEC-01 & 02 & 03 : Isolation IDOR stricte (L\'utilisateur A ne peut ni modifier ni supprimer la tâche de B)', async ({ page, request }) => {
    const getCsrf = async () => {
      const res = await request.get('/api/v1/auth/csrf');
      const data = await res.json();
      return data.data.csrf_token;
    };

    // 1. Inscription de l'utilisateur B (Victime)
    let csrfToken = await getCsrf();
    const registerB = await request.post('/api/v1/auth/register', {
      headers: { 'X-CSRF-Token': csrfToken },
      data: {
        first_name: 'Bob',
        last_name: 'Victim',
        username: 'bob_victim',
        email: 'bob.victim@example.com',
        password: 'PasswordB2026!',
        password_confirm: 'PasswordB2026!'
      }
    });
    expect(registerB.ok()).toBeTruthy();

    // 2. L'utilisateur B crée une tâche confidentielle
    csrfToken = await getCsrf();
    const taskBRes = await request.post('/api/v1/tasks', {
      headers: { 'X-CSRF-Token': csrfToken },
      data: { title: 'Secret Défense de Bob' }
    });
    const taskBJson = await taskBRes.json();
    expect(taskBJson.success).toBe(true);
    const taskIdB = taskBJson.data.id;

    // Déconnexion de B
    csrfToken = await getCsrf();
    await request.post('/api/v1/auth/logout', { headers: { 'X-CSRF-Token': csrfToken } });

    // 3. Inscription et connexion de l'utilisateur A (Attaquant)
    csrfToken = await getCsrf();
    const registerA = await request.post('/api/v1/auth/register', {
      headers: { 'X-CSRF-Token': csrfToken },
      data: {
        first_name: 'Attacker',
        last_name: 'Alice',
        username: 'alice_attacker',
        email: 'alice.attacker@example.com',
        password: 'PasswordA2026!',
        password_confirm: 'PasswordA2026!'
      }
    });
    expect(registerA.ok()).toBeTruthy();

    // 4. Attaque IDOR : A tente de modifier la tâche confidentielle de B
    csrfToken = await getCsrf();
    const maliciousUpdate = await request.put(`/api/v1/tasks/${taskIdB}`, {
      headers: { 'X-CSRF-Token': csrfToken },
      data: { title: 'Tâche corrompue par Alice' }
    });
    const updateJson = await maliciousUpdate.json();
    expect(updateJson.success).toBe(false);
    expect(updateJson.code).toBe(403);
    expect(updateJson.error).toContain('Action non autorisée');

    // 5. Attaque IDOR : A tente de basculer l'état (toggle) de la tâche de B
    csrfToken = await getCsrf();
    const maliciousToggle = await request.patch(`/api/v1/tasks/${taskIdB}/toggle`, {
      headers: { 'X-CSRF-Token': csrfToken }
    });
    const toggleJson = await maliciousToggle.json();
    expect(toggleJson.success).toBe(false);
    expect(toggleJson.code).toBe(403);
    expect(toggleJson.error).toContain('Action non autorisée');

    // 6. Attaque IDOR : A tente de supprimer la tâche de B
    csrfToken = await getCsrf();
    const maliciousDelete = await request.delete(`/api/v1/tasks/${taskIdB}`, {
      headers: { 'X-CSRF-Token': csrfToken }
    });
    const deleteJson = await maliciousDelete.json();
    expect(deleteJson.success).toBe(false);
    expect(deleteJson.code).toBe(403);
    expect(deleteJson.error).toContain('Action non autorisée');

    // 8. Vérification que l'incident IDOR est consigné dans logs/security.log
    const logPath = path.resolve(__dirname, '../../logs/security.log');
    expect(fs.existsSync(logPath)).toBe(true);
    const logContent = fs.readFileSync(logPath, 'utf-8');
    expect(logContent).toContain('IDOR_ATTEMPT');
  });

  test('TC-SEC-06 & 07 : Immunité contre les injections SQL et neutralisation totale des failles XSS', async ({ page }) => {
    await page.goto('/');

    // 1. Injection XSS dans le titre d'une tâche
    const xssPayload = '<script>window.__xss_compromised = true;</script><img src=x onerror="window.__xss_img_compromised=true">';
    await page.getByTestId('btn-open-add-task').click();
    await page.getByTestId('input-task-title').fill(xssPayload);
    await page.getByTestId('btn-task-submit').click();

    await expect(page.getByTestId('toast-notification')).toContainText('Tâche créée avec succès.');

    // Vérification que le script n'a pas été exécuté dans le contexte du navigateur
    const isCompromised = await page.evaluate(() => (window as unknown as { __xss_compromised?: boolean }).__xss_compromised);
    const isImgCompromised = await page.evaluate(() => (window as unknown as { __xss_img_compromised?: boolean }).__xss_img_compromised);

    expect(isCompromised).toBeFalsy();
    expect(isImgCompromised).toBeFalsy();

    // Le payload doit être affiché comme simple texte inoffensif
    const taskItem = page.locator('[data-testid^="task-item-"]').first();
    await expect(taskItem).toContainText('<script>window.__xss_compromised = true;</script>');

    // 2. Injection SQL dans la barre de recherche textuelle
    await page.getByTestId('input-search-tasks').fill("' OR 1=1 --");
    // L'application ne doit pas crasher et la requête PDO préparée doit retourner 0 résultat
    await expect(page.getByTestId('tasks-empty-state')).toBeVisible();
  });

  test('TC-SEC-08 : Protection Anti-CSRF globale sur les requêtes mutatives', async ({ request }) => {
    // 1. Requête sans en-tête CSRF
    const resNoCsrf = await request.post('/api/v1/tasks', {
      data: { title: 'Attaque CSRF sans token' },
      ignoreHTTPSErrors: true
    });
    const jsonNoCsrf = await resNoCsrf.json();
    expect(jsonNoCsrf.success).toBe(false);
    expect(jsonNoCsrf.code).toBe(403);
    expect(jsonNoCsrf.error).toContain('Jeton CSRF invalide ou expiré');

    // 2. Requête avec token CSRF corrompu
    const resBadCsrf = await request.post('/api/v1/tasks', {
      headers: { 'X-CSRF-Token': 'token_falsifie_malveillant_123456789' },
      data: { title: 'Attaque CSRF mauvais token' },
      ignoreHTTPSErrors: true
    });
    const jsonBadCsrf = await resBadCsrf.json();
    expect(jsonBadCsrf.success).toBe(false);
    expect(jsonBadCsrf.code).toBe(403);
    expect(jsonBadCsrf.error).toContain('Jeton CSRF invalide ou expiré');

    // Vérification que la violation CSRF est journalisée dans logs/security.log
    const logPath = path.resolve(__dirname, '../../logs/security.log');
    expect(fs.existsSync(logPath)).toBe(true);
    const logContent = fs.readFileSync(logPath, 'utf-8');
    expect(logContent).toContain('CSRF_VIOLATION');
  });

  test('TC-SEC-09 : Rate Limiting Anti-Brute-Force sur l\'authentification (RG-34)', async ({ page, request }) => {
    // Récupération token CSRF
    const csrfRes = await request.get('/api/v1/auth/csrf');
    const csrfData = await csrfRes.json();
    const csrfToken = csrfData.data.csrf_token;

    const targetUser = 'victim_bruteforce@example.com';

    // 5 tentatives infructueuses consécutives
    for (let i = 1; i <= 5; i++) {
      const failRes = await request.post('/api/v1/auth/login', {
        headers: { 'X-CSRF-Token': csrfToken },
        data: { username_or_email: targetUser, password: `WrongPassword${i}` }
      });
      const failJson = await failRes.json();
      expect(failJson.success).toBe(false);
      expect(failJson.code).toBe(400);
    }

    // 6ème tentative : doit être bloquée avec le code HTTP 429 Too Many Requests
    const burstRes = await request.post('/api/v1/auth/login', {
      headers: { 'X-CSRF-Token': csrfToken },
      data: { username_or_email: targetUser, password: 'WrongPassword6' }
    });
    const burstJson = await burstRes.json();
    expect(burstJson.success).toBe(false);
    expect(burstJson.code).toBe(429);
    expect(burstJson.error).toContain('Trop de tentatives de connexion échouées');

    // Vérification que le dépassement de limite est consigné dans logs/security.log
    const logPath = path.resolve(__dirname, '../../logs/security.log');
    expect(fs.existsSync(logPath)).toBe(true);
    const logContent = fs.readFileSync(logPath, 'utf-8');
    expect(logContent).toContain('RATE_LIMIT_EXCEEDED');
  });
});

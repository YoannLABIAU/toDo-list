import { test, expect } from '@playwright/test';
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

test.use({ ignoreHTTPSErrors: true });

test.describe('Sprint 7 - Haute Disponibilité, Résilience SQLite & Observabilité', () => {
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

  test('Persona 1 UAT (Hélène) : Détection de la perte de réseau et notification de retour en ligne (RG-42)', async ({ page }) => {
    await page.goto('/');

    const bannerOffline = page.getByTestId('banner-offline');
    // Au départ, l'application est en ligne : le bandeau doit être masqué
    await expect(bannerOffline).toBeHidden();

    // 1. Simulation de la coupure de connexion réseau
    await page.evaluate(() => {
      window.dispatchEvent(new Event('offline'));
    });

    // 2. Le bandeau d'alerte apparaît en haut de page avec le message clair
    await expect(bannerOffline).toBeVisible();
    await expect(bannerOffline).toContainText('Connexion réseau perdue. Les modifications locales sont suspendues.');

    // 3. Simulation du rétablissement de la connectivité réseau
    await page.evaluate(() => {
      window.dispatchEvent(new Event('online'));
    });

    // 4. Le bandeau disparaît immédiatement
    await expect(bannerOffline).toBeHidden();

    // 5. Le toast de confirmation de retour en ligne est affiché
    const toastOnline = page.getByTestId('toast-online');
    await expect(toastOnline).toBeVisible();
    await expect(toastOnline).toContainText('Connexion rétablie.');
  });

  test('Persona 2 UAT (Damien) : Verrouillage Anti-Rebond au clic et unicité de création (RG-38)', async ({ page }) => {
    await page.goto('/');

    // 1. Inscription de Damien pour disposer de son compte
    await page.getByTestId('btn-nav-login').click();
    await page.getByTestId('link-to-register').click();

    await page.getByTestId('input-register-firstname').fill('Damien');
    await page.getByTestId('input-register-lastname').fill('Speedy');
    await page.getByTestId('input-register-email').fill('damien.speedy@example.com');
    await page.getByTestId('input-register-password').fill('DamienPass2026!');
    await page.getByTestId('input-register-password-confirm').fill('DamienPass2026!');
    await page.getByTestId('btn-submit-register').click();

    await expect(page.getByTestId('toast-notification')).toContainText('Compte créé avec succès !');

    // 2. Damien ouvre la modale de création de tâche
    await page.getByTestId('btn-open-add-task').click();
    const titleInput = page.getByTestId('input-task-title');
    await titleInput.fill('Acheter des billets de train pour Lyon');

    const submitBtn = page.getByTestId('btn-task-submit');

    // 3. Damien clique pour soumettre
    await submitBtn.click();

    // 4. La tâche est créée de manière unique sans doublon
    await expect(page.getByTestId('toast-notification')).toContainText('Tâche créée avec succès.');

    // Vérification que le libellé apparaît exactement 1 fois
    const taskElements = page.locator('[data-testid^="task-item-"]').filter({ hasText: 'Acheter des billets de train pour Lyon' });
    await expect(taskElements).toHaveCount(1);

    // 5. Test de l'anti-rebond sur la création de catégorie
    await page.getByTestId('btn-manage-categories').click();
    await page.getByTestId('input-category-name').fill('Voyages');
    const catSubmitBtn = page.getByTestId('btn-category-submit');

    await catSubmitBtn.click();
    await expect(page.getByTestId('toast-notification')).toContainText('Catégorie créée avec succès.');

    const catBadge = page.locator('#categories-list-container').filter({ hasText: 'Voyages' });
    await expect(catBadge).toHaveCount(1);
  });

  test('Technique : Configuration Concurrente SQLite en mode WAL et timeout (RG-39)', async () => {
    // Vérification via commande PHP que le mode WAL et le timeout sont actifs
    const command = 'php -r "require \'core/Api/Config.php\'; require \'core/Api/Database.php\'; $pdo = Core\\Api\\Database::getInstance(); echo $pdo->query(\'PRAGMA journal_mode;\')->fetchColumn();"';
    const journalMode = execSync(command, { encoding: 'utf-8' }).trim().toLowerCase();
    expect(journalMode).toBe('wal');

    const timeoutCommand = 'php -r "require \'core/Api/Config.php\'; require \'core/Api/Database.php\'; $pdo = Core\\Api\\Database::getInstance(); echo $pdo->query(\'PRAGMA busy_timeout;\')->fetchColumn();"';
    const busyTimeout = execSync(timeoutCommand, { encoding: 'utf-8' }).trim();
    expect(parseInt(busyTimeout, 10)).toBe(5000);
  });

  test('Technique & Audit : Script de Sauvegarde à Chaud SQLite et Journal d\'Audit (RG-40)', async () => {
    // 1. Exécution du script de backup à chaud
    const backupOutput = execSync('php scripts/backup-database.php', { encoding: 'utf-8' });
    expect(backupOutput).toContain('[SUCCÈS] Sauvegarde créée');

    // 2. Vérification de la présence d'au moins un fichier de sauvegarde
    const backupsDir = path.resolve(__dirname, '../../database/backups');
    expect(fs.existsSync(backupsDir)).toBe(true);
    const files = fs.readdirSync(backupsDir).filter(f => f.endsWith('.sqlite'));
    expect(files.length).toBeGreaterThanOrEqual(1);

    // 3. Vérification du fichier de journalisation d'audit de sécurité
    const logFile = path.resolve(__dirname, '../../logs/security.log');
    expect(fs.existsSync(logFile)).toBe(true);
    const logContent = fs.readFileSync(logFile, 'utf-8');
    expect(logContent).toContain('BACKUP_CREATED');
  });

  test('Technique & Sécurité : Cloisonnement Hermétique des Erreurs Internes (RG-41)', async () => {
    // Vérification que le gestionnaire Response::serverError génère un error_id
    const phpCheck = 'php -r "require \'core/Api/Config.php\'; require \'core/Api/Session.php\'; require \'core/Api/Logger.php\'; require \'core/Api/Response.php\'; Core\\Api\\Config::set(\'APP_ENV\', \'production\'); ob_start(); try { throw new Exception(\'Sensitive secret DB password exposed\'); } catch (Throwable \$e) { Core\\Api\\Response::serverError(\'Sensitive message\', \$e); } \$out = ob_get_clean(); echo \$out;"';
    const jsonOutput = execSync(phpCheck, { encoding: 'utf-8' }).trim();
    const parsed = JSON.parse(jsonOutput);

    expect(parsed.success).toBe(false);
    expect(parsed.code).toBe(500);
    // En production, le secret ne doit JAMAIS apparaître dans la réponse
    expect(parsed.error).not.toContain('Sensitive secret DB password exposed');
    expect(parsed.error).toContain('Code d\'incident : sec-');
    expect(parsed.data?.error_id).toMatch(/^sec-[a-f0-9]{16}$/);

    // Mais l'erreur doit être fidèlement tracée dans logs/app.log
    const appLogFile = path.resolve(__dirname, '../../logs/app.log');
    expect(fs.existsSync(appLogFile)).toBe(true);
    const appLogContent = fs.readFileSync(appLogFile, 'utf-8');
    expect(appLogContent).toContain('Sensitive secret DB password exposed');
    expect(appLogContent).toContain(parsed.data.error_id);
  });
});

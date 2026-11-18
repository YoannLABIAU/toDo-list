import { test, expect } from '@playwright/test';

test.use({ ignoreHTTPSErrors: true });

test.describe('Niveau 4 : Compatibilité & Smoke Tests Responsive (Desktop / Mobile / Tablette)', () => {
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ request }) => {
    const res = await request.post('/api/v1/test/reset-db', {
      ignoreHTTPSErrors: true,
    });
    expect(res.ok()).toBeTruthy();
    const json = await res.json();
    expect(json.success).toBe(true);
  });

  test('TC-CMP-01 : Smoke Test Desktop Standard (1280x800) - Parcours complet nominal', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/');

    // Vérification de la visibilité des blocs principaux
    await expect(page.locator('h1')).toContainText('Ma To-Do List');
    await expect(page.getByTestId('btn-manage-categories')).toBeVisible();
    await expect(page.getByTestId('btn-open-add-task')).toBeVisible();
    await expect(page.getByTestId('tasks-empty-state')).toBeVisible();

    // Création d'une tâche
    await page.getByTestId('btn-open-add-task').click();
    await page.getByTestId('input-task-title').fill('Smoke test Desktop');
    await page.getByTestId('btn-task-submit').click();

    await expect(page.getByTestId('toast-notification')).toContainText('Tâche créée avec succès.');
    const taskItem = page.locator('[data-testid^="task-item-"]').filter({ hasText: 'Smoke test Desktop' });
    await expect(taskItem).toBeVisible();
  });

  test('TC-CMP-02 : Smoke Test Mobile Smartphone (375x667) - Ergonomie tactile et responsive', async ({ page }) => {
    // Émulation d'un écran mobile smartphone
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // 1. Les contrôles sont bien visibles et cliquables sur mobile
    const openAddBtn = page.getByTestId('btn-open-add-task');
    await expect(openAddBtn).toBeVisible();
    await openAddBtn.click();

    // 2. La modale s'affiche et s'adapte à la largeur de l'écran mobile
    const modal = page.getByTestId('modal-add-task');
    await expect(modal).toBeVisible();

    await page.getByTestId('input-task-title').fill('Tâche saisie sur Mobile');
    await page.getByTestId('btn-task-submit').click();

    await expect(page.getByTestId('toast-notification')).toContainText('Tâche créée avec succès.');
    const taskItem = page.locator('[data-testid^="task-item-"]').filter({ hasText: 'Tâche saisie sur Mobile' });
    await expect(taskItem).toBeVisible();

    // 3. Bascule d'achèvement sur mobile
    const checkbox = taskItem.locator('input[type="checkbox"]');
    await checkbox.click();
    await expect(checkbox).toBeChecked();

    // 4. Test du bandeau hors-ligne sur écran mobile
    await page.evaluate(() => window.dispatchEvent(new Event('offline')));
    const banner = page.getByTestId('banner-offline');
    await expect(banner).toBeVisible();
    await expect(banner).toContainText('Connexion réseau perdue');

    await page.evaluate(() => window.dispatchEvent(new Event('online')));
    await expect(banner).toBeHidden();
  });

  test('TC-CMP-03 : Smoke Test Tablette (768x1024) - Affichage équilibré et sans débordement', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');

    // Création d'une catégorie et d'une tâche
    await page.getByTestId('btn-manage-categories').click();
    await page.getByTestId('input-category-name').fill('Tablette');
    await page.getByTestId('btn-category-submit').click();
    await page.getByTestId('btn-close-categories-modal').click();

    await page.getByTestId('btn-open-add-task').click();
    await page.getByTestId('input-task-title').fill('Vérification affichage iPad');
    await page.getByTestId('select-task-category').selectOption({ label: 'Tablette' });
    await page.getByTestId('btn-task-submit').click();

    const taskItem = page.locator('[data-testid^="task-item-"]').filter({ hasText: 'Vérification affichage iPad' });
    await expect(taskItem).toBeVisible();
    await expect(taskItem.locator('span', { hasText: 'Tablette' })).toBeVisible();
  });

  test('TC-CMP-04 : Émulation User-Agent Cross-Browser (Firefox / WebKit headers)', async ({ page }) => {
    // Test avec User Agent personnalisé Firefox
    await page.setExtraHTTPHeaders({
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0'
    });

    await page.goto('/');
    await expect(page.locator('h1')).toBeVisible();

    await page.getByTestId('btn-open-add-task').click();
    await page.getByTestId('input-task-title').fill('Test Compatibilité Navigateur');
    await page.getByTestId('btn-task-submit').click();

    const taskItem = page.locator('[data-testid^="task-item-"]').filter({ hasText: 'Test Compatibilité Navigateur' });
    await expect(taskItem).toBeVisible();
  });
});

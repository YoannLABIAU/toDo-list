import { test, expect } from '@playwright/test';

test.use({ ignoreHTTPSErrors: true });

test.describe('Sprint 3 - Correctifs : Anti-duplication récurrente et Modale de création', () => {
  test.describe.configure({ mode: 'serial' });

  // Isolation BDD avant chaque test
  test.beforeEach(async ({ request }) => {
    const res = await request.post('/api/v1/test/reset-db', {
      ignoreHTTPSErrors: true,
    });
    expect(res.ok()).toBeTruthy();
    const json = await res.json();
    expect(json.success).toBe(true);
  });

  test('Ergonomie : Ouverture, annulation et soumission via la modale de création', async ({ page }) => {
    await page.goto('/');

    // 1. La modale doit être fermée initialement
    await expect(page.getByTestId('modal-add-task')).toBeHidden();

    // 2. Cliquer sur le bouton d'ouverture
    await page.getByTestId('btn-open-add-task').click();
    await expect(page.getByTestId('modal-add-task')).toBeVisible();

    // 3. Cliquer sur le bouton Annuler
    await page.getByTestId('btn-cancel-add-task').click();
    await expect(page.getByTestId('modal-add-task')).toBeHidden();

    // 4. Ré-ouvrir la modale et créer une tâche
    await page.getByTestId('btn-open-add-task').click();
    await page.getByTestId('input-task-title').fill('Tâche test modale');
    await page.getByTestId('btn-task-submit').click();

    // La modale se referme et la tâche apparaît
    await expect(page.getByTestId('toast-notification')).toContainText('Tâche créée avec succès.');
    await expect(page.getByTestId('modal-add-task')).toBeHidden();
    await expect(page.locator('[data-testid^="task-item-"]')).toContainText('Tâche test modale');
  });

  test('Anti-duplication RG-24 : Bascule répétée d\'une tâche récurrente (cocher / décocher / recocher) sans démultiplication', async ({ page }) => {
    await page.goto('/');

    // 1. Créer une tâche récurrente quotidienne
    await page.getByTestId('btn-open-add-task').click();
    await page.getByTestId('input-task-title').fill('Méditation matinale');
    await page.getByTestId('select-task-recurrence').selectOption('daily');
    await page.getByTestId('btn-task-submit').click();
    await expect(page.getByTestId('toast-notification')).toContainText('Tâche créée avec succès.');

    const initialTask = page.locator('[data-testid^="task-item-"]').filter({ hasText: 'Méditation matinale' });
    await expect(initialTask).toHaveCount(1);

    const initialCheckbox = initialTask.locator('[data-testid^="task-checkbox-"]');
    const initialCheckboxId = await initialCheckbox.getAttribute('data-testid');
    const targetCheckbox = page.getByTestId(initialCheckboxId!);

    // 2. Premier toggle (cocher) -> Création de l'occurrence du lendemain (total: 2 tâches)
    await targetCheckbox.click();
    await expect(page.getByTestId('toast-notification')).toContainText('Tâche terminée ! Prochaine occurrence générée automatiquement.');

    let allTasks = page.locator('[data-testid^="task-item-"]').filter({ hasText: 'Méditation matinale' });
    await expect(allTasks).toHaveCount(2);

    // 3. Deuxième toggle (décocher la tâche originale) -> Repasse en "À faire", AUCUNE nouvelle tâche
    await targetCheckbox.click();
    await expect(page.getByTestId('toast-notification')).toContainText('Statut de la tâche mis à jour.');
    allTasks = page.locator('[data-testid^="task-item-"]').filter({ hasText: 'Méditation matinale' });
    await expect(allTasks).toHaveCount(2);

    // 4. Troisième toggle (recocher la tâche originale) -> Repasse en "Terminé", AUCUNE nouvelle tâche ne doit être dupliquée
    await targetCheckbox.click();
    await expect(page.getByTestId('toast-notification')).toContainText('Statut de la tâche mis à jour.');
    allTasks = page.locator('[data-testid^="task-item-"]').filter({ hasText: 'Méditation matinale' });
    await expect(allTasks).toHaveCount(2);
  });
});

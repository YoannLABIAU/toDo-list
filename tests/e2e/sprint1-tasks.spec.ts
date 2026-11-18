import { test, expect } from '@playwright/test';

test.use({ ignoreHTTPSErrors: true });

test.describe('Sprint 1 - Gestion des tâches (To-Do List MVP)', () => {
  // Exécution séquentielle pour garantir l'isolation stricte de la base de données
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

  test('Vue initiale : affiche le message d\'état vide quand aucune tâche n\'existe', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('tasks-empty-state')).toBeVisible();
    await expect(page.getByTestId('task-list')).toBeEmpty();
  });

  test('Création de tâche avec et sans date d\'échéance', async ({ page }) => {
    await page.goto('/');

    // 1. Ajout d'une tâche sans échéance
    await page.getByTestId('btn-open-add-task').click();
    await page.getByTestId('input-task-title').fill('Acheter du pain');
    await page.getByTestId('btn-task-submit').click();

    await expect(page.getByTestId('toast-notification')).toContainText('Tâche créée avec succès.');
    await expect(page.getByTestId('tasks-empty-state')).toBeHidden();

    const titleEl = page.locator('[data-testid^="task-title-"]').first();
    await expect(titleEl).toHaveText('Acheter du pain');

    // 2. Ajout d'une tâche avec échéance
    await page.getByTestId('btn-open-add-task').click();
    await page.getByTestId('input-task-title').fill('Payer les factures');
    await page.getByTestId('input-task-due-date').fill('2026-11-30');
    await page.getByTestId('btn-task-submit').click();

    await expect(page.getByTestId('toast-notification')).toContainText('Tâche créée avec succès.');
    const dueDateEl = page.locator('[data-testid^="task-due-date-"]').first();
    await expect(dueDateEl).toContainText('2026-11-30');
  });

  test('Bascule de statut : marquer une tâche comme terminée puis à faire', async ({ page }) => {
    await page.goto('/');

    await page.getByTestId('btn-open-add-task').click();
    await page.getByTestId('input-task-title').fill('Faire du sport');
    await page.getByTestId('btn-task-submit').click();

    const checkbox = page.locator('[data-testid^="task-checkbox-"]').first();
    const title = page.locator('[data-testid^="task-title-"]').first();

    // Marquer comme terminée
    await checkbox.check();
    await expect(page.getByTestId('toast-notification')).toContainText('Statut de la tâche mis à jour.');
    await expect(checkbox).toBeChecked();
    await expect(title).toHaveClass(/line-through/);

    // Décocher pour remettre à faire
    await checkbox.uncheck();
    await expect(page.getByTestId('toast-notification')).toContainText('Statut de la tâche mis à jour.');
    await expect(checkbox).not.toBeChecked();
    await expect(title).not.toHaveClass(/line-through/);
  });

  test('Modification d\'une tâche via la modale d\'édition', async ({ page }) => {
    await page.goto('/');

    await page.getByTestId('btn-open-add-task').click();
    await page.getByTestId('input-task-title').fill('Préparer la recette');
    await page.getByTestId('btn-task-submit').click();

    const editBtn = page.locator('[data-testid^="btn-task-edit-"]').first();
    await editBtn.click();

    // La modale s'ouvre
    await expect(page.getByTestId('modal-edit-task')).toBeVisible();
    await expect(page.getByTestId('input-edit-task-title')).toHaveValue('Préparer la recette');

    // Modifier le titre et ajouter une date
    await page.getByTestId('input-edit-task-title').fill('Préparer la tarte aux pommes');
    await page.getByTestId('input-edit-task-due-date').fill('2026-11-25');
    await page.getByTestId('btn-confirm-edit-task').click();

    await expect(page.getByTestId('modal-edit-task')).toBeHidden();
    await expect(page.getByTestId('toast-notification')).toContainText('Tâche modifiée avec succès.');

    const titleEl = page.locator('[data-testid^="task-title-"]').first();
    await expect(titleEl).toHaveText('Préparer la tarte aux pommes');
    const dueDateEl = page.locator('[data-testid^="task-due-date-"]').first();
    await expect(dueDateEl).toContainText('2026-11-25');
  });

  test('Suppression d\'une tâche avec modale de confirmation', async ({ page }) => {
    await page.goto('/');

    await page.getByTestId('btn-open-add-task').click();
    await page.getByTestId('input-task-title').fill('Tâche à supprimer');
    await page.getByTestId('btn-task-submit').click();

    const deleteBtn = page.locator('[data-testid^="btn-task-delete-"]').first();
    await deleteBtn.click();

    // Modale de confirmation
    await expect(page.getByTestId('modal-delete-task')).toBeVisible();
    await page.getByTestId('btn-confirm-delete-task').click();

    await expect(page.getByTestId('modal-delete-task')).toBeHidden();
    await expect(page.getByTestId('toast-notification')).toContainText('Tâche supprimée avec succès.');
    await expect(page.getByTestId('tasks-empty-state')).toBeVisible();
  });

  test('Filtrage dynamique de la vue (Toutes, À faire, Terminées)', async ({ page }) => {
    await page.goto('/');

    // Créer une tâche 1 (terminée)
    await page.getByTestId('btn-open-add-task').click();
    await page.getByTestId('input-task-title').fill('Tâche Terminée');
    await page.getByTestId('btn-task-submit').click();
    const checkbox = page.locator('[data-testid^="task-checkbox-"]').first();
    await checkbox.check();

    // Créer une tâche 2 (à faire)
    await page.getByTestId('btn-open-add-task').click();
    await page.getByTestId('input-task-title').fill('Tâche En Cours');
    await page.getByTestId('btn-task-submit').click();

    // Filtre 'À faire'
    await page.getByTestId('filter-todo').click();
    await expect(page.getByText('Tâche En Cours')).toBeVisible();
    await expect(page.getByText('Tâche Terminée')).toBeHidden();

    // Filtre 'Terminées'
    await page.getByTestId('filter-completed').click();
    await expect(page.getByText('Tâche Terminée')).toBeVisible();
    await expect(page.getByText('Tâche En Cours')).toBeHidden();

    // Filtre 'Toutes'
    await page.getByTestId('filter-all').click();
    await expect(page.getByText('Tâche En Cours')).toBeVisible();
    await expect(page.getByText('Tâche Terminée')).toBeVisible();
  });

  test('Persona 1 UAT (Claire - Parcours nominal complet)', async ({ page }) => {
    await page.goto('/');

    // 1. Liste vide
    await expect(page.getByTestId('tasks-empty-state')).toBeVisible();

    // 2. Claire ajoute "Préparer la réunion client" avec échéance
    await page.getByTestId('btn-open-add-task').click();
    await page.getByTestId('input-task-title').fill('Préparer la réunion client');
    await page.getByTestId('input-task-due-date').fill('2026-11-20');
    await page.getByTestId('btn-task-submit').click();

    await expect(page.getByText('Préparer la réunion client')).toBeVisible();
    await expect(page.getByText('2026-11-20')).toBeVisible();

    // 3. Claire ajoute "Acheter des fournitures" sans date
    await page.getByTestId('btn-open-add-task').click();
    await page.getByTestId('input-task-title').fill('Acheter des fournitures');
    await page.getByTestId('btn-task-submit').click();
    await expect(page.getByText('Acheter des fournitures')).toBeVisible();

    // 4. Elle coche "Préparer la réunion client"
    const reunionItem = page.locator('[data-testid^="task-item-"]').filter({ hasText: 'Préparer la réunion client' });
    const reunionCheckbox = reunionItem.locator('[data-testid^="task-checkbox-"]');
    await reunionCheckbox.check();
    await expect(page.getByTestId('toast-notification')).toContainText('Statut de la tâche mis à jour.');

    // 5. Elle modifie "Acheter des fournitures" en "Acheter des stylos et blocs-notes"
    const fournituresItem = page.locator('[data-testid^="task-item-"]').filter({ hasText: 'Acheter des fournitures' });
    const editBtn = fournituresItem.locator('[data-testid^="btn-task-edit-"]');
    await editBtn.click();

    await page.getByTestId('input-edit-task-title').fill('Acheter des stylos et blocs-notes');
    await page.getByTestId('btn-confirm-edit-task').click();
    await expect(page.getByTestId('toast-notification')).toContainText('Tâche modifiée avec succès.');
    await expect(page.getByText('Acheter des stylos et blocs-notes')).toBeVisible();

    // 6. Elle filtre sur "À faire"
    await page.getByTestId('filter-todo').click();
    await expect(page.getByText('Acheter des stylos et blocs-notes')).toBeVisible();
    await expect(page.getByText('Préparer la réunion client')).toBeHidden();

    // 7. Elle filtre sur "Terminées"
    await page.getByTestId('filter-completed').click();
    await expect(page.getByText('Préparer la réunion client')).toBeVisible();
    await expect(page.getByText('Acheter des stylos et blocs-notes')).toBeHidden();

    // 8. Elle revient sur "Toutes" et supprime la tâche terminée
    await page.getByTestId('filter-all').click();
    const taskToDelete = page.locator('[data-testid^="task-item-"]').filter({ hasText: 'Préparer la réunion client' });
    const deleteBtn = taskToDelete.locator('[data-testid^="btn-task-delete-"]');
    await deleteBtn.click();

    await page.getByTestId('btn-confirm-delete-task').click();
    await expect(page.getByTestId('toast-notification')).toContainText('Tâche supprimée avec succès.');
    await expect(page.getByText('Préparer la réunion client')).toBeHidden();
    await expect(page.getByText('Acheter des stylos et blocs-notes')).toBeVisible();
  });

  test('Persona 2 UAT (Marc - Cas d\'erreur et annulations)', async ({ page }) => {
    await page.goto('/');

    // 1. Tentative d'ajout d'une tâche vide
    await page.getByTestId('btn-open-add-task').click();
    await page.getByTestId('input-task-title').fill('   ');
    await page.getByTestId('btn-task-submit').click();
    await expect(page.getByTestId('toast-notification')).toContainText('Le titre de la tâche est obligatoire.');
    await expect(page.getByTestId('tasks-empty-state')).toBeVisible();

    // 2. Ajout d'une tâche valide
    await page.getByTestId('input-task-title').fill('Relancer le fournisseur');
    await page.getByTestId('btn-task-submit').click();
    await expect(page.getByText('Relancer le fournisseur')).toBeVisible();

    // 3. Édition avec titre vidé -> refus
    const editBtn = page.locator('[data-testid^="btn-task-edit-"]').first();
    await editBtn.click();
    await page.getByTestId('input-edit-task-title').fill('   ');
    await page.getByTestId('btn-confirm-edit-task').click();
    await expect(page.getByTestId('toast-notification')).toContainText('Le titre de la tâche est obligatoire.');

    // 4. Annulation d'édition
    await page.getByTestId('input-edit-task-title').fill('Relancer le fournisseur');
    await page.getByTestId('btn-cancel-edit-task').click();
    await expect(page.getByTestId('modal-edit-task')).toBeHidden();
    await expect(page.getByText('Relancer le fournisseur')).toBeVisible();

    // 5. Clic accidentel sur supprimer puis annulation
    const deleteBtn = page.locator('[data-testid^="btn-task-delete-"]').first();
    await deleteBtn.click();
    await expect(page.getByTestId('modal-delete-task')).toBeVisible();
    await page.getByTestId('btn-cancel-delete-task').click();
    await expect(page.getByTestId('modal-delete-task')).toBeHidden();
    await expect(page.getByText('Relancer le fournisseur')).toBeVisible();
  });
});

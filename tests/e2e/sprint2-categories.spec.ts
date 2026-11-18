import { test, expect } from '@playwright/test';

test.use({ ignoreHTTPSErrors: true });

test.describe('Sprint 2 - Organisation & Catégorisation (Catégories / Tags)', () => {
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

  test('Gestion des catégories : création et suppression dans la modale', async ({ page }) => {
    await page.goto('/');

    // Ouvrir la modale
    await page.getByTestId('btn-manage-categories').click();
    await expect(page.getByTestId('modal-categories')).toBeVisible();

    // Ajouter une catégorie
    await page.getByTestId('input-category-name').fill('Projets');
    await page.getByTestId('select-category-color').selectOption('purple');
    await page.getByTestId('btn-category-submit').click();

    await expect(page.getByTestId('toast-notification')).toContainText('Catégorie créée avec succès.');
    const catItem = page.locator('[data-testid^="category-item-"]').filter({ hasText: 'Projets' });
    await expect(catItem).toBeVisible();

    // Supprimer la catégorie
    const delBtn = catItem.locator('[data-testid^="btn-category-delete-"]');
    await delBtn.click();
    await expect(page.getByTestId('toast-notification')).toContainText('Catégorie supprimée avec succès.');
    await expect(catItem).toBeHidden();

    // Fermer la modale
    await page.getByTestId('btn-close-categories-modal').click();
    await expect(page.getByTestId('modal-categories')).toBeHidden();
  });

  test('Association d\'une catégorie à la création de tâche et affichage du badge', async ({ page }) => {
    // 1. Créer d'abord une catégorie via l'API
    await page.goto('/');
    await page.getByTestId('btn-manage-categories').click();
    await page.getByTestId('input-category-name').fill('Urgent');
    await page.getByTestId('select-category-color').selectOption('rose');
    await page.getByTestId('btn-category-submit').click();
    await expect(page.getByTestId('toast-notification')).toContainText('Catégorie créée avec succès.');
    await page.getByTestId('btn-close-categories-modal').click();

    // 2. Créer une tâche avec la catégorie 'Urgent'
    await page.getByTestId('btn-open-add-task').click();
    await page.getByTestId('input-task-title').fill('Réparer la fuite');
    await page.getByTestId('select-task-category').selectOption({ label: 'Urgent' });
    await page.getByTestId('btn-task-submit').click();

    await expect(page.getByTestId('toast-notification')).toContainText('Tâche créée avec succès.');

    const taskItem = page.locator('[data-testid^="task-item-"]').filter({ hasText: 'Réparer la fuite' });
    await expect(taskItem).toBeVisible();

    // Vérifier la présence du badge avec la classe rose
    const badge = taskItem.locator('[data-testid^="task-category-badge-"]');
    await expect(badge).toBeVisible();
    await expect(badge).toHaveText('Urgent');
    await expect(badge).toHaveClass(/border-rose-200/);
  });

  test('Modification d\'une tâche : changement de catégorie', async ({ page }) => {
    await page.goto('/');

    // Créer deux catégories : Travail et Maison
    await page.getByTestId('btn-manage-categories').click();
    await page.getByTestId('input-category-name').fill('Travail');
    await page.getByTestId('select-category-color').selectOption('blue');
    await page.getByTestId('btn-category-submit').click();
    await expect(page.getByTestId('toast-notification')).toContainText('Catégorie créée avec succès.');

    await page.getByTestId('input-category-name').fill('Maison');
    await page.getByTestId('select-category-color').selectOption('emerald');
    await page.getByTestId('btn-category-submit').click();
    await expect(page.getByTestId('toast-notification')).toContainText('Catégorie créée avec succès.');
    await page.getByTestId('btn-close-categories-modal').click();

    // Créer une tâche avec la catégorie Travail
    await page.getByTestId('btn-open-add-task').click();
    await page.getByTestId('input-task-title').fill('Rédiger le compte rendu');
    await page.getByTestId('select-task-category').selectOption({ label: 'Travail' });
    await page.getByTestId('btn-task-submit').click();
    await expect(page.getByTestId('toast-notification')).toContainText('Tâche créée avec succès.');

    // Ouvrir la modale d'édition et basculer sur Maison
    const taskItem = page.locator('[data-testid^="task-item-"]').filter({ hasText: 'Rédiger le compte rendu' });
    const editBtn = taskItem.locator('[data-testid^="btn-task-edit-"]');
    await editBtn.click();

    await expect(page.getByTestId('modal-edit-task')).toBeVisible();
    await page.getByTestId('select-edit-task-category').selectOption({ label: 'Maison' });
    await page.getByTestId('btn-confirm-edit-task').click();

    await expect(page.getByTestId('modal-edit-task')).toBeHidden();
    await expect(page.getByTestId('toast-notification')).toContainText('Tâche modifiée avec succès.');

    const badge = taskItem.locator('[data-testid^="task-category-badge-"]');
    await expect(badge).toHaveText('Maison');
    await expect(badge).toHaveClass(/border-emerald-200/);
  });

  test('Filtrage des tâches par catégorie', async ({ page }) => {
    await page.goto('/');

    // Créer les catégories
    await page.getByTestId('btn-manage-categories').click();
    await page.getByTestId('input-category-name').fill('Boulot');
    await page.getByTestId('select-category-color').selectOption('blue');
    await page.getByTestId('btn-category-submit').click();
    await expect(page.getByTestId('toast-notification')).toContainText('Catégorie créée avec succès.');

    await page.getByTestId('input-category-name').fill('Perso');
    await page.getByTestId('select-category-color').selectOption('amber');
    await page.getByTestId('btn-category-submit').click();
    await expect(page.getByTestId('toast-notification')).toContainText('Catégorie créée avec succès.');
    await page.getByTestId('btn-close-categories-modal').click();

    // Tâche 1 : Boulot
    await page.getByTestId('btn-open-add-task').click();
    await page.getByTestId('input-task-title').fill('Tâche Boulot');
    await page.getByTestId('select-task-category').selectOption({ label: 'Boulot' });
    await page.getByTestId('btn-task-submit').click();
    await expect(page.getByText('Tâche Boulot')).toBeVisible();

    // Tâche 2 : Perso
    await page.getByTestId('btn-open-add-task').click();
    await page.getByTestId('input-task-title').fill('Tâche Perso');
    await page.getByTestId('select-task-category').selectOption({ label: 'Perso' });
    await page.getByTestId('btn-task-submit').click();
    await expect(page.getByText('Tâche Perso')).toBeVisible();

    // Filtre par catégorie 'Boulot'
    await page.getByTestId('select-category-filter').selectOption({ label: 'Boulot' });
    await expect(page.getByText('Tâche Boulot')).toBeVisible();
    await expect(page.getByText('Tâche Perso')).toBeHidden();

    // Filtre par catégorie 'Perso'
    await page.getByTestId('select-category-filter').selectOption({ label: 'Perso' });
    await expect(page.getByText('Tâche Perso')).toBeVisible();
    await expect(page.getByText('Tâche Boulot')).toBeHidden();

    // Réinitialisation du filtre
    await page.getByTestId('select-category-filter').selectOption('all');
    await expect(page.getByText('Tâche Boulot')).toBeVisible();
    await expect(page.getByText('Tâche Perso')).toBeVisible();
  });

  test('Persona 1 UAT (Thomas - Parcours nominal complet)', async ({ page }) => {
    await page.goto('/');

    // 1. Thomas ouvre la gestion des catégories
    await page.getByTestId('btn-manage-categories').click();

    // 2. Il crée "Travail" (bleu) et "Personnel" (émeraude)
    await page.getByTestId('input-category-name').fill('Travail');
    await page.getByTestId('select-category-color').selectOption('blue');
    await page.getByTestId('btn-category-submit').click();
    await expect(page.getByTestId('toast-notification')).toContainText('Catégorie créée avec succès.');

    await page.getByTestId('input-category-name').fill('Personnel');
    await page.getByTestId('select-category-color').selectOption('emerald');
    await page.getByTestId('btn-category-submit').click();
    await expect(page.getByTestId('toast-notification')).toContainText('Catégorie créée avec succès.');

    // 3. Fermeture de la modale
    await page.getByTestId('btn-close-categories-modal').click();

    // 4. Ajout de "Finaliser la présentation" avec catégorie "Travail"
    await page.getByTestId('btn-open-add-task').click();
    await page.getByTestId('input-task-title').fill('Finaliser la présentation');
    await page.getByTestId('select-task-category').selectOption({ label: 'Travail' });
    await page.getByTestId('btn-task-submit').click();
    await expect(page.getByTestId('toast-notification')).toContainText('Tâche créée avec succès.');

    // 5. Ajout de "Acheter un cadeau" avec catégorie "Personnel"
    await page.getByTestId('btn-open-add-task').click();
    await page.getByTestId('input-task-title').fill('Acheter un cadeau');
    await page.getByTestId('select-task-category').selectOption({ label: 'Personnel' });
    await page.getByTestId('btn-task-submit').click();
    await expect(page.getByTestId('toast-notification')).toContainText('Tâche créée avec succès.');

    // 6. Constat des badges
    const task1 = page.locator('[data-testid^="task-item-"]').filter({ hasText: 'Finaliser la présentation' });
    const task2 = page.locator('[data-testid^="task-item-"]').filter({ hasText: 'Acheter un cadeau' });
    await expect(task1.locator('[data-testid^="task-category-badge-"]')).toHaveText('Travail');
    await expect(task2.locator('[data-testid^="task-category-badge-"]')).toHaveText('Personnel');

    // 7. Filtrage par Travail
    await page.getByTestId('select-category-filter').selectOption({ label: 'Travail' });
    await expect(page.getByText('Finaliser la présentation')).toBeVisible();
    await expect(page.getByText('Acheter un cadeau')).toBeHidden();

    // 8. Filtrage par Personnel
    await page.getByTestId('select-category-filter').selectOption({ label: 'Personnel' });
    await expect(page.getByText('Acheter un cadeau')).toBeVisible();
    await expect(page.getByText('Finaliser la présentation')).toBeHidden();

    // 9. Remise sur toutes
    await page.getByTestId('select-category-filter').selectOption('all');
    await expect(page.getByText('Finaliser la présentation')).toBeVisible();
    await expect(page.getByText('Acheter un cadeau')).toBeVisible();

    // 10. Modification de catégorie
    const editBtn = task1.locator('[data-testid^="btn-task-edit-"]');
    await editBtn.click();
    await page.getByTestId('select-edit-task-category').selectOption({ label: 'Personnel' });
    await page.getByTestId('btn-confirm-edit-task').click();
    await expect(page.getByTestId('toast-notification')).toContainText('Tâche modifiée avec succès.');
    await expect(task1.locator('[data-testid^="task-category-badge-"]')).toHaveText('Personnel');
  });

  test('Persona 2 UAT (Sophie - Cas d\'erreur et intégrité après suppression de catégorie)', async ({ page }) => {
    await page.goto('/');

    // 1. Sophie tente de créer une catégorie avec un nom vide
    await page.getByTestId('btn-manage-categories').click();
    await page.getByTestId('input-category-name').fill('   ');
    await page.getByTestId('btn-category-submit').click();
    await expect(page.getByTestId('toast-notification')).toContainText('Le nom de la catégorie est obligatoire');

    // 2. Création valide de "Urgent"
    await page.getByTestId('input-category-name').fill('Urgent');
    await page.getByTestId('select-category-color').selectOption('rose');
    await page.getByTestId('btn-category-submit').click();
    await expect(page.getByTestId('toast-notification')).toContainText('Catégorie créée avec succès.');

    // 3. Tentative de créer un doublon
    await page.getByTestId('input-category-name').fill('urgent');
    await page.getByTestId('btn-category-submit').click();
    await expect(page.getByTestId('toast-notification')).toContainText('Une catégorie portant ce nom existe déjà.');

    // 4. Ferme la modale et crée une tâche rattachée à "Urgent"
    await page.getByTestId('btn-close-categories-modal').click();
    await page.getByTestId('btn-open-add-task').click();
    await page.getByTestId('input-task-title').fill('Payer les impôts');
    await page.getByTestId('select-task-category').selectOption({ label: 'Urgent' });
    await page.getByTestId('btn-task-submit').click();
    await expect(page.getByTestId('toast-notification')).toContainText('Tâche créée avec succès.');

    const taskItem = page.locator('[data-testid^="task-item-"]').filter({ hasText: 'Payer les impôts' });
    await expect(taskItem.locator('[data-testid^="task-category-badge-"]')).toHaveText('Urgent');

    // 5. Rouvre et supprime la catégorie "Urgent"
    await page.getByTestId('btn-manage-categories').click();
    const urgentItem = page.locator('[data-testid^="category-item-"]').filter({ hasText: 'Urgent' });
    await urgentItem.locator('[data-testid^="btn-category-delete-"]').click();
    await expect(page.getByTestId('toast-notification')).toContainText('Catégorie supprimée avec succès.');
    await page.getByTestId('btn-close-categories-modal').click();

    // 6. Vérifie que la tâche existe TOUJOURS et n'a plus de badge
    await expect(page.getByText('Payer les impôts')).toBeVisible();
    await expect(taskItem.locator('[data-testid^="task-category-badge-"]')).toHaveCount(0);
  });
});

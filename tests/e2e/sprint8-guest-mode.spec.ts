import { test, expect } from '@playwright/test';

test.use({ ignoreHTTPSErrors: true });

test.describe('Sprint 8 - Mode Invité (LocalStorage) & Migration post-inscription', () => {
  test.describe.configure({ mode: 'serial' });

  // Réinitialisation de la base de données avant chaque scénario UAT
  test.beforeEach(async ({ request }) => {
    const res = await request.post('/api/v1/test/reset-db', {
      ignoreHTTPSErrors: true,
    });
    expect(res.ok()).toBeTruthy();
    const json = await res.json();
    expect(json.success).toBe(true);
  });

  test('Persona 1 UAT (Julie) : Visiteuse non connectée, stockage local puis migration réussie après inscription (RG-43, RG-44, RG-45, RG-46)', async ({ page }) => {
    // 1. Julie arrive sur le site sans être connectée
    await page.goto('/');

    // 2. Le badge Mode Hors-Ligne / Données locales est bien visible (RG-44)
    const guestBadge = page.getByTestId('badge-guest-mode');
    await expect(guestBadge).toBeVisible();
    await expect(guestBadge).toContainText('Mode Invité (Stockage local)');

    // 3. Julie crée une catégorie locale "Maison"
    await page.getByTestId('btn-manage-categories').click();
    await page.getByTestId('input-category-name').fill('Maison');
    await page.getByTestId('select-category-color').selectOption('emerald');
    await page.getByTestId('btn-category-submit').click();
    await page.getByTestId('btn-close-categories-modal').click();

    // 4. Julie crée une tâche locale "Nettoyer le garage"
    await page.getByTestId('btn-open-add-task').click();
    await page.getByTestId('input-task-title').fill('Nettoyer le garage');
    await page.getByTestId('select-task-category').selectOption({ label: 'Maison' });
    await page.getByTestId('btn-task-submit').click();

    // Vérifier l'affichage immédiat dans la liste
    const taskItem = page.locator('[data-testid^="task-item-"]').first();
    await expect(taskItem).toBeVisible();
    await expect(taskItem).toContainText('Nettoyer le garage');
    await expect(taskItem).toContainText('Maison');

    // 5. Vérification technique : Les données sont bien enregistrées dans localStorage et pas en base (RG-43)
    const localTasksCount = await page.evaluate(() => {
      const raw = localStorage.getItem('todo_guest_tasks');
      return raw ? JSON.parse(raw).length : 0;
    });
    expect(localTasksCount).toBe(1);

    const localCategoriesCount = await page.evaluate(() => {
      const raw = localStorage.getItem('todo_guest_categories');
      return raw ? JSON.parse(raw).length : 0;
    });
    expect(localCategoriesCount).toBe(1);

    // 6. Julie décide de créer son compte
    await page.getByTestId('btn-nav-login').click();
    await page.getByTestId('link-to-register').click();

    await page.getByTestId('input-register-firstname').fill('Julie');
    await page.getByTestId('input-register-lastname').fill('Dupont');
    await page.getByTestId('input-register-username').fill('jdupont');
    await page.getByTestId('input-register-email').fill('julie.dupont@example.com');
    await page.getByTestId('input-register-password').fill('Secret1234!');
    await page.getByTestId('input-register-password-confirm').fill('Secret1234!');

    await page.getByTestId('btn-submit-register').click();

    // 7. Modale de proposition de migration affichée (RG-45)
    const migrateModal = page.getByTestId('modal-migrate-data');
    await expect(migrateModal).toBeVisible();

    const migrateTaskCount = page.getByTestId('migrate-task-count');
    await expect(migrateTaskCount).toContainText('1');

    // 8. Julie clique sur "Oui, importer mes données" (RG-46)
    await page.getByTestId('btn-confirm-migration').click();

    // La modale de migration doit se fermer
    await expect(migrateModal).toBeHidden();

    // 9. Le badge mode invité doit avoir disparu car Julie est maintenant connectée (RG-47)
    await expect(guestBadge).toBeHidden();

    // 10. Le localStorage a été vidé après migration réussie
    const localTasksAfterMigration = await page.evaluate(() => {
      return localStorage.getItem('todo_guest_tasks');
    });
    expect(localTasksAfterMigration).toBeNull();

    // 11. Les tâches et catégories sont maintenant chargées depuis la BDD pour son compte
    await expect(page.locator('[data-testid^="task-item-"]').first()).toContainText('Nettoyer le garage');
    await expect(page.locator('[data-testid^="task-item-"]').first()).toContainText('Maison');
  });

  test('Persona 2 UAT (Karim) : Visiteur non connecté refusant la migration des données locales (RG-45)', async ({ page }) => {
    // 1. Karim arrive sur le site sans être connecté
    await page.goto('/');

    const guestBadge = page.getByTestId('badge-guest-mode');
    await expect(guestBadge).toBeVisible();

    // 2. Karim crée une tâche de test temporaire
    await page.getByTestId('btn-open-add-task').click();
    await page.getByTestId('input-task-title').fill('Acheter du pain');
    await page.getByTestId('btn-task-submit').click();

    await expect(page.locator('[data-testid^="task-item-"]').first()).toContainText('Acheter du pain');

    // 3. Karim s'inscrit pour un compte tout neuf
    await page.getByTestId('btn-nav-login').click();
    await page.getByTestId('link-to-register').click();

    await page.getByTestId('input-register-firstname').fill('Karim');
    await page.getByTestId('input-register-lastname').fill('Benali');
    await page.getByTestId('input-register-username').fill('kbenali');
    await page.getByTestId('input-register-email').fill('karim.benali@example.com');
    await page.getByTestId('input-register-password').fill('Secret1234!');
    await page.getByTestId('input-register-password-confirm').fill('Secret1234!');

    await page.getByTestId('btn-submit-register').click();

    // 4. Modale de migration proposée
    const migrateModal = page.getByTestId('modal-migrate-data');
    await expect(migrateModal).toBeVisible();

    // 5. Karim clique sur "Non, ignorer" (refus de migration)
    await page.getByTestId('btn-skip-migration').click();
    await expect(migrateModal).toBeHidden();

    // 6. Karim est connecté : badge invité masqué
    await expect(guestBadge).toBeHidden();

    // 7. Le compte BDD de Karim est vierge : l'état vide est affiché
    await expect(page.getByTestId('tasks-empty-state')).toBeVisible();
    await expect(page.locator('[data-testid^="task-item-"]')).toHaveCount(0);
  });

  test('Mode Connecté Exclusif BDD : Aucune écriture dans localStorage lors des opérations authentifiées (RG-47)', async ({ page }) => {
    // 1. Inscription directe sans données préalables
    await page.goto('/');

    await page.getByTestId('btn-nav-login').click();
    await page.getByTestId('link-to-register').click();

    await page.getByTestId('input-register-firstname').fill('Sophie');
    await page.getByTestId('input-register-lastname').fill('Lemoine');
    await page.getByTestId('input-register-username').fill('slemoine');
    await page.getByTestId('input-register-email').fill('sophie.lemoine@example.com');
    await page.getByTestId('input-register-password').fill('Secret1234!');
    await page.getByTestId('input-register-password-confirm').fill('Secret1234!');

    await page.getByTestId('btn-submit-register').click();

    // Pas de modale de migration car pas de données locales
    await expect(page.getByTestId('modal-migrate-data')).toBeHidden();
    await expect(page.getByTestId('badge-guest-mode')).toBeHidden();

    // 2. Création d'une tâche par l'utilisateur connecté
    await page.getByTestId('btn-open-add-task').click();
    await page.getByTestId('input-task-title').fill('Préparer la réunion');
    await page.getByTestId('btn-task-submit').click();

    await expect(page.locator('[data-testid^="task-item-"]').first()).toContainText('Préparer la réunion');

    // 3. Vérification : le localStorage reste totalement vide pour l'invité
    const guestTasks = await page.evaluate(() => localStorage.getItem('todo_guest_tasks'));
    expect(guestTasks).toBeNull();
  });
});

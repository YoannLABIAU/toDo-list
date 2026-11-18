import { test, expect } from '@playwright/test';

test.use({ ignoreHTTPSErrors: true });

test.describe('Niveau 2 : Cas Limites & Conditions aux Frontières (Boundary Conditions)', () => {
  test.describe.configure({ mode: 'serial' });

  // Réinitialisation de la BDD avant chaque test pour isolation
  test.beforeEach(async ({ request }) => {
    const res = await request.post('/api/v1/test/reset-db', {
      ignoreHTTPSErrors: true,
    });
    expect(res.ok()).toBeTruthy();
    const json = await res.json();
    expect(json.success).toBe(true);
  });

  test('TC-BND-01 : Titre vide rejeté avec surbrillance d\'erreur', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('btn-open-add-task').click();

    // Clic direct sur soumettre sans titre
    await page.getByTestId('btn-task-submit').click();

    // Vérification du message d'erreur et surbrillance
    await expect(page.getByTestId('toast-notification')).toContainText('Le titre de la tâche est obligatoire.');
    await expect(page.getByTestId('input-task-title')).toHaveClass(/border-rose-500/);
  });

  test('TC-BND-02 : Titre minimal de 1 caractère accepté et persisté', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('btn-open-add-task').click();
    await page.getByTestId('input-task-title').fill('X');
    await page.getByTestId('btn-task-submit').click();

    await expect(page.getByTestId('toast-notification')).toContainText('Tâche créée avec succès.');
    const taskItem = page.locator('[data-testid^="task-item-"]').filter({ hasText: 'X' });
    await expect(taskItem).toBeVisible();
  });

  test('TC-BND-03 : Titre maximal (255 caractères) accepté sans rupture graphique', async ({ page }) => {
    await page.goto('/');
    const longTitle = 'T'.repeat(255);

    await page.getByTestId('btn-open-add-task').click();
    await page.getByTestId('input-task-title').fill(longTitle);
    await page.getByTestId('btn-task-submit').click();

    await expect(page.getByTestId('toast-notification')).toContainText('Tâche créée avec succès.');
    const taskItem = page.locator('[data-testid^="task-item-"]').filter({ hasText: longTitle });
    await expect(taskItem).toBeVisible();
  });

  test('TC-BND-04 & 05 : Support des caractères spéciaux et des émojis UTF-8', async ({ page }) => {
    await page.goto('/');
    const specialTitle = '🎯 Mission Spéciale <Test> & "Quotes" \'Single\' & 🦄 Émojis ✨';

    await page.getByTestId('btn-open-add-task').click();
    await page.getByTestId('input-task-title').fill(specialTitle);
    await page.getByTestId('btn-task-submit').click();

    await expect(page.getByTestId('toast-notification')).toContainText('Tâche créée avec succès.');
    const taskItem = page.locator('[data-testid^="task-item-"]').filter({ hasText: specialTitle });
    await expect(taskItem).toBeVisible();
  });

  test('TC-BND-06 : Date d\'échéance passée déclenche le badge rouge "En retard"', async ({ page }) => {
    await page.goto('/');

    await page.getByTestId('btn-open-add-task').click();
    await page.getByTestId('input-task-title').fill('Facture en souffrance');
    await page.getByTestId('input-task-due-date').fill('2020-01-01');
    await page.getByTestId('btn-task-submit').click();

    const taskItem = page.locator('[data-testid^="task-item-"]').filter({ hasText: 'Facture en souffrance' });
    await expect(taskItem.locator('span', { hasText: 'En retard' })).toBeVisible();
    await expect(taskItem.locator('span', { hasText: 'En retard' })).toHaveClass(/bg-rose-100/);
  });

  test('TC-BND-07 : Date très future (Année 2035) et horaires limites (00:00 et 23:59)', async ({ page }) => {
    await page.goto('/');

    // 1. Horaire 00:00
    await page.getByTestId('btn-open-add-task').click();
    await page.getByTestId('input-task-title').fill('Rendez-vous minuit');
    await page.getByTestId('input-task-due-date').fill('2035-12-31');
    await page.getByTestId('input-task-due-time').fill('00:00');
    await page.getByTestId('btn-task-submit').click();

    const taskMidnight = page.locator('[data-testid^="task-item-"]').filter({ hasText: 'Rendez-vous minuit' });
    await expect(taskMidnight).toContainText('00:00');

    // 2. Horaire 23:59
    await page.getByTestId('btn-open-add-task').click();
    await page.getByTestId('input-task-title').fill('Fin d\'année 2035');
    await page.getByTestId('input-task-due-date').fill('2035-12-31');
    await page.getByTestId('input-task-due-time').fill('23:59');
    await page.getByTestId('btn-task-submit').click();

    const taskEndOfDay = page.locator('[data-testid^="task-item-"]').filter({ hasText: 'Fin d\'année 2035' });
    await expect(taskEndOfDay).toContainText('23:59');
  });

  test('TC-BND-08 & 09 & 10 : Catégorie nom vide et doublon rejetés', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('btn-manage-categories').click();

    // 1. Nom vide
    await page.getByTestId('btn-category-submit').click();
    await expect(page.getByTestId('toast-notification')).toContainText('Le nom de la catégorie est obligatoire');

    // 2. Création de "Projet A"
    await page.getByTestId('input-category-name').fill('Projet A');
    await page.getByTestId('btn-category-submit').click();
    await expect(page.getByTestId('toast-notification')).toContainText('Catégorie créée avec succès.');

    // 3. Tentative de doublon avec le même nom
    await page.getByTestId('input-category-name').fill('Projet A');
    await page.getByTestId('btn-category-submit').click();
    await expect(page.getByTestId('toast-notification')).toContainText('Une catégorie portant ce nom existe déjà.');
  });

  test('TC-BND-11 : Intégrité des données lors de la suppression d\'une catégorie liée à des tâches', async ({ page }) => {
    await page.goto('/');

    // 1. Créer une catégorie "Temporaire"
    await page.getByTestId('btn-manage-categories').click();
    await page.getByTestId('input-category-name').fill('Temporaire');
    await page.getByTestId('btn-category-submit').click();
    await page.getByTestId('btn-close-categories-modal').click();

    // 2. Créer une tâche liée à cette catégorie
    await page.getByTestId('btn-open-add-task').click();
    await page.getByTestId('input-task-title').fill('Tâche protégée contre suppression de catégorie');
    await page.getByTestId('select-task-category').selectOption({ label: 'Temporaire' });
    await page.getByTestId('btn-task-submit').click();

    const taskItem = page.locator('[data-testid^="task-item-"]').filter({ hasText: 'Tâche protégée contre suppression de catégorie' });
    await expect(taskItem.locator('span', { hasText: 'Temporaire' })).toBeVisible();

    // 3. Supprimer la catégorie "Temporaire"
    await page.getByTestId('btn-manage-categories').click();
    const deleteCatBtn = page.locator('[data-testid^="btn-category-delete-"]').first();
    await deleteCatBtn.click();
    await page.getByTestId('btn-close-categories-modal').click();

    // 4. La tâche existe toujours et n'a plus le badge "Temporaire"
    await expect(taskItem).toBeVisible();
    await expect(taskItem.locator('span', { hasText: 'Temporaire' })).toHaveCount(0);
  });

  test('TC-BND-12 & 13 & 14 : Récurrence mensuelle et année bissextile', async ({ page }) => {
    await page.goto('/');

    // Création d'une tâche récurrente mensuelle sur une date bissextile (2028-02-29)
    await page.getByTestId('btn-open-add-task').click();
    await page.getByTestId('input-task-title').fill('Revue mensuelle bissextile');
    await page.getByTestId('input-task-due-date').fill('2028-02-29');
    await page.getByTestId('select-task-recurrence').selectOption('monthly');
    await page.getByTestId('btn-task-submit').click();

    const taskItem = page.locator('[data-testid^="task-item-"]').filter({ hasText: 'Revue mensuelle bissextile' });
    await expect(taskItem).toBeVisible();

    // Cocher la tâche
    await taskItem.locator('input[type="checkbox"]').click();

    // L'occurrence suivante est générée au mois suivant (+1 mois)
    await expect(page.getByTestId('toast-notification')).toContainText('Prochaine occurrence générée automatiquement');
    const occurrences = page.locator('[data-testid^="task-item-"]').filter({ hasText: 'Revue mensuelle bissextile' });
    await expect(occurrences).toHaveCount(2);
  });

  test('TC-BND-17 & 18 & 19 : Validation des limites de l\'authentification (email invalide, mot de passe faible, unicité)', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('btn-nav-login').click();
    await page.getByTestId('link-to-register').click();

    // 1. Mot de passe trop court (<8 car)
    await page.getByTestId('input-register-firstname').fill('Jean');
    await page.getByTestId('input-register-lastname').fill('Dupont');
    await page.getByTestId('input-register-email').fill('jean.dupont@example.com');
    await page.getByTestId('input-register-password').fill('Short1!');
    await page.getByTestId('input-register-password-confirm').fill('Short1!');
    await page.getByTestId('btn-submit-register').click();

    await expect(page.locator('#auth-form-error')).toContainText('Le mot de passe doit comporter au moins 8 caractères');

    // 2. Mots de passe non concordants
    await page.getByTestId('input-register-password').fill('ValidPass2026!');
    await page.getByTestId('input-register-password-confirm').fill('DifferentPass2026!');
    await page.getByTestId('btn-submit-register').click();

    await expect(page.locator('#auth-form-error')).toContainText('La confirmation du mot de passe ne correspond pas.');

    // 3. Inscription réussie
    await page.getByTestId('input-register-password-confirm').fill('ValidPass2026!');
    await page.getByTestId('btn-submit-register').click();
    await expect(page.getByTestId('btn-logout')).toBeVisible();

    // Déconnexion
    await page.getByTestId('btn-logout').click();

    // 4. Tentative de réinscription avec le même email (Unicité)
    await page.getByTestId('btn-nav-login').click();
    await page.getByTestId('link-to-register').click();
    await page.getByTestId('input-register-firstname').fill('Jean');
    await page.getByTestId('input-register-lastname').fill('Deuxieme');
    await page.getByTestId('input-register-email').fill('jean.dupont@example.com');
    await page.getByTestId('input-register-password').fill('ValidPass2026!');
    await page.getByTestId('input-register-password-confirm').fill('ValidPass2026!');
    await page.getByTestId('btn-submit-register').click();

    await expect(page.locator('#auth-form-error')).toContainText('Cette adresse email est déjà associée à un compte.');
  });
});

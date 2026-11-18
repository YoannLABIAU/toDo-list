import { test, expect } from '@playwright/test';

test.use({ ignoreHTTPSErrors: true });

test.describe('Sprint 4 - Planification avancée, Gestion du temps et Recherche', () => {
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

  const formatYmd = (date: Date): string => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  test('Persona Maxime : Horaire précis, récurrence bornée dans le temps et arrêt automatique', async ({ page }) => {
    await page.goto('/');

    const now = new Date();
    const todayStr = formatYmd(now);

    const tomorrow = new Date();
    tomorrow.setDate(now.getDate() + 1);
    const tomorrowStr = formatYmd(tomorrow);

    // 1. Maxime crée une tâche avec heure 09:30, récurrence quotidienne et date de fin fixée à demain
    await page.getByTestId('btn-open-add-task').click();
    await page.getByTestId('input-task-title').fill('Standup équipe');
    await page.getByTestId('input-task-due-date').fill(todayStr);
    await page.getByTestId('input-task-due-time').fill('09:30');
    await page.getByTestId('select-task-recurrence').selectOption('daily');
    await page.getByTestId('input-task-recurrence-end').fill(tomorrowStr);
    await page.getByTestId('btn-task-submit').click();

    await expect(page.getByTestId('toast-notification')).toContainText('Tâche créée avec succès.');

    const initialTask = page.locator('[data-testid^="task-item-"]').filter({ hasText: 'Standup équipe' });
    await expect(initialTask).toBeVisible();

    // Vérifier l'horaire affiché dans le badge d'échéance
    const dueTimeBadge = initialTask.locator('[data-testid^="task-due-time-"]');
    await expect(dueTimeBadge).toBeVisible();
    await expect(dueTimeBadge).toContainText('09:30');

    // 2. Maxime valide l'occurrence du jour
    await initialTask.locator('[data-testid^="task-checkbox-"]').click();
    await expect(page.getByTestId('toast-notification')).toContainText('Tâche terminée ! Prochaine occurrence générée automatiquement.');

    // 3. Deux occurrences sont présentes : celle du jour terminée, celle de demain non terminée
    const allOccurrences = page.locator('[data-testid^="task-item-"]').filter({ hasText: 'Standup équipe' });
    await expect(allOccurrences).toHaveCount(2);

    const tomorrowTask = allOccurrences.filter({ hasText: tomorrowStr });
    await expect(tomorrowTask).toBeVisible();
    await expect(tomorrowTask.locator('[data-testid^="task-due-time-"]')).toContainText('09:30');
    await expect(tomorrowTask.locator('[data-testid^="task-checkbox-"]')).not.toBeChecked();

    // 4. Maxime valide l'occurrence de demain : la prochaine dépasserait la date limite de fin
    await tomorrowTask.locator('[data-testid^="task-checkbox-"]').click();

    // Vérifier le toast spécifique d'arrêt de plage
    await expect(page.getByTestId('toast-notification')).toContainText('Tâche terminée ! Fin de la plage de récurrence atteinte.');

    // Le nombre total de tâches reste à 2 (aucune 3e occurrence n'est créée)
    await expect(page.locator('[data-testid^="task-item-"]')).toHaveCount(2);
  });

  test('Persona Camille : Recherche textuelle instantanée et ordonnancement (tri par défaut vs nom)', async ({ page }) => {
    await page.goto('/');

    const now = new Date();
    const todayStr = formatYmd(now);

    const tomorrow = new Date();
    tomorrow.setDate(now.getDate() + 1);
    const tomorrowStr = formatYmd(tomorrow);

    // 1. Camille crée 3 tâches dans un ordre arbitraire
    // Tâche A : "Zèbre peluche" (demain à 10:00)
    await page.getByTestId('btn-open-add-task').click();
    await page.getByTestId('input-task-title').fill('Zèbre peluche');
    await page.getByTestId('input-task-due-date').fill(tomorrowStr);
    await page.getByTestId('input-task-due-time').fill('10:00');
    await page.getByTestId('btn-task-submit').click();
    await expect(page.getByTestId('toast-notification')).toContainText('Tâche créée avec succès.');

    // Tâche B : "Acheter café" (sans date)
    await page.getByTestId('btn-open-add-task').click();
    await page.getByTestId('input-task-title').fill('Acheter café');
    await page.getByTestId('input-task-due-date').fill('');
    await page.getByTestId('btn-task-submit').click();
    await expect(page.getByTestId('toast-notification')).toContainText('Tâche créée avec succès.');

    // Tâche C : "Bilan comptable" (aujourd'hui à 17:00)
    await page.getByTestId('btn-open-add-task').click();
    await page.getByTestId('input-task-title').fill('Bilan comptable');
    await page.getByTestId('input-task-due-date').fill(todayStr);
    await page.getByTestId('input-task-due-time').fill('17:00');
    await page.getByTestId('btn-task-submit').click();
    await expect(page.getByTestId('toast-notification')).toContainText('Tâche créée avec succès.');

    // 2. Vérification du tri par défaut (RG-21 : temps restant le plus court en tête)
    // Ordre attendu :
    // 1. "Bilan comptable" (aujourd'hui 17:00)
    // 2. "Zèbre peluche" (demain 10:00)
    // 3. "Acheter café" (sans échéance en fin)
    const taskTitles = page.locator('[data-testid^="task-title-"]');
    await expect(taskTitles.nth(0)).toHaveText('Bilan comptable');
    await expect(taskTitles.nth(1)).toHaveText('Zèbre peluche');
    await expect(taskTitles.nth(2)).toHaveText('Acheter café');

    // 3. Recherche textuelle (RG-22)
    await page.getByTestId('input-search-tasks').fill('comptable');
    const filteredTasks = page.locator('[data-testid^="task-item-"]');
    await expect(filteredTasks).toHaveCount(1);
    await expect(filteredTasks.first()).toContainText('Bilan comptable');

    // Vider la recherche
    await page.getByTestId('input-search-tasks').fill('');
    await expect(page.locator('[data-testid^="task-item-"]')).toHaveCount(3);

    // 4. Tri personnalisé par nom A-Z (RG-23)
    await page.getByTestId('select-task-sort').selectOption('name_asc');
    await expect(taskTitles.nth(0)).toHaveText('Acheter café');
    await expect(taskTitles.nth(1)).toHaveText('Bilan comptable');
    await expect(taskTitles.nth(2)).toHaveText('Zèbre peluche');

    // 5. Tri personnalisé par nom Z-A
    await page.getByTestId('select-task-sort').selectOption('name_desc');
    await expect(taskTitles.nth(0)).toHaveText('Zèbre peluche');
    await expect(taskTitles.nth(1)).toHaveText('Bilan comptable');
    await expect(taskTitles.nth(2)).toHaveText('Acheter café');
  });

  test('Modification d\'une tâche : attribution d\'un horaire et d\'une fin de récurrence via la modale', async ({ page }) => {
    await page.goto('/');

    const now = new Date();
    const todayStr = formatYmd(now);

    // 1. Créer une tâche simple
    await page.getByTestId('btn-open-add-task').click();
    await page.getByTestId('input-task-title').fill('Session révision');
    await page.getByTestId('input-task-due-date').fill(todayStr);
    await page.getByTestId('btn-task-submit').click();
    await expect(page.getByTestId('toast-notification')).toContainText('Tâche créée avec succès.');

    const taskItem = page.locator('[data-testid^="task-item-"]').filter({ hasText: 'Session révision' });
    await expect(taskItem).toBeVisible();

    // 2. Ouvrir la modale d'édition
    await taskItem.locator('[data-testid^="btn-task-edit-"]').click();
    await expect(page.getByTestId('modal-edit-task')).toBeVisible();

    // Renseigner heure et récurrence avec fin
    await page.getByTestId('input-edit-task-due-time').fill('15:45');
    await page.getByTestId('select-edit-task-recurrence').selectOption('weekly');
    await page.getByTestId('input-edit-task-recurrence-end').fill('2027-01-18');
    await page.getByTestId('btn-confirm-edit-task').click();

    await expect(page.getByTestId('toast-notification')).toContainText('Tâche modifiée avec succès.');
    await expect(page.getByTestId('modal-edit-task')).toBeHidden();

    // 3. Vérifier les modifications sur la ligne de tâche
    await expect(taskItem.locator('[data-testid^="task-due-time-"]')).toContainText('15:45');
    await expect(taskItem.locator('[data-testid^="task-recurrence-badge-"]')).toContainText('Hebdomadaire');
  });
});

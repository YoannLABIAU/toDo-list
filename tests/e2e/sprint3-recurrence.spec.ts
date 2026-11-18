import { test, expect } from '@playwright/test';

test.use({ ignoreHTTPSErrors: true });

test.describe('Sprint 3 - Automatisation, Tâches Récurrentes et Alertes de Délais', () => {
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

  // Utilitaires de date
  const formatYmd = (date: Date): string => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  test('Persona Julien : Routine hebdomadaire avec régénération automatique à J+7', async ({ page }) => {
    await page.goto('/');

    const now = new Date();
    const today = formatYmd(now);
    const nextWeekDate = new Date();
    nextWeekDate.setDate(now.getDate() + 7);
    const expectedNextDueDate = formatYmd(nextWeekDate);

    // 1. Julien crée d'abord une catégorie "Maison"
    await page.getByTestId('btn-manage-categories').click();
    await page.getByTestId('input-category-name').fill('Maison');
    await page.getByTestId('select-category-color').selectOption('amber');
    await page.getByTestId('btn-category-submit').click();
    await expect(page.getByTestId('toast-notification')).toContainText('Catégorie créée avec succès.');
    await page.getByTestId('btn-close-categories-modal').click();

    // 2. Julien crée une tâche récurrente "Ménage complet" pour aujourd'hui
    await page.getByTestId('btn-open-add-task').click();
    await page.getByTestId('input-task-title').fill('Ménage complet');
    await page.getByTestId('input-task-due-date').fill(today);
    await page.getByTestId('select-task-category').selectOption({ label: 'Maison' });
    await page.getByTestId('select-task-recurrence').selectOption('weekly');
    await page.getByTestId('btn-task-submit').click();

    await expect(page.getByTestId('toast-notification')).toContainText('Tâche créée avec succès.');

    // 3. Julien vérifie l'affichage des badges
    const taskItem = page.locator('[data-testid^="task-item-"]').filter({ hasText: 'Ménage complet' });
    await expect(taskItem).toBeVisible();

    // Badge récurrence hebdomadaire
    const recBadge = taskItem.locator('[data-testid^="task-recurrence-badge-"]');
    await expect(recBadge).toBeVisible();
    await expect(recBadge).toContainText('Hebdomadaire');

    // Badge alerte aujourd'hui
    const todayBadge = taskItem.locator('[data-testid^="task-today-badge-"]');
    await expect(todayBadge).toBeVisible();
    await expect(todayBadge).toContainText("Aujourd'hui");

    // 4. Julien termine sa tâche
    const checkbox = taskItem.locator('[data-testid^="task-checkbox-"]');
    await checkbox.click();

    // Toast d'auto-génération
    await expect(page.getByTestId('toast-notification')).toContainText('Tâche terminée ! Prochaine occurrence générée automatiquement.');

    // 5. Julien constate la présence des deux occurrences :
    // Une terminée et une nouvelle non terminée avec échéance à J+7
    const allMatchingTasks = page.locator('[data-testid^="task-item-"]').filter({ hasText: 'Ménage complet' });
    await expect(allMatchingTasks).toHaveCount(2);

    // Vérifier la nouvelle tâche non terminée avec date J+7
    const nextTask = allMatchingTasks.filter({ hasNotText: today });
    await expect(nextTask).toBeVisible();
    await expect(nextTask.locator('[data-testid^="task-due-date-"]')).toContainText(expectedNextDueDate);
    await expect(nextTask.locator('[data-testid^="task-recurrence-badge-"]')).toContainText('Hebdomadaire');
    await expect(nextTask.locator('[data-testid^="task-checkbox-"]')).not.toBeChecked();
  });

  test('Persona Léa : Gestion des retards (badge rouge), modification vers récurrence quotidienne et régénération à J+1', async ({ page }) => {
    await page.goto('/');

    const now = new Date();
    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);
    const yesterdayStr = formatYmd(yesterday);

    const todayStr = formatYmd(now);

    const tomorrow = new Date();
    tomorrow.setDate(now.getDate() + 1);
    const tomorrowStr = formatYmd(tomorrow);

    // 1. Léa crée une tâche urgente avec échéance dépassée (hier)
    await page.getByTestId('btn-open-add-task').click();
    await page.getByTestId('input-task-title').fill('Déclarer la TVA');
    await page.getByTestId('input-task-due-date').fill(yesterdayStr);
    await page.getByTestId('select-task-recurrence').selectOption('none');
    await page.getByTestId('btn-task-submit').click();

    await expect(page.getByTestId('toast-notification')).toContainText('Tâche créée avec succès.');

    const taskItem = page.locator('[data-testid^="task-item-"]').filter({ hasText: 'Déclarer la TVA' });
    await expect(taskItem).toBeVisible();

    // Badge En retard visible
    const overdueBadge = taskItem.locator('[data-testid^="task-overdue-badge-"]');
    await expect(overdueBadge).toBeVisible();
    await expect(overdueBadge).toContainText('En retard');

    // 2. Léa décide d'éditer la tâche pour la mettre à aujourd'hui et la rendre quotidienne
    await taskItem.locator('[data-testid^="btn-task-edit-"]').click();
    await expect(page.getByTestId('modal-edit-task')).toBeVisible();

    await page.getByTestId('input-edit-task-due-date').fill(todayStr);
    await page.getByTestId('select-edit-task-recurrence').selectOption('daily');
    await page.getByTestId('btn-confirm-edit-task').click();

    await expect(page.getByTestId('toast-notification')).toContainText('Tâche modifiée avec succès.');
    await expect(page.getByTestId('modal-edit-task')).toBeHidden();

    // 3. Vérification des badges mis à jour : "En retard" a disparu au profit de "Aujourd'hui" + badge "Quotidienne"
    await expect(taskItem.locator('[data-testid^="task-overdue-badge-"]')).toBeHidden();
    await expect(taskItem.locator('[data-testid^="task-today-badge-"]')).toBeVisible();
    await expect(taskItem.locator('[data-testid^="task-recurrence-badge-"]')).toContainText('Quotidienne');

    // 4. Léa valide la tâche du jour
    await taskItem.locator('[data-testid^="task-checkbox-"]').click();
    await expect(page.getByTestId('toast-notification')).toContainText('Tâche terminée ! Prochaine occurrence générée automatiquement.');

    // 5. Une nouvelle occurrence quotidienne est programmée pour demain
    const allOccurrences = page.locator('[data-testid^="task-item-"]').filter({ hasText: 'Déclarer la TVA' });
    await expect(allOccurrences).toHaveCount(2);

    const nextOccurrence = allOccurrences.filter({ hasText: tomorrowStr });
    await expect(nextOccurrence).toBeVisible();
    await expect(nextOccurrence.locator('[data-testid^="task-recurrence-badge-"]')).toContainText('Quotidienne');
  });

  test('Cas limites : tâche sans récurrence ne crée aucun doublon au toggle', async ({ page }) => {
    await page.goto('/');

    await page.getByTestId('btn-open-add-task').click();
    await page.getByTestId('input-task-title').fill('Acheter du pain');
    await page.getByTestId('select-task-recurrence').selectOption('none');
    await page.getByTestId('btn-task-submit').click();

    await expect(page.getByTestId('toast-notification')).toContainText('Tâche créée avec succès.');

    const taskItem = page.locator('[data-testid^="task-item-"]').filter({ hasText: 'Acheter du pain' });
    await expect(taskItem).toBeVisible();

    // Toggle
    await taskItem.locator('[data-testid^="task-checkbox-"]').click();
    await expect(page.getByTestId('toast-notification')).toContainText('Statut de la tâche mis à jour.');

    // Toujours une seule tâche dans la liste (aucun clone créé)
    const items = page.locator('[data-testid^="task-item-"]');
    await expect(items).toHaveCount(1);
    await expect(taskItem.locator('[data-testid^="task-checkbox-"]')).toBeChecked();
  });

  test('Règle RG-14 : Récurrence sans date d\'échéance initialise automatiquement la date du jour', async ({ page }) => {
    await page.goto('/');

    const now = new Date();
    const todayStr = formatYmd(now);

    // Tâche récurrente sans renseigner le champ date
    await page.getByTestId('btn-open-add-task').click();
    await page.getByTestId('input-task-title').fill('Sauvegarde mensuelle');
    await page.getByTestId('input-task-due-date').fill('');
    await page.getByTestId('select-task-recurrence').selectOption('monthly');
    await page.getByTestId('btn-task-submit').click();

    await expect(page.getByTestId('toast-notification')).toContainText('Tâche créée avec succès.');

    const taskItem = page.locator('[data-testid^="task-item-"]').filter({ hasText: 'Sauvegarde mensuelle' });
    await expect(taskItem).toBeVisible();

    // Vérification : la date d'échéance affichée est aujourd'hui et le badge Mensuelle est présent
    await expect(taskItem.locator('[data-testid^="task-due-date-"]')).toContainText(todayStr);
    await expect(taskItem.locator('[data-testid^="task-recurrence-badge-"]')).toContainText('Mensuelle');
    await expect(taskItem.locator('[data-testid^="task-today-badge-"]')).toBeVisible();
  });

  test('Filtrage avec tâches récurrentes : À faire vs Terminées', async ({ page }) => {
    await page.goto('/');

    const now = new Date();
    const todayStr = formatYmd(now);

    // 1. Créer une tâche récurrente
    await page.getByTestId('btn-open-add-task').click();
    await page.getByTestId('input-task-title').fill('Prendre vitamines');
    await page.getByTestId('input-task-due-date').fill(todayStr);
    await page.getByTestId('select-task-recurrence').selectOption('daily');
    await page.getByTestId('btn-task-submit').click();
    await expect(page.getByTestId('toast-notification')).toContainText('Tâche créée avec succès.');

    // 2. Terminer l'occurrence du jour -> Génère l'occurrence de demain
    const initialTask = page.locator('[data-testid^="task-item-"]').filter({ hasText: 'Prendre vitamines' });
    await initialTask.locator('[data-testid^="task-checkbox-"]').click();
    await expect(page.getByTestId('toast-notification')).toContainText('Tâche terminée ! Prochaine occurrence générée automatiquement.');

    // 3. Basculer sur le filtre "À faire"
    await page.getByTestId('filter-todo').click();
    const todoTasks = page.locator('[data-testid^="task-item-"]');
    await expect(todoTasks).toHaveCount(1);
    await expect(todoTasks.first().locator('[data-testid^="task-checkbox-"]')).not.toBeChecked();

    // 4. Basculer sur le filtre "Terminées"
    await page.getByTestId('filter-completed').click();
    const completedTasks = page.locator('[data-testid^="task-item-"]');
    await expect(completedTasks).toHaveCount(1);
    await expect(completedTasks.first().locator('[data-testid^="task-checkbox-"]')).toBeChecked();
  });
});

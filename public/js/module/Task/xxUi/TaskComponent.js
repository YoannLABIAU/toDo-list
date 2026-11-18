import { CategoryService } from '../../Category/xxUi/CategoryService.js';
import { TaskService } from './TaskService.js';
import { withButtonLock } from '../../../core/Ui/ButtonLock.js';
import { LocalStorageService } from '../../../core/Ui/LocalStorageService.js';
/**
 * Contrôleur Frontend Vanilla TypeScript pour la gestion complète de la To-Do List et des catégories.
 */
export class TaskComponent {
    service;
    categoryService;
    currentUser = null;
    currentFilter = 'all';
    currentCategoryId = null;
    currentSearch = '';
    currentSort = 'due_asc';
    tasks = [];
    categories = [];
    taskToDeleteId = null;
    taskToEditId = null;
    // Éléments du DOM - Tâches
    taskListEl;
    emptyStateEl;
    addModalEl;
    openAddModalBtn;
    addFormEl;
    titleInputEl;
    dueDateInputEl;
    dueTimeInputEl;
    taskCategorySelectEl;
    taskRecurrenceSelectEl;
    recurrenceEndInputEl;
    submitBtnEl;
    // Barre d'outils - Recherche & Tri
    searchInputEl;
    sortSelectEl;
    filterAllBtn;
    filterTodoBtn;
    filterCompletedBtn;
    categoryFilterSelectEl;
    // Modale d'édition de tâche
    editModalEl;
    editTitleInputEl;
    editDueDateInputEl;
    editDueTimeInputEl;
    editCategorySelectEl;
    editRecurrenceSelectEl;
    editRecurrenceEndInputEl;
    editConfirmBtn;
    editCancelBtn;
    // Modale de suppression de tâche
    deleteModalEl;
    deleteConfirmBtn;
    deleteCancelBtn;
    // Modale de gestion des catégories
    manageCategoriesBtn;
    categoriesModalEl;
    closeCategoriesModalBtn;
    categoryNameInputEl;
    categoryColorSelectEl;
    submitCategoryBtn;
    categoriesListContainerEl;
    // Toast
    toastEl;
    toastTimeout = null;
    /**
     * Initialise le composant avec ses services API.
     */
    constructor() {
        this.service = new TaskService();
        this.categoryService = new CategoryService();
    }
    /**
     * Définit l'utilisateur courant et met à jour l'état visuel du mode invité / connecté.
     */
    setCurrentUser(user) {
        this.currentUser = user;
        this.updateGuestBadge();
    }
    /**
     * Indique si l'utilisateur est un simple visiteur non authentifié.
     */
    isGuest() {
        return this.currentUser === null;
    }
    /**
     * Met à jour la visibilité du badge mode invité (RG-44).
     */
    updateGuestBadge() {
        const badge = document.querySelector('[data-testid="badge-guest-mode"]');
        if (badge) {
            if (this.isGuest()) {
                badge.classList.remove('hidden');
            }
            else {
                badge.classList.add('hidden');
            }
        }
    }
    /**
     * Monte le composant dans le DOM, attache les écouteurs et charge les données initiales.
     */
    async init() {
        this.bindDomElements();
        this.attachEventListeners();
        this.updateGuestBadge();
        await this.loadCategories();
        await this.loadTasks();
    }
    /**
     * Lie les références aux éléments HTML.
     */
    bindDomElements() {
        this.taskListEl = document.querySelector('[data-testid="task-list"]');
        this.emptyStateEl = document.querySelector('[data-testid="tasks-empty-state"]');
        this.addModalEl = document.querySelector('[data-testid="modal-add-task"]');
        this.openAddModalBtn = document.querySelector('[data-testid="btn-open-add-task"]');
        this.addFormEl = document.getElementById('add-task-form');
        this.titleInputEl = document.querySelector('[data-testid="input-task-title"]');
        this.dueDateInputEl = document.querySelector('[data-testid="input-task-due-date"]');
        this.dueTimeInputEl = document.querySelector('[data-testid="input-task-due-time"]');
        this.taskCategorySelectEl = document.querySelector('[data-testid="select-task-category"]');
        this.taskRecurrenceSelectEl = document.querySelector('[data-testid="select-task-recurrence"]');
        this.recurrenceEndInputEl = document.querySelector('[data-testid="input-task-recurrence-end"]');
        this.submitBtnEl = document.querySelector('[data-testid="btn-task-submit"]');
        this.searchInputEl = document.querySelector('[data-testid="input-search-tasks"]');
        this.sortSelectEl = document.querySelector('[data-testid="select-task-sort"]');
        this.filterAllBtn = document.querySelector('[data-testid="filter-all"]');
        this.filterTodoBtn = document.querySelector('[data-testid="filter-todo"]');
        this.filterCompletedBtn = document.querySelector('[data-testid="filter-completed"]');
        this.categoryFilterSelectEl = document.querySelector('[data-testid="select-category-filter"]');
        this.editModalEl = document.querySelector('[data-testid="modal-edit-task"]');
        this.editTitleInputEl = document.querySelector('[data-testid="input-edit-task-title"]');
        this.editDueDateInputEl = document.querySelector('[data-testid="input-edit-task-due-date"]');
        this.editDueTimeInputEl = document.querySelector('[data-testid="input-edit-task-due-time"]');
        this.editCategorySelectEl = document.querySelector('[data-testid="select-edit-task-category"]');
        this.editRecurrenceSelectEl = document.querySelector('[data-testid="select-edit-task-recurrence"]');
        this.editRecurrenceEndInputEl = document.querySelector('[data-testid="input-edit-task-recurrence-end"]');
        this.editConfirmBtn = document.querySelector('[data-testid="btn-confirm-edit-task"]');
        this.editCancelBtn = document.querySelector('[data-testid="btn-cancel-edit-task"]');
        this.deleteModalEl = document.querySelector('[data-testid="modal-delete-task"]');
        this.deleteConfirmBtn = document.querySelector('[data-testid="btn-confirm-delete-task"]');
        this.deleteCancelBtn = document.querySelector('[data-testid="btn-cancel-delete-task"]');
        this.manageCategoriesBtn = document.querySelector('[data-testid="btn-manage-categories"]');
        this.categoriesModalEl = document.querySelector('[data-testid="modal-categories"]');
        this.closeCategoriesModalBtn = document.querySelector('[data-testid="btn-close-categories-modal"]');
        this.categoryNameInputEl = document.querySelector('[data-testid="input-category-name"]');
        this.categoryColorSelectEl = document.querySelector('[data-testid="select-category-color"]');
        this.submitCategoryBtn = document.querySelector('[data-testid="btn-category-submit"]');
        this.categoriesListContainerEl = document.getElementById('categories-list-container');
        this.toastEl = document.querySelector('[data-testid="toast-notification"]');
    }
    /**
     * Attache les écouteurs d'événements.
     */
    attachEventListeners() {
        // Formulaire d'ajout de tâche
        this.addFormEl?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleAddTask();
        });
        // Recherche textuelle dynamique (RG-22)
        this.searchInputEl?.addEventListener('input', () => {
            this.currentSearch = this.searchInputEl.value.trim();
            this.loadTasks();
        });
        // Sélecteur de tri (RG-23)
        this.sortSelectEl?.addEventListener('change', () => {
            this.currentSort = (this.sortSelectEl.value || 'due_asc');
            this.loadTasks();
        });
        // Filtres de statut
        this.filterAllBtn?.addEventListener('click', () => this.setFilter('all'));
        this.filterTodoBtn?.addEventListener('click', () => this.setFilter('todo'));
        this.filterCompletedBtn?.addEventListener('click', () => this.setFilter('completed'));
        // Filtre de catégorie
        this.categoryFilterSelectEl?.addEventListener('change', () => {
            const val = this.categoryFilterSelectEl.value;
            this.currentCategoryId = val && val !== 'all' ? parseInt(val, 10) : null;
            this.loadTasks();
        });
        // Modale d'édition
        this.editConfirmBtn?.addEventListener('click', () => this.handleConfirmEdit());
        this.editCancelBtn?.addEventListener('click', () => this.closeEditModal());
        // Modale de suppression
        this.deleteConfirmBtn?.addEventListener('click', () => this.handleConfirmDelete());
        this.deleteCancelBtn?.addEventListener('click', () => this.closeDeleteModal());
        // Gestion des catégories
        this.manageCategoriesBtn?.addEventListener('click', () => this.openCategoriesModal());
        this.closeCategoriesModalBtn?.addEventListener('click', () => this.closeCategoriesModal());
        this.submitCategoryBtn?.addEventListener('click', () => this.handleAddCategory());
        // Modale de création de tâche
        this.openAddModalBtn?.addEventListener('click', () => this.openAddModal());
        // Fermeture des modales au clic extérieur
        this.addModalEl?.addEventListener('click', (e) => {
            if (e.target === this.addModalEl)
                this.closeAddModal();
        });
        this.editModalEl?.addEventListener('click', (e) => {
            if (e.target === this.editModalEl)
                this.closeEditModal();
        });
        this.deleteModalEl?.addEventListener('click', (e) => {
            if (e.target === this.deleteModalEl)
                this.closeDeleteModal();
        });
        this.categoriesModalEl?.addEventListener('click', (e) => {
            if (e.target === this.categoriesModalEl)
                this.closeCategoriesModal();
        });
    }
    /**
     * Charge la liste des catégories et met à jour les sélecteurs.
     */
    async loadCategories() {
        try {
            if (this.isGuest()) {
                this.categories = LocalStorageService.getGuestCategories();
            }
            else {
                this.categories = await this.categoryService.getCategories();
            }
            this.populateCategorySelects();
            this.renderCategoriesList();
        }
        catch (err) {
            const msg = err instanceof Error ? err.message : 'Erreur chargement catégories';
            this.showToast(msg, 'error');
        }
    }
    /**
     * Remplit les balises select avec les catégories actuelles.
     */
    populateCategorySelects() {
        const optionsHtml = this.categories
            .map((cat) => `<option value="${cat.id}">${this.escapeHtml(cat.name)}</option>`)
            .join('');
        if (this.taskCategorySelectEl) {
            this.taskCategorySelectEl.innerHTML = `<option value="">Sans catégorie</option>${optionsHtml}`;
        }
        if (this.editCategorySelectEl) {
            this.editCategorySelectEl.innerHTML = `<option value="">Sans catégorie</option>${optionsHtml}`;
        }
        if (this.categoryFilterSelectEl) {
            const currentVal = this.categoryFilterSelectEl.value;
            this.categoryFilterSelectEl.innerHTML = `<option value="all">Toutes les catégories</option>${optionsHtml}`;
            if (currentVal && this.categories.some((c) => String(c.id) === currentVal)) {
                this.categoryFilterSelectEl.value = currentVal;
            }
            else {
                this.categoryFilterSelectEl.value = 'all';
                this.currentCategoryId = null;
            }
        }
    }
    /**
     * Affiche la liste des catégories dans la modale de gestion.
     */
    renderCategoriesList() {
        if (!this.categoriesListContainerEl)
            return;
        if (this.categories.length === 0) {
            this.categoriesListContainerEl.innerHTML = '<p class="text-xs text-slate-400 py-2">Aucune catégorie existante.</p>';
            return;
        }
        this.categoriesListContainerEl.innerHTML = this.categories
            .map((cat) => {
            const colorClasses = this.getColorClasses(cat.color);
            return `
          <div data-testid="category-item-${cat.id}" class="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200">
            <span class="inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-md border ${colorClasses}">
              ${this.escapeHtml(cat.name)}
            </span>
            <button 
              type="button" 
              data-testid="btn-category-delete-${cat.id}" 
              class="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
              title="Supprimer la catégorie"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
            </button>
          </div>
        `;
        })
            .join('');
        // Écouteurs de suppression de catégorie
        this.categories.forEach((cat) => {
            const delBtn = document.querySelector(`[data-testid="btn-category-delete-${cat.id}"]`);
            delBtn?.addEventListener('click', () => this.handleDeleteCategory(cat.id));
        });
    }
    /**
     * Ouvre la modale de création de tâche.
     */
    openAddModal() {
        if (!this.addModalEl) {
            this.addModalEl = document.querySelector('[data-testid="modal-add-task"]');
        }
        if (this.addModalEl) {
            this.addModalEl.classList.remove('hidden');
        }
        if (!this.titleInputEl) {
            this.titleInputEl = document.querySelector('[data-testid="input-task-title"]');
        }
        this.titleInputEl?.focus();
    }
    /**
     * Ferme la modale de création de tâche.
     */
    closeAddModal() {
        if (!this.addModalEl) {
            this.addModalEl = document.querySelector('[data-testid="modal-add-task"]');
        }
        if (this.addModalEl) {
            this.addModalEl.classList.add('hidden');
        }
        this.titleInputEl?.classList.remove('border-rose-500', 'focus:ring-rose-500');
    }
    /**
     * Ouvre la modale de gestion des catégories.
     */
    openCategoriesModal() {
        if (!this.categoriesModalEl) {
            this.categoriesModalEl = document.querySelector('[data-testid="modal-categories"]');
        }
        if (this.categoriesModalEl) {
            this.categoriesModalEl.classList.remove('hidden');
        }
        if (!this.categoryNameInputEl) {
            this.categoryNameInputEl = document.querySelector('[data-testid="input-category-name"]');
        }
        if (this.categoryNameInputEl) {
            this.categoryNameInputEl.value = '';
            this.categoryNameInputEl.focus();
        }
    }
    /**
     * Ferme la modale de gestion des catégories.
     */
    closeCategoriesModal() {
        if (!this.categoriesModalEl) {
            this.categoriesModalEl = document.querySelector('[data-testid="modal-categories"]');
        }
        if (this.categoriesModalEl) {
            this.categoriesModalEl.classList.add('hidden');
        }
    }
    /**
     * Ajoute une catégorie avec validation RG-08.
     */
    async handleAddCategory() {
        const name = this.categoryNameInputEl.value.trim();
        const color = this.categoryColorSelectEl.value || 'indigo';
        if (!name) {
            this.categoryNameInputEl.classList.add('border-rose-500', 'focus:ring-rose-500');
            this.showToast('Le nom de la catégorie est obligatoire (1 à 50 caractères).', 'error');
            this.categoryNameInputEl.focus();
            return;
        }
        this.categoryNameInputEl.classList.remove('border-rose-500', 'focus:ring-rose-500');
        await withButtonLock(this.submitCategoryBtn, async () => {
            try {
                if (this.isGuest()) {
                    LocalStorageService.createGuestCategory(name, color);
                }
                else {
                    await this.categoryService.createCategory(name, color);
                }
                this.categoryNameInputEl.value = '';
                this.showToast('Catégorie créée avec succès.', 'success');
                await this.loadCategories();
                await this.loadTasks();
            }
            catch (err) {
                const msg = err instanceof Error ? err.message : 'Erreur inconnue';
                this.showToast(msg, 'error');
            }
        }, 'Création...');
    }
    /**
     * Supprime une catégorie après confirmation.
     *
     * @param id
     */
    async handleDeleteCategory(id) {
        try {
            if (this.isGuest()) {
                LocalStorageService.deleteGuestCategory(id);
            }
            else {
                await this.categoryService.deleteCategory(id);
            }
            this.showToast('Catégorie supprimée avec succès.', 'success');
            await this.loadCategories();
            await this.loadTasks();
        }
        catch (err) {
            const msg = err instanceof Error ? err.message : 'Erreur inconnue';
            this.showToast(msg, 'error');
        }
    }
    /**
     * Charge les tâches depuis l'API ou le LocalStorage et met à jour l'affichage.
     */
    async loadTasks() {
        try {
            if (this.isGuest()) {
                this.tasks = LocalStorageService.getFilteredAndSortedGuestTasks(this.currentFilter, this.currentCategoryId, this.currentSearch, this.currentSort);
            }
            else {
                this.tasks = await this.service.getTasks(this.currentFilter, this.currentCategoryId, this.currentSearch, this.currentSort);
            }
            this.renderTasks();
        }
        catch (err) {
            const msg = err instanceof Error ? err.message : 'Erreur lors du chargement des tâches';
            this.showToast(msg, 'error');
        }
    }
    /**
     * Change le filtre d'état (Toutes, À faire, Terminées).
     *
     * @param filter
     */
    setFilter(filter) {
        this.currentFilter = filter;
        this.updateFilterButtons();
        this.loadTasks();
    }
    /**
     * Met à jour les styles des onglets de filtres.
     */
    updateFilterButtons() {
        const activeClasses = ['bg-indigo-600', 'text-white', 'shadow-sm'];
        const inactiveClasses = ['bg-white', 'text-slate-600', 'hover:bg-slate-50'];
        const setBtnState = (btn, isActive) => {
            if (!btn)
                return;
            if (isActive) {
                btn.classList.remove(...inactiveClasses);
                btn.classList.add(...activeClasses);
            }
            else {
                btn.classList.remove(...activeClasses);
                btn.classList.add(...inactiveClasses);
            }
        };
        setBtnState(this.filterAllBtn, this.currentFilter === 'all');
        setBtnState(this.filterTodoBtn, this.currentFilter === 'todo');
        setBtnState(this.filterCompletedBtn, this.currentFilter === 'completed');
    }
    /**
     * Traite l'ajout d'une nouvelle tâche.
     */
    async handleAddTask() {
        const title = this.titleInputEl.value.trim();
        const dueDate = this.dueDateInputEl.value.trim() || null;
        const dueTime = this.dueTimeInputEl?.value?.trim() || null;
        const catVal = this.taskCategorySelectEl.value;
        const categoryId = catVal ? parseInt(catVal, 10) : null;
        const recurrence = (this.taskRecurrenceSelectEl?.value || 'none');
        const recurrenceEndDate = this.recurrenceEndInputEl?.value?.trim() || null;
        if (!title) {
            this.titleInputEl.classList.add('border-rose-500', 'focus:ring-rose-500');
            this.showToast('Le titre de la tâche est obligatoire.', 'error');
            this.titleInputEl.focus();
            return;
        }
        this.titleInputEl.classList.remove('border-rose-500', 'focus:ring-rose-500');
        await withButtonLock(this.submitBtnEl, async () => {
            try {
                if (this.isGuest()) {
                    LocalStorageService.createGuestTask(title, dueDate, categoryId, recurrence, dueTime, recurrenceEndDate);
                }
                else {
                    await this.service.createTask(title, dueDate, categoryId, recurrence, dueTime, recurrenceEndDate);
                }
                this.titleInputEl.value = '';
                this.dueDateInputEl.value = '';
                if (this.dueTimeInputEl)
                    this.dueTimeInputEl.value = '';
                this.taskCategorySelectEl.value = '';
                if (this.taskRecurrenceSelectEl) {
                    this.taskRecurrenceSelectEl.value = 'none';
                }
                if (this.recurrenceEndInputEl)
                    this.recurrenceEndInputEl.value = '';
                this.showToast('Tâche créée avec succès.', 'success');
                this.closeAddModal();
                await this.loadTasks();
            }
            catch (err) {
                const msg = err instanceof Error ? err.message : 'Erreur inconnue';
                this.showToast(msg, 'error');
            }
        }, 'Enregistrement...');
    }
    /**
     * Bascule l'état d'achèvement d'une tâche.
     *
     * @param id
     */
    async handleToggleTask(id) {
        try {
            let updated = {};
            if (this.isGuest()) {
                updated = LocalStorageService.toggleGuestTask(id);
            }
            else {
                updated = await this.service.toggleTask(id);
            }
            if (updated.recurrence_ended) {
                this.showToast('Tâche terminée ! Fin de la plage de récurrence atteinte.', 'success');
            }
            else if (updated.recurrence_generated) {
                this.showToast('Tâche terminée ! Prochaine occurrence générée automatiquement.', 'success');
            }
            else {
                this.showToast('Statut de la tâche mis à jour.', 'success');
            }
            await this.loadTasks();
        }
        catch (err) {
            const msg = err instanceof Error ? err.message : 'Erreur inconnue';
            this.showToast(msg, 'error');
        }
    }
    /**
     * Ouvre la modale d'édition.
     *
     * @param task
     */
    openEditModal(task) {
        this.taskToEditId = task.id;
        this.editTitleInputEl.value = task.title;
        this.editDueDateInputEl.value = task.due_date ? task.due_date.substring(0, 10) : '';
        if (this.editDueTimeInputEl) {
            this.editDueTimeInputEl.value = task.due_time ? task.due_time.substring(0, 5) : '';
        }
        this.editCategorySelectEl.value = task.category_id ? String(task.category_id) : '';
        if (this.editRecurrenceSelectEl) {
            this.editRecurrenceSelectEl.value = task.recurrence || 'none';
        }
        if (this.editRecurrenceEndInputEl) {
            this.editRecurrenceEndInputEl.value = task.recurrence_end_date ? task.recurrence_end_date.substring(0, 10) : '';
        }
        this.editModalEl.classList.remove('hidden');
        this.editTitleInputEl.focus();
    }
    /**
     * Ferme la modale d'édition.
     */
    closeEditModal() {
        this.taskToEditId = null;
        this.editModalEl.classList.add('hidden');
        this.editTitleInputEl.classList.remove('border-rose-500', 'focus:ring-rose-500');
    }
    /**
     * Valide et soumet les modifications d'une tâche.
     */
    async handleConfirmEdit() {
        if (this.taskToEditId === null)
            return;
        const title = this.editTitleInputEl.value.trim();
        const dueDate = this.editDueDateInputEl.value.trim() || null;
        const dueTime = this.editDueTimeInputEl?.value?.trim() || null;
        const catVal = this.editCategorySelectEl.value;
        const categoryId = catVal ? parseInt(catVal, 10) : null;
        const recurrence = (this.editRecurrenceSelectEl?.value || 'none');
        const recurrenceEndDate = this.editRecurrenceEndInputEl?.value?.trim() || null;
        if (!title) {
            this.editTitleInputEl.classList.add('border-rose-500', 'focus:ring-rose-500');
            this.showToast('Le titre de la tâche est obligatoire.', 'error');
            return;
        }
        this.editTitleInputEl.classList.remove('border-rose-500', 'focus:ring-rose-500');
        await withButtonLock(this.editConfirmBtn, async () => {
            try {
                if (this.isGuest()) {
                    LocalStorageService.updateGuestTask(this.taskToEditId, title, dueDate, categoryId, recurrence, dueTime, recurrenceEndDate);
                }
                else {
                    await this.service.updateTask(this.taskToEditId, title, dueDate, categoryId, recurrence, dueTime, recurrenceEndDate);
                }
                this.showToast('Tâche modifiée avec succès.', 'success');
                this.closeEditModal();
                await this.loadTasks();
            }
            catch (err) {
                const msg = err instanceof Error ? err.message : 'Erreur inconnue';
                this.showToast(msg, 'error');
            }
        }, 'Enregistrement...');
    }
    /**
     * Ouvre la modale de suppression.
     *
     * @param id
     */
    openDeleteModal(id) {
        this.taskToDeleteId = id;
        this.deleteModalEl.classList.remove('hidden');
    }
    /**
     * Ferme la modale de suppression.
     */
    closeDeleteModal() {
        this.taskToDeleteId = null;
        this.deleteModalEl.classList.add('hidden');
    }
    /**
     * Confirme la suppression d'une tâche.
     */
    async handleConfirmDelete() {
        if (this.taskToDeleteId === null)
            return;
        try {
            if (this.isGuest()) {
                LocalStorageService.deleteGuestTask(this.taskToDeleteId);
            }
            else {
                await this.service.deleteTask(this.taskToDeleteId);
            }
            this.showToast('Tâche supprimée avec succès.', 'success');
            this.closeDeleteModal();
            await this.loadTasks();
        }
        catch (err) {
            const msg = err instanceof Error ? err.message : 'Erreur inconnue';
            this.showToast(msg, 'error');
        }
    }
    /**
     * Rendu visuel de la liste des tâches avec badges de catégories, récurrence et alertes de date.
     */
    renderTasks() {
        if (!this.taskListEl)
            return;
        if (this.tasks.length === 0) {
            this.taskListEl.innerHTML = '';
            this.emptyStateEl.classList.remove('hidden');
            return;
        }
        this.emptyStateEl.classList.add('hidden');
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const todayStr = `${year}-${month}-${day}`;
        const recurrenceLabels = {
            daily: 'Quotidienne',
            weekly: 'Hebdomadaire',
            monthly: 'Mensuelle',
        };
        this.taskListEl.innerHTML = this.tasks
            .map((task) => {
            const isDone = task.completed;
            const textStyle = isDone
                ? 'line-through text-slate-400 font-normal'
                : 'text-slate-800 font-medium';
            const checkboxChecked = isDone ? 'checked' : '';
            const timeHtml = task.due_time
                ? `<span data-testid="task-due-time-${task.id}" class="text-slate-500 font-semibold ml-1">à ${this.escapeHtml(task.due_time)}</span>`
                : '';
            const dueDateBadge = task.due_date
                ? `<span data-testid="task-due-date-${task.id}" class="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
              <svg class="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
              ${this.escapeHtml(task.due_date)}${timeHtml}
            </span>`
                : '';
            let statusBadge = '';
            if (!isDone && task.due_date) {
                if (task.due_date < todayStr) {
                    statusBadge = `<span data-testid="task-overdue-badge-${task.id}" class="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-700 font-semibold border border-rose-200">
              <svg class="w-3 h-3 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              En retard
            </span>`;
                }
                else if (task.due_date === todayStr) {
                    statusBadge = `<span data-testid="task-today-badge-${task.id}" class="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-semibold border border-amber-200">
              <svg class="w-3 h-3 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              Aujourd'hui
            </span>`;
                }
            }
            let recurrenceBadge = '';
            if (task.recurrence && task.recurrence !== 'none') {
                const recLabel = recurrenceLabels[task.recurrence] || task.recurrence;
                recurrenceBadge = `<span data-testid="task-recurrence-badge-${task.id}" class="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-md bg-sky-50 text-sky-700 font-medium border border-sky-200">
            <svg class="w-3 h-3 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
            ${this.escapeHtml(recLabel)}
          </span>`;
            }
            const categoryBadge = task.category_id && task.category_name
                ? `<span data-testid="task-category-badge-${task.id}" class="inline-flex items-center text-xs px-2 py-0.5 rounded-md font-semibold border ${this.getColorClasses(task.category_color || 'indigo')}">
              ${this.escapeHtml(task.category_name)}
            </span>`
                : '';
            return `
          <div data-testid="task-item-${task.id}" class="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all gap-4">
            <div class="flex items-center gap-3 flex-1 min-w-0">
              <input 
                type="checkbox" 
                data-testid="task-checkbox-${task.id}" 
                class="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer transition-colors"
                ${checkboxChecked}
              />
              <span data-testid="task-title-${task.id}" class="truncate text-base transition-colors ${textStyle}">
                ${this.escapeHtml(task.title)}
              </span>
              ${categoryBadge}
              ${recurrenceBadge}
              ${statusBadge}
              ${dueDateBadge}
            </div>
            <div class="flex items-center gap-2">
              <button 
                type="button" 
                data-testid="btn-task-edit-${task.id}" 
                class="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                title="Modifier"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
              </button>
              <button 
                type="button" 
                data-testid="btn-task-delete-${task.id}" 
                class="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                title="Supprimer"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
              </button>
            </div>
          </div>
        `;
        })
            .join('');
        // Attacher les écouteurs par ligne
        this.tasks.forEach((task) => {
            const checkbox = document.querySelector(`[data-testid="task-checkbox-${task.id}"]`);
            checkbox?.addEventListener('change', () => this.handleToggleTask(task.id));
            const editBtn = document.querySelector(`[data-testid="btn-task-edit-${task.id}"]`);
            editBtn?.addEventListener('click', () => this.openEditModal(task));
            const deleteBtn = document.querySelector(`[data-testid="btn-task-delete-${task.id}"]`);
            deleteBtn?.addEventListener('click', () => this.openDeleteModal(task.id));
        });
    }
    /**
     * Retourne les classes Tailwind pour la couleur d'une catégorie.
     *
     * @param color
     * @returns Classes CSS
     */
    getColorClasses(color) {
        switch (color) {
            case 'blue':
                return 'bg-blue-50 text-blue-700 border-blue-200';
            case 'emerald':
                return 'bg-emerald-50 text-emerald-700 border-emerald-200';
            case 'purple':
                return 'bg-purple-50 text-purple-700 border-purple-200';
            case 'amber':
                return 'bg-amber-50 text-amber-700 border-amber-200';
            case 'rose':
                return 'bg-rose-50 text-rose-700 border-rose-200';
            case 'slate':
                return 'bg-slate-50 text-slate-700 border-slate-200';
            case 'indigo':
            default:
                return 'bg-indigo-50 text-indigo-700 border-indigo-200';
        }
    }
    /**
     * Affiche un toast.
     *
     * @param message
     * @param type
     */
    showToast(message, type = 'success') {
        if (!this.toastEl)
            return;
        if (this.toastTimeout !== null) {
            window.clearTimeout(this.toastTimeout);
            this.toastTimeout = null;
        }
        this.toastEl.textContent = message;
        this.toastEl.className = 'fixed bottom-5 right-5 z-50 px-4 py-3 rounded-xl shadow-lg text-white font-medium text-sm flex items-center gap-2 transition-transform duration-300';
        if (type === 'success') {
            this.toastEl.classList.add('bg-emerald-600');
        }
        else {
            this.toastEl.classList.add('bg-rose-600');
        }
        this.toastEl.classList.remove('hidden', 'translate-y-12', 'opacity-0');
        this.toastTimeout = window.setTimeout(() => {
            this.toastEl.classList.add('hidden', 'translate-y-12', 'opacity-0');
            this.toastTimeout = null;
        }, 3000);
    }
    /**
     * Échappement HTML sécurisé.
     *
     * @param str
     * @returns Chaîne sécurisée
     */
    escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }
}

<div class="max-w-2xl mx-auto py-10 px-4 sm:px-6">
    <!-- En-tête -->
    <header class="mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div class="text-center sm:text-left">
            <h1 class="text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl">Ma To-Do List</h1>
            <p class="mt-1 text-sm text-slate-500">Gérez vos tâches et catégories avec simplicité et efficacité.</p>
            <div class="mt-2 flex items-center gap-2">
                <span id="badge-guest-mode" data-testid="badge-guest-mode" class="hidden inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-xs font-semibold">
                    <span class="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                    <span>Mode Invité (Stockage local)</span>
                </span>
            </div>
        </div>
        <div class="flex items-center gap-2">
            <div id="auth-header-container"></div>
            <button 
                type="button" 
                id="btn-manage-categories"
                data-testid="btn-manage-categories"
                onclick="window.todoApp?.openCategoriesModal?.()"
                class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-xs font-semibold shadow-sm transition-all cursor-pointer"
            >
                <svg class="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/></svg>
                Gérer les catégories
            </button>
            <button 
                type="button" 
                id="btn-open-add-task"
                data-testid="btn-open-add-task"
                onclick="window.todoApp?.openAddModal?.()"
                class="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 text-xs font-semibold shadow-sm transition-all cursor-pointer"
            >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
                Nouvelle tâche
            </button>
        </div>
    </header>

    <!-- Bannière d'action épurée -->
    <div class="mb-6 flex items-center justify-between p-4 bg-gradient-to-r from-indigo-50/80 via-white to-slate-50/80 rounded-2xl border border-indigo-100 shadow-sm">
        <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-sm">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
            </div>
            <div>
                <h2 class="text-sm font-bold text-slate-800">Planifier une tâche</h2>
                <p class="text-xs text-slate-500">Ajoutez une échéance, un horaire, une récurrence ou une catégorie.</p>
            </div>
        </div>
        <button 
            type="button" 
            onclick="window.todoApp?.openAddModal?.()"
            class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 text-xs font-semibold shadow-sm transition-all cursor-pointer"
        >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
            Créer
        </button>
    </div>

    <!-- Barre d'outils : Recherche et Tri -->
    <div class="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between mb-4 bg-white p-3 rounded-xl border border-slate-200/80 shadow-sm">
        <div class="relative flex-1">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            </div>
            <input 
                id="search-tasks-input"
                type="search" 
                data-testid="input-search-tasks" 
                placeholder="Rechercher par nom de tâche..." 
                class="w-full pl-9 pr-4 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
        </div>
        <div class="flex items-center gap-2">
            <label for="select-task-sort" class="text-xs font-medium text-slate-500 whitespace-nowrap">Trier par :</label>
            <select 
                id="select-task-sort"
                data-testid="select-task-sort"
                class="px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-700 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
            >
                <option value="due_asc">Échéance la plus proche</option>
                <option value="name_asc">Nom de tâche (A → Z)</option>
                <option value="name_desc">Nom de tâche (Z → A)</option>
            </select>
        </div>
    </div>

    <!-- Barre d'onglets de filtrage et filtre de catégorie -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div class="flex items-center gap-2">
            <h2 class="text-sm font-bold text-slate-700 uppercase tracking-wider">Vos tâches</h2>
            <select 
                data-testid="select-category-filter"
                class="px-2.5 py-1 rounded-lg border border-slate-200 text-slate-600 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white shadow-sm"
            >
                <option value="all">Toutes les catégories</option>
            </select>
        </div>

        <div class="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200">
            <button 
                type="button" 
                data-testid="filter-all" 
                class="px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-600 text-white shadow-sm transition-all"
            >
                Toutes
            </button>
            <button 
                type="button" 
                data-testid="filter-todo" 
                class="px-3 py-1.5 rounded-lg text-xs font-medium bg-white text-slate-600 hover:bg-slate-50 transition-all ml-1"
            >
                À faire
            </button>
            <button 
                type="button" 
                data-testid="filter-completed" 
                class="px-3 py-1.5 rounded-lg text-xs font-medium bg-white text-slate-600 hover:bg-slate-50 transition-all ml-1"
            >
                Terminées
            </button>
        </div>
    </div>

    <!-- Conteneur de la liste des tâches -->
    <div data-testid="task-list" class="space-y-3">
        <!-- Rendu dynamique par TaskComponent -->
    </div>

    <!-- État vide (empty state) -->
    <div data-testid="tasks-empty-state" class="hidden text-center py-12 px-4 bg-white rounded-2xl border border-dashed border-slate-300">
        <svg class="mx-auto h-12 w-12 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
        </svg>
        <h3 class="mt-2 text-sm font-semibold text-slate-800">Aucune tâche à afficher</h3>
        <p class="mt-1 text-xs text-slate-500">Ajoutez une tâche ou changez vos filtres pour afficher des éléments.</p>
    </div>
</div>

<!-- Modale d'ajout de tâche -->
<div data-testid="modal-add-task" class="hidden fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
    <div class="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
        <div class="flex items-center justify-between mb-5">
            <div class="flex items-center gap-2.5">
                <div class="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
                </div>
                <h3 class="text-lg font-bold text-slate-900">Nouvelle tâche</h3>
            </div>
            <button 
                type="button" 
                id="btn-close-add-modal"
                data-testid="btn-cancel-add-task"
                onclick="window.todoApp?.closeAddModal?.()"
                class="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
        </div>
        
        <form id="add-task-form" class="space-y-4">
            <div>
                <label for="task-title-input" class="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Titre de la tâche <span class="text-rose-500">*</span>
                </label>
                <input 
                    id="task-title-input"
                    type="text" 
                    data-testid="input-task-title" 
                    placeholder="Qu'avez-vous à faire aujourd'hui ?" 
                    class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition-all"
                />
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                    <label for="task-due-date-input" class="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                        Date d'échéance
                    </label>
                    <input 
                        id="task-due-date-input"
                        type="date" 
                        data-testid="input-task-due-date" 
                        class="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </div>
                <div>
                    <label for="task-due-time-input" class="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                        Horaire (optionnel)
                    </label>
                    <input 
                        id="task-due-time-input"
                        type="time" 
                        data-testid="input-task-due-time" 
                        class="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </div>
            </div>

            <div>
                <label for="task-category-select" class="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Catégorie
                </label>
                <select 
                    id="task-category-select"
                    data-testid="select-task-category"
                    class="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                    <option value="">Sans catégorie</option>
                </select>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                    <label for="task-recurrence-select" class="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                        Récurrence
                    </label>
                    <select 
                        id="task-recurrence-select"
                        data-testid="select-task-recurrence"
                        class="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                    >
                        <option value="none">Aucune</option>
                        <option value="daily">Quotidienne</option>
                        <option value="weekly">Hebdomadaire</option>
                        <option value="monthly">Mensuelle</option>
                    </select>
                </div>
                <div>
                    <label for="task-recurrence-end-input" class="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                        Jusqu'au (optionnel)
                    </label>
                    <input 
                        id="task-recurrence-end-input"
                        type="date" 
                        data-testid="input-task-recurrence-end" 
                        class="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </div>
            </div>

            <div class="mt-6 flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button 
                    type="button" 
                    id="btn-cancel-add-task-form"
                    onclick="window.todoApp?.closeAddModal?.()"
                    class="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors cursor-pointer"
                >
                    Annuler
                </button>
                <button 
                    type="submit" 
                    data-testid="btn-task-submit" 
                    class="inline-flex items-center px-4 py-2 rounded-xl bg-indigo-600 text-white font-medium text-sm hover:bg-indigo-700 shadow-sm transition-all disabled:opacity-50 cursor-pointer"
                >
                    <svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
                    Ajouter la tâche
                </button>
            </div>
        </form>
    </div>
</div>

<!-- Modale de gestion des catégories -->
<div data-testid="modal-categories" class="hidden fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
    <div class="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
        <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-bold text-slate-900">Gérer les catégories</h3>
            <button 
                type="button" 
                id="btn-close-categories-modal"
                data-testid="btn-close-categories-modal" 
                onclick="window.todoApp?.closeCategoriesModal?.()"
                class="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
        </div>

        <!-- Formulaire d'ajout de catégorie -->
        <form id="add-category-form" class="flex gap-2 mb-5">
            <input 
                type="text" 
                data-testid="input-category-name" 
                placeholder="Nouvelle catégorie (ex: Travail)" 
                class="flex-1 px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <select 
                data-testid="select-category-color" 
                class="px-2.5 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
                <option value="indigo">Indigo</option>
                <option value="blue">Bleu</option>
                <option value="emerald">Émeraude</option>
                <option value="purple">Violet</option>
                <option value="amber">Ambre</option>
                <option value="rose">Rose</option>
                <option value="slate">Ardoise</option>
            </select>
            <button 
                type="button" 
                data-testid="btn-category-submit" 
                class="px-3.5 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition-colors shadow-sm"
            >
                Ajouter
            </button>
        </form>

        <!-- Liste des catégories existantes -->
        <div class="border-t border-slate-100 pt-4">
            <h4 class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Catégories existantes</h4>
            <div id="categories-list-container" class="max-h-60 overflow-y-auto space-y-2 pr-1">
                <!-- Rendu dynamique des category-item-{id} -->
            </div>
        </div>
    </div>
</div>

<!-- Modale d'édition de tâche -->
<div data-testid="modal-edit-task" class="hidden fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
    <div class="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
        <h3 class="text-lg font-bold text-slate-900 mb-4">Modifier la tâche</h3>
        <div class="space-y-4">
            <div>
                <label for="edit-title" class="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Libellé <span class="text-rose-500">*</span>
                </label>
                <input 
                    id="edit-title" 
                    type="text" 
                    data-testid="input-edit-task-title" 
                    class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                    <label for="edit-due-date" class="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                        Date d'échéance
                    </label>
                    <input 
                        id="edit-due-date" 
                        type="date" 
                        data-testid="input-edit-task-due-date" 
                        class="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                </div>
                <div>
                    <label for="edit-due-time" class="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                        Horaire (optionnel)
                    </label>
                    <input 
                        id="edit-due-time" 
                        type="time" 
                        data-testid="input-edit-task-due-time" 
                        class="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                </div>
            </div>
            <div>
                <label for="edit-task-category-select" class="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Catégorie
                </label>
                <select 
                    id="edit-task-category-select" 
                    data-testid="select-edit-task-category" 
                    class="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                    <option value="">Sans catégorie</option>
                </select>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                    <label for="edit-task-recurrence-select" class="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                        Récurrence
                    </label>
                    <select 
                        id="edit-task-recurrence-select" 
                        data-testid="select-edit-task-recurrence" 
                        class="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                    >
                        <option value="none">Aucune</option>
                        <option value="daily">Quotidienne</option>
                        <option value="weekly">Hebdomadaire</option>
                        <option value="monthly">Mensuelle</option>
                    </select>
                </div>
                <div>
                    <label for="edit-recurrence-end" class="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                        Jusqu'au (optionnel)
                    </label>
                    <input 
                        id="edit-recurrence-end" 
                        type="date" 
                        data-testid="input-edit-task-recurrence-end" 
                        class="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                </div>
            </div>
        </div>
        <div class="mt-6 flex items-center justify-end gap-3">
            <button 
                type="button" 
                data-testid="btn-cancel-edit-task" 
                class="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors"
            >
                Annuler
            </button>
            <button 
                type="button" 
                data-testid="btn-confirm-edit-task" 
                class="px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 shadow-sm transition-colors"
            >
                Enregistrer
            </button>
        </div>
    </div>
</div>

<!-- Modale de confirmation de suppression de tâche -->
<div data-testid="modal-delete-task" class="hidden fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
    <div class="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 text-center animate-in fade-in zoom-in-95 duration-200">
        <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 mb-4">
            <svg class="h-6 w-6 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
        </div>
        <h3 class="text-base font-bold text-slate-900">Supprimer la tâche ?</h3>
        <p class="mt-2 text-xs text-slate-500">Cette action est irréversible. La tâche sera définitivement effacée de votre liste.</p>
        <div class="mt-6 flex items-center justify-center gap-3">
            <button 
                type="button" 
                data-testid="btn-cancel-delete-task" 
                class="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors"
            >
                Annuler
            </button>
            <button 
                type="button" 
                data-testid="btn-confirm-delete-task" 
                class="px-4 py-2 rounded-xl bg-rose-600 text-white text-sm font-medium hover:bg-rose-700 shadow-sm transition-colors"
            >
                Supprimer
            </button>
        </div>
    </div>
</div>

<!-- Conteneur Toast non-intrusif -->
<div data-testid="toast-notification" class="hidden fixed bottom-5 right-5 z-50 px-4 py-3 rounded-xl shadow-lg text-white font-medium text-sm flex items-center gap-2 transition-transform duration-300"></div>

<!-- Modale Authentification & Sécurité -->
<?php require __DIR__ . '/../../Auth/xxUi/auth-view.php'; ?>

const GUEST_TASKS_KEY = 'todo_guest_tasks';
const GUEST_CATEGORIES_KEY = 'todo_guest_categories';
/**
 * Service de persistance et de manipulation des données en mode Invité (LocalStorage).
 */
export class LocalStorageService {
    /**
     * Récupère la liste des tâches stockées en local.
     */
    static getGuestTasks() {
        try {
            const raw = localStorage.getItem(GUEST_TASKS_KEY);
            if (!raw)
                return [];
            const parsed = JSON.parse(raw);
            return Array.isArray(parsed) ? parsed : [];
        }
        catch {
            return [];
        }
    }
    /**
     * Sauvegarde la liste des tâches dans le localStorage.
     */
    static saveGuestTasks(tasks) {
        try {
            localStorage.setItem(GUEST_TASKS_KEY, JSON.stringify(tasks));
        }
        catch (e) {
            console.error('Erreur lors de la sauvegarde locale des tâches', e);
        }
    }
    /**
     * Récupère la liste des catégories stockées en local.
     */
    static getGuestCategories() {
        try {
            const raw = localStorage.getItem(GUEST_CATEGORIES_KEY);
            if (!raw)
                return [];
            const parsed = JSON.parse(raw);
            return Array.isArray(parsed) ? parsed : [];
        }
        catch {
            return [];
        }
    }
    /**
     * Sauvegarde la liste des catégories dans le localStorage.
     */
    static saveGuestCategories(categories) {
        try {
            localStorage.setItem(GUEST_CATEGORIES_KEY, JSON.stringify(categories));
        }
        catch (e) {
            console.error('Erreur lors de la sauvegarde locale des catégories', e);
        }
    }
    /**
     * Indique si le navigateur contient des données locales d'invité.
     */
    static hasGuestData() {
        return this.getGuestTasks().length > 0 || this.getGuestCategories().length > 0;
    }
    /**
     * Retourne le nombre de tâches locales enregistrées.
     */
    static getGuestTaskCount() {
        return this.getGuestTasks().length;
    }
    /**
     * Nettoie l'ensemble des données locales de l'invité.
     */
    static clearGuestData() {
        try {
            localStorage.removeItem(GUEST_TASKS_KEY);
            localStorage.removeItem(GUEST_CATEGORIES_KEY);
        }
        catch (e) {
            console.error('Erreur lors du nettoyage du localStorage', e);
        }
    }
    /**
     * Génère un nouvel identifiant numérique unique pour les collections locales.
     */
    static generateId(items) {
        if (items.length === 0)
            return 1;
        const max = Math.max(...items.map((i) => i.id));
        return max + 1;
    }
    /**
     * Crée une tâche locale et la persiste.
     */
    static createGuestTask(title, dueDate = null, categoryId = null, recurrence = 'none', dueTime = null, recurrenceEndDate = null) {
        const trimmedTitle = title.trim();
        if (!trimmedTitle || trimmedTitle.length > 255) {
            throw new Error('Le titre de la tâche est obligatoire (1 à 255 caractères).');
        }
        // RG-14 : Si récurrence sans date d'échéance, initialise automatiquement la date du jour
        if (recurrence && recurrence !== 'none' && !dueDate) {
            dueDate = new Date().toISOString().slice(0, 10);
        }
        const tasks = this.getGuestTasks();
        const newTask = {
            id: this.generateId(tasks),
            title: trimmedTitle,
            due_date: dueDate,
            due_time: dueTime,
            category_id: categoryId,
            recurrence,
            recurrence_end_date: recurrenceEndDate,
            completed: false,
            has_generated_next: 0,
            user_id: null,
            created_at: new Date().toISOString().slice(0, 19).replace('T', ' '),
        };
        tasks.unshift(newTask);
        this.saveGuestTasks(tasks);
        return newTask;
    }
    /**
     * Met à jour une tâche locale existante.
     */
    static updateGuestTask(id, title, dueDate = null, categoryId = null, recurrence = 'none', dueTime = null, recurrenceEndDate = null) {
        const tasks = this.getGuestTasks();
        const index = tasks.findIndex((t) => t.id === id);
        if (index === -1)
            return null;
        tasks[index] = {
            ...tasks[index],
            title,
            due_date: dueDate,
            due_time: dueTime,
            category_id: categoryId,
            recurrence,
            recurrence_end_date: recurrenceEndDate,
        };
        this.saveGuestTasks(tasks);
        return tasks[index];
    }
    /**
     * Bascule l'état d'achèvement d'une tâche locale (avec support de l'auto-génération récurrente).
     */
    static toggleGuestTask(id) {
        const tasks = this.getGuestTasks();
        const index = tasks.findIndex((t) => t.id === id);
        if (index === -1) {
            return { recurrence_generated: false, recurrence_ended: false };
        }
        const task = tasks[index];
        const willBeCompleted = !task.completed;
        task.completed = willBeCompleted;
        let recurrence_generated = false;
        let recurrence_ended = false;
        // Si on marque la tâche terminée, qu'elle est récurrente et n'a pas encore généré la suivante
        if (willBeCompleted && task.recurrence && task.recurrence !== 'none' && !task.has_generated_next) {
            const baseDate = task.due_date || new Date().toISOString().slice(0, 10);
            const nextDate = this.calculateNextDueDate(baseDate, task.recurrence);
            // Vérification de la date limite de récurrence
            const shouldGenerate = !task.recurrence_end_date || nextDate <= task.recurrence_end_date;
            if (shouldGenerate) {
                task.has_generated_next = 1;
                recurrence_generated = true;
                const nextTask = {
                    id: this.generateId(tasks),
                    title: task.title,
                    due_date: nextDate,
                    due_time: task.due_time,
                    category_id: task.category_id,
                    recurrence: task.recurrence,
                    recurrence_end_date: task.recurrence_end_date,
                    completed: false,
                    has_generated_next: 0,
                    user_id: null,
                    created_at: new Date().toISOString().slice(0, 19).replace('T', ' '),
                };
                tasks.push(nextTask);
            }
            else {
                recurrence_ended = true;
            }
        }
        this.saveGuestTasks(tasks);
        return { recurrence_generated, recurrence_ended };
    }
    /**
     * Récupère les tâches locales filtrées, triées et hydratées avec les informations de catégorie.
     */
    static getFilteredAndSortedGuestTasks(filter = 'all', categoryId = null, search = '', sort = 'due_asc') {
        const rawTasks = this.getGuestTasks();
        const categories = this.getGuestCategories();
        const catMap = new Map(categories.map((c) => [c.id, c]));
        // Hydratation catégorie
        let tasks = rawTasks.map((t) => {
            const cat = t.category_id ? catMap.get(t.category_id) : undefined;
            return {
                ...t,
                category_name: cat ? cat.name : null,
                category_color: cat ? cat.color : null,
            };
        });
        // Filtre statut
        if (filter === 'todo') {
            tasks = tasks.filter((t) => !t.completed);
        }
        else if (filter === 'completed') {
            tasks = tasks.filter((t) => !!t.completed);
        }
        // Filtre catégorie
        if (categoryId !== null) {
            tasks = tasks.filter((t) => t.category_id === categoryId);
        }
        // Filtre recherche textuelle
        if (search && search.trim() !== '') {
            const q = search.trim().toLowerCase();
            tasks = tasks.filter((t) => t.title.toLowerCase().includes(q));
        }
        // Tri
        tasks.sort((a, b) => {
            if (sort === 'name_asc') {
                return a.title.localeCompare(b.title, 'fr', { sensitivity: 'base' });
            }
            if (sort === 'name_desc') {
                return b.title.localeCompare(a.title, 'fr', { sensitivity: 'base' });
            }
            // Par défaut 'due_asc' : tâches avec échéance la plus proche en premier, nulles à la fin
            if (a.due_date === null && b.due_date !== null)
                return 1;
            if (a.due_date !== null && b.due_date === null)
                return -1;
            if (a.due_date !== null && b.due_date !== null) {
                if (a.due_date !== b.due_date) {
                    return a.due_date.localeCompare(b.due_date);
                }
                // Même jour, comparer l'heure
                const timeA = a.due_time || '99:99';
                const timeB = b.due_time || '99:99';
                if (timeA !== timeB) {
                    return timeA.localeCompare(timeB);
                }
            }
            return b.id - a.id;
        });
        return tasks;
    }
    /**
     * Supprime une tâche locale.
     */
    static deleteGuestTask(id) {
        const tasks = this.getGuestTasks();
        const initialLen = tasks.length;
        const filtered = tasks.filter((t) => t.id !== id);
        if (filtered.length !== initialLen) {
            this.saveGuestTasks(filtered);
            return true;
        }
        return false;
    }
    /**
     * Crée une catégorie locale.
     */
    static createGuestCategory(name, color = 'indigo') {
        const trimmed = name.trim();
        if (!trimmed || trimmed.length > 50) {
            throw new Error('Le nom de la catégorie est obligatoire (1 à 50 caractères).');
        }
        const categories = this.getGuestCategories();
        const exists = categories.some((c) => c.name.toLowerCase() === trimmed.toLowerCase());
        if (exists) {
            throw new Error('Une catégorie portant ce nom existe déjà.');
        }
        const newCat = {
            id: this.generateId(categories),
            name: trimmed,
            color,
            user_id: null,
            created_at: new Date().toISOString().slice(0, 19).replace('T', ' '),
        };
        categories.push(newCat);
        this.saveGuestCategories(categories);
        return newCat;
    }
    /**
     * Supprime une catégorie locale et délie les tâches associées.
     */
    static deleteGuestCategory(id) {
        const categories = this.getGuestCategories();
        const filtered = categories.filter((c) => c.id !== id);
        if (filtered.length === categories.length)
            return false;
        this.saveGuestCategories(filtered);
        // Déclassement des tâches associées
        const tasks = this.getGuestTasks();
        let tasksModified = false;
        tasks.forEach((t) => {
            if (t.category_id === id) {
                t.category_id = null;
                tasksModified = true;
            }
        });
        if (tasksModified) {
            this.saveGuestTasks(tasks);
        }
        return true;
    }
    /**
     * Calcule la date suivante pour une fréquence donnée.
     */
    static calculateNextDueDate(dateStr, recurrence) {
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) {
            const now = new Date();
            return now.toISOString().slice(0, 10);
        }
        if (recurrence === 'daily') {
            d.setDate(d.getDate() + 1);
        }
        else if (recurrence === 'weekly') {
            d.setDate(d.getDate() + 7);
        }
        else if (recurrence === 'monthly') {
            d.setMonth(d.getMonth() + 1);
        }
        return d.toISOString().slice(0, 10);
    }
}

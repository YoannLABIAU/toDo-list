import { ApiResponse, RecurrenceType, Task } from './types.js';
import { getSecurityHeaders } from '../../../core/Ui/CsrfHelper.js';

/**
 * Service gérant les communications HTTP avec l'API backend pour les tâches.
 */
export class TaskService {
  private baseUrl = '/api/v1/tasks';

  /**
   * Récupère la liste des tâches selon les filtres, la recherche et le tri sélectionnés.
   *
   * @param filter Filtre de statut ('all' | 'todo' | 'completed')
   * @param categoryId Filtre de catégorie (id numérique ou null pour toutes)
   * @param search Terme de recherche textuelle
   * @param sort Critère de tri ('due_asc' | 'name_asc' | 'name_desc')
   * @returns Liste des tâches
   */
  public async getTasks(
    filter: string = 'all', 
    categoryId: number | null = null,
    search: string | null = null,
    sort: string = 'due_asc'
  ): Promise<Task[]> {
    const params = new URLSearchParams();
    if (filter !== 'all') {
      params.append('filter', filter);
    }
    if (categoryId !== null) {
      params.append('category_id', String(categoryId));
    }
    if (search && search.trim() !== '') {
      params.append('search', search.trim());
    }
    if (sort && sort !== 'due_asc') {
      params.append('sort', sort);
    }

    const qs = params.toString();
    const url = qs ? `${this.baseUrl}?${qs}` : this.baseUrl;

    const response = await fetch(url);
    const json: ApiResponse<Task[]> = await response.json();

    if (!json.success || !json.data) {
      throw new Error(json.error || 'Erreur lors de la récupération des tâches');
    }

    return json.data;
  }

  /**
   * Crée une nouvelle tâche avec catégorie, récurrence, horaire et fin de récurrence optionnelles.
   *
   * @param title Libellé de la tâche
   * @param dueDate Date d'échéance optionnelle (YYYY-MM-DD)
   * @param categoryId Identifiant de catégorie optionnel
   * @param recurrence Fréquence de récurrence ('none' | 'daily' | 'weekly' | 'monthly')
   * @param dueTime Horaire d'échéance optionnel (HH:MM)
   * @param recurrenceEndDate Date limite de récurrence optionnelle (YYYY-MM-DD)
   * @returns La tâche créée
   */
  public async createTask(
    title: string, 
    dueDate: string | null, 
    categoryId: number | null = null, 
    recurrence: RecurrenceType = 'none',
    dueTime: string | null = null,
    recurrenceEndDate: string | null = null
  ): Promise<Task> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: getSecurityHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({
        title,
        due_date: dueDate || null,
        category_id: categoryId,
        recurrence,
        due_time: dueTime || null,
        recurrence_end_date: recurrenceEndDate || null,
      }),
    });

    const json: ApiResponse<Task> = await response.json();
    if (!json.success || !json.data) {
      throw new Error(json.error || 'Erreur lors de la création de la tâche');
    }

    return json.data;
  }

  /**
   * Met à jour une tâche existante.
   *
   * @param id Identifiant de la tâche
   * @param title Nouveau libellé
   * @param dueDate Nouvelle date d'échéance
   * @param categoryId Nouvelle catégorie
   * @param recurrence Fréquence de récurrence
   * @param dueTime Nouvel horaire d'échéance
   * @param recurrenceEndDate Nouvelle date limite de récurrence
   * @returns La tâche mise à jour
   */
  public async updateTask(
    id: number, 
    title: string, 
    dueDate: string | null, 
    categoryId: number | null = null, 
    recurrence: RecurrenceType = 'none',
    dueTime: string | null = null,
    recurrenceEndDate: string | null = null
  ): Promise<Task> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'PUT',
      headers: getSecurityHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({
        title,
        due_date: dueDate || null,
        category_id: categoryId,
        recurrence,
        due_time: dueTime || null,
        recurrence_end_date: recurrenceEndDate || null,
      }),
    });

    const json: ApiResponse<Task> = await response.json();
    if (!json.success || !json.data) {
      throw new Error(json.error || 'Erreur lors de la modification de la tâche');
    }

    return json.data;
  }

  /**
   * Bascule le statut d'achèvement d'une tâche.
   *
   * @param id Identifiant de la tâche
   * @returns La tâche avec son statut inversé
   */
  public async toggleTask(id: number): Promise<Task> {
    const response = await fetch(`${this.baseUrl}/${id}/toggle`, {
      method: 'PATCH',
      headers: getSecurityHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({}),
    });

    const json: ApiResponse<Task> = await response.json();
    if (!json.success || !json.data) {
      throw new Error(json.error || 'Erreur lors du changement de statut');
    }

    return json.data;
  }

  /**
   * Supprime définitivement une tâche.
   *
   * @param id Identifiant de la tâche
   * @returns true si supprimée avec succès
   */
  public async deleteTask(id: number): Promise<boolean> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'DELETE',
      headers: getSecurityHeaders(),
    });

    const json: ApiResponse<{ id: number; deleted: boolean }> = await response.json();
    if (!json.success) {
      throw new Error(json.error || 'Erreur lors de la suppression');
    }

    return true;
  }
}

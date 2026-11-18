import { ApiResponse, Category } from '../../Task/xxUi/types.js';
import { getSecurityHeaders } from '../../../core/Ui/CsrfHelper.js';

/**
 * Service pour la communication HTTP avec l'API des catégories.
 */
export class CategoryService {
  private baseUrl = '/api/v1/categories';

  /**
   * Récupère la liste de toutes les catégories.
   *
   * @returns Liste des catégories
   */
  public async getCategories(): Promise<Category[]> {
    const response = await fetch(this.baseUrl);
    const json: ApiResponse<Category[]> = await response.json();

    if (!json.success || !json.data) {
      throw new Error(json.error || 'Erreur lors de la récupération des catégories');
    }

    return json.data;
  }

  /**
   * Crée une nouvelle catégorie.
   *
   * @param name Nom de la catégorie
   * @param color Couleur sémantique
   * @returns La catégorie créée
   */
  public async createCategory(name: string, color: string = 'indigo'): Promise<Category> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: getSecurityHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ name, color }),
    });

    const json: ApiResponse<Category> = await response.json();
    if (!json.success || !json.data) {
      throw new Error(json.error || 'Erreur lors de la création de la catégorie');
    }

    return json.data;
  }

  /**
   * Supprime une catégorie.
   *
   * @param id Identifiant de la catégorie
   * @returns true si supprimée
   */
  public async deleteCategory(id: number): Promise<boolean> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'DELETE',
      headers: getSecurityHeaders(),
    });

    const json: ApiResponse<{ id: number; deleted: boolean }> = await response.json();
    if (!json.success) {
      throw new Error(json.error || 'Erreur lors de la suppression de la catégorie');
    }

    return json.data !== undefined ? true : true;
  }
}

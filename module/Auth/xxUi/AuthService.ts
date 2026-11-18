import { getSecurityHeaders } from '../../../core/Ui/CsrfHelper.js';

/**
 * Interface représentant un utilisateur côté client.
 */
export interface UserDto {
  id: number;
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  created_at: string;
}

/**
 * Réponse générique normalisée de l'API.
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  code: number;
  data?: T;
  error?: string;
}

/**
 * Service gérant les communications HTTP avec les endpoints d'authentification.
 */
export class AuthService {
  /**
   * Récupère l'utilisateur actuellement connecté ou null.
   */
  public async getMe(): Promise<UserDto | null> {
    try {
      const res = await fetch('/api/v1/auth/me', {
        headers: { 'Accept': 'application/json' },
      });
      const json: ApiResponse<{ user: UserDto | null }> = await res.json();
      return json.success && json.data?.user ? json.data.user : null;
    } catch {
      return null;
    }
  }

  /**
   * Inscrit un nouvel utilisateur et démarre sa session.
   */
  public async register(payload: {
    first_name: string;
    last_name: string;
    username: string;
    email: string;
    password: string;
    password_confirm: string;
  }): Promise<ApiResponse<{ user: UserDto }>> {
    const res = await fetch('/api/v1/auth/register', {
      method: 'POST',
      headers: getSecurityHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(payload),
    });
    return res.json();
  }

  /**
   * Authentifie un utilisateur existant.
   */
  public async login(payload: {
    username_or_email: string;
    password: string;
  }): Promise<ApiResponse<{ user: UserDto }>> {
    const res = await fetch('/api/v1/auth/login', {
      method: 'POST',
      headers: getSecurityHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(payload),
    });
    return res.json();
  }

  /**
   * Déconnecte l'utilisateur et détruit sa session serveur.
   */
  public async logout(): Promise<ApiResponse<{ message: string }>> {
    const res = await fetch('/api/v1/auth/logout', {
      method: 'POST',
      headers: getSecurityHeaders(),
    });
    return res.json();
  }

  /**
   * Demande l'envoi d'un code OTP par email pour réinitialiser le mot de passe.
   */
  public async forgotPassword(email: string): Promise<ApiResponse<{ message: string; dev_otp?: string }>> {
    const res = await fetch('/api/v1/auth/forgot-password', {
      method: 'POST',
      headers: getSecurityHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ email }),
    });
    return res.json();
  }

  /**
   * Valide le code OTP et applique le nouveau mot de passe.
   */
  public async resetPassword(payload: {
    email: string;
    otp: string;
    new_password: string;
    new_password_confirm: string;
  }): Promise<ApiResponse<{ message: string }>> {
    const res = await fetch('/api/v1/auth/reset-password', {
      method: 'POST',
      headers: getSecurityHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(payload),
    });
    return res.json();
  }
}

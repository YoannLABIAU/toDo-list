import { getSecurityHeaders } from '../../../core/Ui/CsrfHelper.js';
/**
 * Service gérant les communications HTTP avec les endpoints d'authentification.
 */
export class AuthService {
    /**
     * Récupère l'utilisateur actuellement connecté ou null.
     */
    async getMe() {
        try {
            const res = await fetch('/api/v1/auth/me', {
                headers: { 'Accept': 'application/json' },
            });
            const json = await res.json();
            return json.success && json.data?.user ? json.data.user : null;
        }
        catch {
            return null;
        }
    }
    /**
     * Inscrit un nouvel utilisateur et démarre sa session.
     */
    async register(payload) {
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
    async login(payload) {
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
    async logout() {
        const res = await fetch('/api/v1/auth/logout', {
            method: 'POST',
            headers: getSecurityHeaders(),
        });
        return res.json();
    }
    /**
     * Demande l'envoi d'un code OTP par email pour réinitialiser le mot de passe.
     */
    async forgotPassword(email) {
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
    async resetPassword(payload) {
        const res = await fetch('/api/v1/auth/reset-password', {
            method: 'POST',
            headers: getSecurityHeaders({ 'Content-Type': 'application/json' }),
            body: JSON.stringify(payload),
        });
        return res.json();
    }
}

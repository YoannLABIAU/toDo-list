/**
 * Utilitaire pour extraire et fournir le jeton CSRF côté client.
 */
export function getCsrfToken(): string {
  const meta = document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement | null;
  return meta?.content || '';
}

/**
 * Rafraîchit le jeton CSRF auprès du backend et met à jour la balise meta.
 *
 * @returns Le nouveau jeton CSRF
 */
export async function refreshCsrfToken(): Promise<string> {
  try {
    const res = await fetch('/api/v1/auth/csrf');
    const json = await res.json();
    if (json.success && json.data?.csrf_token) {
      let meta = document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement | null;
      if (!meta) {
        meta = document.createElement('meta');
        meta.name = 'csrf-token';
        document.head.appendChild(meta);
      }
      meta.content = json.data.csrf_token;
      return json.data.csrf_token;
    }
  } catch {
    // Échec silencieux
  }
  return getCsrfToken();
}

/**
 * Retourne les en-têtes HTTP de sécurité pour les requêtes mutatives (POST, PUT, PATCH, DELETE).
 *
 * @param additionalHeaders En-têtes additionnels optionnels
 * @returns Objet d'en-têtes prêt pour fetch()
 */
export function getSecurityHeaders(additionalHeaders: Record<string, string> = {}): Record<string, string> {
  const token = getCsrfToken();
  return {
    'Accept': 'application/json',
    'X-CSRF-Token': token,
    ...additionalHeaders,
  };
}

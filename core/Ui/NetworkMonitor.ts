/**
 * Moniteur de connectivité réseau (RG-42).
 * Détecte les transitions hors-ligne et en-ligne pour alerter l'utilisateur et sécuriser les interactions.
 */
export class NetworkMonitor {
  private static bannerEl: HTMLElement | null = null;
  private static onlineToastEl: HTMLElement | null = null;
  private static onlineToastTimeout: number | null = null;

  /**
   * Initialise les écouteurs d'événements réseau et l'état initial.
   */
  public static init(): void {
    this.bannerEl = document.querySelector('[data-testid="banner-offline"]');

    window.addEventListener('offline', () => this.handleOffline());
    window.addEventListener('online', () => this.handleOnline());

    // Vérification initiale
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      this.handleOffline();
    }
  }

  /**
   * Vérifie si le client dispose d'une connexion réseau active.
   *
   * @returns true si en ligne, false si hors ligne
   */
  public static isOnline(): boolean {
    return typeof navigator === 'undefined' || navigator.onLine;
  }

  /**
   * Gestionnaire de passage hors-ligne.
   */
  private static handleOffline(): void {
    if (!this.bannerEl) {
      this.bannerEl = document.querySelector('[data-testid="banner-offline"]');
    }

    if (this.bannerEl) {
      this.bannerEl.classList.remove('hidden');
    }
  }

  /**
   * Gestionnaire de retour en ligne.
   */
  private static handleOnline(): void {
    if (this.bannerEl) {
      this.bannerEl.classList.add('hidden');
    }

    this.showOnlineToast('Connexion rétablie.');
  }

  /**
   * Affiche le toast de confirmation de rétablissement de la connectivité.
   *
   * @param message Message informatif
   */
  private static showOnlineToast(message: string): void {
    if (!this.onlineToastEl) {
      let toast = document.querySelector('[data-testid="toast-online"]') as HTMLElement | null;
      if (!toast) {
        toast = document.createElement('div');
        toast.setAttribute('data-testid', 'toast-online');
        toast.className = 'fixed bottom-5 left-5 z-50 px-4 py-3 rounded-xl shadow-lg bg-emerald-600 text-white font-medium text-xs sm:text-sm flex items-center gap-2 transition-all duration-300';
        document.body.appendChild(toast);
      }
      this.onlineToastEl = toast;
    }

    if (this.onlineToastTimeout !== null) {
      window.clearTimeout(this.onlineToastTimeout);
    }

    this.onlineToastEl.innerHTML = `
      <svg class="w-4 h-4 shrink-0 text-emerald-100" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
      <span>${message}</span>
    `;
    this.onlineToastEl.classList.remove('hidden', 'opacity-0');

    this.onlineToastTimeout = window.setTimeout(() => {
      this.onlineToastEl?.classList.add('opacity-0', 'hidden');
    }, 4000);
  }
}

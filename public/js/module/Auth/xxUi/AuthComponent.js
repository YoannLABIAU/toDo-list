import { AuthService } from './AuthService.js';
import { withButtonLock } from '../../../core/Ui/ButtonLock.js';
import { getSecurityHeaders, refreshCsrfToken } from '../../../core/Ui/CsrfHelper.js';
import { LocalStorageService } from '../../../core/Ui/LocalStorageService.js';
/**
 * Composant contrôlant l'interface d'authentification (connexion, inscription, mot de passe oublié).
 */
export class AuthComponent {
    authService;
    currentUser = null;
    usernameManuallyEdited = false;
    onAuthChangedCallback;
    constructor(onAuthChanged) {
        this.authService = new AuthService();
        this.onAuthChangedCallback = onAuthChanged;
    }
    /**
     * Initialise le composant et vérifie l'état de la session serveur.
     */
    async init() {
        this.bindEvents();
        await this.checkSession();
    }
    /**
     * Vérifie la session active auprès du backend.
     */
    async checkSession() {
        this.currentUser = await this.authService.getMe();
        this.renderUserHeader();
        if (this.onAuthChangedCallback) {
            this.onAuthChangedCallback(this.currentUser);
        }
        return this.currentUser;
    }
    getCurrentUser() {
        return this.currentUser;
    }
    /**
     * Associe les écouteurs d'événements du DOM.
     */
    bindEvents() {
        // Bouton de navigation vers la modale auth
        const navLoginBtn = document.getElementById('btn-nav-login');
        navLoginBtn?.addEventListener('click', () => this.openModal('login'));
        // Bouton de déconnexion
        const logoutBtn = document.getElementById('btn-logout');
        logoutBtn?.addEventListener('click', () => this.handleLogout());
        // Fermeture de la modale
        const closeBtn = document.getElementById('btn-close-auth-modal');
        closeBtn?.addEventListener('click', () => this.closeModal());
        const modal = document.getElementById('modal-auth');
        modal?.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeModal();
            }
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !modal?.classList.contains('hidden')) {
                this.closeModal();
            }
        });
        // Bascules entre formulaires
        document.getElementById('link-to-register')?.addEventListener('click', () => this.switchMode('register'));
        document.getElementById('link-to-login')?.addEventListener('click', () => this.switchMode('login'));
        document.getElementById('link-to-forgot-password')?.addEventListener('click', () => this.switchMode('forgot'));
        document.getElementById('link-back-to-login')?.addEventListener('click', () => this.switchMode('login'));
        // RG-27 : Pré-proposition d'identifiant en temps réel
        const firstnameInput = document.getElementById('register-firstname');
        const lastnameInput = document.getElementById('register-lastname');
        const usernameInput = document.getElementById('register-username');
        usernameInput?.addEventListener('input', () => {
            // Si l'utilisateur saisit manuellement, on respecte son choix
            if (usernameInput.value.trim() !== '') {
                this.usernameManuallyEdited = true;
            }
        });
        const updateSuggestedUsername = () => {
            if (this.usernameManuallyEdited || !usernameInput) {
                return;
            }
            const fn = (firstnameInput?.value || '').trim();
            const ln = (lastnameInput?.value || '').trim();
            const normalize = (str) => str
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .toLowerCase()
                .replace(/[^a-z0-9]/g, '');
            if (fn && ln) {
                usernameInput.value = (fn.charAt(0) + ln).slice(0, 20).toLowerCase();
            }
            else if (ln) {
                usernameInput.value = normalize(ln).slice(0, 20);
            }
            else if (fn) {
                usernameInput.value = normalize(fn).slice(0, 20);
            }
        };
        firstnameInput?.addEventListener('input', updateSuggestedUsername);
        lastnameInput?.addEventListener('input', updateSuggestedUsername);
        // Indicateur de sûreté de mot de passe (RG-29)
        const registerPassInput = document.getElementById('register-password');
        registerPassInput?.addEventListener('input', () => {
            this.updatePasswordStrength(registerPassInput.value);
        });
        // Soumission Inscription
        const registerForm = document.getElementById('form-auth-register');
        registerForm?.addEventListener('submit', (e) => this.handleRegister(e));
        // Soumission Connexion
        const loginForm = document.getElementById('form-auth-login');
        loginForm?.addEventListener('submit', (e) => this.handleLogin(e));
        // Soumission Demande OTP
        document.getElementById('btn-submit-forgot-request')?.addEventListener('click', () => this.handleForgotRequest());
        // Soumission Réinitialisation OTP
        const forgotForm = document.getElementById('form-auth-forgot');
        forgotForm?.addEventListener('submit', (e) => this.handleForgotReset(e));
        // Modale de migration locale (RG-45)
        document.getElementById('btn-confirm-migration')?.addEventListener('click', () => this.handleConfirmMigration());
        document.getElementById('btn-skip-migration')?.addEventListener('click', () => {
            this.closeMigrationModal();
            if (this.onAuthChangedCallback) {
                this.onAuthChangedCallback(this.currentUser);
            }
        });
    }
    /**
     * Ouvre la modale d'authentification dans le mode spécifié.
     */
    openModal(mode = 'login') {
        refreshCsrfToken();
        const modal = document.getElementById('modal-auth');
        if (!modal)
            return;
        this.clearAlerts();
        this.switchMode(mode);
        modal.classList.remove('hidden');
        // Autofocus
        if (mode === 'login') {
            document.getElementById('login-username')?.focus();
        }
        else if (mode === 'register') {
            document.getElementById('register-firstname')?.focus();
        }
        else if (mode === 'forgot') {
            document.getElementById('forgot-email')?.focus();
        }
    }
    /**
     * Ferme la modale d'authentification.
     */
    closeModal() {
        const modal = document.getElementById('modal-auth');
        modal?.classList.add('hidden');
        this.clearAlerts();
    }
    /**
     * Bascule entre les 3 formulaires internes de la modale.
     */
    switchMode(mode) {
        this.clearAlerts();
        const loginForm = document.getElementById('form-auth-login');
        const registerForm = document.getElementById('form-auth-register');
        const forgotForm = document.getElementById('form-auth-forgot');
        const titleEl = document.getElementById('auth-modal-title');
        const subtitleEl = document.getElementById('auth-modal-subtitle');
        loginForm?.classList.add('hidden');
        registerForm?.classList.add('hidden');
        forgotForm?.classList.add('hidden');
        if (mode === 'login') {
            loginForm?.classList.remove('hidden');
            if (titleEl)
                titleEl.textContent = 'Connexion';
            if (subtitleEl)
                subtitleEl.textContent = 'Entrez vos identifiants pour continuer';
        }
        else if (mode === 'register') {
            registerForm?.classList.remove('hidden');
            if (titleEl)
                titleEl.textContent = 'Création de compte';
            if (subtitleEl)
                subtitleEl.textContent = 'Rejoignez votre espace To-Do List';
        }
        else if (mode === 'forgot') {
            forgotForm?.classList.remove('hidden');
            document.getElementById('forgot-step-1')?.classList.remove('hidden');
            document.getElementById('forgot-step-2')?.classList.add('hidden');
            if (titleEl)
                titleEl.textContent = 'Mot de passe oublié';
            if (subtitleEl)
                subtitleEl.textContent = 'Récupération d\'accès par code OTP';
        }
    }
    /**
     * Met à jour l'indicateur visuel de force de mot de passe.
     */
    updatePasswordStrength(password) {
        const fill = document.getElementById('password-strength-fill');
        const text = document.getElementById('password-strength-text');
        if (!fill || !text)
            return;
        let score = 0;
        if (password.length >= 8)
            score++;
        if (/[A-Z]/.test(password))
            score++;
        if (/[a-z]/.test(password))
            score++;
        if (/[0-9]/.test(password))
            score++;
        if (password.length === 0) {
            fill.style.width = '0%';
            fill.className = 'h-full bg-slate-200';
            text.textContent = '8+ car., Maj, Min, Chiffre';
            return;
        }
        if (score <= 2) {
            fill.style.width = '33%';
            fill.className = 'h-full bg-rose-500';
            text.textContent = 'Faible (min 8 car., 1 maj, 1 chiffre)';
        }
        else if (score === 3) {
            fill.style.width = '66%';
            fill.className = 'h-full bg-amber-500';
            text.textContent = 'Moyen';
        }
        else {
            fill.style.width = '100%';
            fill.className = 'h-full bg-emerald-500';
            text.textContent = 'Mot de passe robuste';
        }
    }
    /**
     * Traitement de l'inscription.
     */
    async handleRegister(e) {
        e.preventDefault();
        this.clearAlerts();
        const firstName = document.getElementById('register-firstname')?.value.trim();
        const lastName = document.getElementById('register-lastname')?.value.trim();
        const username = document.getElementById('register-username')?.value.trim();
        const email = document.getElementById('register-email')?.value.trim();
        const password = document.getElementById('register-password')?.value || '';
        const passwordConfirm = document.getElementById('register-password-confirm')?.value || '';
        // Validation RG-29 côté client
        if (password.length < 8 || !/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password)) {
            this.showError('Le mot de passe doit comporter au moins 8 caractères, une majuscule, une minuscule et un chiffre.');
            return;
        }
        if (password !== passwordConfirm) {
            this.showError('La confirmation du mot de passe ne correspond pas.');
            return;
        }
        const submitBtn = document.querySelector('[data-testid="btn-submit-register"]');
        await withButtonLock(submitBtn, async () => {
            const res = await this.authService.register({
                first_name: firstName,
                last_name: lastName,
                username,
                email,
                password,
                password_confirm: passwordConfirm,
            });
            if (!res.success || !res.data) {
                this.showError(res.error || 'Erreur lors de l\'inscription.');
                return;
            }
            this.currentUser = res.data.user;
            this.renderUserHeader();
            this.closeModal();
            this.showToast('Compte créé avec succès ! Bienvenue ' + this.currentUser.first_name);
            // RG-45 : Détection des données locales et proposition de migration
            if (LocalStorageService.hasGuestData()) {
                this.openMigrationModal();
            }
            else if (this.onAuthChangedCallback) {
                this.onAuthChangedCallback(this.currentUser);
            }
        }, 'Création du compte...');
    }
    /**
     * Traitement de la connexion.
     */
    async handleLogin(e) {
        e.preventDefault();
        this.clearAlerts();
        const identifier = document.getElementById('login-username')?.value.trim();
        const password = document.getElementById('login-password')?.value || '';
        if (!identifier || !password) {
            this.showError('Veuillez renseigner votre identifiant et votre mot de passe.');
            return;
        }
        const submitBtn = document.querySelector('[data-testid="btn-submit-login"]');
        await withButtonLock(submitBtn, async () => {
            const res = await this.authService.login({
                username_or_email: identifier,
                password,
            });
            if (!res.success || !res.data) {
                this.showError(res.error || 'Identifiant ou mot de passe incorrect.');
                return;
            }
            this.currentUser = res.data.user;
            this.renderUserHeader();
            this.closeModal();
            this.showToast('Connexion réussie. Ravi de vous revoir !');
            if (this.onAuthChangedCallback) {
                this.onAuthChangedCallback(this.currentUser);
            }
        }, 'Connexion...');
    }
    /**
     * Traitement de la déconnexion.
     */
    async handleLogout() {
        await this.authService.logout();
        await refreshCsrfToken();
        this.currentUser = null;
        this.renderUserHeader();
        this.showToast('Vous avez été déconnecté.');
        if (this.onAuthChangedCallback) {
            this.onAuthChangedCallback(null);
        }
    }
    /**
     * Demande de code OTP pour mot de passe oublié.
     */
    async handleForgotRequest() {
        this.clearAlerts();
        const email = document.getElementById('forgot-email')?.value.trim();
        if (!email) {
            this.showError('Veuillez saisir votre adresse email.');
            return;
        }
        const submitBtn = document.querySelector('[data-testid="btn-submit-forgot-request"]');
        await withButtonLock(submitBtn, async () => {
            const res = await this.authService.forgotPassword(email);
            if (!res.success) {
                this.showError(res.error || 'Erreur lors de la demande OTP.');
                return;
            }
            this.showInfo(res.data?.message || 'Code OTP envoyé sur votre boîte mail.');
            document.getElementById('forgot-step-1')?.classList.add('hidden');
            document.getElementById('forgot-step-2')?.classList.remove('hidden');
            // Si code dev/test disponible, pré-remplissage pour tests automatisés rapides
            if (res.data?.dev_otp) {
                const otpInput = document.getElementById('forgot-otp');
                if (otpInput && !otpInput.value) {
                    otpInput.value = res.data.dev_otp;
                }
            }
        }, 'Envoi en cours...');
    }
    /**
     * Réinitialisation effective du mot de passe via OTP.
     */
    async handleForgotReset(e) {
        e.preventDefault();
        this.clearAlerts();
        const email = document.getElementById('forgot-email')?.value.trim();
        const otp = document.getElementById('forgot-otp')?.value.trim();
        const newPassword = document.getElementById('forgot-new-password')?.value || '';
        const newPasswordConfirm = document.getElementById('forgot-new-password-confirm')?.value || '';
        if (newPassword.length < 8 || !/[A-Z]/.test(newPassword) || !/[a-z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
            this.showError('Le mot de passe doit comporter au moins 8 caractères, une majuscule, une minuscule et un chiffre.');
            return;
        }
        if (newPassword !== newPasswordConfirm) {
            this.showError('La confirmation du mot de passe ne correspond pas.');
            return;
        }
        const submitBtn = document.querySelector('[data-testid="btn-submit-forgot-reset"]');
        await withButtonLock(submitBtn, async () => {
            const res = await this.authService.resetPassword({
                email,
                otp,
                new_password: newPassword,
                new_password_confirm: newPasswordConfirm,
            });
            if (!res.success) {
                this.showError(res.error || 'Code OTP invalide ou expiré.');
                return;
            }
            this.showToast('Mot de passe réinitialisé avec succès ! Vous pouvez maintenant vous connecter.');
            this.switchMode('login');
            const loginIdent = document.getElementById('login-username');
            if (loginIdent) {
                loginIdent.value = email;
            }
        }, 'Modification...');
    }
    /**
     * Rendu de la zone utilisateur dans le header principal de l'application.
     */
    renderUserHeader() {
        const authContainer = document.getElementById('auth-header-container');
        if (!authContainer)
            return;
        if (this.currentUser) {
            authContainer.innerHTML = `
        <div class="flex items-center gap-2">
          <div class="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200/80 text-xs font-semibold text-slate-700 shadow-xs">
            <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span id="user-display-name">${this.escapeHtml(this.currentUser.first_name)} (${this.escapeHtml(this.currentUser.username)})</span>
          </div>
          <button 
            type="button" 
            id="btn-logout"
            data-testid="btn-logout"
            class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-rose-600 hover:bg-rose-50 text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            title="Se déconnecter"
          >
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
            <span>Déconnexion</span>
          </button>
        </div>
      `;
            document.getElementById('btn-logout')?.addEventListener('click', () => this.handleLogout());
        }
        else {
            authContainer.innerHTML = `
        <button 
          type="button" 
          id="btn-nav-login"
          data-testid="btn-nav-login"
          class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-800 text-white hover:bg-slate-900 text-xs font-semibold shadow-xs transition-colors cursor-pointer"
        >
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
          <span>Espace Membre</span>
        </button>
      `;
            document.getElementById('btn-nav-login')?.addEventListener('click', () => this.openModal('login'));
        }
    }
    showError(msg) {
        const box = document.getElementById('auth-form-error');
        const text = document.getElementById('auth-form-error-text');
        if (box && text) {
            text.textContent = msg;
            box.classList.remove('hidden');
        }
    }
    showInfo(msg) {
        const box = document.getElementById('auth-form-info');
        const text = document.getElementById('auth-form-info-text');
        if (box && text) {
            text.textContent = msg;
            box.classList.remove('hidden');
        }
    }
    clearAlerts() {
        document.getElementById('auth-form-error')?.classList.add('hidden');
        document.getElementById('auth-form-info')?.classList.add('hidden');
    }
    showToast(message, type = 'success') {
        const toast = document.querySelector('[data-testid="toast-notification"]');
        if (toast) {
            toast.textContent = message;
            toast.className = 'fixed bottom-5 right-5 z-50 px-4 py-3 rounded-xl shadow-lg text-white font-medium text-sm flex items-center gap-2 transition-transform duration-300';
            if (type === 'success') {
                toast.classList.add('bg-emerald-600');
            }
            else {
                toast.classList.add('bg-rose-600');
            }
            toast.classList.remove('hidden', 'translate-y-12', 'opacity-0');
            setTimeout(() => {
                toast.classList.add('hidden');
            }, 4000);
        }
    }
    escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }
    /**
     * Ouvre la modale de confirmation de migration des données locales (RG-45).
     */
    openMigrationModal() {
        const modal = document.getElementById('modal-migrate-data');
        if (!modal) {
            if (this.onAuthChangedCallback) {
                this.onAuthChangedCallback(this.currentUser);
            }
            return;
        }
        const count = LocalStorageService.getGuestTaskCount();
        const countEl = document.getElementById('migrate-task-count');
        if (countEl) {
            countEl.textContent = `${count} tâche(s) locale(s) détectée(s)`;
        }
        modal.classList.remove('hidden');
    }
    /**
     * Ferme la modale de migration.
     */
    closeMigrationModal() {
        const modal = document.getElementById('modal-migrate-data');
        modal?.classList.add('hidden');
    }
    /**
     * Traite la synchronisation des données locales vers la base de données.
     */
    async handleConfirmMigration() {
        const confirmBtn = document.querySelector('[data-testid="btn-confirm-migration"]');
        await withButtonLock(confirmBtn, async () => {
            try {
                const categories = LocalStorageService.getGuestCategories();
                const tasks = LocalStorageService.getGuestTasks();
                const res = await fetch('/api/v1/sync/import-local', {
                    method: 'POST',
                    headers: getSecurityHeaders({ 'Content-Type': 'application/json' }),
                    body: JSON.stringify({ categories, tasks })
                });
                const json = await res.json();
                if (json.success) {
                    LocalStorageService.clearGuestData();
                    this.closeMigrationModal();
                    this.showToast('Données locales synchronisées avec succès !');
                    if (this.onAuthChangedCallback) {
                        this.onAuthChangedCallback(this.currentUser);
                    }
                }
                else {
                    this.showToast(json.error || 'Erreur lors de la synchronisation.', 'error');
                }
            }
            catch (err) {
                const msg = err instanceof Error ? err.message : 'Erreur réseau lors de la synchronisation';
                this.showToast(msg, 'error');
            }
        }, 'Synchronisation...');
    }
}

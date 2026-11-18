<!-- Composant Auth : Modale et Écrans d'Authentification -->
<div id="modal-auth" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm hidden" role="dialog" aria-modal="true">
    <div class="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden transform transition-all">
        
        <!-- En-tête de la modale avec bouton fermer -->
        <div class="p-5 pb-3 flex items-center justify-between border-b border-slate-100">
            <div class="flex items-center gap-2.5">
                <div class="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-sm">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
                </div>
                <div>
                    <h3 id="auth-modal-title" class="text-base font-bold text-slate-800">Espace Utilisateur</h3>
                    <p id="auth-modal-subtitle" class="text-xs text-slate-500">Accédez à votre espace To-Do List</p>
                </div>
            </div>
            <button 
                type="button" 
                id="btn-close-auth-modal" 
                class="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
                title="Fermer"
            >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
        </div>

        <div class="p-6">
            <!-- Message d'erreur interne au formulaire -->
            <div id="auth-form-error" class="hidden mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <svg class="w-4 h-4 shrink-0 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                <span id="auth-form-error-text">Erreur</span>
            </div>

            <!-- Message d'information interne au formulaire -->
            <div id="auth-form-info" class="hidden mb-4 p-3 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs flex items-center gap-2">
                <svg class="w-4 h-4 shrink-0 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                <span id="auth-form-info-text">Information</span>
            </div>

            <!-- 1. VUE : CONNEXION -->
            <form id="form-auth-login" class="space-y-4">
                <div>
                    <label for="login-username" class="block text-xs font-semibold text-slate-700 mb-1">Identifiant ou Email</label>
                    <input 
                        type="text" 
                        id="login-username" 
                        data-testid="input-login-username" 
                        required 
                        placeholder="ex: lucas ou lucas@example.com" 
                        class="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"
                    />
                </div>

                <div>
                    <div class="flex items-center justify-between mb-1">
                        <label for="login-password" class="block text-xs font-semibold text-slate-700">Mot de passe</label>
                        <button 
                            type="button" 
                            id="link-to-forgot-password" 
                            data-testid="link-forgot-password" 
                            class="text-xs text-indigo-600 hover:text-indigo-700 hover:underline cursor-pointer"
                        >
                            Mot de passe oublié ?
                        </button>
                    </div>
                    <input 
                        type="password" 
                        id="login-password" 
                        data-testid="input-login-password" 
                        required 
                        placeholder="••••••••" 
                        class="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"
                    />
                </div>

                <button 
                    type="submit" 
                    id="btn-submit-login" 
                    data-testid="btn-submit-login" 
                    class="w-full py-2.5 px-4 rounded-xl bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700 shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                    <span>Se connecter</span>
                </button>

                <div class="pt-3 border-t border-slate-100 text-center">
                    <p class="text-xs text-slate-500">
                        Pas encore de compte ? 
                        <button 
                            type="button" 
                            id="link-to-register" 
                            data-testid="link-to-register" 
                            class="font-semibold text-indigo-600 hover:text-indigo-700 hover:underline cursor-pointer ml-1"
                        >
                            Créer un compte
                        </button>
                    </p>
                </div>
            </form>

            <!-- 2. VUE : INSCRIPTION -->
            <form id="form-auth-register" class="space-y-3.5 hidden">
                <div class="grid grid-cols-2 gap-3">
                    <div>
                        <label for="register-firstname" class="block text-xs font-semibold text-slate-700 mb-1">Prénom</label>
                        <input 
                            type="text" 
                            id="register-firstname" 
                            data-testid="input-register-firstname" 
                            required 
                            placeholder="Lucas" 
                            class="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                    <div>
                        <label for="register-lastname" class="block text-xs font-semibold text-slate-700 mb-1">Nom</label>
                        <input 
                            type="text" 
                            id="register-lastname" 
                            data-testid="input-register-lastname" 
                            required 
                            placeholder="Martin" 
                            class="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                </div>

                <div>
                    <div class="flex items-center justify-between mb-1">
                        <label for="register-username" class="block text-xs font-semibold text-slate-700">Identifiant (suggéré)</label>
                        <span class="text-[10px] text-slate-400">Pré-proposition automatique</span>
                    </div>
                    <input 
                        type="text" 
                        id="register-username" 
                        data-testid="input-register-username" 
                        required 
                        placeholder="lmartin" 
                        class="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </div>

                <div>
                    <label for="register-email" class="block text-xs font-semibold text-slate-700 mb-1">Adresse Email</label>
                    <input 
                        type="email" 
                        id="register-email" 
                        data-testid="input-register-email" 
                        required 
                        placeholder="lucas.martin@example.com" 
                        class="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </div>

                <div>
                    <label for="register-password" class="block text-xs font-semibold text-slate-700 mb-1">Mot de passe</label>
                    <input 
                        type="password" 
                        id="register-password" 
                        data-testid="input-register-password" 
                        required 
                        placeholder="Min. 8 car., 1 maj, 1 min, 1 chiffre" 
                        class="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <div class="mt-1 flex items-center gap-1.5 text-[11px] text-slate-400">
                        <div id="password-strength-bar" class="flex-1 h-1 bg-slate-100 rounded-full overflow-hidden">
                            <div id="password-strength-fill" class="h-full w-0 bg-rose-500 transition-all duration-300"></div>
                        </div>
                        <span id="password-strength-text">8+ car., Maj, Min, Chiffre</span>
                    </div>
                </div>

                <div>
                    <label for="register-password-confirm" class="block text-xs font-semibold text-slate-700 mb-1">Confirmer le mot de passe</label>
                    <input 
                        type="password" 
                        id="register-password-confirm" 
                        data-testid="input-register-password-confirm" 
                        required 
                        placeholder="••••••••" 
                        class="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </div>

                <button 
                    type="submit" 
                    id="btn-submit-register" 
                    data-testid="btn-submit-register" 
                    class="w-full py-2.5 px-4 rounded-xl bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700 shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2 mt-2"
                >
                    <span>Valider mon inscription</span>
                </button>

                <div class="pt-3 border-t border-slate-100 text-center">
                    <p class="text-xs text-slate-500">
                        Déjà un compte ? 
                        <button 
                            type="button" 
                            id="link-to-login" 
                            class="font-semibold text-indigo-600 hover:text-indigo-700 hover:underline cursor-pointer ml-1"
                        >
                            Se connecter
                        </button>
                    </p>
                </div>
            </form>

            <!-- 3. VUE : MOT DE PASSE OUBLIÉ (DEMANDE OTP ET VALIDATION) -->
            <form id="form-auth-forgot" class="space-y-4 hidden">
                <!-- Étape 1 : Saisie Email pour envoi OTP -->
                <div id="forgot-step-1" class="space-y-3">
                    <p class="text-xs text-slate-600">Saisissez votre adresse email pour recevoir un code temporaire de validation (OTP) valable 15 minutes.</p>
                    <div>
                        <label for="forgot-email" class="block text-xs font-semibold text-slate-700 mb-1">Adresse Email</label>
                        <input 
                            type="email" 
                            id="forgot-email" 
                            data-testid="input-forgot-email" 
                            required 
                            placeholder="votre.email@example.com" 
                            class="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                    <button 
                        type="button" 
                        id="btn-submit-forgot-request" 
                        data-testid="btn-submit-forgot-request" 
                        class="w-full py-2.5 px-4 rounded-xl bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700 shadow-sm transition-all cursor-pointer"
                    >
                        Envoyer le code OTP
                    </button>
                </div>

                <!-- Étape 2 : Saisie OTP et nouveau mot de passe -->
                <div id="forgot-step-2" class="space-y-3 hidden">
                    <div>
                        <label for="forgot-otp" class="block text-xs font-semibold text-slate-700 mb-1">Code de validation OTP (6 chiffres)</label>
                        <input 
                            type="text" 
                            id="forgot-otp" 
                            data-testid="input-forgot-otp" 
                            maxlength="6" 
                            placeholder="123456" 
                            class="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm text-center tracking-widest font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>

                    <div>
                        <label for="forgot-new-password" class="block text-xs font-semibold text-slate-700 mb-1">Nouveau mot de passe</label>
                        <input 
                            type="password" 
                            id="forgot-new-password" 
                            data-testid="input-forgot-new-password" 
                            placeholder="Min. 8 car., 1 maj, 1 min, 1 chiffre" 
                            class="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>

                    <div>
                        <label for="forgot-new-password-confirm" class="block text-xs font-semibold text-slate-700 mb-1">Confirmer le nouveau mot de passe</label>
                        <input 
                            type="password" 
                            id="forgot-new-password-confirm" 
                            data-testid="input-forgot-new-password-confirm" 
                            placeholder="••••••••" 
                            class="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>

                    <button 
                        type="submit" 
                        id="btn-submit-forgot-reset" 
                        data-testid="btn-submit-forgot-reset" 
                        class="w-full py-2.5 px-4 rounded-xl bg-emerald-600 text-white font-semibold text-sm hover:bg-emerald-700 shadow-sm transition-all cursor-pointer"
                    >
                        Réinitialiser mon mot de passe
                    </button>
                </div>

                <div class="pt-3 border-t border-slate-100 text-center">
                    <button 
                        type="button" 
                        id="link-back-to-login" 
                        class="text-xs font-semibold text-indigo-600 hover:text-indigo-700 hover:underline cursor-pointer"
                    >
                        ← Revenir à la connexion
                    </button>
                </div>
            </form>

        </div>
    </div>
</div>

<!-- Modale de Confirmation de Migration des Données Locales (RG-45) -->
<div 
    id="modal-migrate-data" 
    data-testid="modal-migrate-data" 
    class="hidden fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 transition-opacity duration-200"
    role="dialog" 
    aria-modal="true"
>
    <div class="bg-white rounded-2xl shadow-xl border border-slate-100 max-w-md w-full p-6 text-center">
        <div class="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/></svg>
        </div>
        <h3 class="text-lg font-bold text-slate-800">Synchroniser vos données locales ?</h3>
        <p class="text-xs text-slate-500 mt-2 mb-4">
            Nous avons détecté des tâches créées sur ce navigateur. Souhaitez-vous les importer dans votre nouveau compte ?
        </p>
        <div class="p-3 mb-5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700 font-semibold flex items-center justify-center gap-2">
            <svg class="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
            <span id="migrate-task-count" data-testid="migrate-task-count">0 tâche(s) locale(s) détectée(s)</span>
        </div>
        <div class="flex items-center gap-3 justify-center">
            <button 
                type="button" 
                id="btn-skip-migration" 
                data-testid="btn-skip-migration"
                class="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold text-xs transition-colors cursor-pointer"
            >
                Ignorer
            </button>
            <button 
                type="button" 
                id="btn-confirm-migration" 
                data-testid="btn-confirm-migration"
                class="flex-1 py-2.5 px-4 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 font-semibold text-xs shadow-sm transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                <span>Importer mes données</span>
            </button>
        </div>
    </div>
</div>

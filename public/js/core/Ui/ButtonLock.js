/**
 * Utilitaire Anti-Rebond (Debounce & State Disable) pour sécuriser les interactions UI asynchrones (RG-38).
 */
export async function withButtonLock(button, action, loadingText) {
    if (!button) {
        return await action();
    }
    // Si le bouton est déjà verrouillé, on ignore tout clic consécutif (anti-rebond)
    if (button.disabled) {
        return undefined;
    }
    const originalHtml = button.innerHTML;
    const originalDisabled = button.disabled;
    try {
        button.disabled = true;
        button.classList.add('opacity-50', 'cursor-not-allowed');
        const label = loadingText ? `<span>${loadingText}</span>` : '<span>Patientez...</span>';
        button.innerHTML = `
      <svg class="animate-spin -ml-1 mr-2 h-3.5 w-3.5 inline-block text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
      </svg>
      ${label}
    `;
        return await action();
    }
    finally {
        button.innerHTML = originalHtml;
        button.classList.remove('opacity-50', 'cursor-not-allowed');
        button.disabled = originalDisabled;
    }
}

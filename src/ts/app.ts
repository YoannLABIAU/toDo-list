import { TaskComponent } from '../../module/Task/xxUi/TaskComponent.js';
import { AuthComponent } from '../../module/Auth/xxUi/AuthComponent.js';
import { NetworkMonitor } from '../../core/Ui/NetworkMonitor.js';

/**
 * Initialise l'application dès que le DOM est prêt.
 * Prend en charge l'exécution immédiate si DOMContentLoaded a déjà été émis par le navigateur.
 */
function bootstrap(): void {
  NetworkMonitor.init();

  const taskComponent = new TaskComponent();

  const authComponent = new AuthComponent((user) => {
    // Lors d'une connexion ou déconnexion, mettre à jour l'utilisateur et recharger les données
    taskComponent.setCurrentUser(user);
    taskComponent.loadCategories();
    taskComponent.loadTasks();
  });

  taskComponent.init();
  authComponent.init();

  (window as unknown as { todoApp: TaskComponent; authApp: AuthComponent }).todoApp = taskComponent;
  (window as unknown as { todoApp: TaskComponent; authApp: AuthComponent }).authApp = authComponent;
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrap);
} else {
  bootstrap();
}

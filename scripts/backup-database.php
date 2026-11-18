<?php

declare(strict_types=1);

require_once __DIR__ . '/../core/Api/Config.php';
require_once __DIR__ . '/../core/Api/Session.php';
require_once __DIR__ . '/../core/Api/Database.php';
require_once __DIR__ . '/../core/Api/Logger.php';
require_once __DIR__ . '/../core/Api/BackupService.php';

use Core\Api\BackupService;

echo "====================================================\n";
echo "   To-Do List - Sauvegarde SQLite à chaud (Hot Backup)\n";
echo "====================================================\n";

$backupService = new BackupService();
$result = $backupService->createBackup();

if ($result['success']) {
    $sizeKb = round($result['size'] / 1024, 2);
    echo "[SUCCÈS] Sauvegarde créée : " . basename($result['path']) . " ({$sizeKb} Ko)\n";
    echo "[CHEMIN] " . $result['path'] . "\n";

    $purged = $backupService->rotateBackups(7);
    if ($purged > 0) {
        echo "[ROTATION] {$purged} archive(s) expirée(s) purgée(s).\n";
    }
    echo "====================================================\n";
    exit(0);
} else {
    echo "[ERREUR] Échec de la sauvegarde : " . ($result['error'] ?? 'Inconnue') . "\n";
    if (isset($result['error_id'])) {
        echo "[INCIDENT ID] " . $result['error_id'] . "\n";
    }
    echo "====================================================\n";
    exit(1);
}

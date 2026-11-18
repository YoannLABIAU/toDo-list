<?php

declare(strict_types=1);

namespace Core\Api;

use PDO;
use Throwable;

/**
 * Service de gestion des sauvegardes SQLite à chaud (Hot Backup) et de la rotation des archives.
 */
class BackupService
{
    /**
     * @var string Répertoire de stockage des sauvegardes
     */
    private string $backupDir;

    /**
     * Constructeur
     */
    public function __construct()
    {
        $this->backupDir = dirname(__DIR__, 2) . '/database/backups';
        if (!is_dir($this->backupDir)) {
            mkdir($this->backupDir, 0777, true);
        }
    }

    /**
     * Effectue une sauvegarde SQLite à chaud via la commande SQL standard VACUUM INTO.
     *
     * @param string|null $customFilename Nom de fichier facultatif
     * @return array{success: bool, path: string, size: int, error?: string} Résultat de l'opération
     */
    public function createBackup(?string $customFilename = null): array
    {
        $filename = $customFilename ?? 'backup-' . date('Y-m-d_His') . '.sqlite';
        $targetPath = $this->backupDir . '/' . $filename;

        if (file_exists($targetPath)) {
            unlink($targetPath);
        }

        try {
            $pdo = Database::getInstance();
            // Préparation de la commande sécurisée avec échappement
            $escapedPath = str_replace("'", "''", $targetPath);
            $pdo->exec("VACUUM INTO '{$escapedPath}'");

            $size = file_exists($targetPath) ? (int) filesize($targetPath) : 0;

            Logger::security(
                'BACKUP_CREATED',
                'Sauvegarde SQLite créée avec succès : ' . basename($targetPath),
                ['path' => $targetPath, 'size' => $size],
                'INFO'
            );

            return [
                'success' => true,
                'path' => $targetPath,
                'size' => $size,
            ];
        } catch (Throwable $e) {
            $errorId = Logger::error('Échec de la sauvegarde SQLite à chaud', $e, ['target' => $targetPath]);

            return [
                'success' => false,
                'path' => $targetPath,
                'size' => 0,
                'error' => $e->getMessage(),
                'error_id' => $errorId,
            ];
        }
    }

    /**
     * Supprime les sauvegardes plus anciennes qu'un nombre de jours donné (rétention).
     *
     * @param int $retentionDays Nombre de jours de conservation (7 par défaut)
     * @return int Nombre de fichiers purgés
     */
    public function rotateBackups(int $retentionDays = 7): int
    {
        $purgedCount = 0;
        $thresholdTime = time() - ($retentionDays * 86400);

        $files = glob($this->backupDir . '/backup-*.sqlite');
        if ($files === false) {
            return 0;
        }

        foreach ($files as $file) {
            if (is_file($file) && filemtime($file) < $thresholdTime) {
                if (unlink($file)) {
                    $purgedCount++;
                }
            }
        }

        return $purgedCount;
    }

    /**
     * Retourne la liste des sauvegardes existantes triées par date décroissante.
     *
     * @return array<int, array{name: string, size: int, mtime: string, path: string}>
     */
    public function listBackups(): array
    {
        $backups = [];
        $files = glob($this->backupDir . '/backup-*.sqlite');
        if ($files === false) {
            return [];
        }

        foreach ($files as $file) {
            if (is_file($file)) {
                $backups[] = [
                    'name' => basename($file),
                    'size' => (int) filesize($file),
                    'mtime' => date('Y-m-d H:i:s', (int) filemtime($file)),
                    'path' => $file,
                ];
            }
        }

        usort($backups, fn ($a, $b) => strcmp($b['name'], $a['name']));

        return $backups;
    }
}

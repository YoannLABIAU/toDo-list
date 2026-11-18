<?php

declare(strict_types=1);

namespace Core\Api;

/**
 * Service d'envoi et de journalisation des e-mails (OTP).
 */
class Mailer
{
    /**
     * Envoie un e-mail ou le consigne dans les logs selon la configuration.
     *
     * @param string $to Destinataire
     * @param string $subject Sujet
     * @param string $body Contenu du message
     * @return bool Vrai si l'envoi/journalisation a réussi
     */
    public static function send(string $to, string $subject, string $body): bool
    {
        $driver = Config::get('MAIL_DRIVER', 'log');
        $from = Config::get('MAIL_FROM', 'no-reply@todo-list.fr');

        if ($driver === 'mail') {
            $headers = [
                'From' => $from,
                'Reply-To' => $from,
                'X-Mailer' => 'PHP/' . phpversion(),
                'Content-Type' => 'text/plain; charset=utf-8'
            ];
            return @mail($to, $subject, $body, $headers);
        }

        // Mode 'log' par défaut
        $logPath = Config::get('MAIL_LOG_PATH', 'database/mail.log');
        if (!str_starts_with($logPath, '/') && !preg_match('#^[A-Za-z]:#', $logPath)) {
            $logPath = dirname(__DIR__, 2) . '/' . ltrim($logPath, '/');
        }

        $logDir = dirname($logPath);
        if (!is_dir($logDir)) {
            mkdir($logDir, 0777, true);
        }

        $logEntry = sprintf(
            "[%s] TO: %s | FROM: %s | SUBJECT: %s\nBODY:\n%s\n%s\n",
            date('Y-m-d H:i:s'),
            $to,
            $from,
            $subject,
            $body,
            str_repeat('-', 60)
        );

        return file_put_contents($logPath, $logEntry, FILE_APPEND) !== false;
    }
}

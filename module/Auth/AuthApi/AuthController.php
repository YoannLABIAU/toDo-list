<?php

declare(strict_types=1);

namespace Module\Auth\AuthApi;

use Core\Api\Config;
use Core\Api\Csrf;
use Core\Api\Logger;
use Core\Api\Mailer;
use Core\Api\RateLimiter;
use Core\Api\Response;
use Core\Api\Session;

/**
 * Contrôleur gérant l'authentification, les inscriptions et la réinitialisation de mot de passe.
 */
class AuthController
{
    private UserRepository $userRepository;

    public function __construct()
    {
        $this->userRepository = new UserRepository();
    }

    /**
     * Inscription d'un nouvel utilisateur.
     *
     * @return void
     */
    public function register(): void
    {
        $raw = file_get_contents('php://input');
        $data = json_decode($raw, true) ?? [];

        $firstName = trim((string) ($data['first_name'] ?? ''));
        $lastName = trim((string) ($data['last_name'] ?? ''));
        $username = trim((string) ($data['username'] ?? ''));
        $email = trim((string) ($data['email'] ?? ''));
        $password = (string) ($data['password'] ?? '');
        $passwordConfirm = (string) ($data['password_confirm'] ?? '');

        // 1. Validation de présence
        if ($firstName === '' || $lastName === '' || $username === '' || $email === '' || $password === '') {
            Response::error('Tous les champs sont obligatoires.', 400);
            return;
        }

        // 2. Format d'email
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            Response::error('Format d\'adresse email invalide.', 400);
            return;
        }

        // 3. Format d'identifiant (alphanumérique + point/tiret/underscore)
        if (!preg_match('/^[a-zA-Z0-9._-]{3,30}$/', $username)) {
            Response::error('L\'identifiant doit comporter entre 3 et 30 caractères (lettres, chiffres, ., _, -).', 400);
            return;
        }

        // 4. Force du mot de passe (RG-29) : min 8 chars, 1 maj, 1 min, 1 chiffre
        if (strlen($password) < 8 ||
            !preg_match('/[A-Z]/', $password) ||
            !preg_match('/[a-z]/', $password) ||
            !preg_match('/[0-9]/', $password)) {
            Response::error('Le mot de passe doit comporter au moins 8 caractères, une majuscule, une minuscule et un chiffre.', 400);
            return;
        }

        // 5. Confirmation concordance
        if ($password !== $passwordConfirm) {
            Response::error('La confirmation du mot de passe ne correspond pas.', 400);
            return;
        }

        // 6. Unicité email et username (RG-28)
        if ($this->userRepository->findByEmail($email) !== null) {
            Response::error('Cette adresse email est déjà associée à un compte.', 400);
            return;
        }

        if ($this->userRepository->findByUsername($username) !== null) {
            Response::error('Cet identifiant est déjà utilisé.', 400);
            return;
        }

        // 7. Création de l'utilisateur
        $passwordHash = password_hash($password, PASSWORD_BCRYPT);
        $user = new User(null, $firstName, $lastName, $username, $email, $passwordHash);
        $createdUser = $this->userRepository->create($user);

        // Connexion automatique avec régénération d'ID de session (RG-37)
        Session::regenerate();
        Session::setUserId((int) $createdUser->getId());

        Response::success([
            'message' => 'Compte créé avec succès.',
            'user' => $createdUser->toArray()
        ], 201);
    }

    /**
     * Authentification utilisateur (connexion) avec protection Rate Limiting (RG-34).
     *
     * @return void
     */
    public function login(): void
    {
        $raw = file_get_contents('php://input');
        $data = json_decode($raw, true) ?? [];

        $identifier = trim((string) ($data['username_or_email'] ?? ''));
        $password = (string) ($data['password'] ?? '');

        if ($identifier === '' || $password === '') {
            Response::error('Identifiant et mot de passe requis.', 400);
            return;
        }

        // RG-34 : Rate Limiting (5 tentatives échouées max par 15 min)
        $clientIp = RateLimiter::getClientIp();
        $rateKey = 'login:' . $clientIp . ':' . strtolower($identifier);

        if (RateLimiter::isRateLimited($rateKey, 5, 900)) {
            Response::error('Trop de tentatives de connexion échouées. Veuillez patienter 15 minutes avant de réessayer.', 429);
            return;
        }

        $user = $this->userRepository->findByUsernameOrEmail($identifier);

        if ($user === null || !password_verify($password, $user->getPasswordHash())) {
            RateLimiter::hit($rateKey, 900);
            Logger::security(
                'AUTH_FAILURE',
                "Échec d'authentification pour l'identifiant : {$identifier}",
                ['identifier' => $identifier],
                'WARNING'
            );
            Response::error('Identifiant ou mot de passe incorrect.', 400);
            return;
        }

        // Succès : réinitialisation du compteur d'échecs et régénération de session (RG-37)
        RateLimiter::clear($rateKey);
        Session::regenerate();
        Session::setUserId((int) $user->getId());

        Logger::security(
            'AUTH_SUCCESS',
            "Connexion réussie pour l'utilisateur ID {$user->getId()} ({$user->getUsername()})",
            ['user_id' => $user->getId(), 'username' => $user->getUsername()],
            'INFO'
        );

        Response::success([
            'message' => 'Connexion réussie.',
            'user' => $user->toArray()
        ], 200);
    }

    /**
     * Déconnexion de l'utilisateur.
     *
     * @return void
     */
    public function logout(): void
    {
        Session::destroy();
        Response::success(['message' => 'Déconnexion réussie.'], 200);
    }

    /**
     * Récupère le profil de l'utilisateur connecté ou null.
     *
     * @return void
     */
    public function me(): void
    {
        $userId = Session::getUserId();
        if ($userId === null) {
            Response::success(['user' => null], 200);
            return;
        }

        $user = $this->userRepository->findById($userId);
        if ($user === null) {
            Session::destroy();
            Response::success(['user' => null], 200);
            return;
        }

        Response::success(['user' => $user->toArray()], 200);
    }

    /**
     * Demande de réinitialisation de mot de passe (génération et envoi du code OTP).
     *
     * @return void
     */
    public function forgotPassword(): void
    {
        $raw = file_get_contents('php://input');
        $data = json_decode($raw, true) ?? [];

        $email = trim((string) ($data['email'] ?? ''));

        if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            Response::error('Veuillez saisir une adresse email valide.', 400);
            return;
        }

        // RG-34 : Rate Limiting sur demande OTP (5 demandes max par 15 min par IP)
        $clientIp = RateLimiter::getClientIp();
        $rateKey = 'forgot:' . $clientIp;
        if (RateLimiter::isRateLimited($rateKey, 5, 900)) {
            Response::error('Trop de demandes de code OTP. Veuillez patienter 15 minutes avant de réessayer.', 429);
            return;
        }
        RateLimiter::hit($rateKey, 900);

        $user = $this->userRepository->findByEmail($email);
        $otp = null;

        if ($user !== null) {
            // Génération d'un OTP 6 chiffres
            $otp = str_pad((string) random_int(100000, 999999), 6, '0', STR_PAD_LEFT);
            $this->userRepository->createPasswordReset((int) $user->getId(), $otp, 15);

            $subject = 'Code de réinitialisation de mot de passe - To-Do List';
            $body = "Bonjour {$user->getFirstName()},\n\n"
                  . "Vous avez demandé la réinitialisation de votre mot de passe pour To-Do List.\n"
                  . "Votre code de validation OTP est : {$otp}\n\n"
                  . "Ce code est valide pendant 15 minutes.\n"
                  . "Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet e-mail.\n\n"
                  . "L'équipe To-Do List";

            Mailer::send($email, $subject, $body);
        }

        // Pour éviter l'énumération des comptes, message générique
        $payload = [
            'message' => 'Si cette adresse email est associée à un compte, un code OTP de réinitialisation vous a été envoyé.'
        ];

        // En environnement local ou de test, on expose l'OTP dans la réponse pour la testabilité automatique
        $env = Config::get('APP_ENV', 'local');
        if (($env === 'local' || $env === 'test') && $otp !== null) {
            $payload['dev_otp'] = $otp;
        }

        Response::success($payload, 200);
    }

    /**
     * Validation de l'OTP et application du nouveau mot de passe.
     *
     * @return void
     */
    public function resetPassword(): void
    {
        $raw = file_get_contents('php://input');
        $data = json_decode($raw, true) ?? [];

        $email = trim((string) ($data['email'] ?? ''));
        $otp = trim((string) ($data['otp'] ?? ''));
        $newPassword = (string) ($data['new_password'] ?? '');
        $newPasswordConfirm = (string) ($data['new_password_confirm'] ?? '');

        if ($email === '' || $otp === '' || $newPassword === '') {
            Response::error('Tous les champs sont requis.', 400);
            return;
        }

        // Contrôle de sécurité du mot de passe
        if (strlen($newPassword) < 8 ||
            !preg_match('/[A-Z]/', $newPassword) ||
            !preg_match('/[a-z]/', $newPassword) ||
            !preg_match('/[0-9]/', $newPassword)) {
            Response::error('Le mot de passe doit comporter au moins 8 caractères, une majuscule, une minuscule et un chiffre.', 400);
            return;
        }

        if ($newPassword !== $newPasswordConfirm) {
            Response::error('La confirmation du mot de passe ne correspond pas.', 400);
            return;
        }

        $userId = $this->userRepository->verifyPasswordReset($email, $otp);

        if ($userId === null) {
            Response::error('Code OTP invalide ou expiré.', 400);
            return;
        }

        $newHash = password_hash($newPassword, PASSWORD_BCRYPT);
        $this->userRepository->updatePassword($userId, $newHash);
        $this->userRepository->deletePasswordResets($userId);

        Response::success(['message' => 'Votre mot de passe a été réinitialisé avec succès.'], 200);
    }

    /**
     * Retourne le jeton CSRF de la session courante (RG-35).
     *
     * @return void
     */
    public function csrf(): void
    {
        Response::success(['csrf_token' => Csrf::getToken()], 200);
    }
}

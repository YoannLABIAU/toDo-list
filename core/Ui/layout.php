<!DOCTYPE html>
<html lang="fr" class="h-full bg-slate-50">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="<?= \Core\Api\Csrf::getToken() ?>">
    <title>To-Do List - Application Personnelle</title>
    <link rel="stylesheet" href="/public/css/style.css?v=<?= time() ?>">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Inter', system-ui, -apple-system, sans-serif; }
    </style>
</head>
<body class="min-h-full flex flex-col justify-between text-slate-800 antialiased">
    <!-- Bandeau Réseau Hors-Ligne (RG-42) -->
    <div 
        id="banner-offline" 
        data-testid="banner-offline" 
        class="hidden fixed top-0 left-0 right-0 z-50 bg-amber-500 text-amber-950 px-4 py-2 text-center text-xs sm:text-sm font-semibold shadow-md flex items-center justify-center gap-2"
        role="alert"
    >
        <svg class="w-4 h-4 shrink-0 text-amber-950" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 4.243a9 9 0 01-12.728-12.728m0 0l2.829 2.829m-2.829-2.829L3 3m5.657 5.657a5 5 0 017.071 7.071"/></svg>
        <span>Connexion réseau perdue. Les modifications locales sont suspendues.</span>
    </div>

    <main class="flex-grow">
        <?php require __DIR__ . '/../../module/Task/xxUi/task-view.php'; ?>
    </main>

    <footer class="py-6 text-center text-xs text-slate-400">
        <p>&copy; <?= date('Y') ?> To-Do List Modulaire Vanilla - Sprint 2 V2</p>
    </footer>

    <!-- Script Application Vanilla TS compilé en ES Module avec cache-busting -->
    <script type="module" src="/public/js/src/ts/app.js?v=<?= time() ?>"></script>
</body>
</html>

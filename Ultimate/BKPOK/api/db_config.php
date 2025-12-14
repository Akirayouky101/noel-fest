<?php
// Configurazione database per Noel Fest
define('DB_HOST', 'localhost'); // Cambia se necessario (es. 'mysql.tuohost.com')
define('DB_NAME', 'dbgxaxaie7pbze');
define('DB_USER', 'un0izfn5newpz');
define('DB_PASS', 'Criogenia2024!?');
define('DB_CHARSET', 'utf8mb4');

// Connessione al database
function getDbConnection() {
    try {
        $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
        $options = [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ];
        $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
        return $pdo;
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Errore connessione database: ' . $e->getMessage()]);
        exit;
    }
}
?>

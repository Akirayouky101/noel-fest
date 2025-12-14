<?php
// Script per aggiornare il database con i nuovi campi
require_once 'db_config.php';

header('Content-Type: application/json');

try {
    $pdo = getDbConnection();
    $updates = [];
    
    // Controlla e aggiungi table_number
    $stmt = $pdo->query("SHOW COLUMNS FROM orders LIKE 'table_number'");
    if ($stmt->rowCount() == 0) {
        $pdo->exec("ALTER TABLE orders ADD COLUMN table_number VARCHAR(20) NOT NULL DEFAULT 'TA-000' AFTER character_name");
        $pdo->exec("ALTER TABLE orders ADD INDEX idx_table (table_number)");
        $updates[] = "Aggiunto campo table_number";
    }
    
    // Controlla e aggiungi locked_by
    $stmt = $pdo->query("SHOW COLUMNS FROM orders LIKE 'locked_by'");
    if ($stmt->rowCount() == 0) {
        $pdo->exec("ALTER TABLE orders ADD COLUMN locked_by VARCHAR(50) NULL AFTER status");
        $updates[] = "Aggiunto campo locked_by";
    }
    
    // Controlla e aggiungi locked_at
    $stmt = $pdo->query("SHOW COLUMNS FROM orders LIKE 'locked_at'");
    if ($stmt->rowCount() == 0) {
        $pdo->exec("ALTER TABLE orders ADD COLUMN locked_at DATETIME NULL AFTER locked_by");
        $pdo->exec("ALTER TABLE orders ADD INDEX idx_locked (locked_by)");
        $updates[] = "Aggiunto campo locked_at";
    }
    
    // Controlla e aggiungi session_token
    $stmt = $pdo->query("SHOW COLUMNS FROM orders LIKE 'session_token'");
    if ($stmt->rowCount() == 0) {
        $pdo->exec("ALTER TABLE orders ADD COLUMN session_token VARCHAR(100) NOT NULL DEFAULT '' AFTER table_number");
        $pdo->exec("ALTER TABLE orders ADD INDEX idx_session (session_token)");
        $updates[] = "Aggiunto campo session_token";
    }
    
    // Crea tabella reservations se non esiste
    $stmt = $pdo->query("SHOW TABLES LIKE 'reservations'");
    if ($stmt->rowCount() == 0) {
        $sql = "CREATE TABLE reservations (
            id INT AUTO_INCREMENT PRIMARY KEY,
            customer_name VARCHAR(100) NOT NULL,
            phone VARCHAR(20) NOT NULL,
            num_people INT NOT NULL,
            reservation_time TIME NOT NULL,
            table_number VARCHAR(20) NULL,
            status ENUM('pending', 'confirmed', 'seated', 'completed', 'cancelled') DEFAULT 'pending',
            notes TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX idx_status (status),
            INDEX idx_table (table_number),
            INDEX idx_time (reservation_time)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";
        $pdo->exec($sql);
        $updates[] = "Creata tabella reservations";
    }
    
    // Crea tabella operators se non esiste
    $stmt = $pdo->query("SHOW TABLES LIKE 'operators'");
    if ($stmt->rowCount() == 0) {
        $sql = "CREATE TABLE operators (
            id INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(50) NOT NULL UNIQUE,
            display_name VARCHAR(100) NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            is_active BOOLEAN DEFAULT TRUE,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";
        $pdo->exec($sql);
        
        // Inserisci operatori default (password: "noel2024")
        $sql = "INSERT INTO operators (username, display_name, password_hash) VALUES
            ('cassa1', 'Cassa 1', '\$2y\$10\$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'),
            ('cassa2', 'Cassa 2', '\$2y\$10\$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi')";
        $pdo->exec($sql);
        $updates[] = "Creata tabella operators con 2 utenti (password: noel2024)";
    }
    
    echo json_encode([
        'success' => true,
        'message' => 'Database aggiornato con successo',
        'updates' => $updates,
        'timestamp' => date('Y-m-d H:i:s')
    ]);
    
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
?>

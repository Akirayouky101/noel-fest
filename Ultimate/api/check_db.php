<?php
// Script per verificare e creare la tabella orders
require_once 'db_config.php';

header('Content-Type: application/json');

try {
    $pdo = getDbConnection();
    
    // Verifica se la tabella esiste
    $stmt = $pdo->query("SHOW TABLES LIKE 'orders'");
    $tableExists = $stmt->rowCount() > 0;
    
    if (!$tableExists) {
        // Crea la tabella
        $sql = "CREATE TABLE IF NOT EXISTS orders (
            id INT AUTO_INCREMENT PRIMARY KEY,
            character_name VARCHAR(100) NOT NULL,
            items TEXT NOT NULL,
            notes TEXT,
            total DECIMAL(10, 2) NOT NULL,
            status ENUM('pending', 'preparing', 'completed', 'cancelled') DEFAULT 'pending',
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_status (status),
            INDEX idx_timestamp (timestamp)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";
        
        $pdo->exec($sql);
        
        echo json_encode([
            'success' => true,
            'message' => 'Tabella orders creata con successo',
            'table_existed' => false
        ]);
    } else {
        // Verifica la struttura della tabella
        $stmt = $pdo->query("DESCRIBE orders");
        $columns = $stmt->fetchAll();
        
        echo json_encode([
            'success' => true,
            'message' => 'Tabella orders già esistente',
            'table_existed' => true,
            'columns' => $columns
        ]);
    }
    
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
?>

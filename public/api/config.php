<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once 'db_config.php';

try {
    $pdo = getDbConnection();
    
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        // Carica configurazione
        $stmt = $pdo->prepare("SELECT config_key, config_value FROM system_config");
        $stmt->execute();
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        $config = [
            'total_seats' => 150,
            'walkin_seats' => 100,
            'coperto_price' => 1.50,
            'reservations_enabled' => true,
            'orders_enabled' => true,
            'lunch_start' => '12:00',
            'lunch_end' => '15:00',
            'dinner_start' => '19:00',
            'dinner_end' => '23:00'
        ];
        
        foreach ($rows as $row) {
            $key = $row['config_key'];
            $value = $row['config_value'];
            
            if ($key === 'total_seats' || $key === 'walkin_seats') {
                $config[$key] = (int)$value;
            } elseif ($key === 'coperto_price') {
                $config[$key] = (float)$value;
            } elseif ($key === 'reservations_enabled' || $key === 'orders_enabled') {
                $config[$key] = $value === '1' || $value === 'true';
            } elseif (in_array($key, ['lunch_start', 'lunch_end', 'dinner_start', 'dinner_end'])) {
                $config[$key] = $value;
            }
        }
        
        echo json_encode([
            'success' => true,
            'config' => $config
        ]);
        
    } elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
        // Salva configurazione
        $data = json_decode(file_get_contents('php://input'), true);
        
        $updates = [
            'total_seats' => $data['total_seats'] ?? 150,
            'walkin_seats' => $data['walkin_seats'] ?? 100,
            'coperto_price' => $data['coperto_price'] ?? 1.50,
            'reservations_enabled' => ($data['reservations_enabled'] ?? true) ? '1' : '0',
            'orders_enabled' => ($data['orders_enabled'] ?? true) ? '1' : '0',
            'lunch_start' => $data['lunch_start'] ?? '12:00',
            'lunch_end' => $data['lunch_end'] ?? '15:00',
            'dinner_start' => $data['dinner_start'] ?? '19:00',
            'dinner_end' => $data['dinner_end'] ?? '23:00'
        ];
        
        foreach ($updates as $key => $value) {
            $stmt = $pdo->prepare("
                INSERT INTO system_config (config_key, config_value) 
                VALUES (:key, :value)
                ON DUPLICATE KEY UPDATE config_value = :value
            ");
            $stmt->execute([
                'key' => $key,
                'value' => (string)$value
            ]);
        }
        
        echo json_encode([
            'success' => true,
            'message' => 'Configurazione salvata con successo'
        ]);
    }
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Errore: ' . $e->getMessage()
    ]);
}
?>

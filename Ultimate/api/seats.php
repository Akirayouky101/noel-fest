<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');
header('Cache-Control: no-cache, no-store, must-revalidate');
header('Pragma: no-cache');
header('Expires: 0');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once 'db_config.php';
$pdo = getDbConnection();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        // Ottieni il totale posti dal config
        $stmt = $pdo->prepare("SELECT config_value FROM system_config WHERE config_key = 'total_seats'");
        $stmt->execute();
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        $totalSeats = $result ? (int)$result['config_value'] : 150;
        
        // Calcola posti occupati da prenotazioni attive
        $stmt = $pdo->prepare("
            SELECT COALESCE(SUM(num_people), 0) as occupied 
            FROM seat_reservations 
            WHERE status = 'active'
        ");
        $stmt->execute();
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        $occupiedSeats = (int)$result['occupied'];
        
        $availableSeats = max(0, $totalSeats - $occupiedSeats);
        
        echo json_encode([
            'success' => true,
            'total' => $totalSeats,
            'occupied' => $occupiedSeats,
            'available' => $availableSeats
        ]);
        
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'error' => 'Errore database: ' . $e->getMessage()
        ]);
    }
} else {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'error' => 'Metodo non consentito'
    ]);
}
?>

<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once 'db_config.php';

$pdo = getDbConnection();
$method = $_SERVER['REQUEST_METHOD'];

try {
    switch($method) {
        case 'GET':
            // Ottieni posti walk-in disponibili
            $totalQuery = $pdo->query("SELECT config_value FROM system_config WHERE config_key = 'walkin_seats'");
            $totalSeats = (int)$totalQuery->fetchColumn();
            
            $occupiedQuery = $pdo->query("SELECT COALESCE(SUM(num_people), 0) as occupied FROM walkin_seats WHERE status = 'occupied'");
            $occupied = (int)$occupiedQuery->fetchColumn();
            
            // Se richiesto, ritorna anche i dettagli dei personaggi
            if (isset($_GET['details']) && $_GET['details'] == '1') {
                $charactersQuery = $pdo->query("SELECT DISTINCT character_name FROM walkin_seats WHERE status = 'occupied'");
                $characters = $charactersQuery->fetchAll(PDO::FETCH_COLUMN);
                
                echo json_encode([
                    'success' => true,
                    'total' => $totalSeats,
                    'occupied' => $occupied,
                    'available' => $totalSeats - $occupied,
                    'characters' => $characters
                ]);
            } else {
                echo json_encode([
                    'success' => true,
                    'total' => $totalSeats,
                    'occupied' => $occupied,
                    'available' => $totalSeats - $occupied
                ]);
            }
            break;
            
        case 'POST':
            // Occupa posti walk-in
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (!isset($data['character_name']) || !isset($data['num_people'])) {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'Dati mancanti']);
                exit;
            }
            
            // Verifica disponibilità
            $totalQuery = $pdo->query("SELECT config_value FROM system_config WHERE config_key = 'walkin_seats'");
            $totalSeats = (int)$totalQuery->fetchColumn();
            
            $occupiedQuery = $pdo->query("SELECT COALESCE(SUM(num_people), 0) as occupied FROM walkin_seats WHERE status = 'occupied'");
            $occupied = (int)$occupiedQuery->fetchColumn();
            
            $available = $totalSeats - $occupied;
            
            if ($available < $data['num_people']) {
                http_response_code(400);
                echo json_encode([
                    'success' => false, 
                    'error' => 'Posti insufficienti',
                    'available' => $available
                ]);
                exit;
            }
            
            // Occupa i posti
            $stmt = $pdo->prepare("
                INSERT INTO walkin_seats (character_name, num_people, status) 
                VALUES (:character_name, :num_people, 'occupied')
            ");
            
            $stmt->execute([
                ':character_name' => $data['character_name'],
                ':num_people' => $data['num_people']
            ]);
            
            echo json_encode(['success' => true, 'id' => $pdo->lastInsertId()]);
            break;
            
        case 'PUT':
            // Libera posti walk-in
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (!isset($data['character_name'])) {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'character_name mancante']);
                exit;
            }
            
            $stmt = $pdo->prepare("
                UPDATE walkin_seats 
                SET status = 'freed', freed_at = NOW() 
                WHERE character_name = :character_name AND status = 'occupied'
            ");
            
            $stmt->execute([':character_name' => $data['character_name']]);
            
            echo json_encode(['success' => true, 'rows_affected' => $stmt->rowCount()]);
            break;
            
        case 'DELETE':
            // Elimina occupazione walk-in per un personaggio
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (!isset($data['character_name'])) {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'character_name mancante']);
                exit;
            }
            
            $stmt = $pdo->prepare("DELETE FROM walkin_seats WHERE character_name = :character_name");
            $stmt->execute([':character_name' => $data['character_name']]);
            
            echo json_encode(['success' => true, 'rows_deleted' => $stmt->rowCount()]);
            break;
            
        default:
            http_response_code(405);
            echo json_encode(['success' => false, 'error' => 'Metodo non supportato']);
            break;
    }
} catch (PDOException $e) {
    error_log("Errore walkin-seats.php: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Errore database: ' . $e->getMessage()]);
}
?>

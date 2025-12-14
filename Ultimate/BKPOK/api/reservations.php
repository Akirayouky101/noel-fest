<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
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

// CREATE - Nuova prenotazione
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    error_log("📥 Richiesta prenotazione: " . json_encode($data));
    
    // Accetta sia 'character' che 'character_name'
    $characterName = $data['character_name'] ?? $data['character'] ?? null;
    
    if (!$characterName || !isset($data['email']) || !isset($data['num_people'])) {
        error_log("❌ Dati mancanti nella prenotazione");
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Dati mancanti']);
        exit();
    }
    
    try {
        $stmt = $pdo->prepare("
            INSERT INTO seat_reservations (character_name, email, num_people, status, created_at) 
            VALUES (:character, :email, :num_people, 'active', NOW())
        ");
        
        $result = $stmt->execute([
            ':character' => $characterName,
            ':email' => $data['email'],
            ':num_people' => $data['num_people']
        ]);
        
        $insertId = $pdo->lastInsertId();
        error_log("✅ Prenotazione creata con ID: " . $insertId);
        
        echo json_encode([
            'success' => true,
            'id' => $insertId,
            'message' => 'Prenotazione creata'
        ]);
        
    } catch (PDOException $e) {
        error_log("❌ Errore DB prenotazione: " . $e->getMessage());
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'error' => 'Errore database: ' . $e->getMessage()
        ]);
    }
}

// READ - Elenco prenotazioni
elseif ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        $stmt = $pdo->prepare("
            SELECT * FROM seat_reservations 
            ORDER BY created_at DESC
        ");
        $stmt->execute();
        $reservations = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo json_encode([
            'success' => true,
            'reservations' => $reservations
        ]);
        
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'error' => 'Errore database: ' . $e->getMessage()
        ]);
    }
}

// UPDATE - Aggiorna status prenotazione
elseif ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($data['id'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'ID richiesto']);
        exit();
    }
    
    try {
        // Se è presente solo num_people, aggiorna solo quello
        if (isset($data['num_people']) && !isset($data['status'])) {
            $stmt = $pdo->prepare("
                UPDATE seat_reservations 
                SET num_people = :num_people 
                WHERE id = :id
            ");
            
            $stmt->execute([
                ':num_people' => $data['num_people'],
                ':id' => $data['id']
            ]);
            
            error_log("✅ Prenotazione aggiornata - num_people: " . $data['num_people']);
        }
        // Se è presente solo status, aggiorna solo quello
        elseif (isset($data['status']) && !isset($data['num_people'])) {
            $stmt = $pdo->prepare("
                UPDATE seat_reservations 
                SET status = :status 
                WHERE id = :id
            ");
            
            $stmt->execute([
                ':status' => $data['status'],
                ':id' => $data['id']
            ]);
            
            error_log("✅ Prenotazione aggiornata - status: " . $data['status']);
        }
        // Se presenti entrambi, aggiorna entrambi
        else {
            $stmt = $pdo->prepare("
                UPDATE seat_reservations 
                SET status = :status, num_people = :num_people 
                WHERE id = :id
            ");
            
            $stmt->execute([
                ':status' => $data['status'],
                ':num_people' => $data['num_people'],
                ':id' => $data['id']
            ]);
        }
        
        echo json_encode([
            'success' => true,
            'message' => 'Prenotazione aggiornata'
        ]);
        
    } catch (PDOException $e) {
        error_log("❌ Errore aggiornamento prenotazione: " . $e->getMessage());
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'error' => 'Errore database: ' . $e->getMessage()
        ]);
    }
}

// DELETE - Elimina prenotazione
elseif ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($data['id'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'ID richiesto']);
        exit();
    }
    
    try {
        $stmt = $pdo->prepare("DELETE FROM seat_reservations WHERE id = :id");
        $stmt->execute([':id' => $data['id']]);
        
        echo json_encode([
            'success' => true,
            'message' => 'Prenotazione eliminata'
        ]);
        
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'error' => 'Errore database: ' . $e->getMessage()
        ]);
    }
}

else {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'error' => 'Metodo non consentito'
    ]);
}
?>

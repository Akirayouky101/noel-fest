<?php
// Disabilita completamente il caching
header('Cache-Control: no-cache, no-store, must-revalidate, max-age=0');
header('Pragma: no-cache');
header('Expires: 0');

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Gestione richieste OPTIONS (preflight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once 'db_config.php';

$method = $_SERVER['REQUEST_METHOD'];

try {
    $pdo = getDbConnection();
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Errore connessione database: ' . $e->getMessage()]);
    exit;
}

try {
    switch ($method) {
        case 'GET':
            // Recupera tutti gli ordini o uno specifico
            if (isset($_GET['id'])) {
                $stmt = $pdo->prepare("SELECT id, character_name as `character`, email, num_people, order_type as orderType, items, notes, total, status, timestamp FROM orders WHERE id = ?");
                $stmt->execute([$_GET['id']]);
                $order = $stmt->fetch();
                if ($order) {
                    $order['items'] = json_decode($order['items']);
                    echo json_encode($order);
                } else {
                    http_response_code(404);
                    echo json_encode(['error' => 'Ordine non trovato']);
                }
            } else {
                // Recupera tutti gli ordini (per admin)
                $status = $_GET['status'] ?? null;
                if ($status) {
                    $stmt = $pdo->prepare("SELECT id, character_name as `character`, email, num_people, order_type as orderType, items, notes, total, status, timestamp FROM orders WHERE status = ? ORDER BY timestamp DESC");
                    $stmt->execute([$status]);
                } else {
                    $stmt = $pdo->query("SELECT id, character_name as `character`, email, num_people, order_type as orderType, items, notes, total, status, timestamp FROM orders ORDER BY timestamp DESC");
                }
                $orders = $stmt->fetchAll();
                // Decodifica JSON items per ogni ordine
                foreach ($orders as &$order) {
                    $order['items'] = json_decode($order['items']);
                }
                echo json_encode($orders);
            }
            break;

        case 'POST':
            // Crea nuovo ordine
            $input = json_decode(file_get_contents('php://input'), true);
            
            // Log per debug
            error_log("POST ricevuto: " . json_encode($input));
            
            if (!isset($input['character']) || !isset($input['email']) || !isset($input['order_type']) || !isset($input['items']) || empty($input['items'])) {
                http_response_code(400);
                $error = ['error' => 'Dati mancanti: character, email, order_type e items sono obbligatori', 'received' => $input];
                error_log("Errore POST: " . json_encode($error));
                echo json_encode($error);
                exit;
            }

            $character = $input['character'];
            $email = $input['email'];
            $numPeople = $input['num_people'] ?? 1;
            $orderType = $input['order_type'];
            $items = json_encode($input['items']);
            $notes = $input['notes'] ?? null;
            
            // Calcola il totale dai items
            $total = 0;
            foreach ($input['items'] as $item) {
                $total += $item['price'] * $item['quantity'];
            }
            
            $timestamp = $input['timestamp'] ?? date('Y-m-d H:i:s');

            $stmt = $pdo->prepare("INSERT INTO orders (character_name, email, num_people, order_type, items, notes, total, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
            $result = $stmt->execute([$character, $email, $numPeople, $orderType, $items, $notes, $total, $timestamp]);
            
            if (!$result) {
                error_log("Errore inserimento DB: " . json_encode($stmt->errorInfo()));
                http_response_code(500);
                echo json_encode(['error' => 'Errore inserimento database', 'details' => $stmt->errorInfo()]);
                exit;
            }
            
            $orderId = $pdo->lastInsertId();
            
            error_log("Ordine creato con ID: " . $orderId);
            
            http_response_code(201);
            echo json_encode([
                'success' => true,
                'order_id' => $orderId,
                'message' => 'Ordine creato con successo'
            ]);
            break;

        case 'PUT':
            // Aggiorna stato ordine (per admin)
            $input = json_decode(file_get_contents('php://input'), true);
            
            // Accetta sia 'id' che 'orderId'
            $orderId = $input['id'] ?? $input['orderId'] ?? null;
            
            if (!$orderId) {
                http_response_code(400);
                echo json_encode(['error' => 'ID ordine mancante']);
                exit;
            }

            // Se è presente 'status', aggiorna solo lo status
            if (isset($input['status'])) {
                $validStatuses = ['pending', 'preparing', 'completed', 'cancelled'];
                if (!in_array($input['status'], $validStatuses)) {
                    http_response_code(400);
                    echo json_encode(['error' => 'Status non valido']);
                    exit;
                }

                $stmt = $pdo->prepare("UPDATE orders SET status = ? WHERE id = ?");
                $stmt->execute([$input['status'], $orderId]);
                
                if ($stmt->rowCount() > 0) {
                    echo json_encode([
                        'success' => true,
                        'message' => 'Stato ordine aggiornato'
                    ]);
                } else {
                    http_response_code(404);
                    echo json_encode(['error' => 'Ordine non trovato']);
                }
            }
            // Se sono presenti 'items' e 'total', aggiorna items e totale
            elseif (isset($input['items']) && isset($input['total'])) {
                $items = json_encode($input['items']);
                $total = $input['total'];

                $stmt = $pdo->prepare("UPDATE orders SET items = ?, total = ? WHERE id = ?");
                $stmt->execute([$items, $total, $orderId]);
                
                if ($stmt->rowCount() > 0 || $pdo->errorCode() === '00000') {
                    echo json_encode([
                        'success' => true,
                        'message' => 'Ordine aggiornato'
                    ]);
                } else {
                    http_response_code(404);
                    echo json_encode(['error' => 'Ordine non trovato']);
                }
            }
            // Se sono presenti 'num_people' e 'total', aggiorna numero persone e totale
            elseif (isset($input['num_people']) && isset($input['total'])) {
                $numPeople = $input['num_people'];
                $total = $input['total'];

                $stmt = $pdo->prepare("UPDATE orders SET num_people = ?, total = ? WHERE id = ?");
                $stmt->execute([$numPeople, $total, $orderId]);
                
                if ($stmt->rowCount() > 0 || $pdo->errorCode() === '00000') {
                    echo json_encode([
                        'success' => true,
                        'message' => 'Numero persone aggiornato'
                    ]);
                } else {
                    http_response_code(404);
                    echo json_encode(['error' => 'Ordine non trovato']);
                }
            }
            else {
                http_response_code(400);
                echo json_encode(['error' => 'Dati insufficienti per aggiornamento']);
            }
            break;

        case 'DELETE':
            // Elimina ordine
            $input = json_decode(file_get_contents('php://input'), true);
            $orderId = $input['orderId'] ?? $_GET['id'] ?? null;
            
            if (!$orderId) {
                http_response_code(400);
                echo json_encode(['error' => 'ID ordine mancante', 'debug' => $input]);
                exit;
            }

            $stmt = $pdo->prepare("DELETE FROM orders WHERE id = ?");
            $stmt->execute([$orderId]);
            
            if ($stmt->rowCount() > 0) {
                echo json_encode([
                    'success' => true,
                    'message' => 'Ordine eliminato'
                ]);
            } else {
                http_response_code(404);
                echo json_encode(['error' => 'Ordine non trovato', 'orderId' => $orderId]);
            }
            break;

        default:
            http_response_code(405);
            echo json_encode(['error' => 'Metodo non supportato']);
            break;
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Errore database: ' . $e->getMessage()]);
}
?>

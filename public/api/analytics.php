<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once 'db_config.php';

try {
    $pdo = getDbConnection();
    
    // Parametro per filtrare per range temporale
    $range = $_GET['range'] ?? 'all';
    
    $dateCondition = '';
    switch ($range) {
        case 'today':
            $dateCondition = "AND DATE(o.timestamp) = CURDATE()";
            break;
        case 'week':
            $dateCondition = "AND o.timestamp >= DATE_SUB(NOW(), INTERVAL 7 DAY)";
            break;
        case 'all':
        default:
            $dateCondition = '';
            break;
    }
    
    // TOTALI GENERALI
    $stmt = $pdo->prepare("
        SELECT 
            COUNT(*) as total_orders,
            SUM(total) as total_revenue,
            SUM(num_people) as total_people,
            SUM(num_people * 1.50) as total_coperto,
            AVG(total) as average_order
        FROM orders o
        WHERE status != 'cancelled' $dateCondition
    ");
    $stmt->execute();
    $totals = $stmt->fetch(PDO::FETCH_ASSOC);
    
    // Conta items totali venduti
    $stmt = $pdo->prepare("
        SELECT SUM(JSON_LENGTH(items)) as total_items
        FROM orders o
        WHERE status != 'cancelled' $dateCondition
    ");
    $stmt->execute();
    $itemsCount = $stmt->fetch(PDO::FETCH_ASSOC);
    
    // POSTI OCCUPATI
    $stmt = $pdo->prepare("SELECT config_value FROM system_config WHERE config_key = 'total_seats'");
    $stmt->execute();
    $totalSeats = (int)$stmt->fetchColumn();
    
    $stmt = $pdo->prepare("SELECT config_value FROM system_config WHERE config_key = 'walkin_seats'");
    $stmt->execute();
    $totalWalkinSeats = (int)$stmt->fetchColumn();
    
    $stmt = $pdo->prepare("SELECT COALESCE(SUM(num_people), 0) FROM seat_reservations WHERE status = 'active'");
    $stmt->execute();
    $occupiedSeats = (int)$stmt->fetchColumn();
    
    $stmt = $pdo->prepare("SELECT COALESCE(SUM(num_people), 0) FROM walkin_seats WHERE status = 'occupied'");
    $stmt->execute();
    $occupiedWalkinSeats = (int)$stmt->fetchColumn();
    
    // PIATTI PIÙ VENDUTI (escluse bibite)
    $stmt = $pdo->prepare("
        SELECT 
            item_name,
            SUM(item_quantity) as quantity,
            SUM(item_quantity * item_price) as revenue
        FROM (
            SELECT 
                JSON_UNQUOTE(JSON_EXTRACT(item, '$.name')) as item_name,
                CAST(JSON_UNQUOTE(JSON_EXTRACT(item, '$.quantity')) AS UNSIGNED) as item_quantity,
                CAST(JSON_UNQUOTE(JSON_EXTRACT(item, '$.price')) AS DECIMAL(10,2)) as item_price,
                JSON_UNQUOTE(JSON_EXTRACT(item, '$.category')) as item_category
            FROM orders o,
            JSON_TABLE(
                o.items,
                '$[*]' COLUMNS(
                    item JSON PATH '$'
                )
            ) as jt
            WHERE o.status != 'cancelled' $dateCondition
        ) as items_data
        WHERE item_category != 'Bibite'
        GROUP BY item_name
        ORDER BY quantity DESC
    ");
    $stmt->execute();
    $topDishes = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // BIBITE PIÙ VENDUTE
    $stmt = $pdo->prepare("
        SELECT 
            item_name,
            SUM(item_quantity) as quantity,
            SUM(item_quantity * item_price) as revenue
        FROM (
            SELECT 
                JSON_UNQUOTE(JSON_EXTRACT(item, '$.name')) as item_name,
                CAST(JSON_UNQUOTE(JSON_EXTRACT(item, '$.quantity')) AS UNSIGNED) as item_quantity,
                CAST(JSON_UNQUOTE(JSON_EXTRACT(item, '$.price')) AS DECIMAL(10,2)) as item_price,
                JSON_UNQUOTE(JSON_EXTRACT(item, '$.category')) as item_category
            FROM orders o,
            JSON_TABLE(
                o.items,
                '$[*]' COLUMNS(
                    item JSON PATH '$'
                )
            ) as jt
            WHERE o.status != 'cancelled' $dateCondition
        ) as items_data
        WHERE item_category = 'Bibite'
        GROUP BY item_name
        ORDER BY quantity DESC
    ");
    $stmt->execute();
    $topDrinks = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // VENDITE PER CATEGORIA
    $stmt = $pdo->prepare("
        SELECT 
            item_category as category,
            SUM(item_quantity) as quantity,
            SUM(item_quantity * item_price) as revenue
        FROM (
            SELECT 
                JSON_UNQUOTE(JSON_EXTRACT(item, '$.category')) as item_category,
                CAST(JSON_UNQUOTE(JSON_EXTRACT(item, '$.quantity')) AS UNSIGNED) as item_quantity,
                CAST(JSON_UNQUOTE(JSON_EXTRACT(item, '$.price')) AS DECIMAL(10,2)) as item_price
            FROM orders o,
            JSON_TABLE(
                o.items,
                '$[*]' COLUMNS(
                    item JSON PATH '$'
                )
            ) as jt
            WHERE o.status != 'cancelled' $dateCondition
        ) as items_data
        GROUP BY item_category
        ORDER BY revenue DESC
    ");
    $stmt->execute();
    $categories = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Calcola percentuali
    $totalCategoryRevenue = array_sum(array_column($categories, 'revenue'));
    foreach ($categories as &$cat) {
        $cat['percentage'] = $totalCategoryRevenue > 0 ? ($cat['revenue'] / $totalCategoryRevenue) * 100 : 0;
    }
    
    // ORDINI PER STATO
    $stmt = $pdo->prepare("
        SELECT status, COUNT(*) as count
        FROM orders o
        WHERE 1=1 $dateCondition
        GROUP BY status
    ");
    $stmt->execute();
    $ordersByStatusArray = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    $ordersByStatus = [
        'pending' => 0,
        'preparing' => 0,
        'completed' => 0,
        'cancelled' => 0
    ];
    foreach ($ordersByStatusArray as $row) {
        $ordersByStatus[$row['status']] = (int)$row['count'];
    }
    
    // ORDINI PER TIPO
    $stmt = $pdo->prepare("
        SELECT order_type, COUNT(*) as count
        FROM orders o
        WHERE status != 'cancelled' $dateCondition
        GROUP BY order_type
    ");
    $stmt->execute();
    $ordersByTypeArray = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    $ordersByType = [
        'immediate' => 0,
        'at_register' => 0
    ];
    foreach ($ordersByTypeArray as $row) {
        $ordersByType[$row['order_type']] = (int)$row['count'];
    }
    
    // Formatta i dati numerici
    $totals['total_revenue'] = (float)($totals['total_revenue'] ?? 0);
    $totals['total_people'] = (int)($totals['total_people'] ?? 0);
    $totals['total_coperto'] = (float)($totals['total_coperto'] ?? 0);
    $totals['average_order'] = (float)($totals['average_order'] ?? 0);
    $totals['total_items'] = (int)($itemsCount['total_items'] ?? 0);
    
    // Risposta JSON
    echo json_encode([
        'success' => true,
        'stats' => [
            'totals' => [
                'orders' => (int)$totals['total_orders'],
                'revenue' => $totals['total_revenue'],
                'people' => $totals['total_people'],
                'coperto' => $totals['total_coperto'],
                'items' => $totals['total_items'],
                'averageOrder' => $totals['average_order']
            ],
            'seats' => [
                'total' => $totalSeats,
                'occupied' => $occupiedSeats,
                'walkin_total' => $totalWalkinSeats,
                'walkin_occupied' => $occupiedWalkinSeats
            ],
            'topDishes' => array_map(function($dish) {
                return [
                    'name' => $dish['item_name'],
                    'quantity' => (int)$dish['quantity'],
                    'revenue' => (float)$dish['revenue']
                ];
            }, $topDishes),
            'topDrinks' => array_map(function($drink) {
                return [
                    'name' => $drink['item_name'],
                    'quantity' => (int)$drink['quantity'],
                    'revenue' => (float)$drink['revenue']
                ];
            }, $topDrinks),
            'categories' => $categories,
            'ordersByStatus' => $ordersByStatus,
            'ordersByType' => $ordersByType
        ],
        'range' => $range
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Errore nel caricamento delle statistiche: ' . $e->getMessage()
    ]);
}
?>

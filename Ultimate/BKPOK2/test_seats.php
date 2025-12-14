<?php
// Test rapido per seats.php
echo "Testing seats.php...\n";

require_once 'api/db_config.php';

try {
    $pdo = getDbConnection();
    echo "✅ Connessione DB OK\n";
    
    // Test query total_seats
    $stmt = $pdo->prepare("SELECT config_value FROM system_config WHERE config_key = 'total_seats'");
    $stmt->execute();
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    $totalSeats = $result ? (int)$result['config_value'] : 150;
    echo "✅ Total seats: $totalSeats\n";
    
    // Test query occupied
    $stmt = $pdo->prepare("SELECT COALESCE(SUM(num_people), 0) as occupied FROM seat_reservations WHERE status = 'active'");
    $stmt->execute();
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    $occupiedSeats = (int)$result['occupied'];
    echo "✅ Occupied seats: $occupiedSeats\n";
    
    $availableSeats = max(0, $totalSeats - $occupiedSeats);
    echo "✅ Available seats: $availableSeats\n";
    
    echo "\n🎉 seats.php dovrebbe funzionare!\n";
    
} catch (PDOException $e) {
    echo "❌ Errore: " . $e->getMessage() . "\n";
}
?>

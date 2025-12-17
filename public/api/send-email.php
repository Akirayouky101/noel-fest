<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit();
}

// Get JSON data
$json = file_get_contents('php://input');
$data = json_decode($json, true);

// Validate required fields
if (!isset($data['email']) || !isset($data['characterName'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Missing required fields']);
    exit();
}

// Extract data
$toEmail = $data['email'];
$characterName = $data['characterName'];
$orderType = $data['orderType'] ?? 'immediato';
$numPeople = $data['numPeople'] ?? 1;
$total = $data['total'] ?? 0;
$items = $data['items'] ?? [];
$orderDate = date('d/m/Y H:i');

// Format items list
$itemsList = '';
foreach ($items as $item) {
    $quantity = $item['quantity'] ?? 1;
    $name = $item['name'] ?? 'Prodotto';
    $price = $item['price'] ?? 0;
    $itemTotal = $quantity * $price;
    $itemsList .= "• {$quantity}x {$name} - €" . number_format($itemTotal, 2) . "\n";
}

// Instructions based on order type
$instructions = '';
if ($orderType === 'immediato') {
    $instructions = "⚡ ORDINE IMMEDIATO\nIl tuo ordine verrà preparato subito!\nPresentati alla cassa con il nome del personaggio: {$characterName}";
} else {
    $instructions = "📅 PRENOTAZIONE\nIl tuo tavolo è prenotato!\nPresentati all'ingresso con il nome del personaggio: {$characterName}";
}

// Email subject
$subject = "🎄 Ordine Noel Fest - {$characterName}";

// Email body (HTML)
$htmlBody = "
<!DOCTYPE html>
<html>
<head>
    <meta charset='UTF-8'>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9; }
        .header { background: linear-gradient(135deg, #8B0000, #CD5C5C); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: white; padding: 30px; border-radius: 0 0 10px 10px; }
        .character { font-size: 24px; font-weight: bold; color: #8B0000; margin: 20px 0; text-align: center; }
        .section { margin: 25px 0; padding: 15px; background: #f0f0f0; border-radius: 8px; }
        .section-title { font-size: 18px; font-weight: bold; color: #8B0000; margin-bottom: 10px; }
        .items { background: white; padding: 15px; border-radius: 5px; }
        .item { padding: 8px 0; border-bottom: 1px solid #eee; }
        .total { font-size: 20px; font-weight: bold; color: #10b981; text-align: right; margin-top: 15px; }
        .instructions { background: #fff9e6; border-left: 4px solid #FFD700; padding: 15px; margin: 20px 0; }
        .footer { text-align: center; color: #666; margin-top: 30px; font-size: 14px; }
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h1>🎄 Noel Fest 🎅</h1>
            <p>Conferma Ordine</p>
        </div>
        <div class='content'>
            <p>Ciao!</p>
            <p>Grazie per il tuo ordine al Noel Fest! 🎄</p>
            
            <div class='character'>
                🎭 Personaggio: {$characterName}
            </div>
            
            <div class='section'>
                <div class='section-title'>📋 Dettagli Ordine</div>
                <p><strong>👥 Numero persone:</strong> {$numPeople}</p>
                <p><strong>📦 Tipo ordine:</strong> {$orderType}</p>
                <p><strong>📅 Data:</strong> {$orderDate}</p>
            </div>
            
            <div class='section'>
                <div class='section-title'>🍽️ Il Tuo Ordine</div>
                <div class='items'>
                    " . nl2br(htmlspecialchars($itemsList)) . "
                </div>
                <div class='total'>Totale: €" . number_format($total, 2) . "</div>
            </div>
            
            <div class='instructions'>
                <strong>📌 IMPORTANTE:</strong><br>
                " . nl2br(htmlspecialchars($instructions)) . "
            </div>
            
            <div class='footer'>
                <p>A presto al Noel Fest! 🎅✨</p>
                <p style='font-size: 12px; color: #999;'>Questa è una email automatica, non rispondere a questo messaggio.</p>
            </div>
        </div>
    </div>
</body>
</html>
";

// Plain text version
$textBody = "
Ciao!

Grazie per il tuo ordine al Noel Fest! 🎄

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 DETTAGLI ORDINE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎭 Personaggio: {$characterName}
👥 Numero persone: {$numPeople}
📦 Tipo ordine: {$orderType}
💰 Totale: €" . number_format($total, 2) . "

🍽️ IL TUO ORDINE:
{$itemsList}

📌 ISTRUZIONI:
{$instructions}

📅 Data: {$orderDate}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

A presto al Noel Fest! 🎅

Questa è una email automatica, non rispondere a questo messaggio.
";

// Email headers
$headers = "MIME-Version: 1.0\r\n";
$headers .= "Content-Type: text/html; charset=UTF-8\r\n";
$headers .= "From: Noel Fest <prolocolanzo@appdataconnect.it>\r\n";
$headers .= "Reply-To: prolocolanzo@appdataconnect.it\r\n";
$headers .= "X-Mailer: PHP/" . phpversion();

// Send email using PHP mail() function
// Note: Siteground's PHP mail() is already configured to use your SMTP settings
$success = mail($toEmail, $subject, $htmlBody, $headers);

if ($success) {
    echo json_encode([
        'success' => true,
        'message' => 'Email sent successfully'
    ]);
} else {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Failed to send email'
    ]);
}
?>

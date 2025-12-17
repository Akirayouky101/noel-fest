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

// Nuovo: gestisci prenotazione solo posti
$isSeatsOnly = isset($data['isSeatsOnly']) && $data['isSeatsOnly'] === true;
$sessionType = $data['sessionType'] ?? null;
$sessionDate = $data['sessionDate'] ?? null;
$sessionTime = $data['sessionTime'] ?? null;

// Format items list
$itemsList = '';
if (count($items) > 0) {
    foreach ($items as $item) {
        $quantity = $item['quantity'] ?? 1;
        $name = $item['name'] ?? 'Prodotto';
        $price = $item['price'] ?? 0;
        $itemTotal = $quantity * $price;
        $itemsList .= "• {$quantity}x {$name} - €" . number_format($itemTotal, 2) . "\n";
    }
} else if ($isSeatsOnly) {
    $itemsList = "Nessun ordine ancora effettuato.\nOrdinerai direttamente in presenza al locale.";
}

// Instructions based on order type
$instructions = '';
if ($isSeatsOnly) {
    // Prenotazione solo posti
    $sessionLabel = $sessionType === 'lunch' ? 'Pranzo' : 'Cena';
    $instructions = "🪑 PRENOTAZIONE POSTI\n\n";
    $instructions .= "I tuoi posti sono stati riservati!\n\n";
    $instructions .= "📅 Sessione: {$sessionLabel}\n";
    if ($sessionDate) {
        $instructions .= "📆 Data: {$sessionDate}\n";
    }
    if ($sessionTime) {
        $instructions .= "🕐 Orario: {$sessionTime}\n";
    }
    $instructions .= "\n💡 L'ordinazione verrà effettuata direttamente in presenza.\n";
    $instructions .= "Presentati all'ingresso con il nome del personaggio: {$characterName}";
} else if ($orderType === 'immediato') {
    $instructions = "⚡ ORDINE IMMEDIATO\nIl tuo ordine verrà preparato subito!\nPresentati alla cassa con il nome del personaggio: {$characterName}";
} else {
    $instructions = "📅 PRENOTAZIONE\nIl tuo tavolo è prenotato!\nPresentati all'ingresso con il nome del personaggio: {$characterName}";
}

// Email subject
$subject = $isSeatsOnly 
    ? "🎄 Prenotazione Posti Noel Fest - {$characterName}"
    : "🎄 Ordine Noel Fest - {$characterName}";

// Email body (HTML) - Christmas themed like the website
$htmlBody = "
<!DOCTYPE html>
<html>
<head>
    <meta charset='UTF-8'>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Poppins:wght@400;600&display=swap');
        
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        body {
            font-family: 'Poppins', Arial, sans-serif;
            line-height: 1.6;
            background: linear-gradient(135deg, #1a0505 0%, #4a0e0e 100%);
            padding: 20px;
        }
        
        .email-wrapper {
            max-width: 600px;
            margin: 0 auto;
            background: rgba(139, 0, 0, 0.95);
            border-radius: 20px;
            overflow: hidden;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
            border: 3px solid #FFD700;
        }
        
        .header {
            background: linear-gradient(135deg, #8B0000 0%, #CD5C5C 100%);
            padding: 40px 20px;
            text-align: center;
            position: relative;
            border-bottom: 3px solid #FFD700;
        }
        
        .header::before {
            content: '❄️';
            position: absolute;
            top: 10px;
            left: 20px;
            font-size: 30px;
            animation: float 3s ease-in-out infinite;
        }
        
        .header::after {
            content: '❄️';
            position: absolute;
            top: 10px;
            right: 20px;
            font-size: 30px;
            animation: float 3s ease-in-out infinite 1.5s;
        }
        
        .header h1 {
            font-family: 'Playfair Display', serif;
            font-size: 42px;
            color: #FFD700;
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
            margin-bottom: 10px;
            letter-spacing: 2px;
        }
        
        .header p {
            color: white;
            font-size: 18px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 3px;
        }
        
        .content {
            background: rgba(255, 255, 255, 0.98);
            padding: 40px 30px;
        }
        
        .greeting {
            color: #8B0000;
            font-size: 18px;
            margin-bottom: 15px;
            font-weight: 600;
        }
        
        .intro {
            color: #333;
            font-size: 16px;
            margin-bottom: 30px;
        }
        
        .character-box {
            background: linear-gradient(135deg, #8B0000 0%, #CD5C5C 100%);
            color: white;
            padding: 25px;
            border-radius: 15px;
            text-align: center;
            margin: 30px 0;
            border: 3px solid #FFD700;
            box-shadow: 0 5px 15px rgba(139, 0, 0, 0.3);
        }
        
        .character-icon {
            font-size: 50px;
            margin-bottom: 10px;
            display: block;
        }
        
        .character-name {
            font-size: 28px;
            font-weight: 700;
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
            color: #FFD700;
            letter-spacing: 1px;
        }
        
        .section {
            background: #f8f9fa;
            padding: 25px;
            border-radius: 12px;
            margin: 20px 0;
            border-left: 5px solid #8B0000;
        }
        
        .section-title {
            font-size: 20px;
            font-weight: 700;
            color: #8B0000;
            margin-bottom: 15px;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .detail-row {
            display: flex;
            justify-content: space-between;
            padding: 12px 0;
            border-bottom: 1px solid #dee2e6;
            color: #333;
        }
        
        .detail-row:last-child {
            border-bottom: none;
        }
        
        .detail-label {
            font-weight: 600;
            color: #666;
        }
        
        .detail-value {
            font-weight: 600;
            color: #8B0000;
        }
        
        .order-items {
            background: white;
            padding: 20px;
            border-radius: 10px;
            margin-top: 15px;
        }
        
        .order-item {
            padding: 12px 0;
            border-bottom: 1px solid #eee;
            color: #333;
            font-size: 15px;
        }
        
        .order-item:last-child {
            border-bottom: none;
        }
        
        .total-box {
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: white;
            padding: 20px;
            border-radius: 10px;
            text-align: right;
            margin-top: 20px;
            font-size: 24px;
            font-weight: 700;
            box-shadow: 0 5px 15px rgba(16, 185, 129, 0.3);
        }
        
        .instructions-box {
            background: linear-gradient(135deg, #fff9e6 0%, #fffaf0 100%);
            border-left: 5px solid #FFD700;
            padding: 25px;
            border-radius: 10px;
            margin: 25px 0;
            box-shadow: 0 3px 10px rgba(255, 215, 0, 0.2);
        }
        
        .instructions-title {
            font-size: 18px;
            font-weight: 700;
            color: #8B0000;
            margin-bottom: 12px;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .instructions-text {
            color: #333;
            line-height: 1.8;
            font-size: 15px;
        }
        
        .footer {
            background: #8B0000;
            color: white;
            padding: 30px;
            text-align: center;
            border-top: 3px solid #FFD700;
        }
        
        .footer-message {
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 15px;
            color: #FFD700;
        }
        
        .footer-note {
            font-size: 12px;
            color: rgba(255, 255, 255, 0.7);
            font-style: italic;
        }
        
        .snowflakes {
            font-size: 20px;
            opacity: 0.6;
            margin: 10px 0;
        }
        
        @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
        }
    </style>
</head>
<body>
    <div class='email-wrapper'>
        <div class='header'>
            <h1>🎄 Noel Fest 🎅</h1>
            <p>" . ($isSeatsOnly ? "Conferma Prenotazione Posti" : "Conferma Ordine") . "</p>
        </div>
        
        <div class='content'>
            <p class='greeting'>Ciao!</p>
            <p class='intro'>" . ($isSeatsOnly 
                ? "I tuoi posti al Noel Fest sono stati prenotati con successo! 🪑✨" 
                : "Grazie per il tuo ordine al Noel Fest! Il tuo ordine è stato confermato con successo. 🎄✨"
            ) . "</p>
            
            <div class='character-box'>
                <span class='character-icon'>🎭</span>
                <div class='character-name'>{$characterName}</div>
            </div>
            
            <div class='section'>
                <div class='section-title'>📋 Dettagli Ordine</div>
                <div class='detail-row'>
                    <span class='detail-label'>👥 Numero persone:</span>
                    <span class='detail-value'>{$numPeople}</span>
                </div>
                <div class='detail-row'>
                    <span class='detail-label'>📦 Tipo ordine:</span>
                    <span class='detail-value'>{$orderType}</span>
                </div>
                <div class='detail-row'>
                    <span class='detail-label'>📅 Data:</span>
                    <span class='detail-value'>{$orderDate}</span>
                </div>
            </div>
            
            <div class='section'>
                <div class='section-title'>" . ($isSeatsOnly ? "🪑 Prenotazione Posti" : "🍽️ Il Tuo Ordine") . "</div>
                <div class='order-items'>
                    " . nl2br(htmlspecialchars($itemsList)) . "
                </div>
                " . ($isSeatsOnly ? "" : "<div class='total-box'>
                    Totale: €" . number_format($total, 2) . "
                </div>") . "
            </div>
            
            <div class='instructions-box'>
                <div class='instructions-title'>📌 IMPORTANTE</div>
                <div class='instructions-text'>
                    " . nl2br(htmlspecialchars($instructions)) . "
                </div>
            </div>
        </div>
        
        <div class='footer'>
            <div class='snowflakes'>❄️ ❄️ ❄️ ❄️ ❄️</div>
            <p class='footer-message'>A presto al Noel Fest! 🎅✨</p>
            <p class='footer-note'>Questa è una email automatica, non rispondere a questo messaggio.</p>
            <div class='snowflakes'>❄️ ❄️ ❄️ ❄️ ❄️</div>
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

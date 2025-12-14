<?php
// Test script per verificare le API walk-in
header('Content-Type: text/html; charset=utf-8');
?>
<!DOCTYPE html>
<html>
<head>
    <title>Test Walk-in System</title>
    <style>
        body { font-family: Arial; padding: 20px; background: #f5f5f5; }
        .container { max-width: 800px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; }
        h1 { color: #0d6efd; }
        .test { margin: 20px 0; padding: 15px; background: #f8f9fa; border-left: 4px solid #0d6efd; }
        button { padding: 10px 20px; margin: 5px; cursor: pointer; background: #0d6efd; color: white; border: none; border-radius: 4px; }
        button:hover { background: #0b5ed7; }
        .success { color: green; }
        .error { color: red; }
        pre { background: #f1f1f1; padding: 10px; border-radius: 4px; overflow-x: auto; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🚶 Test Sistema Walk-in</h1>
        
        <div class="test">
            <h3>1. Verifica disponibilità posti walk-in</h3>
            <button onclick="checkWalkinSeats()">GET /api/walkin-seats.php</button>
            <div id="result1"></div>
        </div>
        
        <div class="test">
            <h3>2. Occupa 3 posti walk-in per Biancaneve</h3>
            <button onclick="occupyWalkin()">POST /api/walkin-seats.php</button>
            <div id="result2"></div>
        </div>
        
        <div class="test">
            <h3>3. Verifica personaggi con walk-in attivi</h3>
            <button onclick="checkWalkinDetails()">GET /api/walkin-seats.php?details=1</button>
            <div id="result3"></div>
        </div>
        
        <div class="test">
            <h3>4. Libera posti walk-in di Biancaneve</h3>
            <button onclick="freeWalkin()">PUT /api/walkin-seats.php</button>
            <div id="result4"></div>
        </div>
        
        <div class="test">
            <h3>5. Elimina occupazione walk-in di Biancaneve</h3>
            <button onclick="deleteWalkin()">DELETE /api/walkin-seats.php</button>
            <div id="result5"></div>
        </div>
    </div>
    
    <script>
        async function checkWalkinSeats() {
            try {
                const response = await fetch('/api/walkin-seats.php');
                const data = await response.json();
                document.getElementById('result1').innerHTML = `
                    <p class="success">✅ Risposta ricevuta</p>
                    <pre>${JSON.stringify(data, null, 2)}</pre>
                `;
            } catch (error) {
                document.getElementById('result1').innerHTML = `<p class="error">❌ Errore: ${error.message}</p>`;
            }
        }
        
        async function occupyWalkin() {
            try {
                const response = await fetch('/api/walkin-seats.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        character_name: 'Biancaneve',
                        num_people: 3
                    })
                });
                const data = await response.json();
                document.getElementById('result2').innerHTML = `
                    <p class="${data.success ? 'success' : 'error'}">
                        ${data.success ? '✅ Posti occupati' : '❌ Errore'}
                    </p>
                    <pre>${JSON.stringify(data, null, 2)}</pre>
                `;
            } catch (error) {
                document.getElementById('result2').innerHTML = `<p class="error">❌ Errore: ${error.message}</p>`;
            }
        }
        
        async function checkWalkinDetails() {
            try {
                const response = await fetch('/api/walkin-seats.php?details=1');
                const data = await response.json();
                document.getElementById('result3').innerHTML = `
                    <p class="success">✅ Risposta ricevuta</p>
                    <pre>${JSON.stringify(data, null, 2)}</pre>
                `;
            } catch (error) {
                document.getElementById('result3').innerHTML = `<p class="error">❌ Errore: ${error.message}</p>`;
            }
        }
        
        async function freeWalkin() {
            try {
                const response = await fetch('/api/walkin-seats.php', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        character_name: 'Biancaneve'
                    })
                });
                const data = await response.json();
                document.getElementById('result4').innerHTML = `
                    <p class="${data.success ? 'success' : 'error'}">
                        ${data.success ? '✅ Posti liberati' : '❌ Errore'}
                    </p>
                    <pre>${JSON.stringify(data, null, 2)}</pre>
                `;
            } catch (error) {
                document.getElementById('result4').innerHTML = `<p class="error">❌ Errore: ${error.message}</p>`;
            }
        }
        
        async function deleteWalkin() {
            try {
                const response = await fetch('/api/walkin-seats.php', {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        character_name: 'Biancaneve'
                    })
                });
                const data = await response.json();
                document.getElementById('result5').innerHTML = `
                    <p class="${data.success ? 'success' : 'error'}">
                        ${data.success ? '✅ Record eliminato' : '❌ Errore'}
                    </p>
                    <pre>${JSON.stringify(data, null, 2)}</pre>
                `;
            } catch (error) {
                document.getElementById('result5').innerHTML = `<p class="error">❌ Errore: ${error.message}</p>`;
            }
        }
    </script>
</body>
</html>

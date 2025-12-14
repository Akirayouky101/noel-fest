# DEBUG CONTATORE POSTI

## Problema
I posti non scalano quando si fa una prenotazione.

## Checklist Verifica

### 1. Database
- [ ] Tabella `seat_reservations` esiste?
- [ ] Tabella `system_config` ha `total_seats = 150`?
- [ ] Query test: `SELECT * FROM seat_reservations WHERE status='active'`
- [ ] Query test: `SELECT COALESCE(SUM(num_people), 0) FROM seat_reservations WHERE status='active'`

### 2. Backend API
- [ ] `/api/reservations.php` funziona? (test POST)
- [ ] `/api/seats.php` restituisce i dati corretti?

### 3. Frontend
- [ ] `Menu.jsx` handleEmailSubmit fa POST a `/api/reservations.php`?
- [ ] Dopo POST, chiama `fetchAvailableSeats()`?
- [ ] Polling ogni 30 secondi attivo?

## SQL da eseguire su phpMyAdmin

```sql
-- 1. Verifica tabelle
SHOW TABLES;

-- 2. Verifica struttura seat_reservations
DESCRIBE seat_reservations;

-- 3. Verifica configurazione
SELECT * FROM system_config WHERE config_key='total_seats';

-- 4. Verifica prenotazioni
SELECT * FROM seat_reservations;

-- 5. Calcola posti occupati
SELECT COALESCE(SUM(num_people), 0) as posti_occupati 
FROM seat_reservations 
WHERE status = 'active';

-- 6. Se mancano tabelle, esegui:
CREATE TABLE IF NOT EXISTS seat_reservations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    character_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NULL,
    num_people INT NOT NULL,
    status ENUM('active', 'completed', 'cancelled') DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_status (status),
    INDEX idx_character (character_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO system_config (config_key, config_value) VALUES ('total_seats', '150')
ON DUPLICATE KEY UPDATE config_value='150';
```

## Test manuale

1. Apri console browser (F12)
2. Fai una prenotazione di 10 posti
3. Verifica nella console se appare: "POST /api/reservations.php"
4. Verifica nella console la risposta
5. Controlla su phpMyAdmin se il record è stato inserito

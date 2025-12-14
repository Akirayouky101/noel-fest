-- Verifica e crea la tabella seat_reservations se non esiste
-- Database: dbgxaxaie7pbze

-- Crea la tabella prenotazioni posti
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

-- Verifica che system_config abbia il valore total_seats
INSERT INTO system_config (config_key, config_value) VALUES ('total_seats', '150')
ON DUPLICATE KEY UPDATE config_value='150';

-- Mostra le tabelle create
SHOW TABLES;

-- Mostra la struttura della tabella seat_reservations
DESCRIBE seat_reservations;

-- Mostra le prenotazioni attuali
SELECT * FROM seat_reservations;

-- Mostra il conteggio posti occupati
SELECT COALESCE(SUM(num_people), 0) as posti_occupati 
FROM seat_reservations 
WHERE status = 'active';

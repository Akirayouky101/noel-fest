-- Script SQL per creare le tabelle del sistema Noel Fest
-- Database: dbgxaxaie7pbze

-- Tabella ordini
CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    character_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NULL,
    num_people INT DEFAULT 1,
    order_type ENUM('immediate', 'at_register') DEFAULT 'immediate',
    items JSON NOT NULL,
    notes TEXT,
    total DECIMAL(10, 2) NOT NULL,
    status ENUM('pending', 'preparing', 'completed', 'cancelled') DEFAULT 'pending',
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_status (status),
    INDEX idx_timestamp (timestamp),
    INDEX idx_character (character_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabella prenotazioni posti
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

-- Configurazione sistema (posti totali disponibili)
CREATE TABLE IF NOT EXISTS system_config (
    id INT AUTO_INCREMENT PRIMARY KEY,
    config_key VARCHAR(50) NOT NULL UNIQUE,
    config_value TEXT NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabella posti walk-in (100 posti per clienti senza prenotazione)
CREATE TABLE IF NOT EXISTS walkin_seats (
    id INT AUTO_INCREMENT PRIMARY KEY,
    character_name VARCHAR(100) NOT NULL,
    num_people INT NOT NULL,
    status ENUM('occupied', 'freed') DEFAULT 'occupied',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    freed_at DATETIME NULL,
    INDEX idx_status (status),
    INDEX idx_character (character_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Inserisci configurazione posti totali
INSERT INTO system_config (config_key, config_value) VALUES ('total_seats', '150')
ON DUPLICATE KEY UPDATE config_value='150';

-- Inserisci configurazione posti walk-in
INSERT INTO system_config (config_key, config_value) VALUES ('walkin_seats', '100')
ON DUPLICATE KEY UPDATE config_value='100';

-- Inserisci configurazione prezzo coperto
INSERT INTO system_config (config_key, config_value) VALUES ('coperto_price', '1.50')
ON DUPLICATE KEY UPDATE config_value='1.50';

-- Inserisci configurazione abilitazione prenotazioni
INSERT INTO system_config (config_key, config_value) VALUES ('reservations_enabled', '1')
ON DUPLICATE KEY UPDATE config_value='1';

-- Inserisci configurazione abilitazione ordini
INSERT INTO system_config (config_key, config_value) VALUES ('orders_enabled', '1')
ON DUPLICATE KEY UPDATE config_value='1';

-- Se le tabelle esistono già, aggiungi i campi mancanti:
-- ALTER TABLE orders DROP COLUMN table_number;
-- ALTER TABLE orders DROP COLUMN session_token;
-- ALTER TABLE orders DROP COLUMN locked_by;
-- ALTER TABLE orders DROP COLUMN locked_at;
-- ALTER TABLE orders ADD COLUMN email VARCHAR(255) NULL AFTER character_name;
-- ALTER TABLE orders ADD COLUMN num_people INT DEFAULT 1 AFTER email;
-- ALTER TABLE orders ADD COLUMN order_type ENUM('immediate', 'at_register') DEFAULT 'immediate' AFTER num_people;

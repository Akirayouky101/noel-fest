-- =====================================================
-- MIGRAZIONE DATABASE: Table-based → Character-based
-- =====================================================
-- Esegui questo script SOLO se hai già un database
-- con il vecchio schema (table_number, session_token)
-- =====================================================

-- STEP 1: Backup tabella ordini esistente
CREATE TABLE IF NOT EXISTS orders_backup_old_system AS SELECT * FROM orders;

-- STEP 2: Rimuovi colonne vecchie da orders (una alla volta per compatibilità)
ALTER TABLE orders DROP COLUMN table_number;
ALTER TABLE orders DROP COLUMN session_token;
ALTER TABLE orders DROP COLUMN locked_by;
ALTER TABLE orders DROP COLUMN locked_at;

-- STEP 3: Aggiungi nuove colonne a orders
ALTER TABLE orders 
ADD COLUMN email VARCHAR(255) AFTER character_name,
ADD COLUMN num_people INT DEFAULT 1 AFTER email,
ADD COLUMN order_type ENUM('immediate', 'at_register') DEFAULT 'immediate' AFTER num_people;

-- STEP 4: Crea nuova tabella seat_reservations
CREATE TABLE IF NOT EXISTS seat_reservations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    character_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    num_people INT NOT NULL DEFAULT 1,
    status ENUM('active', 'completed', 'cancelled') DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_status (status),
    INDEX idx_character (character_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- STEP 5: Crea tabella system_config
CREATE TABLE IF NOT EXISTS system_config (
    config_key VARCHAR(100) PRIMARY KEY,
    config_value VARCHAR(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- STEP 6: Inserisci configurazione totale posti
INSERT INTO system_config (config_key, config_value) 
VALUES ('total_seats', '150')
ON DUPLICATE KEY UPDATE config_value = '150';

-- STEP 7: Elimina tabelle vecchie non più usate
DROP TABLE IF EXISTS reservations;
DROP TABLE IF EXISTS operators;

-- =====================================================
-- VERIFICA POST-MIGRAZIONE
-- =====================================================

-- Controlla struttura orders
SELECT COLUMN_NAME, DATA_TYPE 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'orders' 
AND TABLE_SCHEMA = DATABASE();

-- Controlla se esistono nuove tabelle
SHOW TABLES LIKE '%seat%';
SHOW TABLES LIKE '%config%';

-- =====================================================
-- CLEANUP (opzionale - esegui SOLO se sicuro)
-- =====================================================

-- Dopo aver verificato che tutto funziona:
-- DROP TABLE IF EXISTS orders_backup_old_system;

-- =====================================================
-- FINE MIGRAZIONE
-- =====================================================

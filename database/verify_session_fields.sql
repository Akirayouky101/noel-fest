-- Script per verificare se i campi sessione esistono

-- 1. Mostra la struttura della tabella orders
DESCRIBE orders;

-- 2. Verifica se i campi sessione esistono
SELECT 
    COLUMN_NAME, 
    DATA_TYPE, 
    IS_NULLABLE, 
    COLUMN_DEFAULT
FROM 
    INFORMATION_SCHEMA.COLUMNS
WHERE 
    TABLE_NAME = 'orders' 
    AND COLUMN_NAME IN ('session_type', 'session_date', 'session_time');

-- 3. Se i campi esistono, mostra statistiche
SELECT 
    COUNT(*) as total_orders,
    COUNT(CASE WHEN session_type = 'immediate' OR session_type IS NULL THEN 1 END) as immediate_orders,
    COUNT(CASE WHEN session_type = 'lunch' THEN 1 END) as lunch_reservations,
    COUNT(CASE WHEN session_type = 'dinner' THEN 1 END) as dinner_reservations,
    COUNT(CASE WHEN session_type IS NULL THEN 1 END) as null_session_type
FROM orders;

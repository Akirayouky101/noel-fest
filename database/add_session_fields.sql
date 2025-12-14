-- Script per aggiungere campi sessione alla tabella orders
-- Questi campi permettono di gestire prenotazioni pranzo/cena separate

-- Aggiungi colonna session (pranzo/cena/immediato)
ALTER TABLE orders 
ADD COLUMN session_type VARCHAR(20) DEFAULT 'immediate' 
AFTER order_type;

-- Aggiungi colonna session_date (data della sessione)
ALTER TABLE orders 
ADD COLUMN session_date DATE DEFAULT NULL 
AFTER session_type;

-- Aggiungi colonna session_time (orario inizio sessione)
ALTER TABLE orders 
ADD COLUMN session_time TIME DEFAULT NULL 
AFTER session_date;

-- Crea indice per query sessioni
CREATE INDEX idx_session ON orders(session_type, session_date, session_time);

-- Aggiorna ordini esistenti: tutti gli ordini esistenti sono 'immediate'
UPDATE orders 
SET session_type = 'immediate'
WHERE session_type IS NULL;

-- Verifica risultato
SELECT 
    COUNT(*) as total_orders,
    COUNT(CASE WHEN session_type = 'immediate' THEN 1 END) as immediate_orders,
    COUNT(CASE WHEN session_type = 'lunch' THEN 1 END) as lunch_reservations,
    COUNT(CASE WHEN session_type = 'dinner' THEN 1 END) as dinner_reservations
FROM orders;

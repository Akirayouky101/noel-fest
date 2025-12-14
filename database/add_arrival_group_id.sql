-- Script per aggiungere colonna arrival_group_id alla tabella orders
-- Questa colonna identifica univocamente ogni "arrivo" di un personaggio
-- Gli ordini dello stesso arrivo (prima che venga completato) condividono lo stesso arrival_group_id

-- Aggiungi colonna (se già esiste, ignora l'errore e continua)
ALTER TABLE orders 
ADD COLUMN arrival_group_id VARCHAR(36) DEFAULT NULL 
AFTER id;

-- Crea indice per performance nelle query di raggruppamento
CREATE INDEX idx_arrival_group ON orders(arrival_group_id);

-- Crea indice composto per query character + status
CREATE INDEX idx_character_status ON orders(character_name, status);

-- Per gli ordini esistenti, genera arrival_group_id univoci
-- Ogni ordine esistente diventa un arrivo separato
UPDATE orders 
SET arrival_group_id = UUID() 
WHERE arrival_group_id IS NULL;

-- Verifica risultato
SELECT COUNT(*) as total_orders, 
       COUNT(DISTINCT arrival_group_id) as total_arrivals,
       COUNT(DISTINCT character_name) as total_characters
FROM orders;

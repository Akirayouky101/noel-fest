-- Migrazione: Aggiungi campi session alla tabella active_reservations
-- Data: 18/12/2024
-- Descrizione: Aggiunge email, session_type, session_date, session_time per le prenotazioni solo posti

-- Aggiungi email se non esiste
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='active_reservations' AND column_name='email') THEN
        ALTER TABLE active_reservations ADD COLUMN email VARCHAR(255);
        RAISE NOTICE 'Colonna email aggiunta';
    END IF;
END $$;

-- Aggiungi session_type se non esiste
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='active_reservations' AND column_name='session_type') THEN
        ALTER TABLE active_reservations ADD COLUMN session_type VARCHAR(20);
        RAISE NOTICE 'Colonna session_type aggiunta';
    END IF;
END $$;

-- Aggiungi session_date se non esiste
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='active_reservations' AND column_name='session_date') THEN
        ALTER TABLE active_reservations ADD COLUMN session_date VARCHAR(50);
        RAISE NOTICE 'Colonna session_date aggiunta';
    END IF;
END $$;

-- Aggiungi session_time se non esiste
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='active_reservations' AND column_name='session_time') THEN
        ALTER TABLE active_reservations ADD COLUMN session_time VARCHAR(50);
        RAISE NOTICE 'Colonna session_time aggiunta';
    END IF;
END $$;

-- Verifica le colonne
SELECT column_name, data_type, character_maximum_length 
FROM information_schema.columns 
WHERE table_name = 'active_reservations'
ORDER BY ordinal_position;

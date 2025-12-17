-- Tabella impostazioni sistema
CREATE TABLE IF NOT EXISTS settings (
  id INT PRIMARY KEY DEFAULT 1,
  
  -- Orari prenotazioni
  reservation_start_time TEXT DEFAULT '18:00',
  reservation_end_time TEXT DEFAULT '23:00',
  reservation_slot_duration INT DEFAULT 30,
  
  -- Limiti posti
  max_total_seats INT DEFAULT 50,
  max_reservation_people INT DEFAULT 10,
  max_immediate_people INT DEFAULT 6,
  
  -- Email
  email_enabled BOOLEAN DEFAULT true,
  notification_email TEXT DEFAULT 'admin@noelfest.com',
  
  -- Coperto
  coperto_price DECIMAL(5,2) DEFAULT 1.50,
  coperto_enabled BOOLEAN DEFAULT true,
  
  -- Messaggi
  welcome_message TEXT DEFAULT 'Benvenuto al Noel Fest! 🎄',
  closed_message TEXT DEFAULT 'Siamo chiusi. Torna presto!',
  
  -- Sistema
  auto_logout_delay INT DEFAULT 3000,
  maintenance_mode BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CHECK (id = 1) -- Assicura che esista solo 1 riga
);

-- Inserisci valori di default
INSERT INTO settings (id) VALUES (1)
ON CONFLICT (id) DO NOTHING;

-- Trigger per aggiornare updated_at
CREATE OR REPLACE FUNCTION update_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER settings_updated_at
BEFORE UPDATE ON settings
FOR EACH ROW
EXECUTE FUNCTION update_settings_updated_at();

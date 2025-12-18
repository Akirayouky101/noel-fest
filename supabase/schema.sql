-- Schema PostgreSQL per Noel Fest
-- Ottimizzato per Supabase con RLS (Row Level Security)


-- =============================================
-- TABELLA: orders
-- =============================================
CREATE TABLE IF NOT EXISTS orders (
  id BIGSERIAL PRIMARY KEY,
  character_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  num_people INTEGER DEFAULT 1,
  order_type VARCHAR(50) NOT NULL, -- 'immediate' o 'at_register'
  session_type VARCHAR(20) DEFAULT 'immediate', -- 'immediate', 'lunch', 'dinner'
  session_date DATE DEFAULT NULL,
  session_time TIME DEFAULT NULL,
  items JSONB NOT NULL, -- Array di prodotti in formato JSON
  notes TEXT,
  total NUMERIC(10, 2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'preparing', 'completed', 'cancelled'
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  arrival_group_id UUID NOT NULL, -- Raggruppa ordini dello stesso arrivo
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indici per performance
CREATE INDEX IF NOT EXISTS idx_orders_character ON orders(character_name);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_arrival_group ON orders(arrival_group_id);
CREATE INDEX IF NOT EXISTS idx_orders_session ON orders(session_type, session_date, session_time);
CREATE INDEX IF NOT EXISTS idx_orders_timestamp ON orders(timestamp DESC);

-- Trigger per aggiornare updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- TABELLA: system_config
-- =============================================
CREATE TABLE IF NOT EXISTS system_config (
  id BIGSERIAL PRIMARY KEY,
  config_key VARCHAR(100) UNIQUE NOT NULL,
  config_value TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indice per config_key
CREATE INDEX IF NOT EXISTS idx_config_key ON system_config(config_key);

-- Trigger per updated_at
CREATE TRIGGER update_config_updated_at
  BEFORE UPDATE ON system_config
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Valori di default per configurazione
INSERT INTO system_config (config_key, config_value) VALUES
  ('total_seats', '150'),
  ('walkin_seats', '100'),
  ('coperto_price', '1.50'),
  ('reservations_enabled', 'true'),
  ('orders_enabled', 'true'),
  ('lunch_start', '12:00'),
  ('lunch_end', '15:00'),
  ('dinner_start', '19:00'),
  ('dinner_end', '23:00')
ON CONFLICT (config_key) DO NOTHING;

-- =============================================
-- TABELLA: active_reservations
-- =============================================
CREATE TABLE IF NOT EXISTS active_reservations (
  id BIGSERIAL PRIMARY KEY,
  character_name VARCHAR(100) UNIQUE NOT NULL,
  num_people INTEGER NOT NULL,
  email VARCHAR(255),
  session_type VARCHAR(20),
  session_date VARCHAR(50),
  session_time VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indice per character_name
CREATE INDEX IF NOT EXISTS idx_active_reservations_character ON active_reservations(character_name);

-- =============================================
-- TABELLA: walkin_seats
-- =============================================
CREATE TABLE IF NOT EXISTS walkin_seats (
  id BIGSERIAL PRIMARY KEY,
  character_name VARCHAR(100) UNIQUE NOT NULL,
  num_seats INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indice per character_name
CREATE INDEX IF NOT EXISTS idx_walkin_seats_character ON walkin_seats(character_name);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================
-- Per ora disabilitiamo RLS perché non abbiamo autenticazione
-- In futuro si può abilitare per sicurezza
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE active_reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE walkin_seats ENABLE ROW LEVEL SECURITY;

-- Policy: permetti tutto per ora (da modificare in produzione con auth)
CREATE POLICY "Allow all operations" ON orders FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations" ON system_config FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations" ON active_reservations FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations" ON walkin_seats FOR ALL USING (true) WITH CHECK (true);

-- =============================================
-- FUNZIONI HELPER
-- =============================================

-- Funzione per ottenere posti disponibili
CREATE OR REPLACE FUNCTION get_available_seats()
RETURNS INTEGER AS $$
DECLARE
  total_seats INTEGER;
  occupied_seats INTEGER;
BEGIN
  -- Ottieni totale posti da config
  SELECT config_value::INTEGER INTO total_seats
  FROM system_config
  WHERE config_key = 'total_seats';
  
  -- Conta posti occupati
  SELECT COALESCE(SUM(num_people), 0) INTO occupied_seats
  FROM active_reservations;
  
  RETURN GREATEST(total_seats - occupied_seats, 0);
END;
$$ LANGUAGE plpgsql;

-- Funzione per ottenere posti walk-in disponibili
CREATE OR REPLACE FUNCTION get_available_walkin_seats()
RETURNS INTEGER AS $$
DECLARE
  total_walkin INTEGER;
  occupied_walkin INTEGER;
BEGIN
  -- Ottieni totale walk-in da config
  SELECT config_value::INTEGER INTO total_walkin
  FROM system_config
  WHERE config_key = 'walkin_seats';
  
  -- Conta posti walk-in occupati
  SELECT COALESCE(SUM(num_seats), 0) INTO occupied_walkin
  FROM walkin_seats;
  
  RETURN GREATEST(total_walkin - occupied_walkin, 0);
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- VISTE UTILI
-- =============================================

-- Vista: ordini con info sessione formattate
CREATE OR REPLACE VIEW orders_with_session AS
SELECT 
  o.*,
  CASE 
    WHEN o.session_type = 'lunch' THEN '🌞 Pranzo'
    WHEN o.session_type = 'dinner' THEN '🌙 Cena'
    ELSE '⚡ Immediato'
  END as session_label,
  CASE
    WHEN o.session_type != 'immediate' AND o.session_date IS NOT NULL THEN
      TO_CHAR(o.session_date, 'DD/MM/YYYY') || ' - ' || TO_CHAR(o.session_time, 'HH24:MI')
    ELSE NULL
  END as session_display
FROM orders o;

-- Vista: statistiche ordini
CREATE OR REPLACE VIEW order_stats AS
SELECT
  COUNT(*) FILTER (WHERE status = 'pending') as pending_orders,
  COUNT(*) FILTER (WHERE status = 'preparing') as preparing_orders,
  COUNT(*) FILTER (WHERE status = 'completed') as completed_orders,
  COUNT(*) FILTER (WHERE status = 'cancelled') as cancelled_orders,
  COUNT(*) as total_orders,
  SUM(total) FILTER (WHERE status = 'completed') as total_revenue,
  COUNT(DISTINCT arrival_group_id) as total_arrivals,
  COUNT(*) FILTER (WHERE session_type = 'immediate') as immediate_orders,
  COUNT(*) FILTER (WHERE session_type = 'lunch') as lunch_reservations,
  COUNT(*) FILTER (WHERE session_type = 'dinner') as dinner_reservations
FROM orders;

-- =============================================
-- COMMENTI
-- =============================================
COMMENT ON TABLE orders IS 'Tabella principale ordini con supporto prenotazioni pranzo/cena';
COMMENT ON TABLE system_config IS 'Configurazione dinamica del sistema';
COMMENT ON TABLE active_reservations IS 'Prenotazioni attive per gestione posti';
COMMENT ON TABLE walkin_seats IS 'Posti walk-in occupati';
COMMENT ON COLUMN orders.arrival_group_id IS 'UUID che raggruppa ordini dello stesso arrivo';
COMMENT ON COLUMN orders.session_type IS 'Tipo sessione: immediate, lunch, dinner';

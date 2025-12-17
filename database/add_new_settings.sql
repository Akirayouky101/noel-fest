-- Aggiungi nuove configurazioni alla tabella system_config esistente
INSERT INTO system_config (config_key, config_value) VALUES
  ('reservation_slot_duration', '30'),
  ('max_reservation_people', '10'),
  ('max_immediate_people', '6'),
  ('email_enabled', 'true'),
  ('notification_email', 'admin@noelfest.com'),
  ('coperto_enabled', 'true'),
  ('welcome_message', 'Benvenuto al Noel Fest! 🎄'),
  ('closed_message', 'Siamo chiusi. Torna presto!'),
  ('auto_logout_delay', '3000'),
  ('maintenance_mode', 'false')
ON CONFLICT (config_key) DO NOTHING;

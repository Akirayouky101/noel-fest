import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { toast } from 'react-hot-toast'
import './Settings.css'

function Settings() {
  const [settings, setSettings] = useState({
    // Orari prenotazioni
    reservation_start_time: '18:00',
    reservation_end_time: '23:00',
    reservation_slot_duration: 30, // minuti
    
    // Limiti posti
    max_total_seats: 50,
    max_reservation_people: 10,
    max_immediate_people: 6,
    
    // Email
    email_enabled: true,
    notification_email: 'admin@noelfest.com',
    
    // Coperto
    coperto_price: 1.50,
    coperto_enabled: true,
    
    // Messaggi
    welcome_message: 'Benvenuto al Noel Fest! 🎄',
    closed_message: 'Siamo chiusi. Torna presto!',
    
    // Sistema
    auto_logout_delay: 3000, // millisecondi
    maintenance_mode: false,
  })

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('system_config')
        .select('*')

      if (error) throw error

      // Converti array di key-value in oggetto
      const configObj = {}
      data.forEach(item => {
        const value = item.config_value
        // Converti valori
        if (value === 'true') configObj[item.config_key] = true
        else if (value === 'false') configObj[item.config_key] = false
        else if (!isNaN(value)) configObj[item.config_key] = parseFloat(value)
        else configObj[item.config_key] = value
      })

      // Mappa i nomi delle chiavi
      setSettings({
        reservation_start_time: configObj.dinner_start || '18:00',
        reservation_end_time: configObj.dinner_end || '23:00',
        reservation_slot_duration: configObj.reservation_slot_duration || 30,
        max_total_seats: configObj.total_seats || 50,
        max_reservation_people: configObj.max_reservation_people || 10,
        max_immediate_people: configObj.max_immediate_people || 6,
        email_enabled: configObj.email_enabled !== false,
        notification_email: configObj.notification_email || 'admin@noelfest.com',
        coperto_price: configObj.coperto_price || 1.50,
        coperto_enabled: configObj.coperto_enabled !== false,
        welcome_message: configObj.welcome_message || 'Benvenuto al Noel Fest! 🎄',
        closed_message: configObj.closed_message || 'Siamo chiusi. Torna presto!',
        auto_logout_delay: configObj.auto_logout_delay || 3000,
        maintenance_mode: configObj.maintenance_mode === true,
      })
    } catch (error) {
      console.error('Error loading settings:', error)
      toast.error('Errore caricamento impostazioni')
    } finally {
      setLoading(false)
    }
  }

  const saveSettings = async () => {
    setSaving(true)
    try {
      // Converti oggetto settings in array di updates
      const updates = [
        { config_key: 'dinner_start', config_value: settings.reservation_start_time },
        { config_key: 'dinner_end', config_value: settings.reservation_end_time },
        { config_key: 'reservation_slot_duration', config_value: String(settings.reservation_slot_duration) },
        { config_key: 'total_seats', config_value: String(settings.max_total_seats) },
        { config_key: 'max_reservation_people', config_value: String(settings.max_reservation_people) },
        { config_key: 'max_immediate_people', config_value: String(settings.max_immediate_people) },
        { config_key: 'email_enabled', config_value: String(settings.email_enabled) },
        { config_key: 'notification_email', config_value: settings.notification_email },
        { config_key: 'coperto_price', config_value: String(settings.coperto_price) },
        { config_key: 'coperto_enabled', config_value: String(settings.coperto_enabled) },
        { config_key: 'welcome_message', config_value: settings.welcome_message },
        { config_key: 'closed_message', config_value: settings.closed_message },
        { config_key: 'auto_logout_delay', config_value: String(settings.auto_logout_delay) },
        { config_key: 'maintenance_mode', config_value: String(settings.maintenance_mode) },
      ]

      // Aggiorna ogni configurazione
      for (const update of updates) {
        const { error } = await supabase
          .from('system_config')
          .update({ config_value: update.config_value })
          .eq('config_key', update.config_key)

        if (error) throw error
      }

      toast.success('✅ Impostazioni salvate!')
    } catch (error) {
      console.error('Error saving settings:', error)
      toast.error('❌ Errore salvataggio')
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  if (loading) {
    return (
      <div className="settings-loading">
        <div className="loading-spinner"></div>
        <p>Caricamento impostazioni...</p>
      </div>
    )
  }

  return (
    <div className="settings-container">
      <div className="settings-header">
        <h1>⚙️ Impostazioni Sistema</h1>
        <p>Configura tutti i parametri del Noel Fest</p>
      </div>

      <div className="settings-grid">
        {/* Sezione Orari Prenotazioni */}
        <div className="settings-section">
          <div className="section-header">
            <h2>🕐 Orari Prenotazioni</h2>
            <span className="section-icon">📅</span>
          </div>
          
          <div className="setting-item">
            <label>
              <span className="label-text">Orario Inizio</span>
              <input
                type="time"
                value={settings.reservation_start_time}
                onChange={(e) => handleChange('reservation_start_time', e.target.value)}
              />
            </label>
          </div>

          <div className="setting-item">
            <label>
              <span className="label-text">Orario Fine</span>
              <input
                type="time"
                value={settings.reservation_end_time}
                onChange={(e) => handleChange('reservation_end_time', e.target.value)}
              />
            </label>
          </div>

          <div className="setting-item">
            <label>
              <span className="label-text">Durata Slot (minuti)</span>
              <input
                type="number"
                min="15"
                max="120"
                step="15"
                value={settings.reservation_slot_duration}
                onChange={(e) => handleChange('reservation_slot_duration', parseInt(e.target.value))}
              />
            </label>
          </div>
        </div>

        {/* Sezione Limiti Posti */}
        <div className="settings-section">
          <div className="section-header">
            <h2>👥 Limiti Posti</h2>
            <span className="section-icon">🪑</span>
          </div>

          <div className="setting-item">
            <label>
              <span className="label-text">Posti Totali Disponibili</span>
              <input
                type="number"
                min="10"
                max="500"
                value={settings.max_total_seats}
                onChange={(e) => handleChange('max_total_seats', parseInt(e.target.value))}
              />
            </label>
          </div>

          <div className="setting-item">
            <label>
              <span className="label-text">Max Persone per Prenotazione</span>
              <input
                type="number"
                min="1"
                max="20"
                value={settings.max_reservation_people}
                onChange={(e) => handleChange('max_reservation_people', parseInt(e.target.value))}
              />
            </label>
          </div>

          <div className="setting-item">
            <label>
              <span className="label-text">Max Persone Ordine Immediato</span>
              <input
                type="number"
                min="1"
                max="10"
                value={settings.max_immediate_people}
                onChange={(e) => handleChange('max_immediate_people', parseInt(e.target.value))}
              />
            </label>
          </div>
        </div>

        {/* Sezione Coperto */}
        <div className="settings-section">
          <div className="section-header">
            <h2>💰 Coperto</h2>
            <span className="section-icon">🍽️</span>
          </div>

          <div className="setting-item toggle-item">
            <label>
              <span className="label-text">Abilita Coperto</span>
              <div className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.coperto_enabled}
                  onChange={(e) => handleChange('coperto_enabled', e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </div>
            </label>
          </div>

          <div className="setting-item">
            <label>
              <span className="label-text">Prezzo Coperto (€)</span>
              <input
                type="number"
                min="0"
                max="10"
                step="0.50"
                value={settings.coperto_price}
                onChange={(e) => handleChange('coperto_price', parseFloat(e.target.value))}
                disabled={!settings.coperto_enabled}
              />
            </label>
          </div>
        </div>

        {/* Sezione Email */}
        <div className="settings-section">
          <div className="section-header">
            <h2>📧 Email</h2>
            <span className="section-icon">✉️</span>
          </div>

          <div className="setting-item toggle-item">
            <label>
              <span className="label-text">Abilita Invio Email</span>
              <div className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.email_enabled}
                  onChange={(e) => handleChange('email_enabled', e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </div>
            </label>
          </div>

          <div className="setting-item">
            <label>
              <span className="label-text">Email Notifiche Admin</span>
              <input
                type="email"
                value={settings.notification_email}
                onChange={(e) => handleChange('notification_email', e.target.value)}
                placeholder="admin@noelfest.com"
              />
            </label>
          </div>
        </div>

        {/* Sezione Messaggi */}
        <div className="settings-section full-width">
          <div className="section-header">
            <h2>💬 Messaggi Personalizzati</h2>
            <span className="section-icon">📝</span>
          </div>

          <div className="setting-item">
            <label>
              <span className="label-text">Messaggio di Benvenuto</span>
              <input
                type="text"
                value={settings.welcome_message}
                onChange={(e) => handleChange('welcome_message', e.target.value)}
                placeholder="Benvenuto al Noel Fest! 🎄"
              />
            </label>
          </div>

          <div className="setting-item">
            <label>
              <span className="label-text">Messaggio Chiusura</span>
              <input
                type="text"
                value={settings.closed_message}
                onChange={(e) => handleChange('closed_message', e.target.value)}
                placeholder="Siamo chiusi. Torna presto!"
              />
            </label>
          </div>
        </div>

        {/* Sezione Sistema */}
        <div className="settings-section">
          <div className="section-header">
            <h2>🔧 Sistema</h2>
            <span className="section-icon">⚙️</span>
          </div>

          <div className="setting-item">
            <label>
              <span className="label-text">Ritardo Auto-Logout (ms)</span>
              <input
                type="number"
                min="1000"
                max="10000"
                step="500"
                value={settings.auto_logout_delay}
                onChange={(e) => handleChange('auto_logout_delay', parseInt(e.target.value))}
              />
              <small>{(settings.auto_logout_delay / 1000).toFixed(1)} secondi</small>
            </label>
          </div>

          <div className="setting-item toggle-item">
            <label>
              <span className="label-text">Modalità Manutenzione</span>
              <div className="toggle-switch danger">
                <input
                  type="checkbox"
                  checked={settings.maintenance_mode}
                  onChange={(e) => handleChange('maintenance_mode', e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </div>
            </label>
            <small>Il sito sarà inaccessibile agli utenti</small>
          </div>
        </div>
      </div>

      {/* Pulsanti Azione */}
      <div className="settings-actions">
        <button
          className="btn-save"
          onClick={saveSettings}
          disabled={saving}
        >
          {saving ? '⏳ Salvataggio...' : '💾 Salva Impostazioni'}
        </button>
        
        <button
          className="btn-reset"
          onClick={loadSettings}
        >
          🔄 Ripristina
        </button>
      </div>
    </div>
  )
}

export default Settings

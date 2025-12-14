import { useState, useEffect } from 'react'
import { getAllSystemConfig, updateMultipleConfigs } from '../lib/supabaseAPI'
import './Settings.css'

export default function Settings() {
  const [config, setConfig] = useState({
    total_seats: '150',
    walkin_seats: '100',
    coperto_price: '1.50',
    reservations_enabled: 'true',
    orders_enabled: 'true',
    lunch_start: '12:00',
    lunch_end: '15:00',
    dinner_start: '19:00',
    dinner_end: '23:00'
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    loadConfig()
  }, [])

  const loadConfig = async () => {
    try {
      const data = await getAllSystemConfig()
      setConfig(data)
    } catch (error) {
      console.error('Errore caricamento configurazione:', error)
    } finally {
      setLoading(false)
    }
  }

  const saveConfig = async () => {
    setSaving(true)
    try {
      await updateMultipleConfigs(config)
      setSuccessMessage('✅ Configurazione salvata con successo!')
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (error) {
      console.error('Errore salvataggio:', error)
      alert('Errore durante il salvataggio: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  const resetToDefaults = () => {
    if (confirm('Sei sicuro di voler ripristinare i valori predefiniti?')) {
      setConfig({
        total_seats: '150',
        walkin_seats: '100',
        coperto_price: '1.50',
        reservations_enabled: 'true',
        orders_enabled: 'true',
        lunch_start: '12:00',
        lunch_end: '15:00',
        dinner_start: '19:00',
        dinner_end: '23:00'
      })
    }
  }

  if (loading) {
    return (
      <div className="settings-container">
        <div className="loading">
          <div className="spinner"></div>
          <p>Caricamento configurazione...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="settings-container">
      <div className="settings-header">
        <h1>⚙️ Configurazione Sistema</h1>
        <p>Gestisci i parametri globali di Noel Fest</p>
      </div>

      {successMessage && (
        <div className="success-banner">
          {successMessage}
        </div>
      )}

      <div className="settings-sections">
        {/* Posti a sedere */}
        <div className="settings-section">
          <h2>🪑 Gestione Posti</h2>
          
          <div className="setting-item">
            <div className="setting-info">
              <h3>Posti Prenotabili</h3>
              <p>Numero totale di posti disponibili per "Prenota Posto"</p>
            </div>
            <input
              type="number"
              min="0"
              max="500"
              value={config.total_seats}
              onChange={(e) => setConfig({ ...config, total_seats: e.target.value })}
              className="setting-input"
            />
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <h3>Posti Walk-in</h3>
              <p>Posti aggiuntivi per clienti senza prenotazione</p>
            </div>
            <input
              type="number"
              min="0"
              max="500"
              value={config.walkin_seats}
              onChange={(e) => setConfig({ ...config, walkin_seats: e.target.value })}
              className="setting-input"
            />
          </div>

          <div className="seats-preview">
            <div className="preview-card">
              <span className="preview-label">Totale Posti Sistema:</span>
              <span className="preview-value">{parseInt(config.total_seats || 0) + parseInt(config.walkin_seats || 0)}</span>
            </div>
          </div>
        </div>

        {/* Prezzi */}
        <div className="settings-section">
          <h2>💰 Prezzi e Costi</h2>
          
          <div className="setting-item">
            <div className="setting-info">
              <h3>Coperto</h3>
              <p>Prezzo del coperto per persona (€)</p>
            </div>
            <input
              type="number"
              min="0"
              max="10"
              step="0.10"
              value={config.coperto_price}
              onChange={(e) => setConfig({ ...config, coperto_price: e.target.value })}
              className="setting-input"
            />
          </div>
        </div>

        {/* Funzionalità */}
        <div className="settings-section">
          <h2>🔧 Funzionalità Sistema</h2>
          
          <div className="setting-item">
            <div className="setting-info">
              <h3>Prenotazioni Posti</h3>
              <p>Abilita/Disabilita la funzione "Prenota Posto"</p>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={config.reservations_enabled}
                onChange={(e) => setConfig({ ...config, reservations_enabled: e.target.checked })}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <h3>Ordini Online</h3>
              <p>Abilita/Disabilita tutti gli ordini online</p>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={config.orders_enabled}
                onChange={(e) => setConfig({ ...config, orders_enabled: e.target.checked })}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
        </div>

        {/* Orari Sessioni */}
        <div className="settings-section">
          <h2>🕐 Orari Prenotazioni</h2>
          <p style={{ marginBottom: '20px', color: 'rgba(255, 255, 255, 0.7)' }}>
            Configura gli orari disponibili per le prenotazioni Pranzo e Cena
          </p>
          
          <div className="session-times-grid">
            <div className="session-time-card">
              <h3>🌞 Pranzo</h3>
              <div className="time-inputs">
                <div className="time-input-group">
                  <label>Inizio</label>
                  <input
                    type="time"
                    value={config.lunch_start}
                    onChange={(e) => setConfig({ ...config, lunch_start: e.target.value })}
                    className="time-input"
                  />
                </div>
                <span className="time-separator">→</span>
                <div className="time-input-group">
                  <label>Fine</label>
                  <input
                    type="time"
                    value={config.lunch_end}
                    onChange={(e) => setConfig({ ...config, lunch_end: e.target.value })}
                    className="time-input"
                  />
                </div>
              </div>
            </div>

            <div className="session-time-card">
              <h3>🌙 Cena</h3>
              <div className="time-inputs">
                <div className="time-input-group">
                  <label>Inizio</label>
                  <input
                    type="time"
                    value={config.dinner_start}
                    onChange={(e) => setConfig({ ...config, dinner_start: e.target.value })}
                    className="time-input"
                  />
                </div>
                <span className="time-separator">→</span>
                <div className="time-input-group">
                  <label>Fine</label>
                  <input
                    type="time"
                    value={config.dinner_end}
                    onChange={(e) => setConfig({ ...config, dinner_end: e.target.value })}
                    className="time-input"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Info Sistema */}
        <div className="settings-section">
          <h2>ℹ️ Informazioni Sistema</h2>
          
          <div className="info-grid">
            <div className="info-card">
              <h4>Database</h4>
              <p>dbgxaxaie7pbze</p>
            </div>
            <div className="info-card">
              <h4>Versione</h4>
              <p>1.0.0</p>
            </div>
            <div className="info-card">
              <h4>Evento</h4>
              <p>Noel Fest 2025</p>
            </div>
            <div className="info-card">
              <h4>Organizzatore</h4>
              <p>Proloco Lanzo TSE</p>
            </div>
          </div>
        </div>
      </div>

      {/* Pulsanti Azione */}
      <div className="settings-actions">
        <button 
          className="btn-reset"
          onClick={resetToDefaults}
          disabled={saving}
        >
          🔄 Ripristina Valori Predefiniti
        </button>
        <button 
          className="btn-save"
          onClick={saveConfig}
          disabled={saving}
        >
          {saving ? '💾 Salvataggio...' : '💾 Salva Configurazione'}
        </button>
      </div>
    </div>
  )
}

import { useState, useEffect } from 'react'
import { getAllSystemConfig } from '../lib/supabaseAPI'

export default function SessionSelectionModal({ show, onClose, onConfirm }) {
  const [selectedSession, setSelectedSession] = useState(null)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [config, setConfig] = useState({
    lunch_start: '12:00',
    lunch_end: '15:00',
    dinner_start: '19:00',
    dinner_end: '23:00'
  })

  // Carica configurazione orari
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const data = await getAllSystemConfig()
        setConfig({
          lunch_start: data.lunch_start || '12:00',
          lunch_end: data.lunch_end || '15:00',
          dinner_start: data.dinner_start || '19:00',
          dinner_end: data.dinner_end || '23:00'
        })
      } catch (error) {
        console.error('Errore caricamento configurazione:', error)
      }
    }
    if (show) loadConfig()
  }, [show])

  if (!show) return null

  const sessions = [
    {
      type: 'lunch',
      icon: '🌞',
      title: 'Pranzo',
      time: config.lunch_start,
      timeRange: `${config.lunch_start} - ${config.lunch_end}`,
      description: 'Prenota per il servizio pranzo'
    },
    {
      type: 'dinner',
      icon: '🌙',
      title: 'Cena',
      time: config.dinner_start,
      timeRange: `${config.dinner_start} - ${config.dinner_end}`,
      description: 'Prenota per il servizio cena'
    }
  ]

  const handleConfirm = () => {
    if (selectedSession) {
      const session = sessions.find(s => s.type === selectedSession)
      onConfirm({
        sessionType: selectedSession,
        sessionDate: selectedDate,
        sessionTime: session.time
      })
    }
  }

  return (
    <div 
      className="modal-overlay"
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
        padding: '20px'
      }}
    >
      <div 
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'linear-gradient(135deg, #1a4d2e, #0d2818)',
          borderRadius: '16px',
          border: '3px solid #FFD700',
          maxWidth: '600px',
          width: '100%',
          padding: '30px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)'
        }}
      >
        <h2 style={{
          color: '#FFD700',
          marginBottom: '10px',
          fontSize: '1.8rem',
          textAlign: 'center',
          textShadow: '0 2px 4px rgba(0,0,0,0.3)'
        }}>
          📅 Seleziona la Sessione
        </h2>
        
        <p style={{
          color: 'rgba(255, 255, 255, 0.8)',
          textAlign: 'center',
          marginBottom: '25px',
          fontSize: '0.95rem'
        }}>
          Scegli quando vuoi venire a pranzo o cena
        </p>

        {/* Selezione Data */}
        <div style={{ marginBottom: '25px' }}>
          <label style={{
            color: '#FFD700',
            display: 'block',
            marginBottom: '8px',
            fontSize: '1rem',
            fontWeight: 'bold'
          }}>
            📆 Data
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '8px',
              border: '2px solid #FFD700',
              background: 'rgba(255, 255, 255, 0.1)',
              color: 'white',
              fontSize: '1rem',
              cursor: 'pointer'
            }}
          />
        </div>

        {/* Selezione Sessione */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '15px',
          marginBottom: '25px'
        }}>
          {sessions.map((session) => (
            <div
              key={session.type}
              onClick={() => setSelectedSession(session.type)}
              style={{
                background: selectedSession === session.type 
                  ? 'linear-gradient(135deg, #8B0000, #CD5C5C)'
                  : 'rgba(255, 255, 255, 0.05)',
                border: `3px solid ${selectedSession === session.type ? '#FFD700' : 'rgba(255, 215, 0, 0.3)'}`,
                borderRadius: '12px',
                padding: '20px',
                cursor: 'pointer',
                transition: 'all 0.3s',
                textAlign: 'center',
                transform: selectedSession === session.type ? 'scale(1.05)' : 'scale(1)',
                boxShadow: selectedSession === session.type 
                  ? '0 8px 24px rgba(255, 215, 0, 0.4)'
                  : '0 2px 8px rgba(0, 0, 0, 0.2)'
              }}
              onMouseEnter={(e) => {
                if (selectedSession !== session.type) {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
                  e.currentTarget.style.transform = 'scale(1.02)'
                }
              }}
              onMouseLeave={(e) => {
                if (selectedSession !== session.type) {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                  e.currentTarget.style.transform = 'scale(1)'
                }
              }}
            >
              <div style={{ fontSize: '3rem', marginBottom: '10px' }}>
                {session.icon}
              </div>
              <h3 style={{
                color: '#FFD700',
                margin: '0 0 8px 0',
                fontSize: '1.3rem'
              }}>
                {session.title}
              </h3>
              <div style={{
                color: 'rgba(255, 255, 255, 0.9)',
                fontSize: '1.1rem',
                fontWeight: 'bold',
                marginBottom: '5px'
              }}>
                {session.timeRange}
              </div>
              <p style={{
                color: 'rgba(255, 255, 255, 0.7)',
                fontSize: '0.85rem',
                margin: 0
              }}>
                {session.description}
              </p>
            </div>
          ))}
        </div>

        {/* Bottoni */}
        <div style={{
          display: 'flex',
          gap: '15px',
          justifyContent: 'center'
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '12px 30px',
              borderRadius: '8px',
              border: '2px solid rgba(255, 255, 255, 0.3)',
              background: 'rgba(255, 255, 255, 0.1)',
              color: 'white',
              fontSize: '1rem',
              cursor: 'pointer',
              transition: 'all 0.3s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
            }}
          >
            Annulla
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selectedSession}
            style={{
              padding: '12px 30px',
              borderRadius: '8px',
              border: '2px solid #FFD700',
              background: selectedSession 
                ? 'linear-gradient(135deg, #8B0000, #CD5C5C)'
                : 'rgba(139, 0, 0, 0.3)',
              color: selectedSession ? '#FFD700' : 'rgba(255, 215, 0, 0.5)',
              fontSize: '1rem',
              fontWeight: 'bold',
              cursor: selectedSession ? 'pointer' : 'not-allowed',
              transition: 'all 0.3s',
              opacity: selectedSession ? 1 : 0.6
            }}
            onMouseEnter={(e) => {
              if (selectedSession) {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(255, 215, 0, 0.4)'
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = 'none'
            }}
          >
            Conferma Prenotazione
          </button>
        </div>

        {selectedSession && (
          <div style={{
            marginTop: '20px',
            padding: '15px',
            background: 'rgba(255, 215, 0, 0.1)',
            border: '2px solid rgba(255, 215, 0, 0.3)',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <p style={{
              color: '#FFD700',
              margin: 0,
              fontSize: '0.9rem'
            }}>
              ℹ️ La prenotazione sarà visibile nell'admin ma attivabile solo all'orario della sessione
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

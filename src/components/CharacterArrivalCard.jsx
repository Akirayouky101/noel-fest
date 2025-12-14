import { useState } from 'react'

export default function CharacterArrivalCard({ 
  character, 
  arrivals,
  viewMode,
  isReservationUnlocked,
  getSessionBadge,
  expandedCharacters,
  toggleCharacterExpansion,
  activeDropdown,
  setActiveDropdown,
  activeReservations,
  activeWalkinCharacters,
  updateOrderStatus,
  openEditModal,
  freeSeats,
  freeWalkinSeatsForCharacter,
  setWalkinModal,
  setPeopleModal,
  openDeleteModal,
  printOrder,
  getStatusColor,
  getStatusText
}) {
  const [showModal, setShowModal] = useState(false)
  const hasMultipleArrivals = arrivals.length > 1
  
  // Ordina gli arrivi per timestamp
  const sortedArrivals = [...arrivals].sort((a, b) => 
    new Date(a.timestamp) - new Date(b.timestamp)
  )
  
  // Mostra il primo arrivo (più recente non completato o l'ultimo)
  const primaryArrival = sortedArrivals.find(a => a.status !== 'completed') || sortedArrivals[sortedArrivals.length - 1]
  
  // Controlla se la prenotazione è bloccata
  const isLocked = viewMode === 'reservations' && !isReservationUnlocked(primaryArrival)
  const sessionBadge = viewMode === 'reservations' ? getSessionBadge(primaryArrival) : null
  
  const renderArrival = (arrival, isPrimary = false, arrivalIndex = null) => (
    <div 
      className="order-card"
      onClick={() => !hasMultipleArrivals && arrival.status !== 'completed' && openEditModal(arrival)}
      style={{ 
        cursor: hasMultipleArrivals || arrival.status === 'completed' ? 'default' : 'pointer',
        opacity: arrival.status === 'completed' && !hasMultipleArrivals ? 0.7 : 1,
        position: 'relative',
        marginTop: !isPrimary ? '10px' : '0',
        marginLeft: !isPrimary ? '20px' : '0',
        borderLeft: !isPrimary ? '4px solid #FFD700' : 'none'
      }}
    >
      {/* Badge numero arrivi - solo sulla card principale */}
      {isPrimary && hasMultipleArrivals && (
        <div 
          onClick={(e) => {
            e.stopPropagation()
            setShowModal(true)
          }}
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            background: '#FFD700',
            color: '#8B0000',
            borderRadius: '50%',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold',
            fontSize: '16px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
            zIndex: 10,
            cursor: 'pointer',
            transition: 'transform 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          {arrivals.length}
        </div>
      )}
      
      {/* Badge sessione (bloccata/attiva) - solo per prenotazioni sulla card principale */}
      {isPrimary && sessionBadge && (
        <div style={{
          position: 'absolute',
          top: '10px',
          left: '10px',
          background: sessionBadge.color,
          color: 'white',
          borderRadius: '20px',
          padding: '6px 12px',
          fontSize: '13px',
          fontWeight: 'bold',
          boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          gap: '5px'
        }}>
          <span>{sessionBadge.icon}</span>
          <span>{sessionBadge.text}</span>
        </div>
      )}
      
      {/* Label arrivo per card secondarie */}
      {!isPrimary && arrivalIndex !== null && (
        <div style={{
          background: '#FFD700',
          color: '#8B0000',
          padding: '4px 12px',
          borderRadius: '4px',
          fontSize: '12px',
          fontWeight: 'bold',
          marginBottom: '10px',
          display: 'inline-block'
        }}>
          ARRIVO #{arrivalIndex}
        </div>
      )}
      
      <div className="order-header">
        <div>
          <h3>
            {character}
            {isPrimary && hasMultipleArrivals && (
              <span 
                onClick={(e) => {
                  e.stopPropagation()
                  setShowModal(true)
                }}
                style={{ 
                  marginLeft: '8px', 
                  fontSize: '0.9em', 
                  color: '#FFD700',
                  cursor: 'pointer'
                }}
              >
                ▶
              </span>
            )}
          </h3>
          <div className="character-info">
            <span className="email-badge">📧 {arrival.email}</span>
          </div>
          <span className={`order-type-badge ${arrival.orderType}`}>
            {arrival.orderType === 'immediate' ? '🍽️ Immediato' : '🪑 Con Prenotazione'}
          </span>
        </div>
        <span 
          className="order-status"
          style={{ backgroundColor: getStatusColor(arrival.status) }}
        >
          {getStatusText(arrival.status)}
        </span>
      </div>

      <div className="order-time">
        {new Date(arrival.timestamp).toLocaleString('it-IT')}
      </div>

      <div className="order-items">
        {arrival.items.map((item, index) => (
          <div key={index} className="order-item">
            <span>{item.name} x{item.quantity}</span>
            <span>€{(parseFloat(item.price) * item.quantity).toFixed(2)}</span>
          </div>
        ))}
        <div className="order-item" style={{borderTop: '1px solid #ddd', paddingTop: '8px', marginTop: '8px'}}>
          <span>Coperto ({arrival.num_people || 1} {(arrival.num_people || 1) === 1 ? 'persona' : 'persone'})</span>
          <span>€{(1.50 * (arrival.num_people || 1)).toFixed(2)}</span>
        </div>
      </div>

      {arrival.notes && (
        <div className="order-notes">
          <strong>Note:</strong> {arrival.notes}
        </div>
      )}

      <div className="order-total">
        <div>
          <span style={{ fontSize: '0.9rem', color: 'rgba(255, 255, 255, 0.8)' }}>
            👥 {arrival.num_people} {arrival.num_people === 1 ? 'persona' : 'persone'}
          </span>
        </div>
        <div>
          <strong style={{ color: '#FFD700' }}>Totale:</strong>
          <strong style={{ color: '#FFD700' }}>€{parseFloat(arrival.total).toFixed(2)}</strong>
        </div>
      </div>

      <div className="order-actions" onClick={(e) => e.stopPropagation()}>
        {/* Messaggio blocco prenotazione */}
        {isLocked && isPrimary && (
          <div style={{
            background: 'rgba(255, 165, 0, 0.2)',
            border: '2px solid #ffa500',
            borderRadius: '8px',
            padding: '10px',
            marginBottom: '10px',
            textAlign: 'center',
            color: '#FFD700',
            fontSize: '0.9rem'
          }}>
            🔒 Prenotazione bloccata fino a 30 min prima della sessione
          </div>
        )}
        
        {/* Status buttons - disabilitati se bloccata */}
        {arrival.status === 'pending' && (
          <button 
            className="btn-preparing"
            disabled={isLocked}
            onClick={(e) => {
              e.stopPropagation()
              if (!isLocked) updateOrderStatus(arrival, 'preparing')
            }}
            style={{
              opacity: isLocked ? 0.5 : 1,
              cursor: isLocked ? 'not-allowed' : 'pointer'
            }}
          >
            👨‍🍳 In Preparazione
          </button>
        )}
        {arrival.status === 'preparing' && (
          <button 
            className="btn-complete"
            disabled={isLocked}
            onClick={(e) => {
              e.stopPropagation()
              if (!isLocked) updateOrderStatus(arrival, 'completed')
            }}
            style={{
              opacity: isLocked ? 0.5 : 1,
              cursor: isLocked ? 'not-allowed' : 'pointer'
            }}
          >
            ✅ Completato
          </button>
        )}
        
        {/* Actions dropdown */}
        <div className="actions-dropdown">
          <button 
            className="actions-dropdown-btn"
            onClick={(e) => {
              e.stopPropagation()
              setActiveDropdown(activeDropdown === (character + (isPrimary ? '' : arrival.arrival_group_id)) ? null : (character + (isPrimary ? '' : arrival.arrival_group_id)))
            }}
          >
            ⚙️ Azioni
            <span style={{ fontSize: '0.8em' }}>{activeDropdown === (character + (isPrimary ? '' : arrival.arrival_group_id)) ? '▲' : '▼'}</span>
          </button>
          
          {activeDropdown === (character + (isPrimary ? '' : arrival.arrival_group_id)) && (
            <div className="dropdown-menu" onClick={(e) => e.stopPropagation()}>
              {/* Occupa Walk-in */}
              {arrival.status !== 'completed' && arrival.orderType === 'immediate' && arrival.num_people >= 1 && 
               !activeReservations.has(character) && 
               !activeWalkinCharacters.has(character) && (
                <button 
                  className="dropdown-item primary"
                  onClick={(e) => {
                    e.stopPropagation()
                    setWalkinModal({ show: true, order: arrival, numSeats: arrival.num_people })
                    setActiveDropdown(null)
                  }}
                >
                  🚶 Occupa Walk-in
                </button>
              )}
              
              {/* Libera Walk-in */}
              {activeWalkinCharacters.has(character) && (
                <button 
                  className="dropdown-item primary"
                  onClick={(e) => {
                    e.stopPropagation()
                    freeWalkinSeatsForCharacter(character, false)
                    setActiveDropdown(null)
                  }}
                >
                  🚶 Libera Walk-in
                </button>
              )}
              
              {/* Libera Posti */}
              {activeReservations.has(character) && (
                <button 
                  className="dropdown-item info"
                  onClick={(e) => {
                    e.stopPropagation()
                    freeSeats(character)
                    setActiveDropdown(null)
                  }}
                >
                  🪑 Libera Posti
                </button>
              )}
              
              {/* Modifica Numero Persone */}
              {arrival.status !== 'completed' && (
                <button 
                  className="dropdown-item"
                  onClick={(e) => {
                    e.stopPropagation()
                    setPeopleModal({ show: true, order: arrival, newNumber: arrival.num_people })
                    setActiveDropdown(null)
                  }}
                >
                  👥 Modifica Persone
                </button>
              )}
              
              {/* Annulla */}
              {(arrival.status === 'pending' || arrival.status === 'preparing') && (
                <button 
                  className="dropdown-item danger"
                  onClick={(e) => {
                    e.stopPropagation()
                    updateOrderStatus(arrival, 'cancelled')
                    setActiveDropdown(null)
                  }}
                >
                  ❌ Annulla
                </button>
              )}
              
              {/* Stampa */}
              <button 
                className="dropdown-item"
                onClick={(e) => {
                  e.stopPropagation()
                  printOrder(arrival)
                  setActiveDropdown(null)
                }}
              >
                🖨️ Stampa
              </button>
              
              {/* Elimina */}
              {arrival.status !== 'completed' && (
                <button 
                  className="dropdown-item danger"
                  onClick={(e) => {
                    e.stopPropagation()
                    openDeleteModal(arrival, character)
                    setActiveDropdown(null)
                  }}
                >
                  🗑️ Elimina
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
  
  return (
    <>
      {/* Card principale */}
      {renderArrival(primaryArrival, true)}
      
      {/* Modal arrivi - stile carte da poker */}
      {showModal && hasMultipleArrivals && (
        <div 
          className="arrivals-modal-overlay"
          onClick={() => setShowModal(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px',
            animation: 'fadeIn 0.3s ease-out'
          }}
        >
          <div 
            className="arrivals-modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'linear-gradient(135deg, #1a4d2e, #0d2818)',
              borderRadius: '16px',
              border: '3px solid #FFD700',
              maxWidth: '900px',
              maxHeight: '85vh',
              width: '100%',
              overflow: 'hidden',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5), 0 0 30px rgba(255, 215, 0, 0.3)',
              animation: 'cardFlip 0.5s ease-out',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {/* Header modal */}
            <div style={{
              background: 'linear-gradient(135deg, #8B0000, #CD5C5C)',
              padding: '20px 25px',
              borderBottom: '2px solid #FFD700',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h2 style={{
                margin: 0,
                color: '#FFD700',
                fontSize: '1.5rem',
                textShadow: '0 2px 4px rgba(0,0,0,0.3)'
              }}>
                🎴 {character} - Tutti gli Arrivi
              </h2>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  border: '2px solid #FFD700',
                  color: '#FFD700',
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  fontSize: '24px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.3s',
                  fontWeight: 'bold'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)'
                  e.currentTarget.style.transform = 'rotate(90deg)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'
                  e.currentTarget.style.transform = 'rotate(0deg)'
                }}
              >
                ×
              </button>
            </div>

            {/* Contenuto scrollabile */}
            <div style={{
              padding: '25px',
              overflowY: 'auto',
              flex: 1
            }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
                gap: '20px'
              }}>
                {sortedArrivals.map((arrival, index) => (
                  <div 
                    key={arrival.arrival_group_id || index}
                    style={{
                      animation: `cardSlideIn 0.4s ease-out ${index * 0.1}s both`,
                      transformOrigin: 'center'
                    }}
                  >
                    <div style={{
                      background: 'rgba(139, 0, 0, 0.2)',
                      padding: '4px 12px',
                      borderRadius: '8px 8px 0 0',
                      fontSize: '13px',
                      fontWeight: 'bold',
                      color: '#FFD700',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <span>🎯 ARRIVO #{index + 1}</span>
                      <span style={{ fontSize: '11px', opacity: 0.8 }}>
                        {new Date(arrival.timestamp).toLocaleTimeString('it-IT', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </span>
                    </div>
                    {renderArrival(arrival, false, index + 1)}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <style>{`
            @keyframes fadeIn {
              from {
                opacity: 0;
              }
              to {
                opacity: 1;
              }
            }

            @keyframes cardFlip {
              0% {
                opacity: 0;
                transform: perspective(1000px) rotateY(-20deg) scale(0.9);
              }
              100% {
                opacity: 1;
                transform: perspective(1000px) rotateY(0deg) scale(1);
              }
            }

            @keyframes cardSlideIn {
              0% {
                opacity: 0;
                transform: translateY(30px) scale(0.95);
              }
              100% {
                opacity: 1;
                transform: translateY(0) scale(1);
              }
            }

            .arrivals-modal-content::-webkit-scrollbar {
              width: 10px;
            }

            .arrivals-modal-content::-webkit-scrollbar-track {
              background: rgba(255, 255, 255, 0.1);
              border-radius: 10px;
            }

            .arrivals-modal-content::-webkit-scrollbar-thumb {
              background: #FFD700;
              border-radius: 10px;
            }

            .arrivals-modal-content::-webkit-scrollbar-thumb:hover {
              background: #FFA500;
            }
          `}</style>
        </div>
      )}
    </>
  )
}

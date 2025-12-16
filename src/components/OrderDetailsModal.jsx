import { X, Clock, Users, Calendar, Package, CheckCircle } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useState } from 'react'
import toast from 'react-hot-toast'

export default function OrderDetailsModal({ characterName, orders, onClose }) {
  const [isCompleting, setIsCompleting] = useState(false)
  
  if (!orders || orders.length === 0) return null

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusLabel = (status) => {
    const labels = {
      pending: 'In Attesa',
      preparing: 'In Preparazione',
      completed: 'Completato'
    }
    return labels[status] || status
  }

  const COPERTO = 1.50

  const totalOrders = orders.length
  
  // FIXED: Prendi il numero di persone MAX (in caso ci siano discrepanze)
  const totalPeople = Math.max(...orders.map(o => o.numPeople || 0))
  
  // FIXED: Calcola totale corretto - il coperto è calcolato UNA VOLTA per sessione
  // Sessione = stesso giorno + stesso tipo (immediate, lunch, dinner)
  
  // Raggruppa ordini per sessione: stesso giorno + stesso sessionType
  const sessionGroups = {}
  orders.forEach(order => {
    // Per immediate: usa la data (stesso giorno = stessa sessione)
    // Per lunch/dinner: usa sessionType + sessionDate
    let sessionKey
    
    if (order.sessionType === 'immediate') {
      // Estrai solo la data dal timestamp (YYYY-MM-DD)
      const orderDate = new Date(order.timestamp).toISOString().split('T')[0]
      sessionKey = `immediate-${orderDate}`
    } else {
      // Lunch/Dinner: usa tipo + data
      sessionKey = `${order.sessionType}-${order.sessionDate || ''}`
    }
    
    if (!sessionGroups[sessionKey]) {
      sessionGroups[sessionKey] = []
    }
    sessionGroups[sessionKey].push(order)
  })
  
  // Calcola totale corretto: somma items di tutti gli ordini + coperto UNA VOLTA per sessione
  let totalAmount = 0
  let totalCoperto = 0
  
  Object.values(sessionGroups).forEach(sessionOrders => {
    // Somma solo gli items (total - coperto)
    const sessionItemsTotal = sessionOrders.reduce((sum, order) => {
      const orderCoperto = COPERTO * (order.numPeople || 0)
      const orderItems = order.total - orderCoperto
      return sum + orderItems
    }, 0)
    
    // Aggiungi coperto UNA VOLTA per questa sessione
    const sessionCoperto = COPERTO * totalPeople
    totalAmount += sessionItemsTotal + sessionCoperto
    totalCoperto += sessionCoperto
  })
  
  const numberOfSessions = Object.keys(sessionGroups).length

  const handleCompleteAllOrders = async () => {
    if (!window.confirm(`Completare tutti gli ${totalOrders} ordini di ${characterName}?`)) {
      return
    }
    
    setIsCompleting(true)
    
    try {
      // Aggiorna tutti gli ordini a "completed"
      const orderIds = orders.map(o => o.id)
      
      const { error } = await supabase
        .from('orders')
        .update({ status: 'completed' })
        .in('id', orderIds)
      
      if (error) throw error
      
      toast.success(`✅ ${totalOrders} ordini completati!`)
      
      // Chiudi modale e ricarica
      setTimeout(() => {
        onClose()
        window.location.reload()
      }, 500)
    } catch (error) {
      console.error('Errore completamento ordini:', error)
      toast.error('Errore nel completamento')
    } finally {
      setIsCompleting(false)
    }
  }

  // Controlla se ci sono ordini ancora pending
  const hasPendingOrders = orders.some(o => o.status === 'pending')

  return (
    <div className="order-details-modal-overlay" onClick={onClose}>
      <div className="order-details-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="modal-header-content">
            <div className="modal-character-name">
              🎅 {characterName}
            </div>
            <div className="modal-subtitle">
              {totalOrders} {totalOrders === 1 ? 'ordine' : 'ordini'} • 
              {totalPeople} {totalPeople === 1 ? 'persona' : 'persone'} • 
              {numberOfSessions} {numberOfSessions === 1 ? 'sessione' : 'sessioni'} •
              Totale: €{totalAmount.toFixed(2)} (coperto: €{totalCoperto.toFixed(2)})
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        {/* Body - Lista ordini */}
        <div className="modal-body">
          {orders.map((order, index) => (
            <div key={order.id} className="modal-order-card">
              {/* Order Header */}
              <div className="modal-order-header">
                <div className={`modal-order-status ${order.status}`}>
                  {order.status === 'pending' && '⏳'}
                  {order.status === 'preparing' && '👨‍🍳'}
                  {order.status === 'completed' && '✅'}
                  {getStatusLabel(order.status)}
                </div>
                <div className="modal-order-time">
                  <Clock size={16} />
                  {formatDate(order.timestamp)}
                </div>
              </div>

              {/* Order Info Grid */}
              <div className="modal-order-info">
                <div className="modal-info-item">
                  <Users size={20} className="icon" />
                  <span>{order.numPeople} {order.numPeople === 1 ? 'persona' : 'persone'}</span>
                </div>

                {order.sessionType !== 'immediate' && (
                  <div className="modal-info-item">
                    <Calendar size={20} className="icon" />
                    <span>
                      {order.sessionType === 'lunch' ? '🌞 Pranzo' : '🌙 Cena'}
                      {order.sessionDate && ` - ${order.sessionDate}`}
                    </span>
                  </div>
                )}

                <div className="modal-info-item">
                  <Package size={20} className="icon" />
                  <span>{order.items.length} {order.items.length === 1 ? 'articolo' : 'articoli'}</span>
                </div>
              </div>

              {/* Items List */}
              <div className="modal-items-section">
                <div className="modal-items-title">
                  📦 Articoli Ordinati
                </div>
                {order.items.map((item, idx) => (
                  <div key={idx} className="modal-item">
                    <span className="modal-item-name">{item.name}</span>
                    <span className="modal-item-quantity">x{item.quantity}</span>
                    <span className="modal-item-price">
                      €{(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}

                {/* Total */}
                <div className="modal-total">
                  <span className="modal-total-label">Totale Ordine:</span>
                  <span className="modal-total-value">€{order.total.toFixed(2)}</span>
                </div>
              </div>

              {/* Notes */}
              {order.notes && (
                <div className="modal-notes">
                  💬 {order.notes}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer - Azioni */}
        {hasPendingOrders && (
          <div className="modal-footer">
            <button 
              className="modal-complete-btn"
              onClick={handleCompleteAllOrders}
              disabled={isCompleting}
            >
              <CheckCircle size={20} />
              {isCompleting ? 'Completamento...' : `Completa Tutti gli Ordini (${totalOrders})`}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

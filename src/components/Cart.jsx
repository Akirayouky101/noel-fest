import { useState } from 'react'
import './Cart.css'

function Cart({ cart, character, numPeople = 1, onClose, onUpdateQuantity, onSubmit }) {
  const [notes, setNotes] = useState('')
  const [showConfirm, setShowConfirm] = useState(false)
  const [sending, setSending] = useState(false)

  const COPERTO = 1.50
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const copertoTotal = COPERTO * numPeople
  const total = cart.length > 0 ? subtotal + copertoTotal : 0

  const handleSubmit = () => {
    if (cart.length === 0) {
      alert('Il carrello è vuoto!')
      return
    }
    setShowConfirm(true)
  }

  const confirmOrder = async () => {
    setSending(true)
    try {
      await onSubmit(notes)
    } catch (error) {
      setSending(false)
      alert('Errore nell\'invio dell\'ordine. Riprova.')
    }
  }

  if (showConfirm) {
    return (
      <div className="cart-overlay" onClick={() => !sending && setShowConfirm(false)}>
        <div className="cart-sheet confirm-sheet" onClick={e => e.stopPropagation()}>
          {/* Header */}
          <div className="sheet-header">
            <button className="back-btn" onClick={() => setShowConfirm(false)} disabled={sending}>
              ← Indietro
            </button>
            <h3>Conferma ordine</h3>
            <div style={{width: '80px'}}></div>
          </div>

          {/* Ordine per */}
          <div className="order-for">
            <span className="order-for-label">Ordine per:</span>
            <span className="order-for-name">{character}</span>
          </div>

          {/* Items */}
          <div className="confirm-items-list">
            {cart.map(item => (
              <div key={item.id} className="confirm-row">
                <span className="confirm-qty">{item.quantity}x</span>
                <span className="confirm-name">{item.name}</span>
                <span className="confirm-price">€{(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>

          {/* Note */}
          {notes && (
            <div className="confirm-note-box">
              <strong>📝 Note:</strong> {notes}
            </div>
          )}

          {/* Totali */}
          <div className="totals-box">
            <div className="total-row">
              <span>Subtotale</span>
              <span>€{subtotal.toFixed(2)}</span>
            </div>
            <div className="total-row">
              <span>Coperto ({numPeople} {numPeople === 1 ? 'persona' : 'persone'})</span>
              <span>€{copertoTotal.toFixed(2)}</span>
            </div>
            <div className="total-row total-final">
              <span>Totale</span>
              <span>€{total.toFixed(2)}</span>
            </div>
          </div>

          {/* Bottone conferma */}
          <div className="sheet-footer">
            <button 
              className="btn-confirm" 
              onClick={confirmOrder} 
              disabled={sending || cart.length === 0}
            >
              {sending ? '⏳ Invio in corso...' : cart.length === 0 ? '⚠️ Carrello vuoto' : '✓ Conferma e Invia'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="cart-overlay" onClick={onClose}>
      <div className="cart-sheet" onClick={e => e.stopPropagation()}>
        {/* Header carrello */}
        <div className="sheet-header">
          <button className="close-btn" onClick={onClose}>✕</button>
          <h3>Carrello ({cart.length})</h3>
          <div style={{width: '40px'}}></div>
        </div>

        {/* Lista items o empty state */}
        {cart.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🛒</div>
            <p>Il carrello è vuoto</p>
            <button className="btn-continue" onClick={onClose}>Inizia a ordinare</button>
          </div>
        ) : (
          <>
            {/* Items */}
            <div className="items-list">
              {cart.map(item => (
                <div key={item.id} className="item-card">
                  <div className="item-main">
                    <div className="item-details">
                      <h4>{item.name}</h4>
                      <span className="item-price">€{item.price.toFixed(2)}</span>
                    </div>
                    <div className="quantity-controls">
                      <button 
                        className="qty-btn minus"
                        onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                      >
                        −
                      </button>
                      <span className="qty-value">{item.quantity}</span>
                      <button 
                        className="qty-btn plus"
                        onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div className="item-subtotal">
                    Totale: €{(item.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            {/* Note */}
            <div className="notes-section">
              <input
                type="text"
                className="notes-input"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="💬 Note o richieste speciali (allergie, ecc.)"
              />
            </div>

            {/* Riepilogo totali */}
            <div className="summary-box">
              <div className="summary-row">
                <span>Subtotale</span>
                <span>€{subtotal.toFixed(2)}</span>
              </div>
              <div className="summary-row">
                <span>Coperto ({numPeople} {numPeople === 1 ? 'persona' : 'persone'})</span>
                <span>€{copertoTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Footer con totale e bottone */}
            <div className="sheet-footer">
              <div className="footer-total">
                <span>Totale</span>
                <span className="footer-amount">€{total.toFixed(2)}</span>
              </div>
              <button className="btn-order" onClick={handleSubmit}>
                Procedi all'ordine →
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default Cart

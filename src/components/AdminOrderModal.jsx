import { useState } from 'react'
import { X, Plus, Minus, ShoppingCart } from 'lucide-react'
import { menuData } from '../data/menuData'
import './AdminOrderModal.css'

export default function AdminOrderModal({ reservation, onClose, onCreateOrder }) {
  const [cart, setCart] = useState([])
  const [activeSection, setActiveSection] = useState('kitchen') // 'kitchen' or 'streetfood'

  // Converti menuData in array e filtra per categoria
  const allItems = Object.values(menuData).flat()
  const kitchenItems = allItems.filter(item => item.category === 'kitchen')
  const streetfoodItems = allItems.filter(item => item.category === 'streetfood')

  const currentItems = activeSection === 'kitchen' ? kitchenItems : streetfoodItems

  // Aggiungi al carrello
  const addToCart = (item) => {
    const existing = cart.find(i => i.id === item.id)
    if (existing) {
      setCart(cart.map(i => 
        i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
      ))
    } else {
      setCart([...cart, { ...item, quantity: 1 }])
    }
  }

  // Rimuovi dal carrello
  const removeFromCart = (itemId) => {
    const existing = cart.find(i => i.id === itemId)
    if (existing.quantity === 1) {
      setCart(cart.filter(i => i.id !== itemId))
    } else {
      setCart(cart.map(i => 
        i.id === itemId ? { ...i, quantity: i.quantity - 1 } : i
      ))
    }
  }

  // Calcola totale
  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  // Completa ordine
  const handleCompleteOrder = () => {
    if (cart.length === 0) {
      alert('Aggiungi almeno un prodotto!')
      return
    }

    onCreateOrder({
      characterName: reservation.character_name,
      email: reservation.email,
      numPeople: reservation.num_people,
      items: cart,
      total: total,
      sessionType: reservation.session_type,
      sessionDate: reservation.session_date,
      sessionTime: reservation.session_time
    })
  }

  return (
    <div className="admin-order-modal-overlay" onClick={onClose}>
      <div className="admin-order-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="admin-order-header">
          <div>
            <h2>🛒 Crea Ordine</h2>
            <p className="character-info">
              <strong>{reservation.character_name}</strong> · {reservation.num_people} persone
            </p>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        {/* Section Tabs */}
        <div className="section-tabs">
          <button 
            className={`tab-btn ${activeSection === 'kitchen' ? 'active' : ''}`}
            onClick={() => setActiveSection('kitchen')}
          >
            🍽️ Cucina ({kitchenItems.length})
          </button>
          <button 
            className={`tab-btn ${activeSection === 'streetfood' ? 'active' : ''}`}
            onClick={() => setActiveSection('streetfood')}
          >
            🌭 Street Food ({streetfoodItems.length})
          </button>
        </div>

        {/* Products Grid */}
        <div className="products-grid">
          {currentItems.map(item => {
            const inCart = cart.find(i => i.id === item.id)
            const quantity = inCart ? inCart.quantity : 0

            return (
              <div key={item.id} className="product-card">
                <div className="product-info">
                  <div className="product-name">{item.name}</div>
                  <div className="product-price">€{item.price.toFixed(2)}</div>
                </div>
                <div className="product-actions">
                  {quantity > 0 ? (
                    <div className="quantity-controls">
                      <button 
                        className="qty-btn minus"
                        onClick={() => removeFromCart(item.id)}
                      >
                        <Minus size={16} />
                      </button>
                      <span className="quantity">{quantity}</span>
                      <button 
                        className="qty-btn plus"
                        onClick={() => addToCart(item)}
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  ) : (
                    <button 
                      className="add-btn"
                      onClick={() => addToCart(item)}
                    >
                      <Plus size={16} />
                      Aggiungi
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Cart Summary */}
        <div className="cart-summary">
          <div className="cart-info">
            <ShoppingCart size={20} />
            <span>{cartCount} prodotti</span>
          </div>
          <div className="cart-total">
            Totale: <strong>€{total.toFixed(2)}</strong>
          </div>
          <button 
            className="complete-btn"
            onClick={handleCompleteOrder}
            disabled={cart.length === 0}
          >
            Completa Ordine
          </button>
        </div>
      </div>
    </div>
  )
}

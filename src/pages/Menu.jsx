import { useState, useEffect } from 'react'
import Cart from '../components/Cart'
import SessionSelectionModal from '../components/SessionSelectionModal'
import { menuData } from '../data/menuData'
import { getRandomCharacter } from '../data/characters'
import { getAvailableSeats, createOrder, createReservation } from '../lib/supabaseAPI'
import './Menu.css'

const categories = [
  { id: 'antipasti', name: 'Antipasti', icon: '👨‍🍳', desc: 'Prelibatezze per iniziare' },
  { id: 'primi', name: 'Primi', icon: '👑', desc: 'Paste e risotti' },
  { id: 'secondi', name: 'Secondi', icon: '🧚', desc: 'Piatti principali' },
  { id: 'contorni', name: 'Contorni', icon: '🧚‍♀️', desc: 'Verdure e accompagnamenti' },
  { id: 'panini', name: 'Panini', icon: '🎅', desc: 'Panini speciali' },
  { id: 'streetfood', name: 'Street Food', icon: '⛄', desc: 'Da passeggio' },
  { id: 'dolci', name: 'Dolci', icon: '🦄', desc: 'Dessert magici' },
  { id: 'golosoni', name: 'Golosoni', icon: '🧁', desc: 'Golosi e fritti' },
  { id: 'bevande', name: 'Bevande', icon: '🍾', desc: 'Drink e bibite' }
]

function Menu() {
  const [character, setCharacter] = useState(null)
  const [email, setEmail] = useState('')
  const [numPeople, setNumPeople] = useState(1)
  const [orderType, setOrderType] = useState(null) // 'immediate' o 'at_register'
  const [sessionData, setSessionData] = useState(null) // { sessionType, sessionDate, sessionTime }
  const [availableSeats, setAvailableSeats] = useState(150)
  const [showWelcomeModal, setShowWelcomeModal] = useState(true)
  const [showEmailModal, setShowEmailModal] = useState(false)
  const [showSessionModal, setShowSessionModal] = useState(false)
  const [showSeatsFullModal, setShowSeatsFullModal] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [cart, setCart] = useState([])
  const [showCart, setShowCart] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  // Carica dati da localStorage se esistono
  useEffect(() => {
    const savedCharacter = localStorage.getItem('character')
    const savedEmail = localStorage.getItem('email')
    const savedOrderType = localStorage.getItem('orderType')
    
    if (savedCharacter && savedEmail && savedOrderType) {
      setCharacter(savedCharacter)
      setEmail(savedEmail)
      setOrderType(savedOrderType)
      setShowWelcomeModal(false)
    }
    
    // Carica disponibilità posti
    fetchAvailableSeats()
    
    // Polling ogni 30 secondi per aggiornare contatore posti
    const interval = setInterval(() => {
      fetchAvailableSeats()
    }, 30000)
    
    return () => clearInterval(interval)
  }, [])

  const fetchAvailableSeats = async () => {
    try {
      const available = await getAvailableSeats()
      setAvailableSeats(available)
    } catch (error) {
      console.error('Errore caricamento posti:', error)
    }
  }

  const handleStartFlow = (type) => {
    // type = 'immediate' oppure 'at_register'
    if (type === 'at_register' && availableSeats === 0) {
      setShowSeatsFullModal(true)
      return
    }
    
    const newCharacter = getRandomCharacter()
    setCharacter(newCharacter)
    setOrderType(type)
    setShowWelcomeModal(false)
    
    // Se prenota posto, mostra modal sessione prima dell'email
    if (type === 'at_register') {
      setShowSessionModal(true)
    } else {
      setShowEmailModal(true)
    }
  }

  const handleSessionConfirm = (session) => {
    console.log('✅ Sessione confermata:', session)
    setSessionData(session)
    setShowSessionModal(false)
    setShowEmailModal(true)
  }

  const handleEmailSubmit = async (submittedEmail, people) => {
    setEmail(submittedEmail)
    setNumPeople(people)
    
    localStorage.setItem('character', character)
    localStorage.setItem('email', submittedEmail)
    localStorage.setItem('orderType', orderType)
    
    setShowEmailModal(false)
    
    console.log('📊 DEBUG orderType:', orderType, typeof orderType)
    
    // Se prenota tavolo, crea reservation
    if (orderType === 'at_register') {
      // Verifica disponibilità posti PRIMA di prenotare
      if (people > availableSeats) {
        alert(`❌ Posti insufficienti!\nRichiesti: ${people}\nDisponibili: ${availableSeats}\n\nRiduci il numero di persone o ordina senza prenotazione.`)
        setShowEmailModal(true)
        return
      }
      
      try {
        console.log('🪑 Creazione prenotazione:', { character, email: submittedEmail, num_people: people })
        
        await createReservation(character, people)
        console.log('✅ Prenotazione creata con successo')
        
        // Aggiorna immediatamente il contatore posti
        await fetchAvailableSeats()
      } catch (error) {
        console.error('❌ Errore prenotazione:', error)
      }
    } else {
      console.log('🍽️ Ordine immediato - nessuna prenotazione (orderType:', orderType, ')')
    }
  }

  const handleCategoryClick = (category) => {
    setSelectedCategory(category.id)
  }

  const handleBackToMenu = () => {
    setSelectedCategory(null)
  }

  const addToCart = (item) => {
    const existingItem = cart.find(cartItem => cartItem.id === item.id)
    if (existingItem) {
      setCart(cart.map(cartItem =>
        cartItem.id === item.id
          ? { ...cartItem, quantity: cartItem.quantity + 1 }
          : cartItem
      ))
    } else {
      setCart([...cart, { ...item, quantity: 1 }])
    }
  }

  const updateQuantity = (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      setCart(cart.filter(item => item.id !== itemId))
    } else {
      setCart(cart.map(item =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      ))
    }
  }

  const submitOrder = async (notes) => {
    // VALIDAZIONE 1: Verifica che il carrello non sia vuoto
    if (!cart || cart.length === 0) {
      console.error('❌ ERRORE: Tentativo di inviare ordine con carrello vuoto!')
      alert('⚠️ Il carrello è vuoto! Aggiungi almeno un articolo prima di ordinare.')
      return
    }
    
    // VALIDAZIONE 2: Verifica che tutti gli items abbiano quantità valida
    const invalidItems = cart.filter(item => !item.quantity || item.quantity <= 0)
    if (invalidItems.length > 0) {
      console.error('❌ ERRORE: Items con quantità non valida:', invalidItems)
      alert('⚠️ Alcuni articoli nel carrello hanno quantità non valida. Controlla il carrello.')
      return
    }
    
    const COPERTO = 1.50
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    const copertoTotal = COPERTO * numPeople
    
    // Se è una prenotazione ma non ha sessionData, c'è un errore
    if (orderType === 'at_register' && !sessionData) {
      console.error('❌ ERRORE: Prenotazione senza dati sessione!')
      alert('Errore: mancano i dati della sessione. Riprova.')
      return
    }
    
    const orderData = {
      character,
      email,
      num_people: numPeople,
      orderType,
      items: cart,
      notes,
      total: subtotal + copertoTotal,
      // Aggiungi dati sessione se è una prenotazione
      sessionType: sessionData?.sessionType || 'immediate',
      sessionDate: sessionData?.sessionDate || null,
      sessionTime: sessionData?.sessionTime || null
    }

    console.log('🔍 DEBUG - orderType:', orderType)
    console.log('🔍 DEBUG - sessionData:', sessionData)
    console.log('🔍 DEBUG - orderData completo:', orderData)

    try {
      await createOrder(orderData)
      console.log('✅ Ordine creato con successo')

      setCart([])
      setShowCart(false)
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 3000)
    } catch (error) {
      console.error('Errore completo:', error)
      alert('Errore durante l\'invio dell\'ordine: ' + error.message)
      throw error
    }
  }

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  // Modale benvenuto iniziale
  if (showWelcomeModal) {
    return <WelcomeModal onStart={handleStartFlow} availableSeats={availableSeats} />
  }

  // Modale selezione sessione (pranzo/cena)
  if (showSessionModal) {
    return (
      <SessionSelectionModal
        show={showSessionModal}
        onClose={() => {
          setShowSessionModal(false)
          setShowWelcomeModal(true) // Torna indietro al benvenuto
        }}
        onConfirm={handleSessionConfirm}
      />
    )
  }

  // Modale email/screenshot
  if (showEmailModal) {
    return (
      <EmailModal 
        character={character}
        orderType={orderType}
        onSubmit={handleEmailSubmit}
      />
    )
  }

  // Modale posti esauriti
  if (showSeatsFullModal) {
    return (
      <SeatsFullModal onClose={() => setShowSeatsFullModal(false)} />
    )
  }

  if (!selectedCategory) {
    return (
      <div className="app-container">
        <video className="video-background" autoPlay loop muted playsInline>
          <source src="/Sfondo1.mp4" type="video/mp4" />
        </video>
        <div className="app-header">
          <div className="header-content">
            <div className="header-left">
              <button className="avatar-btn">
                👑
              </button>
              <div className="header-info">
                <h1>Noel Fest</h1>
                <p>{character}</p>
              </div>
            </div>
            <button className="cart-btn-header" onClick={() => setShowCart(true)}>
              🛒
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </button>
          </div>
        </div>

        <div className="seats-counter-bar">
          <span>🪑 Posti disponibili: <strong>{availableSeats}</strong></span>
        </div>

        <div className="categories-scroll">
          <div className="categories-grid">
            {categories.map((cat, index) => (
              <div 
                key={cat.id} 
                className="category-tile" 
                onClick={() => handleCategoryClick(cat)}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="tile-icon">{cat.icon}</div>
                <div className="tile-info">
                  <h3>{cat.name}</h3>
                  <p>{cat.desc}</p>
                </div>
                <div className="tile-arrow">›</div>
              </div>
            ))}
          </div>
        </div>

        {showCart && (
          <Cart
            cart={cart}
            character={character}
            numPeople={numPeople}
            onClose={() => setShowCart(false)}
            onUpdateQuantity={updateQuantity}
            onSubmit={submitOrder}
          />
        )}

        {showSuccess && (
          <div className="success-toast">
            ✓ Ordine inviato con successo!
          </div>
        )}
      </div>
    )
  }

  const categoryInfo = categories.find(c => c.id === selectedCategory)
  const items = menuData[selectedCategory] || []

  return (
    <div className="app-container">
      <video className="video-background" autoPlay loop muted playsInline>
        <source src="/Sfondo1.mp4" type="video/mp4" />
      </video>
      <div className="category-header">
        <button className="back-btn-header" onClick={handleBackToMenu}>
          ← Indietro
        </button>
        <div className="category-title">
          <span className="category-emoji">{categoryInfo.icon}</span>
          <h2>{categoryInfo.name}</h2>
        </div>
        <button className="cart-btn-header" onClick={() => setShowCart(true)}>
          🛒
          {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
        </button>
      </div>

      <div className="items-scroll">
        <div className="items-container">
          {items.map(item => (
            <div key={item.id} className="menu-item-card">
              <div className="item-content">
                <div className="item-header">
                  <h3>{item.name}</h3>
                  <span className="item-price">€{item.price.toFixed(2)}</span>
                </div>
                {item.description && (
                  <p className="item-description">{item.description}</p>
                )}
                {item.ingredients && (
                  <p className="item-ingredients">{item.ingredients}</p>
                )}
                {item.allergens && (
                  <p className="item-allergens">⚠️ {item.allergens}</p>
                )}
              </div>
              <button className="add-btn" onClick={() => addToCart(item)}>
                + Aggiungi
              </button>
            </div>
          ))}
        </div>
      </div>

      {showCart && (
        <Cart
          cart={cart}
          character={character}
          numPeople={numPeople}
          onClose={() => setShowCart(false)}
          onUpdateQuantity={updateQuantity}
          onSubmit={submitOrder}
        />
      )}

      {showSuccess && (
        <div className="success-toast">
          ✓ Ordine inviato con successo!
        </div>
      )}
    </div>
  )
}

// Componente modale benvenuto
function WelcomeModal({ onStart, availableSeats }) {
  return (
    <div className="welcome-modal-overlay">
      <video className="video-background" autoPlay loop muted playsInline>
        <source src="/Sfondo1.mp4" type="video/mp4" />
      </video>
      <div className="welcome-modal">
        <div className="welcome-header">
          <h1>🎄 Benvenuto al Noel Fest</h1>
          <p className="welcome-subtitle">Il Bosco Incantato di Re Agrifoglio</p>
        </div>
        
        <div className="welcome-content">
          <p className="seats-info">
            <span className="seats-icon">🪑</span>
            <span className="seats-text">Posti disponibili: <strong>{availableSeats}</strong></span>
          </p>
          
          <p className="welcome-description">
            Scegli come vuoi procedere
          </p>
          
          <div className="welcome-buttons">
            <button 
              className="welcome-btn immediate-btn"
              onClick={() => onStart('immediate')}
            >
              <span className="btn-icon">🍽️</span>
              <span className="btn-text">
                <strong>Ordina Subito</strong>
                <small>Ordina e ritira in cassa</small>
              </span>
            </button>
            
            <button 
              className="welcome-btn reserve-btn"
              onClick={() => onStart('at_register')}
              disabled={availableSeats === 0}
            >
              <span className="btn-icon">🪑</span>
              <span className="btn-text">
                <strong>Prenota Posto</strong>
                <small>Prenota e ordina dopo</small>
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Componente modale email/screenshot
function EmailModal({ character, orderType, onSubmit }) {
  const [email, setEmail] = useState('')
  const [numPeople, setNumPeople] = useState(1)
  const [showScreenshot, setShowScreenshot] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (email.trim()) {
      setShowScreenshot(true)
    }
  }

  const handleContinue = () => {
    onSubmit(email, numPeople)
  }

  if (showScreenshot) {
    return (
      <div className="email-modal-overlay">
        <video className="video-background" autoPlay loop muted playsInline>
          <source src="/Sfondo1.mp4" type="video/mp4" />
        </video>
        <div className="email-modal screenshot-view">
          <div className="screenshot-header">
            <h2>✨ Il tuo personaggio</h2>
          </div>
          
          <div className="character-display">
            <div className="character-icon">👑</div>
            <h1 className="character-name">{character}</h1>
            <p className="character-subtitle">Bosco Incantato</p>
          </div>
          
          <div className="screenshot-info">
            <p className="screenshot-text">
              📸 <strong>Fai uno screenshot</strong> di questa schermata
            </p>
            <p className="screenshot-text">
              Mostra il tuo personaggio in cassa per ritirare l'ordine
            </p>
          </div>
          
          <button 
            className="continue-btn"
            onClick={handleContinue}
          >
            Continua al Menù →
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="email-modal-overlay">
      <video className="video-background" autoPlay loop muted playsInline>
        <source src="/Sfondo1.mp4" type="video/mp4" />
      </video>
      <div className="email-modal">
        <div className="email-header">
          <h2>📧 I tuoi dati</h2>
          <p>Riceverai conferma via email</p>
        </div>
        
        <form onSubmit={handleSubmit} className="email-form">
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tua@email.com"
              className="email-input"
              required
              autoFocus
            />
          </div>
          
          {orderType === 'at_register' && (
            <div className="form-group">
              <label>Numero persone</label>
              <div className="number-selector">
                <button 
                  type="button"
                  onClick={() => setNumPeople(Math.max(1, numPeople - 1))}
                  className="number-btn"
                >
                  -
                </button>
                <span className="number-display">{numPeople}</span>
                <button 
                  type="button"
                  onClick={() => setNumPeople(numPeople + 1)}
                  className="number-btn"
                >
                  +
                </button>
              </div>
            </div>
          )}
          
          <button type="submit" className="email-submit-btn">
            Continua
          </button>
        </form>
      </div>
    </div>
  )
}

// Componente modale posti esauriti
function SeatsFullModal({ onClose }) {
  return (
    <div className="seats-full-overlay">
      <div className="seats-full-modal">
        <div className="seats-full-icon">⚠️</div>
        <h2>Posti Esauriti</h2>
        <p className="seats-full-text">
          Per sapere se sono disponibili ancora dei posti devi <strong>recarti in cassa</strong>.
        </p>
        <p className="seats-full-urgent">Affrettati!</p>
        <button 
          className="seats-full-btn"
          onClick={onClose}
        >
          Ho capito
        </button>
      </div>
    </div>
  )
}

export default Menu

import { useState, useEffect, useRef } from 'react'
import Cart from '../components/Cart'
import SessionSelectionModal from '../components/SessionSelectionModal'
import KitchenHoursModal from '../components/KitchenHoursModal'
import MenuItemNew from '../components/MenuItemNew'
import { menuData } from '../data/menuData'
import { getRandomCharacter } from '../data/characters'
import { getAvailableSeats, createOrder, createReservation } from '../lib/supabaseAPI'
import { sendOrderConfirmationEmail } from '../lib/emailService'
import './MenuNew.css'

const categoriesCucina = [
  { id: 'antipasti', name: 'Antipasti', icon: '🥟' },
  { id: 'primi', name: 'Primi', icon: '🍝' },
  { id: 'secondi', name: 'Secondi', icon: '🍖' },
  { id: 'contorni', name: 'Contorni', icon: '🥗' },
  { id: 'dolci', name: 'Dolci', icon: '🍰' },
  { id: 'bevande', name: 'Bevande', icon: '🥤' }
]

const categoriesStreetFood = [
  { id: 'panini', name: 'Panini', icon: '🥪' },
  { id: 'fritti', name: 'Fritti', icon: '�' },
  { id: 'golosoni', name: 'Golosoni', icon: '🍩' },
  { id: 'bevande_street', name: 'Bevande', icon: '🥤' }
]

function MenuNew() {
  const [character, setCharacter] = useState(null)
  const [email, setEmail] = useState('')
  const [numPeople, setNumPeople] = useState(1)
  const [orderType, setOrderType] = useState(null)
  const [menuType, setMenuType] = useState(null) // 'cucina' o 'street'
  const [sessionData, setSessionData] = useState(null)
  const [availableSeats, setAvailableSeats] = useState(150)
  const [showWelcomeModal, setShowWelcomeModal] = useState(true)
  const [showEmailModal, setShowEmailModal] = useState(false)
  const [showSessionModal, setShowSessionModal] = useState(false)
  const [showSeatsFullModal, setShowSeatsFullModal] = useState(false)
  const [showMenuTypeModal, setShowMenuTypeModal] = useState(false)
  const [showCopertoWarningModal, setShowCopertoWarningModal] = useState(false)
  const [showKitchenHoursModal, setShowKitchenHoursModal] = useState(false)
  const [activeCategory, setActiveCategory] = useState('antipasti')
  const [cart, setCart] = useState([])
  const [showCart, setShowCart] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [showProductModal, setShowProductModal] = useState(false)
  const [showReserveOnlyModal, setShowReserveOnlyModal] = useState(false)

  const scrollContainerRef = useRef(null)
  const categoryRefs = useRef({})
  
  // Categorie dinamiche in base al tipo di menù
  const categories = menuType === 'street' ? categoriesStreetFood : categoriesCucina

  // Carica dati da localStorage
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
    
    fetchAvailableSeats()
    
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
    if (type === 'at_register' && availableSeats === 0) {
      setShowSeatsFullModal(true)
      return
    }
    
    const newCharacter = getRandomCharacter()
    setCharacter(newCharacter)
    setOrderType(type)
    setShowWelcomeModal(false)
    
    // PRENOTAZIONE: solo menù cucina, vai diretto alla sessione
    if (type === 'at_register') {
      setMenuType('cucina')
      setActiveCategory('antipasti')
      setShowSessionModal(true)
      return
    }
    
    // VISUALIZZAZIONE o IMMEDIATO: mostra scelta menù
    if (type === 'view_only') {
      setCharacter('Visitatore')
    }
    setShowMenuTypeModal(true)
  }
  
  const handleMenuTypeSelection = (type) => {
    setShowMenuTypeModal(false)
    
    // Controllo orari per ordini immediati
    if (orderType === 'immediate') {
      const now = new Date()
      const currentHour = now.getHours()
      const currentMinutes = now.getMinutes()
      const currentTime = currentHour * 60 + currentMinutes

      // Orari cucina: 19:00 - 23:00
      const kitchenStart = 19 * 60
      const kitchenEnd = 23 * 60

      // Orari street food: 10:00 - 00:00
      const streetStart = 10 * 60
      const streetEnd = 24 * 60

      // Se prova ad accedere alla cucina fuori orario
      if (type === 'cucina' && (currentTime < kitchenStart || currentTime >= kitchenEnd)) {
        setShowKitchenHoursModal(true)
        // Forza Street Food come unica opzione
        setMenuType('street')
        setActiveCategory('panini')
        if (orderType === 'immediate') {
          setShowEmailModal(true)
        }
        return
      }

      // Se prova ad accedere allo street food fuori orario
      if (type === 'street' && (currentTime < streetStart || currentTime >= streetEnd)) {
        setShowKitchenHoursModal(true)
        return
      }
    }
    
    // Se è Menù Cucina, mostra avviso coperto PRIMA di continuare
    if (type === 'cucina') {
      setMenuType(type)
      setShowCopertoWarningModal(true)
      return
    }
    
    // Street Food: continua normalmente
    setMenuType(type)
    setActiveCategory('panini')
    
    // Se è ordine immediato, continua con email
    // Se è view_only, NON chiedere email - vai diretto al menu
    if (orderType === 'immediate') {
      setShowEmailModal(true)
    }
  }
  
  const handleCopertoWarningClose = () => {
    setShowCopertoWarningModal(false)
    
    // Imposta categoria iniziale per Menù Cucina
    setActiveCategory('antipasti')
    
    // Se è ordine immediato, continua con email
    // Se è view_only, NON chiedere email - vai diretto al menu
    if (orderType === 'immediate') {
      setShowEmailModal(true)
    }
  }

  const handleBackToStart = () => {
    // Reset completo dello stato
    setCharacter(null)
    setEmail('')
    setNumPeople(1)
    setOrderType(null)
    setMenuType(null)
    setSessionData(null)
    setActiveCategory('antipasti')
    setCart([])
    setShowCart(false)
    setShowWelcomeModal(true)
    
    // Pulisci localStorage
    localStorage.removeItem('character')
    localStorage.removeItem('email')
    localStorage.removeItem('orderType')
  }

  const handleSessionConfirm = (session) => {
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
    
    // NON creare più la prenotazione qui!
    // La prenotazione verrà creata SOLO quando:
    // 1. L'utente completa un ordine (in submitOrder), OPPURE
    // 2. L'utente clicca "Occupa Posti" (in confirmReserveSeatsOnly)
    
    setShowEmailModal(false)
  }

  const handleCategoryClick = (categoryId) => {
    // Controllo orari per ordini immediati
    if (orderType === 'immediate') {
      const now = new Date()
      const currentHour = now.getHours()
      const currentMinutes = now.getMinutes()
      const currentTime = currentHour * 60 + currentMinutes

      // Orari cucina: 19:00 - 23:00 (1140-1380 minuti)
      const kitchenStart = 19 * 60 // 1140
      const kitchenEnd = 23 * 60 // 1380

      // Orari street food: 10:00 - 00:00 (600-1440 minuti, poi 0-0)
      const streetStart = 10 * 60 // 600
      const streetEnd = 24 * 60 // 1440 (mezzanotte)

      // Se sto cercando di accedere alla cucina
      if (menuType === 'cucina' && (currentTime < kitchenStart || currentTime >= kitchenEnd)) {
        setShowKitchenHoursModal(true)
        return
      }

      // Se sto cercando di accedere allo street food
      if (menuType === 'street' && (currentTime < streetStart || currentTime >= streetEnd)) {
        setShowKitchenHoursModal(true)
        return
      }
    }

    setActiveCategory(categoryId)
    categoryRefs.current[categoryId]?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'start'
    })
  }

  const addToCart = (item) => {
    // In modalità view_only, apri la modal del prodotto invece di aggiungere al carrello
    if (orderType === 'view_only') {
      setSelectedProduct(item)
      setShowProductModal(true)
      return
    }
    
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id)
      if (existing) {
        return prev.map(i => 
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        )
      }
      return [...prev, { ...item, quantity: 1 }]
    })
  }

  const updateQuantity = (itemId, delta) => {
    setCart(prev => {
      const updated = prev.map(item => 
        item.id === itemId 
          ? { ...item, quantity: Math.max(0, item.quantity + delta) }
          : item
      )
      return updated.filter(item => item.quantity > 0)
    })
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
    
    try {
      const orderData = {
        characterName: character,
        email: email,
        items: cart,
        numPeople: numPeople,
        orderType: orderType,
        sessionData: sessionData,
        notes: notes || ''
      }
      
      // 1. Se è una prenotazione, crea prima la prenotazione dei posti
      if (orderType === 'at_register' && sessionData) {
        console.log('🪑 Creando prenotazione posti per:', character)
        await createReservation(character, email, numPeople, sessionData)
      }
      
      // 2. Crea ordine nel database
      await createOrder(orderData)
      
      // 3. Calcola totale per email
      const itemsTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
      const coperto = numPeople * 1.5
      const total = itemsTotal + coperto
      
      // 4. Invia email di conferma (non bloccare se fallisce)
      try {
        const emailResult = await sendOrderConfirmationEmail({
          email: email,
          characterName: character,
          items: cart,
          total: total,
          numPeople: numPeople,
          orderType: orderType
        })
        
        if (emailResult.success) {
          console.log('✅ Email di conferma inviata con successo')
        } else {
          console.warn('⚠️ Email non inviata:', emailResult.error)
        }
      } catch (emailError) {
        console.warn('⚠️ Email non inviata (ordine comunque creato):', emailError)
      }
      
      setCart([])
      setShowCart(false)
      setShowSuccess(true)
      
      // Dopo 3 secondi: logout automatico e torna alla pagina iniziale
      setTimeout(() => {
        setShowSuccess(false)
        handleBackToStart() // Esegui logout e reset
      }, 3000)
    } catch (error) {
      console.error('Errore completo:', error)
      alert('Errore durante l\'invio dell\'ordine: ' + error.message)
      throw error
    }
  }

  // Funzione per occupare posti senza ordine (ordineranno in presenza)
  const handleReserveSeatsOnly = () => {
    // Solo per prenotazioni (at_register)
    if (orderType !== 'at_register') {
      alert('⚠️ Questa funzione è disponibile solo per le prenotazioni!')
      return
    }
    
    setShowReserveOnlyModal(true)
  }

  const confirmReserveSeatsOnly = async () => {
    try {
      console.log('🪑 Occupando posti senza ordine per:', character)
      
      // Crea solo la prenotazione, senza ordine
      await createReservation(character, email, numPeople, sessionData)
      
      console.log('✅ Posti occupati con successo')
      
      setShowReserveOnlyModal(false)
      setShowSuccess(true)
      
      // Dopo 3 secondi: torna alla pagina iniziale
      setTimeout(() => {
        setShowSuccess(false)
        handleBackToStart()
      }, 3000)
    } catch (error) {
      console.error('❌ Errore occupazione posti:', error)
      alert('Errore durante l\'occupazione dei posti: ' + error.message)
    }
  }

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0)
  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)

  // Modale benvenuto
  if (showWelcomeModal) {
    return <WelcomeModal onStart={handleStartFlow} availableSeats={availableSeats} />
  }

  // Modale selezione sessione
  if (showSessionModal) {
    return (
      <SessionSelectionModal
        show={showSessionModal}
        onClose={() => {
          setShowSessionModal(false)
          setShowWelcomeModal(true)
        }}
        onConfirm={handleSessionConfirm}
      />
    )
  }

  // Modale email
  if (showEmailModal) {
    return (
      <EmailModal 
        character={character}
        orderType={orderType}
        onSubmit={handleEmailSubmit}
      />
    )
  }

  // Modale selezione tipo menù (per immediato e view_only)
  if (showMenuTypeModal) {
    return (
      <MenuTypeModal onSelect={handleMenuTypeSelection} />
    )
  }
  
  // Modale avviso coperto
  if (showCopertoWarningModal) {
    return (
      <CopertoWarningModal onClose={handleCopertoWarningClose} />
    )
  }
  
  // Modale orari cucina
  if (showKitchenHoursModal) {
    return (
      <KitchenHoursModal 
        show={showKitchenHoursModal}
        onClose={() => setShowKitchenHoursModal(false)}
      />
    )
  }
  
  // Modale posti esauriti
  if (showSeatsFullModal) {
    return (
      <SeatsFullModal onClose={() => setShowSeatsFullModal(false)} />
    )
  }

  // MENU PRINCIPALE CON SIDEBAR
  return (
    <div className="menu-layout">
      {/* HEADER */}
      <header className="menu-header">
        <div className="header-left">
          <div className="user-avatar">{character?.charAt(0) || '👤'}</div>
          <div className="user-info">
            <h1 className="brand">Noel Fest</h1>
            <p className="user-name">{character}</p>
            {menuType && (
              <span className={`menu-badge ${menuType}`}>
                {menuType === 'cucina' ? '🍝 Menù Cucina' : '🌭 Street Food'}
              </span>
            )}
          </div>
        </div>
        
        <div className="header-right">
          {orderType === 'view_only' ? (
            <button className="view-mode-btn" onClick={handleBackToStart}>
              <span>⬅️ Torna Indietro</span>
            </button>
          ) : (
            <>
              {/* Pulsante Occupa Posti (solo per prenotazioni) */}
              {orderType === 'at_register' && (
                <button className="reserve-seats-btn" onClick={handleReserveSeatsOnly}>
                  <span className="reserve-icon">🪑</span>
                  <span className="reserve-text">Occupa Posti</span>
                </button>
              )}
              
              <button className="cart-button" onClick={() => setShowCart(true)}>
                <span className="cart-icon">🛒</span>
                {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
              </button>
              <button className="logout-btn" onClick={handleBackToStart}>
                <span>🚪</span>
                <span>Esci</span>
              </button>
            </>
          )}
        </div>
      </header>

      {/* VIEW MODE BANNER */}
      {orderType === 'view_only' && (
        <div className="view-mode-banner">
          <span>👁️ Modalità visualizzazione - Clicca su un piatto per i dettagli</span>
        </div>
      )}

      {/* SEATS BAR */}
      {orderType !== 'view_only' && (
        <div className="seats-bar">
          <span>🪑 Posti disponibili: <strong>{availableSeats}</strong></span>
        </div>
      )}

      {/* SIDEBAR CATEGORIE (Desktop) */}
      <aside className="categories-sidebar">
        <nav className="categories-nav">
          {categories.map(cat => (
            <button
              key={cat.id}
              className={`category-btn ${activeCategory === cat.id ? 'active' : ''}`}
              onClick={() => handleCategoryClick(cat.id)}
            >
              <span className="cat-icon">{cat.icon}</span>
              <span className="cat-name">{cat.name}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* BOTTOM NAV (Mobile) */}
      <nav className="bottom-nav">
        {categories.map(cat => (
          <button
            key={cat.id}
            className={`bottom-nav-btn ${activeCategory === cat.id ? 'active' : ''}`}
            onClick={() => handleCategoryClick(cat.id)}
          >
            <span className="nav-icon">{cat.icon}</span>
            <span className="nav-label">{cat.name}</span>
          </button>
        ))}
      </nav>

      {/* MAIN CONTENT - SCROLL CONTINUO */}
      <main className="menu-content" ref={scrollContainerRef}>
        {categories.map(category => {
          const items = menuData[category.id] || []
          if (items.length === 0) return null
          
          return (
            <section 
              key={category.id}
              className="category-section"
              ref={el => categoryRefs.current[category.id] = el}
            >
              <h2 className="category-title">
                <span className="title-icon">{category.icon}</span>
                {category.name}
              </h2>
              <div className="items-grid">
                {items.map((item, index) => (
                  <MenuItemNew
                    key={item.id}
                    item={item}
                    index={index}
                    onAddToCart={addToCart}
                    viewOnly={orderType === 'view_only'}
                  />
                ))}
              </div>
            </section>
          )
        })}
      </main>

      {/* CARRELLO SLIDE-IN */}
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

      {/* SUCCESS TOAST */}
      {showSuccess && (
        <div className="success-toast">
          ✓ Ordine inviato con successo!
        </div>
      )}

      {/* FAB CARRELLO (Mobile Alternative) */}
      {cartCount > 0 && orderType !== 'view_only' && (
        <button className="fab-cart" onClick={() => setShowCart(true)}>
          <span className="fab-icon">🛒</span>
          <span className="fab-count">{cartCount}</span>
          <span className="fab-total">€{cartTotal.toFixed(2)}</span>
        </button>
      )}

      {/* PRODUCT DETAIL MODAL */}
      {showProductModal && selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => {
            setShowProductModal(false)
            setSelectedProduct(null)
          }}
          onGoToMenu={() => window.location.href = '/'}
        />
      )}

      {/* Modale Conferma Occupa Posti */}
      {showReserveOnlyModal && (
        <div className="modal-overlay" onClick={() => setShowReserveOnlyModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>🪑 Occupa Posti Senza Ordinazione</h2>
            </div>
            
            <div className="modal-body">
              <div className="reserve-info">
                <p className="reserve-character">🎅 <strong>{character}</strong></p>
                <p className="reserve-people">👥 <strong>{numPeople}</strong> {numPeople === 1 ? 'persona' : 'persone'}</p>
                {sessionData && (
                  <>
                    <p className="reserve-session">
                      📅 {sessionData.sessionType === 'lunch' ? '🌞 Pranzo' : '🌙 Cena'}
                    </p>
                    {sessionData.sessionDate && (
                      <p className="reserve-date">📆 {sessionData.sessionDate}</p>
                    )}
                    {sessionData.sessionTime && (
                      <p className="reserve-time">🕐 {sessionData.sessionTime}</p>
                    )}
                  </>
                )}
              </div>
              
              <div className="reserve-warning">
                <p>⚠️ I posti verranno occupati ma <strong>non ci sarà un ordine</strong>.</p>
                <p>💡 L'ordinazione verrà fatta direttamente in presenza.</p>
              </div>
            </div>

            <div className="modal-actions">
              <button 
                className="btn-modal-cancel" 
                onClick={() => setShowReserveOnlyModal(false)}
              >
                Annulla
              </button>
              <button 
                className="btn-modal-confirm" 
                onClick={confirmReserveSeatsOnly}
              >
                🪑 Conferma Occupazione
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Componente modale benvenuto (come prima, mantengo la logica esistente)
function WelcomeModal({ onStart, availableSeats }) {
  return (
    <div className="welcome-modal-overlay">
      <div className="welcome-modal">
        <div className="welcome-header">
          <h1>🎄 Benvenuto al Noel Fest</h1>
          <p className="welcome-subtitle">Il Bosco Incantato di Re Agrifoglio</p>
        </div>
        
        <div className="welcome-content">
          <p className="seats-info">
            🪑 <strong>{availableSeats}</strong> posti disponibili
          </p>
          
          <div className="welcome-buttons">
            <button className="welcome-btn primary" onClick={() => onStart('at_register')}>
              <span className="btn-icon">🎫</span>
              <div className="btn-content">
                <h3>Prenota Posto</h3>
                <p>Ordina e vieni a mangiare in cassa</p>
              </div>
            </button>
            
            <button className="welcome-btn secondary" onClick={() => onStart('immediate')}>
              <span className="btn-icon">⚡</span>
              <div className="btn-content">
                <h3>Ordine Immediato</h3>
                <p>Solo ordine, ritiro sul posto</p>
              </div>
            </button>
            
            <button className="welcome-btn view-only" onClick={() => onStart('view_only')}>
              <span className="btn-icon eye-animated">👁️</span>
              <div className="btn-content">
                <h3>Vedi Menù</h3>
                <p>Esplora i nostri piatti</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function EmailModal({ character, orderType, onSubmit }) {
  const [email, setEmail] = useState('')
  const [people, setPeople] = useState(1)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (email.trim()) {
      onSubmit(email, people)
    }
  }

  return (
    <div className="email-modal-overlay">
      <div className="email-modal">
        <h2>👋 Ciao {character}!</h2>
        <p className="modal-subtitle">
          {orderType === 'at_register' 
            ? 'Conferma la tua prenotazione' 
            : 'Completa i tuoi dati'}
        </p>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>📧 Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="la-tua-email@esempio.com"
              required
            />
          </div>
          
          {orderType === 'at_register' && (
            <div className="form-group">
              <label>👥 Numero persone</label>
              <input
                type="number"
                min="1"
                max="10"
                value={people}
                onChange={(e) => setPeople(parseInt(e.target.value))}
                required
              />
            </div>
          )}
          
          <button type="submit" className="submit-btn">
            Continua →
          </button>
        </form>
      </div>
    </div>
  )
}

function CopertoWarningModal({ onClose }) {
  return (
    <div className="coperto-warning-overlay">
      <div className="coperto-warning-modal">
        <div className="coperto-warning-icon">ℹ️</div>
        <h2>Menù Cucina</h2>
        <div className="coperto-warning-content">
          <p>Il costo del coperto è di</p>
          <div className="coperto-price">€1,50</div>
          <p>a persona</p>
        </div>
        <button className="coperto-confirm-btn" onClick={onClose}>
          Ho Capito, Continua
        </button>
      </div>
    </div>
  )
}

function SeatsFullModal({ onClose }) {
  return (
    <div className="seats-full-overlay">
      <div className="seats-full-modal">
        <h2>😢 Posti Esauriti</h2>
        <p>Siamo al completo! Puoi comunque fare un ordine immediato.</p>
        <button className="close-btn" onClick={onClose}>
          Torna Indietro
        </button>
      </div>
    </div>
  )
}

function ProductDetailModal({ product, onClose, onGoToMenu }) {
  return (
    <div className="product-modal-overlay" onClick={onClose}>
      <div className="product-modal" onClick={(e) => e.stopPropagation()}>
        <button className="product-modal-close" onClick={onClose}>×</button>
        
        <div className="product-modal-header">
          <h2>🎁 {product.name}</h2>
          <span className="product-modal-price">€{product.price.toFixed(2)}</span>
        </div>
        
        <div className="product-modal-body">
          {product.description && (
            <p className="product-modal-description">{product.description}</p>
          )}
        </div>
        
        <div className="product-modal-footer">
          <p className="product-modal-info">
            💡 Vuoi ordinare questo prodotto?
          </p>
          <button className="product-modal-order-btn" onClick={onGoToMenu}>
            📋 Vai al Menu Completo
          </button>
        </div>
      </div>
    </div>
  )
}

function MenuTypeModal({ onSelect }) {
  return (
    <div className="modal-overlay">
      <div className="modal-content menu-type-selection">
        <div className="modal-header">
          <h2>🍽️ Scegli il Menù</h2>
          <p>Seleziona quale menù desideri consultare</p>
        </div>
        
        <div className="menu-type-cards">
          <div 
            className="menu-type-card cucina"
            onClick={() => onSelect('cucina')}
          >
            <div className="card-icon">🍝</div>
            <h3>Menù Cucina</h3>
            <p>Antipasti • Primi • Secondi</p>
            <p>Contorni • Dolci • Bevande</p>
            <div className="card-arrow">→</div>
          </div>
          
          <div 
            className="menu-type-card street"
            onClick={() => onSelect('street')}
          >
            <div className="card-icon">🌭</div>
            <h3>Street Food</h3>
            <p>Panini • Fritti</p>
            <p>Golosoni • Bevande</p>
            <div className="card-arrow">→</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MenuNew

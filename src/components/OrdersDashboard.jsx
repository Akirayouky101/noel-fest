import { useState, useEffect, useRef } from 'react'
import { menuData } from '../data/menuData'
import { printOrder } from '../utils/printUtils'
import CharacterArrivalCard from './CharacterArrivalCard'
import '../pages/Admin.css'

export default function OrdersDashboard() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleteModal, setDeleteModal] = useState({ show: false, order: null, characterName: '' })
  const [editModal, setEditModal] = useState({ show: false, order: null })
  const [peopleModal, setPeopleModal] = useState({ show: false, order: null, newNumber: 1 })
  const [freeSeatsModal, setFreeSeatsModal] = useState({ show: false, characterName: '' })
  const [walkinModal, setWalkinModal] = useState({ show: false, order: null, numSeats: 1 })
  const [successModal, setSuccessModal] = useState({ show: false, message: '' })
  const [availableSeats, setAvailableSeats] = useState(150)
  const [walkinSeats, setWalkinSeats] = useState({ total: 100, occupied: 0 })
  const [activeReservations, setActiveReservations] = useState(new Set())
  const [activeWalkinCharacters, setActiveWalkinCharacters] = useState(new Set())
  const [lastOrderCount, setLastOrderCount] = useState(0)
  const [audioEnabled, setAudioEnabled] = useState(true)
  const [activeDropdown, setActiveDropdown] = useState(null)
  const [filterStatus, setFilterStatus] = useState('all') // 'all', 'pending', 'preparing', 'completed'
  const [viewMode, setViewMode] = useState('orders') // 'orders' o 'reservations'
  const [expandedCharacters, setExpandedCharacters] = useState(new Set())
  const audioRef = useRef(null)

  useEffect(() => {
    loadOrders()
    loadAvailableSeats()
    loadActiveReservations()
    loadWalkinSeats()
    // Polling ogni 5 secondi
    const interval = setInterval(() => {
      loadOrders()
      loadAvailableSeats()
      loadActiveReservations()
      loadWalkinSeats()
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (activeDropdown) {
        setActiveDropdown(null)
      }
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [activeDropdown])

  const loadOrders = async () => {
    try {
      const response = await fetch('/api/orders.php')
      if (response.ok) {
        const data = await response.json()
        
        // Controlla nuovi ordini per audio alert
        if (lastOrderCount > 0 && data.length > lastOrderCount && audioEnabled) {
          playNotificationSound()
        }
        setLastOrderCount(data.length)
        
        // Raggruppa ordini per character, poi per arrival_group_id
        const characterGroups = {}
        
        data.forEach(order => {
          const char = order.character
          const arrivalId = order.arrival_group_id || 'default'
          
          // Inizializza il gruppo character se non esiste
          if (!characterGroups[char]) {
            characterGroups[char] = {
              character: char,
              arrivals: {},
              totalArrivals: 0
            }
          }
          
          // Inizializza il gruppo arrival se non esiste
          if (!characterGroups[char].arrivals[arrivalId]) {
            characterGroups[char].arrivals[arrivalId] = {
              arrival_group_id: arrivalId,
              orders: [],
              items: [],
              total: 0,
              num_people: 0,
              orderIds: [],
              email: order.email,
              orderType: order.orderType,
              status: order.status,
              timestamp: order.timestamp,
              notes: order.notes || ''
            }
            characterGroups[char].totalArrivals++
          }
          
          const arrivalGroup = characterGroups[char].arrivals[arrivalId]
          
          // Aggiungi l'ordine all'arrival
          arrivalGroup.orders.push(order)
          arrivalGroup.orderIds.push(order.id)
          
          // Unisci items
          order.items.forEach(newItem => {
            const existing = arrivalGroup.items.find(i => i.id === newItem.id)
            if (existing) {
              existing.quantity += newItem.quantity
            } else {
              arrivalGroup.items.push({...newItem})
            }
          })
          
          // Somma totali e persone
          arrivalGroup.total = (parseFloat(arrivalGroup.total) + parseFloat(order.total)).toFixed(2)
          arrivalGroup.num_people += order.num_people
          
          // Mantieni lo status meno avanzato (pending < preparing < completed)
          const statusPriority = { 'pending': 0, 'preparing': 1, 'completed': 2, 'cancelled': 3 }
          if (statusPriority[order.status] < statusPriority[arrivalGroup.status]) {
            arrivalGroup.status = order.status
          }
          
          // Usa il timestamp più recente
          if (new Date(order.timestamp) > new Date(arrivalGroup.timestamp)) {
            arrivalGroup.timestamp = order.timestamp
          }
          
          // Aggiungi note se ci sono
          if (order.notes && !arrivalGroup.notes.includes(order.notes)) {
            arrivalGroup.notes += (arrivalGroup.notes ? ' | ' : '') + order.notes
          }
        })
        
        // Converti in array flat per la visualizzazione
        const flatOrders = []
        Object.values(characterGroups).forEach(charGroup => {
          const arrivals = Object.values(charGroup.arrivals)
          // Ordina gli arrivi per timestamp
          arrivals.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
          
          arrivals.forEach((arrival, index) => {
            flatOrders.push({
              ...arrival,
              character: charGroup.character,
              arrivalNumber: index + 1,
              totalArrivals: charGroup.totalArrivals,
              allArrivals: arrivals // Tutti gli arrivi per questo personaggio
            })
          })
        })
        
        setOrders(flatOrders)
      }
    } catch (error) {
      console.error('Errore caricamento ordini:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadAvailableSeats = async () => {
    try {
      const response = await fetch('/api/seats.php')
      const data = await response.json()
      if (data.available !== undefined) {
        setAvailableSeats(data.available)
      }
    } catch (error) {
      console.error('Errore caricamento posti:', error)
    }
  }

  const loadActiveReservations = async () => {
    try {
      const response = await fetch('/api/reservations.php')
      const data = await response.json()
      if (data.success && data.reservations) {
        const activeChars = new Set(
          data.reservations
            .filter(r => r.status === 'active')
            .map(r => r.character_name)
        )
        setActiveReservations(activeChars)
      }
    } catch (error) {
      console.error('Errore caricamento prenotazioni:', error)
    }
  }

  const loadWalkinSeats = async () => {
    try {
      const response = await fetch('/api/walkin-seats.php')
      const data = await response.json()
      
      if (data.success) {
        setWalkinSeats({ 
          total: data.total, 
          occupied: data.occupied 
        })
      }
      
      // Carica anche i personaggi con walk-in attivi
      const detailsResponse = await fetch('/api/walkin-seats.php?details=1')
      const detailsData = await detailsResponse.json()
      
      console.log('Response walkin details:', detailsData)
      
      if (detailsData.success && detailsData.characters) {
        console.log('Personaggi con walk-in attivi:', detailsData.characters)
        setActiveWalkinCharacters(new Set(detailsData.characters))
      } else {
        console.log('Nessun personaggio walk-in attivo')
        setActiveWalkinCharacters(new Set())
      }
    } catch (error) {
      console.error('Errore caricamento posti walk-in:', error)
      // Fallback in caso di errore
      setWalkinSeats({ total: 100, occupied: 0 })
      setActiveWalkinCharacters(new Set())
    }
  }

  const updateOrderStatus = async (order, newStatus) => {
    try {
      const ids = order.orderIds || [order.id]
      
      // Aggiorna tutti gli ordini
      for (const orderId of ids) {
        await fetch('/api/orders.php', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId, status: newStatus })
        })
      }
      
      // Se l'ordine viene ANNULLATO, libera i posti (sia prenotabili che walk-in)
      // (NON quando completato, perché il tavolo è ancora occupato)
      if (newStatus === 'cancelled') {
        await freeSeatsForCharacter(order.character, true) // true = silenzioso
        await freeWalkinSeatsForCharacter(order.character, true)
      }
      
      loadOrders()
      loadAvailableSeats()
      loadWalkinSeats()
    } catch (error) {
      console.error('Errore aggiornamento stato:', error)
    }
  }

  const deleteOrder = async (order) => {
    try {
      const ids = order.orderIds || [order.id]
      console.log('Eliminando ordini:', ids)
      
      let allSuccess = true
      for (const orderId of ids) {
        const response = await fetch('/api/orders.php', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId })
        })
        
        const result = await response.json()
        if (!result.success) {
          console.error('Errore eliminazione ordine:', orderId, result)
          allSuccess = false
        }
      }
      
      if (allSuccess) {
        // Libera i posti prenotabili (sia per at_register che per immediate con walk-in)
        await freeSeatsForCharacter(order.character, true)
        
        // Libera anche eventuali posti walk-in occupati
        await freeWalkinSeatsForCharacter(order.character, true)
        
        setDeleteModal({ show: false, orderId: null, characterName: '' })
        loadOrders()
        loadAvailableSeats()
        loadWalkinSeats()
      } else {
        setSuccessModal({ 
          show: true, 
          message: '❌ Errore: impossibile eliminare alcuni ordini' 
        })
      }
    } catch (error) {
      console.error('Errore eliminazione ordine:', error)
      setSuccessModal({ 
        show: true, 
        message: '❌ Errore di connessione' 
      })
    }
  }

  const openDeleteModal = (order, characterName) => {
    setDeleteModal({ show: true, order, characterName })
  }

  const closeDeleteModal = () => {
    setDeleteModal({ show: false, order: null, characterName: '' })
  }

  const openEditModal = (order) => {
    setEditModal({ show: true, order: { ...order, items: [...order.items] } })
  }

  const closeEditModal = () => {
    setEditModal({ show: false, order: null })
  }

  const updateNumPeople = async (order, newNumPeople) => {
    const COPERTO = 1.50
    const oldNumPeople = order.num_people
    const difference = newNumPeople - oldNumPeople
    
    // Ricalcola il totale con il nuovo numero di persone
    const itemsTotal = order.items.reduce((sum, item) => 
      sum + (parseFloat(item.price) * item.quantity), 0
    )
    const newTotal = itemsTotal + (COPERTO * newNumPeople)
    
    try {
      // Aggiorna l'ordine
      const response = await fetch('/api/orders.php', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          orderId: order.id, 
          num_people: newNumPeople,
          total: newTotal
        })
      })
      
      if (!response.ok) {
        setSuccessModal({ 
          show: true, 
          message: '❌ Errore aggiornamento numero persone' 
        })
        return
      }
      
      // Se è una prenotazione (at_register), aggiorna seat_reservations
      if (order.orderType === 'at_register' && activeReservations.has(order.character)) {
        const resResponse = await fetch('/api/reservations.php')
        const resData = await resResponse.json()
        
        if (resData.success && resData.reservations) {
          const reservation = resData.reservations.find(
            r => r.character_name === order.character && r.status === 'active'
          )
          
          if (reservation) {
            // Aggiorna num_people nella prenotazione
            await fetch('/api/reservations.php', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                id: reservation.id,
                num_people: newNumPeople
              })
            })
          }
        }
      }
      
      // Se è un ordine immediate con walk-in attivo, aggiorna walkin_seats
      if (order.orderType === 'immediate' && activeWalkinCharacters.has(order.character)) {
        const walkinResponse = await fetch('/api/walkin-seats.php')
        const walkinData = await walkinResponse.json()
        
        if (walkinData.success && walkinData.walkins) {
          const walkin = walkinData.walkins.find(
            w => w.character_name === order.character && w.status === 'active'
          )
          
          if (walkin) {
            // Aggiorna num_seats nel walk-in
            await fetch('/api/walkin-seats.php', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                id: walkin.id,
                num_seats: newNumPeople
              })
            })
          }
        }
      }
      
      loadOrders()
      loadAvailableSeats()
      loadWalkinSeats()
      setPeopleModal({ show: false, order: null, newNumber: 1 })
      setSuccessModal({ 
        show: true, 
        message: `✅ Numero persone aggiornato: ${oldNumPeople} → ${newNumPeople}` 
      })
    } catch (error) {
      console.error('Errore aggiornamento num_people:', error)
      setSuccessModal({ 
        show: true, 
        message: '❌ Errore di connessione' 
      })
    }
  }

  const freeWalkinSeatsForCharacter = async (characterName, silent = false) => {
    try {
      const response = await fetch('/api/walkin-seats.php', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ character_name: characterName })
      })
      
      const data = await response.json()
      
      if (data.success && data.rows_affected > 0) {
        if (!silent) console.log(`Liberati posti walk-in per ${characterName}`)
        loadWalkinSeats()
      }
    } catch (error) {
      console.error('Errore liberazione posti walk-in:', error)
    }
  }

  const updateOrderItems = async (orderId, newItems, newTotal) => {
    try {
      const response = await fetch('/api/orders.php', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          orderId, 
          items: newItems,
          total: newTotal
        })
      })
      
      if (response.ok) {
        loadOrders()
        closeEditModal()
      } else {
        setSuccessModal({ 
          show: true, 
          message: '❌ Errore aggiornamento ordine' 
        })
      }
    } catch (error) {
      console.error('Errore aggiornamento items:', error)
      setSuccessModal({ 
        show: true, 
        message: '❌ Errore di connessione' 
      })
    }
  }

  const freeSeatsForCharacter = async (characterName, silent = false) => {
    try {
      // Cerca la prenotazione attiva per questo personaggio
      const response = await fetch('/api/reservations.php')
      const data = await response.json()
      
      if (data.success && data.reservations) {
        const reservation = data.reservations.find(
          r => r.character_name === characterName && r.status === 'active'
        )
        
        if (reservation) {
          // Aggiorna lo status a 'completed'
          const updateResponse = await fetch('/api/reservations.php', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: reservation.id,
              status: 'completed'
            })
          })
          
          if (updateResponse.ok) {
            if (!silent) {
              setSuccessModal({ 
                show: true, 
                message: `✅ Posti liberati per ${characterName}` 
              })
            }
            loadAvailableSeats()
            loadActiveReservations() // Ricarica le prenotazioni attive per aggiornare il pulsante
          } else {
            if (!silent) {
              setSuccessModal({ 
                show: true, 
                message: '❌ Errore liberazione posti' 
              })
            }
          }
        } else {
          if (!silent) {
            setSuccessModal({ 
              show: true, 
              message: '⚠️ Nessuna prenotazione attiva trovata' 
            })
          }
        }
      }
    } catch (error) {
      console.error('Errore liberazione posti:', error)
      if (!silent) {
        setSuccessModal({ 
          show: true, 
          message: '❌ Errore di connessione' 
        })
      }
    }
  }

  const freeSeats = (characterName) => {
    setFreeSeatsModal({ show: true, characterName })
  }

  const confirmFreeSeats = async () => {
    await freeSeatsForCharacter(freeSeatsModal.characterName, false)
    setFreeSeatsModal({ show: false, characterName: '' })
    // Dopo aver liberato i posti, ricarica gli ordini (così il pulsante scompare se la prenotazione non è più attiva)
    loadOrders()
  }

  const confirmOccupyWalkin = async () => {
    const { order, numSeats } = walkinModal
    
    try {
      // Prima aggiorna num_people nell'ordine se diverso
      if (order.num_people !== numSeats) {
        const ids = order.orderIds || [order.id]
        const COPERTO = 1.50
        const itemsTotal = order.items.reduce((sum, item) => 
          sum + (parseFloat(item.price) * item.quantity), 0
        )
        const newTotal = itemsTotal + (COPERTO * numSeats)
        
        for (const orderId of ids) {
          await fetch('/api/orders.php', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              orderId, 
              num_people: numSeats,
              total: newTotal
            })
          })
        }
      }
      
      // 1. Controlla prima se ci sono posti nei 150 prenotabili
      if (availableSeats >= numSeats) {
        // Usa i posti prenotabili creando una prenotazione normale
        const reservationResponse = await fetch('/api/reservations.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            character_name: order.character,
            email: order.email || `walkin_${order.character}@noelfest.local`,
            num_people: numSeats
          })
        })
        
        const reservationData = await reservationResponse.json()
        
        if (reservationData.success) {
          setWalkinModal({ show: false, order: null, numSeats: 1 })
          setSuccessModal({ 
            show: true, 
            message: `✅ Occupati ${numSeats} posti dai 150 prenotabili per ${order.character}` 
          })
          loadOrders()
          loadAvailableSeats()
          loadActiveReservations()
        } else {
          setWalkinModal({ show: false, order: null, numSeats: 1 })
          setSuccessModal({ 
            show: true, 
            message: `❌ Errore: ${reservationData.error || 'Errore sconosciuto'}` 
          })
        }
      } else if ((walkinSeats.total - walkinSeats.occupied) >= numSeats) {
        // Usa i posti walk-in
        const walkinResponse = await fetch('/api/walkin-seats.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            character_name: order.character,
            num_people: numSeats
          })
        })
        
        const walkinData = await walkinResponse.json()
        
        if (walkinData.success) {
          setWalkinModal({ show: false, order: null, numSeats: 1 })
          setSuccessModal({ 
            show: true, 
            message: `✅ Occupati ${numSeats} posti Walk-in per ${order.character}` 
          })
          loadOrders()
          loadWalkinSeats()
        } else {
          setWalkinModal({ show: false, order: null, numSeats: 1 })
          setSuccessModal({ 
            show: true, 
            message: `❌ Errore: ${walkinData.error}` 
          })
        }
      } else {
        // Nessun posto disponibile in entrambe le categorie
        setWalkinModal({ show: false, order: null, numSeats: 1 })
        setSuccessModal({ 
          show: true, 
          message: `❌ Non ci sono posti disponibili!\n🪑 Prenotabili: ${availableSeats}/150\n🚶 Walk-in: ${walkinSeats.total - walkinSeats.occupied}/${walkinSeats.total}` 
        })
      }
    } catch (error) {
      console.error('Errore occupazione walk-in:', error)
      setWalkinModal({ show: false, order: null, numSeats: 1 })
      setSuccessModal({ 
        show: true, 
        message: '❌ Errore di connessione' 
      })
    }
  }

  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return '#ffa500'
      case 'preparing': return '#4169e1'
      case 'completed': return '#32cd32'
      case 'cancelled': return '#dc143c'
      default: return '#666'
    }
  }

  const getStatusText = (status) => {
    switch(status) {
      case 'pending': return 'In Attesa'
      case 'preparing': return 'In Preparazione'
      case 'completed': return 'Completato'
      case 'cancelled': return 'Annullato'
      default: return status
    }
  }

  const toggleCharacterExpansion = (character) => {
    setExpandedCharacters(prev => {
      const newSet = new Set(prev)
      if (newSet.has(character)) {
        newSet.delete(character)
      } else {
        newSet.add(character)
      }
      return newSet
    })
  }

  const isReservationUnlocked = (order) => {
    // Se non è una prenotazione (è immediato), è sempre sbloccato
    if (!order.sessionType || order.sessionType === 'immediate') {
      return true
    }

    // Se non ha data/ora sessione, considera sbloccato (fallback)
    if (!order.sessionDate || !order.sessionTime) {
      return true
    }

    const now = new Date()
    const sessionDateTime = new Date(`${order.sessionDate}T${order.sessionTime}`)
    
    // Sblocca 30 minuti prima dell'orario della sessione
    const unlockTime = new Date(sessionDateTime.getTime() - 30 * 60 * 1000)
    
    return now >= unlockTime
  }

  const getSessionBadge = (order) => {
    if (!order.sessionType || order.sessionType === 'immediate') {
      return null
    }

    const unlocked = isReservationUnlocked(order)
    
    return {
      icon: unlocked ? '✅' : '🔒',
      text: unlocked ? 'Attiva' : 'Bloccata',
      color: unlocked ? '#32cd32' : '#ffa500'
    }
  }

  const playNotificationSound = () => {
    // Crea un suono semplice con Web Audio API
    const audioContext = new (window.AudioContext || window.webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)
    
    oscillator.frequency.value = 800
    oscillator.type = 'sine'
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)
    
    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + 0.5)
  }

  if (loading) {
    return <div className="admin-loading">Caricamento...</div>
  }

  return (
    <div className="admin-page">
      <header className="admin-header">
        <h1>🎄 Dashboard Ordini - Noel Fest 🎅</h1>
        <button 
          className={`audio-toggle ${audioEnabled ? 'enabled' : 'disabled'}`}
          onClick={() => setAudioEnabled(!audioEnabled)}
          title={audioEnabled ? 'Disattiva notifiche audio' : 'Attiva notifiche audio'}
        >
          {audioEnabled ? '🔔' : '🔕'}
        </button>
      </header>

      <div className="admin-stats">
        <div className="stat-card">
          <h3>Ordini Totali</h3>
          <p className="stat-number">{orders.length}</p>
        </div>
        <div className="stat-card">
          <h3>In Attesa</h3>
          <p className="stat-number">{orders.filter(o => o.status === 'pending').length}</p>
        </div>
        <div className="stat-card">
          <h3>In Preparazione</h3>
          <p className="stat-number">{orders.filter(o => o.status === 'preparing').length}</p>
        </div>
        <div className="stat-card">
          <h3>Completati</h3>
          <p className="stat-number">{orders.filter(o => o.status === 'completed').length}</p>
        </div>
        <div className="stat-card" style={{ 
          background: availableSeats < 30 ? 'rgba(255, 193, 7, 0.3)' : availableSeats === 0 ? 'rgba(220, 53, 69, 0.3)' : 'rgba(25, 135, 84, 0.3)',
          borderColor: availableSeats < 30 ? '#ffc107' : availableSeats === 0 ? '#dc3545' : '#198754'
        }}>
          <h3>🪑 Posti Prenotabili</h3>
          <p className="stat-number" style={{
            color: '#FFD700'
          }}>
            {availableSeats}/150
          </p>
        </div>
        <div className="stat-card" style={{ 
          background: (walkinSeats.total - walkinSeats.occupied) < 20 ? 'rgba(255, 193, 7, 0.3)' : (walkinSeats.total - walkinSeats.occupied) === 0 ? 'rgba(220, 53, 69, 0.3)' : 'rgba(13, 110, 253, 0.3)',
          borderColor: (walkinSeats.total - walkinSeats.occupied) < 20 ? '#ffc107' : (walkinSeats.total - walkinSeats.occupied) === 0 ? '#dc3545' : '#0d6efd'
        }}>
          <h3>🚶 Posti Walk-in</h3>
          <p className="stat-number" style={{
            color: '#FFD700'
          }}>
            {walkinSeats.total - walkinSeats.occupied}/{walkinSeats.total}
          </p>
        </div>
      </div>

      {/* VISTA LISTA ORDINI */}
      <div className="orders-section">
        <h2>📋 Gestione Ordini</h2>
        
        {/* Tab Ordini / Prenotazioni */}
        <div className="view-mode-tabs" style={{
          display: 'flex',
          gap: '15px',
          marginBottom: '20px',
          borderBottom: '2px solid rgba(255, 215, 0, 0.3)',
          paddingBottom: '10px'
        }}>
          <button
            onClick={() => {
              setViewMode('orders')
              setFilterStatus('all')
            }}
            style={{
              padding: '12px 24px',
              borderRadius: '8px 8px 0 0',
              border: viewMode === 'orders' ? '2px solid #FFD700' : '2px solid transparent',
              borderBottom: 'none',
              background: viewMode === 'orders' 
                ? 'linear-gradient(135deg, #8B0000, #CD5C5C)'
                : 'rgba(255, 255, 255, 0.05)',
              color: viewMode === 'orders' ? '#FFD700' : 'rgba(255, 255, 255, 0.7)',
              fontSize: '1rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.3s',
              marginBottom: '-2px'
            }}
          >
            🍽️ Ordini Immediati ({orders.filter(o => !o.sessionType || o.sessionType === 'immediate').length})
          </button>
          <button
            onClick={() => {
              setViewMode('reservations')
              setFilterStatus('all')
            }}
            style={{
              padding: '12px 24px',
              borderRadius: '8px 8px 0 0',
              border: viewMode === 'reservations' ? '2px solid #FFD700' : '2px solid transparent',
              borderBottom: 'none',
              background: viewMode === 'reservations'
                ? 'linear-gradient(135deg, #8B0000, #CD5C5C)'
                : 'rgba(255, 255, 255, 0.05)',
              color: viewMode === 'reservations' ? '#FFD700' : 'rgba(255, 255, 255, 0.7)',
              fontSize: '1rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.3s',
              marginBottom: '-2px'
            }}
          >
            📅 Prenotazioni ({orders.filter(o => o.sessionType && o.sessionType !== 'immediate').length})
          </button>
        </div>
        
        {/* Tab filtri status */}
        <div className="order-filters">
          <button 
            className={`filter-tab ${filterStatus === 'all' ? 'active' : ''}`}
            onClick={() => setFilterStatus('all')}
          >
            📋 Tutti ({orders.filter(o => {
              if (viewMode === 'orders') return !o.sessionType || o.sessionType === 'immediate'
              return o.sessionType && o.sessionType !== 'immediate'
            }).length})
          </button>
          <button 
            className={`filter-tab ${filterStatus === 'pending' ? 'active' : ''}`}
            onClick={() => setFilterStatus('pending')}
          >
            ⏳ In Attesa ({orders.filter(o => {
              const isCorrectView = viewMode === 'orders' 
                ? (!o.sessionType || o.sessionType === 'immediate')
                : (o.sessionType && o.sessionType !== 'immediate')
              return isCorrectView && o.status === 'pending'
            }).length})
          </button>
          <button 
            className={`filter-tab ${filterStatus === 'preparing' ? 'active' : ''}`}
            onClick={() => setFilterStatus('preparing')}
          >
            👨‍🍳 In Preparazione ({orders.filter(o => {
              const isCorrectView = viewMode === 'orders'
                ? (!o.sessionType || o.sessionType === 'immediate')
                : (o.sessionType && o.sessionType !== 'immediate')
              return isCorrectView && o.status === 'preparing'
            }).length})
          </button>
          <button 
            className={`filter-tab ${filterStatus === 'completed' ? 'active' : ''}`}
            onClick={() => setFilterStatus('completed')}
          >
            ✅ Completati ({orders.filter(o => {
              const isCorrectView = viewMode === 'orders'
                ? (!o.sessionType || o.sessionType === 'immediate')
                : (o.sessionType && o.sessionType !== 'immediate')
              return isCorrectView && o.status === 'completed'
            }).length})
          </button>
        </div>
        
        {orders.filter(o => {
          const isCorrectView = viewMode === 'orders'
            ? (!o.sessionType || o.sessionType === 'immediate')
            : (o.sessionType && o.sessionType !== 'immediate')
          return isCorrectView
        }).length === 0 ? (
          <p className="no-orders">
            {viewMode === 'orders' ? 'Nessun ordine immediato presente' : 'Nessuna prenotazione presente'}
          </p>
        ) : (
          <div className="orders-grid">
          {(() => {
            // Raggruppa gli ordini per personaggio per la visualizzazione
            const characterMap = new Map()
            orders
              .filter(order => {
                // Filtra per view mode
                const isCorrectView = viewMode === 'orders'
                  ? (!order.sessionType || order.sessionType === 'immediate')
                  : (order.sessionType && order.sessionType !== 'immediate')
                
                // Filtra per status
                const matchesStatus = filterStatus === 'all' || order.status === filterStatus
                
                return isCorrectView && matchesStatus
              })
              .forEach(order => {
                if (!characterMap.has(order.character)) {
                  characterMap.set(order.character, [])
                }
                characterMap.get(order.character).push(order)
              })
            
            return Array.from(characterMap.entries()).map(([character, arrivals]) => (
              <CharacterArrivalCard
                key={character}
                character={character}
                arrivals={arrivals}
                viewMode={viewMode}
                isReservationUnlocked={isReservationUnlocked}
                getSessionBadge={getSessionBadge}
                expandedCharacters={expandedCharacters}
                toggleCharacterExpansion={toggleCharacterExpansion}
                activeDropdown={activeDropdown}
                setActiveDropdown={setActiveDropdown}
                activeReservations={activeReservations}
                activeWalkinCharacters={activeWalkinCharacters}
                updateOrderStatus={updateOrderStatus}
                openEditModal={openEditModal}
                freeSeats={freeSeats}
                freeWalkinSeatsForCharacter={freeWalkinSeatsForCharacter}
                setWalkinModal={setWalkinModal}
                setPeopleModal={setPeopleModal}
                openDeleteModal={openDeleteModal}
                printOrder={printOrder}
                getStatusColor={getStatusColor}
                getStatusText={getStatusText}
              />
            ))
          })()}
        </div>
      )}
      </div>

      {/* Modale modifica ordine */}
      {editModal.show && (
        <EditOrderModal 
          order={editModal.order}
          onClose={closeEditModal}
          onSave={updateOrderItems}
          menuData={menuData}
        />
      )}

      {/* Modale modifica numero persone */}
      {peopleModal.show && (
        <div className="modal-overlay" onClick={() => setPeopleModal({ show: false, order: null, newNumber: 1 })}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>👥 Modifica Numero Persone</h2>
            </div>
            <div className="modal-body">
              <p>Ordine di: <strong>{peopleModal.order?.character}</strong></p>
              <p style={{ marginTop: '20px', marginBottom: '10px' }}>Numero attuale: <strong>{peopleModal.order?.num_people}</strong></p>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', justifyContent: 'center', margin: '20px 0' }}>
                <button 
                  className="modal-counter-btn"
                  onClick={() => setPeopleModal({ ...peopleModal, newNumber: Math.max(1, peopleModal.newNumber - 1) })}
                >
                  −
                </button>
                <span style={{ fontSize: '32px', fontWeight: 'bold', minWidth: '60px', textAlign: 'center', color: '#FFD700' }}>
                  {peopleModal.newNumber}
                </span>
                <button 
                  className="modal-counter-btn"
                  onClick={() => setPeopleModal({ ...peopleModal, newNumber: peopleModal.newNumber + 1 })}
                >
                  +
                </button>
              </div>

              <div style={{ marginTop: '20px', padding: '15px', background: '#f8f9fa', borderRadius: '8px' }}>
                <p style={{ margin: '5px 0' }}>Coperto: €1.50 × {peopleModal.newNumber} = <strong>€{(1.50 * peopleModal.newNumber).toFixed(2)}</strong></p>
                <p style={{ margin: '5px 0', fontSize: '14px', color: '#666' }}>
                  Nuovo totale: €{(() => {
                    const itemsTotal = peopleModal.order?.items.reduce((sum, item) => 
                      sum + (parseFloat(item.price) * item.quantity), 0
                    ) || 0
                    return (itemsTotal + (1.50 * peopleModal.newNumber)).toFixed(2)
                  })()}
                </p>
              </div>
            </div>
            <div className="modal-actions">
              <button 
                className="btn-modal-cancel" 
                onClick={() => setPeopleModal({ show: false, order: null, newNumber: 1 })}
              >
                Annulla
              </button>
              <button 
                className="btn-modal-delete" 
                onClick={() => updateNumPeople(peopleModal.order, peopleModal.newNumber)}
                style={{ background: '#1a4d2e' }}
              >
                💾 Salva
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modale liberazione posti */}
      {freeSeatsModal.show && (
        <div className="modal-overlay" onClick={() => setFreeSeatsModal({ show: false, characterName: '' })}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>🪑 Libera Posti</h2>
            </div>
            <div className="modal-body">
              <p>Confermi di voler liberare i posti prenotati da</p>
              <p className="modal-character">{freeSeatsModal.characterName}</p>
              <p style={{ marginTop: '15px', fontSize: '14px', color: '#666' }}>
                I posti torneranno disponibili per nuove prenotazioni
              </p>
            </div>
            <div className="modal-actions">
              <button 
                className="btn-modal-cancel" 
                onClick={() => setFreeSeatsModal({ show: false, characterName: '' })}
              >
                Annulla
              </button>
              <button 
                className="btn-modal-delete" 
                onClick={confirmFreeSeats}
                style={{ background: '#17a2b8', borderColor: '#17a2b8' }}
              >
                🪑 Libera Posti
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modale occupazione posti walk-in */}
      {walkinModal.show && (
        <div className="modal-overlay" onClick={() => setWalkinModal({ show: false, order: null, numSeats: 1 })}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>🚶 Occupa Posti Walk-in</h2>
            </div>
            <div className="modal-body">
              <p>Ordine di: <strong>{walkinModal.order?.character}</strong></p>
              
              <div style={{ marginTop: '20px' }}>
                <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold', color: '#FFD700', textAlign: 'center' }}>
                  Numero di posti da occupare:
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', justifyContent: 'center' }}>
                  <button 
                    onClick={() => setWalkinModal(prev => ({ 
                      ...prev, 
                      numSeats: Math.max(1, prev.numSeats - 1) 
                    }))}
                    className="modal-counter-btn"
                  >
                    −
                  </button>
                  <span style={{ 
                    fontSize: '24px', 
                    fontWeight: 'bold', 
                    minWidth: '60px', 
                    textAlign: 'center',
                    color: '#FFD700'
                  }}>
                    {walkinModal.numSeats}
                  </span>
                  <button 
                    onClick={() => setWalkinModal(prev => ({ 
                      ...prev, 
                      numSeats: Math.min(20, prev.numSeats + 1) 
                    }))}
                    className="modal-counter-btn"
                  >
                    +
                  </button>
                </div>
              </div>
              
              <div style={{ marginTop: '20px', padding: '15px', background: '#e7f1ff', borderRadius: '8px', border: '1px solid #0d6efd' }}>
                <p style={{ margin: '5px 0', fontSize: '14px' }}>
                  🪑 <strong>Posti Prenotabili disponibili:</strong> {availableSeats}/150
                </p>
                <p style={{ margin: '5px 0', fontSize: '14px' }}>
                  🚶 <strong>Posti Walk-in disponibili:</strong> {walkinSeats.total - walkinSeats.occupied}/{walkinSeats.total}
                </p>
              </div>

              <p style={{ marginTop: '15px', fontSize: '13px', color: '#666' }}>
                💡 <strong>Logica automatica:</strong><br/>
                Se ci sono posti nei 150 prenotabili → occupa quelli<br/>
                Altrimenti → occupa dai 100 walk-in
              </p>
            </div>
            <div className="modal-actions">
              <button 
                className="btn-modal-cancel" 
                onClick={() => setWalkinModal({ show: false, order: null, numSeats: 1 })}
              >
                Annulla
              </button>
              <button 
                className="btn-modal-delete" 
                onClick={confirmOccupyWalkin}
                style={{ background: '#0d6efd', borderColor: '#0d6efd' }}
              >
                🚶 Conferma Occupazione
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modale messaggio di successo/errore */}
      {successModal.show && (
        <div className="modal-overlay" onClick={() => setSuccessModal({ show: false, message: '' })}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-body" style={{ textAlign: 'center', padding: '30px' }}>
              <p style={{ fontSize: '18px', whiteSpace: 'pre-line', margin: '20px 0' }}>
                {successModal.message}
              </p>
            </div>
            <div className="modal-actions">
              <button 
                className="btn-modal-cancel" 
                onClick={() => setSuccessModal({ show: false, message: '' })}
                style={{ width: '100%' }}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteModal.show && (
        <div className="modal-overlay" onClick={closeDeleteModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>🗑️ Elimina Ordine</h2>
            </div>
            <div className="modal-body">
              <p>Sei sicuro di voler eliminare l'ordine di</p>
              <p className="modal-character">{deleteModal.characterName}</p>
              <p className="modal-warning">⚠️ Questa azione non può essere annullata</p>
            </div>
            <div className="modal-actions">
              <button className="btn-modal-cancel" onClick={closeDeleteModal}>
                Annulla
              </button>
              <button 
                className="btn-modal-delete" 
                onClick={() => deleteOrder(deleteModal.order)}
              >
                Elimina Ordine
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Componente modale modifica ordine
function EditOrderModal({ order, onClose, onSave, menuData }) {
  const [items, setItems] = useState(order.items)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [showAddItems, setShowAddItems] = useState(false)

  const updateQuantity = (index, newQuantity) => {
    if (newQuantity <= 0) {
      setItems(items.filter((_, i) => i !== index))
    } else {
      const newItems = [...items]
      newItems[index].quantity = newQuantity
      setItems(newItems)
    }
  }

  const addItem = (menuItem) => {
    const existingIndex = items.findIndex(item => item.id === menuItem.id)
    if (existingIndex >= 0) {
      const newItems = [...items]
      newItems[existingIndex].quantity += 1
      setItems(newItems)
    } else {
      setItems([...items, { ...menuItem, quantity: 1 }])
    }
  }

  const calculateTotal = () => {
    const COPERTO = 1.50
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    const copertoTotal = COPERTO * (order.num_people || 1)
    return subtotal + copertoTotal
  }

  const handleSave = () => {
    if (items.length === 0) {
      alert('L\'ordine deve contenere almeno un prodotto')
      return
    }
    onSave(order.id, items, calculateTotal())
  }

  const categories = [
    { id: 'antipasti', name: 'Antipasti', icon: '👨‍🍳' },
    { id: 'primi', name: 'Primi', icon: '👑' },
    { id: 'secondi', name: 'Secondi', icon: '🧚' },
    { id: 'contorni', name: 'Contorni', icon: '🧚‍♀️' },
    { id: 'panini', name: 'Panini', icon: '🎅' },
    { id: 'streetfood', name: 'Street Food', icon: '⛄' },
    { id: 'dolci', name: 'Dolci', icon: '🦄' },
    { id: 'golosoni', name: 'Golosoni', icon: '🧁' },
    { id: 'bevande', name: 'Bevande', icon: '🍾' }
  ]

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content edit-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>📝 Modifica Ordine - {order.character}</h2>
          <button className="close-modal-btn" onClick={onClose}>✕</button>
        </div>
        
        <div className="modal-body edit-modal-body">
          <div className="order-info-summary">
            <p><strong>Email:</strong> {order.email}</p>
            <p><strong>Tipo:</strong> {order.orderType === 'immediate' ? '🍽️ Immediato' : '🪑 Con Prenotazione'}</p>
            <p><strong>Data:</strong> {new Date(order.timestamp).toLocaleString('it-IT')}</p>
          </div>

          <div className="edit-items-section">
            <h3>Prodotti nell'ordine</h3>
            {items.length === 0 ? (
              <p className="no-items">Nessun prodotto nell'ordine</p>
            ) : (
              <div className="edit-items-list">
                {items.map((item, index) => (
                  <div key={index} className="edit-item">
                    <div className="edit-item-info">
                      <strong>{item.name}</strong>
                      <span className="edit-item-price">€{item.price.toFixed(2)}</span>
                    </div>
                    <div className="edit-item-controls">
                      <button 
                        className="qty-btn"
                        onClick={() => updateQuantity(index, item.quantity - 1)}
                      >
                        −
                      </button>
                      <span className="qty-display">{item.quantity}</span>
                      <button 
                        className="qty-btn"
                        onClick={() => updateQuantity(index, item.quantity + 1)}
                      >
                        +
                      </button>
                      <button 
                        className="remove-item-btn"
                        onClick={() => updateQuantity(index, 0)}
                      >
                        🗑️
                      </button>
                    </div>
                    <div className="edit-item-total">
                      €{(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="add-items-section">
            {!showAddItems ? (
              <button 
                className="btn-add-items"
                onClick={() => setShowAddItems(true)}
              >
                ➕ Aggiungi Prodotti
              </button>
            ) : (
              <div className="add-items-panel">
                <div className="categories-selector">
                  {categories.map(cat => (
                    <button
                      key={cat.id}
                      className={`category-btn ${selectedCategory === cat.id ? 'active' : ''}`}
                      onClick={() => setSelectedCategory(cat.id)}
                    >
                      {cat.icon} {cat.name}
                    </button>
                  ))}
                </div>

                {selectedCategory && (
                  <div className="menu-items-list">
                    {menuData[selectedCategory].map(menuItem => (
                      <div key={menuItem.id} className="menu-item-add">
                        <div className="menu-item-add-info">
                          <strong>{menuItem.name}</strong>
                          <span>€{menuItem.price.toFixed(2)}</span>
                        </div>
                        <button 
                          className="btn-add-to-order"
                          onClick={() => addItem(menuItem)}
                        >
                          + Aggiungi
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <button 
                  className="btn-close-add-items"
                  onClick={() => {
                    setShowAddItems(false)
                    setSelectedCategory(null)
                  }}
                >
                  Chiudi
                </button>
              </div>
            )}
          </div>

          <div className="edit-total">
            <div className="edit-total-row">
              <span>Subtotale:</span>
              <span>€{items.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)}</span>
            </div>
            <div className="edit-total-row">
              <span>Coperto ({order.num_people || 1} {(order.num_people || 1) === 1 ? 'persona' : 'persone'}):</span>
              <span>€{(1.50 * (order.num_people || 1)).toFixed(2)}</span>
            </div>
            <div className="edit-total-row total">
              <strong>Totale:</strong>
              <strong>€{calculateTotal().toFixed(2)}</strong>
            </div>
          </div>
        </div>

        <div className="modal-actions">
          <button className="btn-modal-cancel" onClick={onClose}>
            Annulla
          </button>
          <button 
            className="btn-modal-save" 
            onClick={handleSave}
          >
            💾 Salva Modifiche
          </button>
        </div>
      </div>
    </div>
  )
}

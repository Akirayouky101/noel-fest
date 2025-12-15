import { useState, useEffect, useRef } from 'react'
import toast, { Toaster } from 'react-hot-toast'
import { 
  Clock, Users, Package, TrendingUp, RefreshCw, 
  Volume2, VolumeX, Trash2, Search,
  Filter, Download, Calendar, X, BarChart3, LayoutGrid, LogOut,
  ChevronDown, AlertTriangle, Armchair, CalendarDays
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import { 
  getAllOrders, 
  updateOrderStatus,
  deleteMultipleOrders 
} from '../lib/supabaseAPI'
import AnalyticsDashboard from '../components/AnalyticsDashboard'
import SeatsManager from '../components/SeatsManager'
import OrderDetailsModal from '../components/OrderDetailsModal'
import './Admin-Kanban-Professional.css'

export default function AdminKanban({ user, onLogout }) {
  const [orders, setOrders] = useState([]) // Ordini VISIBILI (filtrati per orario)
  const [allOrders, setAllOrders] = useState([]) // TUTTI gli ordini (anche futuri)
  const [filteredOrders, setFilteredOrders] = useState([])
  const [reservations, setReservations] = useState([])
  const [loading, setLoading] = useState(true)
  const [audioEnabled, setAudioEnabled] = useState(true)
  const [activeTab, setActiveTab] = useState('kanban') // 'kanban', 'analytics', 'reservations'
  const [showSeatsManager, setShowSeatsManager] = useState(false)
  const [selectedCharacter, setSelectedCharacter] = useState(null)
  const [selectedOrders, setSelectedOrders] = useState([])
  const audioRef = useRef(null)
  
  // Filtri
  const [searchTerm, setSearchTerm] = useState('')
  const [sessionFilter, setSessionFilter] = useState('all') // all, immediate, lunch, dinner
  const [dateFilter, setDateFilter] = useState('all') // all, today, yesterday, week
  const [showFilters, setShowFilters] = useState(false)

  // Stats
  const [stats, setStats] = useState({
    pending: 0,
    preparing: 0,
    completed: 0,
    total: 0,
    revenue: 0
  })

  // Load orders on mount
  useEffect(() => {
    loadOrders()
    loadReservations()
    const cleanup = setupRealtimeSubscription()
    
    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
    
    // Auto-refresh orders every hour to show scheduled orders at the right time
    const refreshInterval = setInterval(() => {
      console.log('⏰ Auto-refresh: ricarico ordini programmati')
      loadOrders()
    }, 60 * 60 * 1000) // Every hour
    
    // Cleanup on unmount
    return () => {
      if (cleanup) cleanup()
      clearInterval(refreshInterval)
    }
  }, [])

  // Calculate stats whenever orders change
  useEffect(() => {
    calculateStats()
  }, [orders])

  // Apply filters
  useEffect(() => {
    applyFilters()
  }, [orders, searchTerm, sessionFilter, dateFilter])

  // Debug: monitor modal state
  useEffect(() => {
    console.log('🎯 Modal state changed:', {
      selectedCharacter,
      selectedOrdersCount: selectedOrders.length,
      shouldShowModal: !!(selectedCharacter && selectedOrders.length > 0)
    })
  }, [selectedCharacter, selectedOrders])

  // Apply filters
  const applyFilters = () => {
    let filtered = [...orders]

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(order =>
        order.characterName.toLowerCase().includes(term) ||
        order.email.toLowerCase().includes(term)
      )
    }

    // Session type filter
    if (sessionFilter !== 'all') {
      filtered = filtered.filter(order => order.sessionType === sessionFilter)
    }

    // Date filter
    if (dateFilter !== 'all') {
      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      
      filtered = filtered.filter(order => {
        const orderDate = new Date(order.timestamp)
        const orderDay = new Date(orderDate.getFullYear(), orderDate.getMonth(), orderDate.getDate())
        
        if (dateFilter === 'today') {
          return orderDay.getTime() === today.getTime()
        } else if (dateFilter === 'yesterday') {
          const yesterday = new Date(today)
          yesterday.setDate(yesterday.getDate() - 1)
          return orderDay.getTime() === yesterday.getTime()
        } else if (dateFilter === 'week') {
          const weekAgo = new Date(today)
          weekAgo.setDate(weekAgo.getDate() - 7)
          return orderDate >= weekAgo
        }
        return true
      })
    }

    setFilteredOrders(filtered)
  }

  // Load orders from Supabase
  const loadOrders = async () => {
    try {
      setLoading(true)
      const data = await getAllOrders()
      
      // Salva TUTTI gli ordini (anche quelli non ancora visibili)
      const allActiveOrders = data.filter(order => order.status !== 'cancelled')
      setAllOrders(allActiveOrders)
      
      // Filter out cancelled orders and orders not yet ready to be shown
      const visibleOrders = allActiveOrders.filter(order => {
        // Ordini immediati sono sempre visibili
        if (order.sessionType === 'immediate') return true
        
        // Ordini con prenotazione: controllare data e ora
        if (order.sessionType === 'lunch' || order.sessionType === 'dinner') {
          return shouldShowScheduledOrder(order)
        }
        
        return true
      })
      
      setOrders(visibleOrders)
      
      toast.success(`${visibleOrders.length} ordini caricati${allActiveOrders.length > visibleOrders.length ? ` (${allActiveOrders.length - visibleOrders.length} programmati per dopo)` : ''}`)
    } catch (error) {
      console.error('Errore caricamento ordini:', error)
      toast.error('Errore nel caricamento degli ordini')
    } finally {
      setLoading(false)
    }
  }

  // Check if a scheduled order should be shown based on date and time
  const shouldShowScheduledOrder = (order) => {
    const now = new Date()
    
    // Se non ha data di sessione, mostralo sempre
    if (!order.sessionDate) return true
    
    // Parse la data dell'ordine (formato: "YYYY-MM-DD")
    const [year, month, day] = order.sessionDate.split('-').map(Number)
    const orderDate = new Date(year, month - 1, day)
    
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const orderDay = new Date(orderDate.getFullYear(), orderDate.getMonth(), orderDate.getDate())
    
    // Se l'ordine è per un giorno futuro, non mostrarlo
    if (orderDay > today) return false
    
    // Se l'ordine è per oggi, controllare l'orario
    if (orderDay.getTime() === today.getTime()) {
      const currentHour = now.getHours()
      const currentMinutes = now.getMinutes()
      const currentTimeInMinutes = currentHour * 60 + currentMinutes
      
      if (order.sessionType === 'lunch') {
        // Pranzo: mostrare dalle 11:00
        const lunchStartTime = 11 * 60 // 11:00
        return currentTimeInMinutes >= lunchStartTime
      } else if (order.sessionType === 'dinner') {
        // Cena: mostrare dalle 18:00
        const dinnerStartTime = 18 * 60 // 18:00
        return currentTimeInMinutes >= dinnerStartTime
      }
    }
    
    // Se l'ordine è per un giorno passato, mostralo (per storico)
    if (orderDay < today) return true
    
    return true
  }

  // Load reservations from Supabase
  const loadReservations = async () => {
    try {
      const { data, error } = await supabase
        .from('active_reservations')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      setReservations(data || [])
    } catch (error) {
      console.error('Errore caricamento prenotazioni:', error)
    }
  }

  // Setup real-time subscription
  const setupRealtimeSubscription = () => {
    console.log('📡 Setting up real-time subscription...')
    
    const channel = supabase
      .channel('orders-changes-v2', {
        config: {
          broadcast: { self: true },
          presence: { key: 'admin' }
        }
      })
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders'
        },
        (payload) => {
          console.log('🔥 Real-time update received:', payload.eventType, payload)
          
          if (payload.eventType === 'INSERT') {
            // New order
            const newOrder = transformOrder(payload.new)
            console.log('✅ Adding new order to state:', newOrder.characterName)
            
            // Aggiungi sempre a allOrders
            if (newOrder.status !== 'cancelled') {
              setAllOrders(prev => {
                if (prev.some(o => o.id === newOrder.id)) return prev
                return [newOrder, ...prev]
              })
            }
            
            // Controllare se l'ordine deve essere mostrato
            if (newOrder.status === 'cancelled') return
            if ((newOrder.sessionType === 'lunch' || newOrder.sessionType === 'dinner') 
                && !shouldShowScheduledOrder(newOrder)) {
              console.log('⏰ Ordine programmato per dopo, salvato ma non mostrato ora')
              return
            }
            
            setOrders(prev => {
              // Check if already exists (prevent duplicates)
              if (prev.some(o => o.id === newOrder.id)) {
                console.log('⚠️ Order already exists, skipping')
                return prev
              }
              return [newOrder, ...prev]
            })
            
            toast.success(`🎄 Nuovo ordine da ${newOrder.characterName}!`, {
              duration: 5000,
              icon: '🔔'
            })
            
            // Play notification sound
            if (audioEnabled && audioRef.current) {
              audioRef.current.play().catch(err => console.log('Audio play error:', err))
            }
            
            // Browser notification
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification('🎄 Nuovo Ordine - Noel Fest', {
                body: `${newOrder.characterName} - ${newOrder.numPeople} persone\nTotale: €${newOrder.total.toFixed(2)}`,
                icon: '/favicon.svg',
                badge: '/favicon.svg',
                tag: 'new-order',
                requireInteraction: true
              })
            }
          } else if (payload.eventType === 'UPDATE') {
            // Order updated
            const updatedOrder = transformOrder(payload.new)
            console.log('♻️ Updating order in state:', updatedOrder.characterName)
            
            // Aggiorna in allOrders
            setAllOrders(prev => 
              prev.map(order => order.id === updatedOrder.id ? updatedOrder : order)
            )
            
            // Aggiorna in orders (visibili)
            setOrders(prev => {
              const updated = prev.map(order => 
                order.id === updatedOrder.id ? updatedOrder : order
              )
              return updated
            })
            
            toast(`📝 Ordine ${updatedOrder.characterName} aggiornato`, {
              icon: '♻️'
            })
          } else if (payload.eventType === 'DELETE') {
            // Order deleted
            console.log('🗑️ Removing order from state:', payload.old.id)
            
            // Rimuovi da allOrders
            setAllOrders(prev => prev.filter(order => order.id !== payload.old.id))
            
            // Rimuovi da orders (visibili)
            setOrders(prev => prev.filter(order => order.id !== payload.old.id))
            
            toast('🗑️ Ordine eliminato', {
              icon: '✅'
            })
          }
        }
      )
      .subscribe((status) => {
        console.log('📡 Subscription status:', status)
        
        if (status === 'SUBSCRIBED') {
          console.log('✅ Real-time subscription ACTIVE')
          toast.success('🔴 LIVE - Aggiornamenti automatici attivi', {
            duration: 3000,
            icon: '📡'
          })
        } else if (status === 'CLOSED') {
          console.warn('⚠️ Real-time subscription CLOSED')
          toast.error('Real-time disconnesso - Ricarica la pagina', {
            duration: 5000
          })
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ Real-time subscription ERROR')
          toast.error('Errore real-time - Verifica connessione', {
            duration: 5000
          })
        }
      })

    return channel
  }

  // Transform order from Supabase format
  const transformOrder = (dbOrder) => ({
    id: dbOrder.id,
    characterName: dbOrder.character_name,
    email: dbOrder.email,
    numPeople: dbOrder.num_people,
    orderType: dbOrder.order_type,
    sessionType: dbOrder.session_type,
    sessionDate: dbOrder.session_date,
    sessionTime: dbOrder.session_time,
    items: dbOrder.items,
    notes: dbOrder.notes,
    total: parseFloat(dbOrder.total),
    status: dbOrder.status,
    timestamp: dbOrder.timestamp,
    arrivalGroupId: dbOrder.arrival_group_id
  })

  // Calculate stats
  const calculateStats = () => {
    const pending = filteredOrders.filter(o => o.status === 'pending').length
    const preparing = filteredOrders.filter(o => o.status === 'preparing').length
    const completed = filteredOrders.filter(o => o.status === 'completed').length
    const revenue = filteredOrders
      .filter(o => o.status === 'completed')
      .reduce((sum, o) => sum + o.total, 0)

    setStats({
      pending,
      preparing,
      completed,
      total: filteredOrders.length,
      revenue
    })
  }

  // Count scheduled orders not yet shown
  const getScheduledOrdersCount = () => {
    // This would require querying all orders including future ones
    // For now, we'll show a generic message
    return 0
  }

  // Handle status change
  const handleStatusChange = async (orderId, newStatus) => {
    try {
      // Optimistic update
      setOrders(prev =>
        prev.map(order =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      )

      // Update in database
      await updateOrderStatus(orderId, newStatus)
      
      toast.success(`✅ Stato aggiornato: ${getStatusLabel(newStatus)}`)
    } catch (error) {
      console.error('Errore aggiornamento stato:', error)
      toast.error('Errore nell\'aggiornamento dello stato')
      
      // Revert optimistic update
      loadOrders()
    }
  }

  // Get orders by status
  const getOrdersByStatus = (status) => {
    return filteredOrders.filter(order => order.status === status)
  }

  // Export to CSV
  const exportToCSV = () => {
    const headers = ['ID', 'Character', 'Email', 'Persone', 'Tipo', 'Sessione', 'Articoli', 'Note', 'Totale', 'Status', 'Data']
    
    const rows = filteredOrders.map(order => [
      order.id,
      order.characterName,
      order.email,
      order.numPeople,
      order.orderType,
      order.sessionType,
      order.items.map(i => `${i.name} x${i.quantity}`).join('; '),
      order.notes || '',
      order.total.toFixed(2),
      order.status,
      new Date(order.timestamp).toLocaleString('it-IT')
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `ordini_noel_fest_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    
    toast.success('CSV esportato con successo!')
  }

  // Clear filters
  const clearFilters = () => {
    setSearchTerm('')
    setSessionFilter('all')
    setDateFilter('all')
    toast.success('Filtri azzerati')
  }

  // Delete order (now handled by modal in OrderCard)
  const handleDeleteOrder = async (orderId) => {
    try {
      console.log('🗑️ Deleting order:', orderId)
      
      const result = await deleteMultipleOrders([orderId])
      
      // Update local state - rimuovi da entrambi gli stati
      setAllOrders(prev => prev.filter(order => order.id !== orderId))
      setOrders(prev => prev.filter(order => order.id !== orderId))
      
      // Show success with freed seats info
      if (result && result.freedSeats > 0) {
        toast.success(`✅ Ordine eliminato e ${result.freedSeats} posti liberati`, {
          duration: 4000,
          icon: '🎉'
        })
      } else {
        toast.success('✅ Ordine eliminato', {
          icon: '🗑️'
        })
      }
      
    } catch (error) {
      console.error('Errore eliminazione:', error)
      toast.error('❌ Errore nell\'eliminazione dell\'ordine', {
        duration: 5000
      })
    }
  }

  // Handle card click - open modal with all orders from same character
  const handleCardClick = (clickedOrder) => {
    const characterOrders = orders.filter(
      order => order.characterName === clickedOrder.characterName
    )
    setSelectedCharacter(clickedOrder.characterName)
    setSelectedOrders(characterOrders)
  }

  // Close modal
  const closeModal = () => {
    setSelectedCharacter(null)
    setSelectedOrders([])
  }

  // Status helpers
  const getStatusLabel = (status) => {
    const labels = {
      pending: 'In Attesa',
      preparing: 'In Preparazione',
      completed: 'Completato'
    }
    return labels[status] || status
  }

  const getStatusIcon = (status) => {
    const icons = {
      pending: '⏳',
      preparing: '👨‍🍳',
      completed: '✅'
    }
    return icons[status] || '📦'
  }

  // Toggle audio
  const toggleAudio = () => {
    setAudioEnabled(!audioEnabled)
    toast.success(audioEnabled ? 'Audio disabilitato' : 'Audio abilitato', {
      icon: audioEnabled ? '🔇' : '🔊'
    })
  }

  // Handle logout
  const handleLogout = async () => {
    if (!confirm('Sei sicuro di voler uscire?')) return
    
    try {
      await supabase.auth.signOut()
      toast.success('Logout effettuato')
      if (onLogout) onLogout()
    } catch (error) {
      console.error('Logout error:', error)
      toast.error('Errore durante il logout')
    }
  }

  if (loading) {
    return (
      <div className="admin-page">
        <div className="loading-spinner">
          <div className="spinner"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-page">
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: '#1e293b',
            color: '#fff',
            border: '1px solid rgba(255, 215, 0, 0.3)'
          }
        }}
      />

      {/* Hidden audio for notifications */}
      <audio ref={audioRef} src="/notification.mp3" preload="auto" />

      <div className="admin-container">
        {/* Header con Stats */}
        <div className="admin-header">
          <div className="admin-title">
            <h1>
              <span className="icon">🎄</span>
              Dashboard Ordini - Noel Fest 2025
            </h1>
            
            <div className="header-actions">
              {user && (
                <div className="user-info">
                  <span className="user-email">{user.email}</span>
                </div>
              )}
              
              <button 
                className={`audio-toggle ${audioEnabled ? 'active' : ''}`}
                onClick={toggleAudio}
                title={audioEnabled ? 'Disabilita audio' : 'Abilita audio'}
              >
                {audioEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
              </button>
              
              <button 
                className="refresh-btn"
                onClick={loadOrders}
                title="Ricarica ordini (gli ordini programmati appaiono all'orario giusto)"
              >
                <RefreshCw size={20} />
                <span>Aggiorna</span>
              </button>
              
              <button 
                className="seats-btn"
                onClick={() => setShowSeatsManager(true)}
                title="Gestione Posti"
              >
                <Armchair size={20} />
                <span>Posti</span>
              </button>
              
              <button 
                className="logout-btn"
                onClick={handleLogout}
                title="Esci"
              >
                <LogOut size={20} />
                <span>Esci</span>
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="tabs-navigation">
            <button
              className={`tab-btn ${activeTab === 'kanban' ? 'active' : ''}`}
              onClick={() => setActiveTab('kanban')}
            >
              <LayoutGrid size={18} />
              <span>Kanban Board</span>
            </button>
            <button
              className={`tab-btn ${activeTab === 'reservations' ? 'active' : ''}`}
              onClick={() => setActiveTab('reservations')}
            >
              <CalendarDays size={18} />
              <span>Prenotazioni</span>
            </button>
            <button
              className={`tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
              onClick={() => setActiveTab('analytics')}
            >
              <BarChart3 size={18} />
              <span>Analytics</span>
            </button>
          </div>

          {/* Stats Bar */}
          <div className="stats-bar">
            <div className="stat-card pending">
              <div className="stat-card-content">
                <h3>⏳ In Attesa</h3>
                <p className="stat-value">
                  {stats.pending}
                  {stats.pending > 5 && <span className="stat-badge">!</span>}
                </p>
              </div>
            </div>

            <div className="stat-card preparing">
              <div className="stat-card-content">
                <h3>👨‍🍳 In Preparazione</h3>
                <p className="stat-value">{stats.preparing}</p>
              </div>
            </div>

            <div className="stat-card completed">
              <div className="stat-card-content">
                <h3>✅ Completati</h3>
                <p className="stat-value">{stats.completed}</p>
              </div>
            </div>

            <div className="stat-card total">
              <div className="stat-card-content">
                <h3>📦 Totale</h3>
                <p className="stat-value">{stats.total}</p>
              </div>
            </div>

            <div className="stat-card revenue">
              <div className="stat-card-content">
                <h3>💰 Incasso</h3>
                <p className="stat-value">€{stats.revenue.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filtri e Ricerca */}
        <div className="filters-section">
          <div className="filters-header">
            <button 
              className="filters-toggle"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter size={18} />
              <span>Filtri {showFilters ? '▲' : '▼'}</span>
              {(searchTerm || sessionFilter !== 'all' || dateFilter !== 'all') && (
                <span className="filters-active-badge">{
                  [searchTerm, sessionFilter !== 'all', dateFilter !== 'all'].filter(Boolean).length
                }</span>
              )}
            </button>

            <button 
              className="export-btn"
              onClick={exportToCSV}
              title="Esporta in CSV"
            >
              <Download size={18} />
              <span>Esporta CSV</span>
            </button>
          </div>

          {showFilters && (
            <div className="filters-content">
              {/* Search */}
              <div className="filter-group">
                <label>
                  <Search size={16} />
                  Cerca Character
                </label>
                <input
                  type="text"
                  placeholder="Nome character o email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="filter-input"
                />
              </div>

              {/* Session Type */}
              <div className="filter-group">
                <label>
                  <Package size={16} />
                  Tipo Sessione
                </label>
                <select
                  value={sessionFilter}
                  onChange={(e) => setSessionFilter(e.target.value)}
                  className="filter-select"
                >
                  <option value="all">Tutte</option>
                  <option value="immediate">⚡ Immediato</option>
                  <option value="lunch">🌞 Pranzo</option>
                  <option value="dinner">🌙 Cena</option>
                </select>
              </div>

              {/* Date Range */}
              <div className="filter-group">
                <label>
                  <Calendar size={16} />
                  Periodo
                </label>
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="filter-select"
                >
                  <option value="all">Tutto</option>
                  <option value="today">Oggi</option>
                  <option value="yesterday">Ieri</option>
                  <option value="week">Ultima settimana</option>
                </select>
              </div>

              {/* Clear Filters */}
              {(searchTerm || sessionFilter !== 'all' || dateFilter !== 'all') && (
                <button 
                  className="clear-filters-btn"
                  onClick={clearFilters}
                >
                  <X size={16} />
                  Azzera filtri
                </button>
              )}
            </div>
          )}
        </div>

        {/* Content Rendering */}
        {activeTab === 'kanban' ? (
          /* Kanban Board - SENZA DRAG AND DROP */
          <div className="kanban-board">
            {/* Colonna Pending */}
            <KanbanColumn
              status="pending"
              title="In Attesa"
              icon="⏳"
              orders={getOrdersByStatus('pending')}
              onDelete={handleDeleteOrder}
              onCardClick={handleCardClick}
              onStatusChange={handleStatusChange}
            />

            {/* Colonna Preparing */}
            <KanbanColumn
              status="preparing"
              title="In Preparazione"
              icon="👨‍🍳"
              orders={getOrdersByStatus('preparing')}
              onDelete={handleDeleteOrder}
              onCardClick={handleCardClick}
              onStatusChange={handleStatusChange}
            />

            {/* Colonna Completed */}
            <KanbanColumn
              status="completed"
              title="Completati"
              icon="✅"
              orders={getOrdersByStatus('completed')}
              onDelete={handleDeleteOrder}
              onCardClick={handleCardClick}
              onStatusChange={handleStatusChange}
            />
          </div>
        ) : activeTab === 'reservations' ? (
          /* Reservations View */
          <ReservationsView 
            reservations={reservations} 
            onRefresh={loadReservations}
            onReservationClick={(characterName) => {
              console.log('🔍 Click su prenotazione:', characterName)
              console.log('📦 allOrders disponibili:', allOrders.length)
              
              // Cerco tra TUTTI gli ordini (anche quelli programmati non ancora visibili)
              const characterOrders = allOrders.filter(
                order => order.characterName === characterName
              )
              
              console.log('📋 Ordini trovati per', characterName, ':', characterOrders.length)
              
              if (characterOrders.length > 0) {
                console.log('✅ Apro modale con ordini:', characterOrders)
                setSelectedCharacter(characterName)
                setSelectedOrders(characterOrders)
              } else {
                console.log('⚠️ Nessun ordine trovato')
                toast.info(`Nessun ordine trovato per ${characterName}`)
              }
            }}
          />
        ) : (
          /* Analytics Dashboard */
          <AnalyticsDashboard orders={filteredOrders} />
        )}
      </div>

      {/* Seats Manager Modal */}
      <SeatsManager 
        isOpen={showSeatsManager} 
        onClose={() => setShowSeatsManager(false)} 
      />

      {/* Order Details Modal */}
      {selectedCharacter && selectedOrders.length > 0 && (
        <OrderDetailsModal
          characterName={selectedCharacter}
          orders={selectedOrders}
          onClose={closeModal}
        />
      )}
    </div>
  )
}

// Kanban Column Component - SENZA DRAG AND DROP
function KanbanColumn({ status, title, icon, orders, onDelete, onCardClick, onStatusChange }) {
  return (
    <div className={`kanban-column ${status}`}>
      <div className="column-header">
        <div className="column-title">
          <span className="column-icon">{icon}</span>
          {title}
        </div>
        <span className="column-count">{orders.length}</span>
      </div>

      <div className="column-content">
        {orders.length === 0 ? (
          <div className="column-empty">
            <span className="icon">{icon}</span>
            <p>Nessun ordine</p>
          </div>
        ) : (
          orders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onDelete={onDelete}
              onClick={onCardClick}
              onStatusChange={onStatusChange}
            />
          ))
        )}
      </div>
    </div>
  )
}

// Order Card Component - CON MENU STATUS
function OrderCard({ order, onDelete, onClick, onStatusChange }) {
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showStatusMenu, setShowStatusMenu] = useState(false)

  const handleDelete = () => {
    setShowDeleteModal(false)
    onDelete(order.id)
  }

  const handleStatusChange = (newStatus) => {
    setShowStatusMenu(false)
    onStatusChange(order.id, newStatus)
  }

  return (
    <>
      <div
        className="order-card"
        onClick={(e) => {
          if (!e.target.closest('.card-action-btn') && !e.target.closest('.status-menu')) {
            onClick(order)
          }
        }}
      >
        <div className="card-header">
          <div className="card-character">
            🎅 {order.characterName}
          </div>
          <div className="card-actions">
            <button
              className="card-action-btn status-change"
              onClick={(e) => {
                e.stopPropagation()
                setShowStatusMenu(!showStatusMenu)
              }}
              title="Cambia stato"
            >
              <ChevronDown size={16} />
            </button>
            <button
              className="card-action-btn delete"
              onClick={(e) => {
                e.stopPropagation()
                setShowDeleteModal(true)
              }}
              title="Elimina ordine"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        {showStatusMenu && (
          <div className="status-menu">
            <button
              className="status-option pending"
              onClick={() => handleStatusChange('pending')}
              disabled={order.status === 'pending'}
            >
              ⏳ In Attesa
            </button>
            <button
              className="status-option preparing"
              onClick={() => handleStatusChange('preparing')}
              disabled={order.status === 'preparing'}
            >
              👨‍🍳 In Preparazione
            </button>
            <button
              className="status-option completed"
              onClick={() => handleStatusChange('completed')}
              disabled={order.status === 'completed'}
            >
              ✅ Completato
            </button>
          </div>
        )}

        <div className="card-quick-info">
          <span className="quick-total">€{order.total.toFixed(2)}</span>
          <span className="quick-items">{order.items.length} art.</span>
          <span className="quick-people">{order.numPeople} pers.</span>
          
          {(order.sessionType === 'lunch' || order.sessionType === 'dinner') && (
            <span className="reservation-badge" title="Ha una prenotazione">
              📅
            </span>
          )}
        </div>
      </div>

      {showDeleteModal && (
        <div className="delete-modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="delete-modal" onClick={(e) => e.stopPropagation()}>
            <div className="delete-modal-header">
              <AlertTriangle size={48} className="warning-icon" />
              <h2>Conferma Eliminazione</h2>
            </div>
            
            <div className="delete-modal-body">
              <p className="warning-text">Stai per eliminare l'ordine di:</p>
              <div className="delete-order-info">
                <div className="delete-character">🎅 {order.characterName}</div>
                <div className="delete-details">
                  <span>Totale: €{order.total.toFixed(2)}</span>
                  <span>{order.items.length} articoli</span>
                  <span>{order.numPeople} persone</span>
                </div>
              </div>
              <p className="warning-note">⚠️ Questa azione non può essere annullata!</p>
            </div>

            <div className="delete-modal-footer">
              <button 
                className="modal-btn cancel"
                onClick={() => setShowDeleteModal(false)}
              >
                Annulla
              </button>
              <button 
                className="modal-btn confirm"
                onClick={handleDelete}
              >
                <Trash2 size={16} />
                Elimina Ordine
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// Reservations View Component
function ReservationsView({ reservations, onRefresh, onReservationClick }) {
  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="reservations-view">
      <div className="reservations-header">
        <h2>
          <CalendarDays size={24} />
          Prenotazioni Attive
        </h2>
        <button className="refresh-btn-small" onClick={onRefresh}>
          <RefreshCw size={18} />
          Aggiorna
        </button>
      </div>

      {reservations.length === 0 ? (
        <div className="empty-reservations">
          <CalendarDays size={64} />
          <p>Nessuna prenotazione attiva</p>
        </div>
      ) : (
        <div className="reservations-grid">
          {reservations.map((reservation) => (
            <div 
              key={reservation.id} 
              className="reservation-card clickable"
              onClick={() => onReservationClick(reservation.character_name)}
            >
              <div className="reservation-character">
                🎅 {reservation.character_name}
              </div>
              <div className="reservation-details">
                <div className="reservation-info">
                  <Users size={18} />
                  <span>{reservation.num_people} {reservation.num_people === 1 ? 'persona' : 'persone'}</span>
                </div>
                <div className="reservation-info">
                  <Clock size={18} />
                  <span>{formatDate(reservation.created_at)}</span>
                </div>
              </div>
              <div className="reservation-hint">
                👆 Clicca per vedere gli ordini
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

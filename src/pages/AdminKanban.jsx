import { useState, useEffect, useRef } from 'react'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import toast, { Toaster } from 'react-hot-toast'
import { 
  Clock, Users, Package, TrendingUp, RefreshCw, 
  Volume2, VolumeX, Edit, Trash2, Info 
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import { 
  getAllOrders, 
  updateMultipleOrdersStatus,
  deleteMultipleOrders 
} from '../lib/supabaseAPI'
import './Admin-Kanban.css'

export default function AdminKanban() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [audioEnabled, setAudioEnabled] = useState(true)
  const audioRef = useRef(null)

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
    setupRealtimeSubscription()
  }, [])

  // Calculate stats whenever orders change
  useEffect(() => {
    calculateStats()
  }, [orders])

  // Load orders from Supabase
  const loadOrders = async () => {
    try {
      setLoading(true)
      const data = await getAllOrders()
      
      // Filter out cancelled orders
      const activeOrders = data.filter(order => order.status !== 'cancelled')
      setOrders(activeOrders)
      
      toast.success(`${activeOrders.length} ordini caricati`)
    } catch (error) {
      console.error('Errore caricamento ordini:', error)
      toast.error('Errore nel caricamento degli ordini')
    } finally {
      setLoading(false)
    }
  }

  // Setup real-time subscription
  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel('orders-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders'
        },
        (payload) => {
          console.log('Real-time update:', payload)
          
          if (payload.eventType === 'INSERT') {
            // New order
            const newOrder = transformOrder(payload.new)
            setOrders(prev => [newOrder, ...prev])
            
            toast.success(`🎄 Nuovo ordine da ${newOrder.characterName}!`, {
              duration: 5000,
              icon: '🔔'
            })
            
            // Play notification sound
            if (audioEnabled && audioRef.current) {
              audioRef.current.play()
            }
          } else if (payload.eventType === 'UPDATE') {
            // Order updated
            const updatedOrder = transformOrder(payload.new)
            setOrders(prev => 
              prev.map(order => order.id === updatedOrder.id ? updatedOrder : order)
            )
          } else if (payload.eventType === 'DELETE') {
            // Order deleted
            setOrders(prev => prev.filter(order => order.id !== payload.old.id))
            toast.success('Ordine eliminato')
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
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
    const pending = orders.filter(o => o.status === 'pending').length
    const preparing = orders.filter(o => o.status === 'preparing').length
    const completed = orders.filter(o => o.status === 'completed').length
    const revenue = orders
      .filter(o => o.status === 'completed')
      .reduce((sum, o) => sum + o.total, 0)

    setStats({
      pending,
      preparing,
      completed,
      total: orders.length,
      revenue
    })
  }

  // Handle drag end
  const onDragEnd = async (result) => {
    if (!result.destination) return

    const { source, destination, draggableId } = result
    
    // No movement
    if (source.droppableId === destination.droppableId) return

    const orderId = parseInt(draggableId.replace('order-', ''))
    const newStatus = destination.droppableId

    try {
      // Optimistic update
      setOrders(prev =>
        prev.map(order =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      )

      // Update in database
      await updateMultipleOrdersStatus([orderId], newStatus)
      
      toast.success(`Ordine spostato in ${getStatusLabel(newStatus)}`, {
        icon: getStatusIcon(newStatus)
      })
    } catch (error) {
      console.error('Errore aggiornamento status:', error)
      toast.error('Errore nell\'aggiornamento dello stato')
      // Revert on error
      loadOrders()
    }
  }

  // Get orders by status
  const getOrdersByStatus = (status) => {
    return orders.filter(order => order.status === status)
  }

  // Delete order
  const handleDeleteOrder = async (orderId) => {
    if (!confirm('Sei sicuro di voler eliminare questo ordine?')) return

    try {
      await deleteMultipleOrders([orderId])
      setOrders(prev => prev.filter(order => order.id !== orderId))
      toast.success('Ordine eliminato')
    } catch (error) {
      console.error('Errore eliminazione:', error)
      toast.error('Errore nell\'eliminazione')
    }
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
                title="Ricarica ordini"
              >
                <RefreshCw size={20} />
                <span>Aggiorna</span>
              </button>
            </div>
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

        {/* Kanban Board */}
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="kanban-board">
            {/* Colonna Pending */}
            <KanbanColumn
              status="pending"
              title="In Attesa"
              icon="⏳"
              orders={getOrdersByStatus('pending')}
              onDelete={handleDeleteOrder}
            />

            {/* Colonna Preparing */}
            <KanbanColumn
              status="preparing"
              title="In Preparazione"
              icon="👨‍🍳"
              orders={getOrdersByStatus('preparing')}
              onDelete={handleDeleteOrder}
            />

            {/* Colonna Completed */}
            <KanbanColumn
              status="completed"
              title="Completati"
              icon="✅"
              orders={getOrdersByStatus('completed')}
              onDelete={handleDeleteOrder}
            />
          </div>
        </DragDropContext>
      </div>
    </div>
  )
}

// Kanban Column Component
function KanbanColumn({ status, title, icon, orders, onDelete }) {
  return (
    <div className={`kanban-column ${status}`}>
      <div className="column-header">
        <div className="column-title">
          <span className="column-icon">{icon}</span>
          {title}
        </div>
        <span className="column-count">{orders.length}</span>
      </div>

      <Droppable droppableId={status}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`column-content ${snapshot.isDraggingOver ? 'drag-over' : ''}`}
          >
            {orders.length === 0 ? (
              <div className="column-empty">
                <span className="icon">{icon}</span>
                <p>Nessun ordine</p>
              </div>
            ) : (
              orders.map((order, index) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  index={index}
                  onDelete={onDelete}
                />
              ))
            )}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  )
}

// Order Card Component
function OrderCard({ order, index, onDelete }) {
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
    <Draggable draggableId={`order-${order.id}`} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`order-card ${snapshot.isDragging ? 'dragging' : ''}`}
        >
          {/* Header */}
          <div className="card-header">
            <div className="card-character">
              🎭 {order.characterName}
            </div>
            <div className="card-actions">
              <button
                className="card-action-btn delete"
                onClick={() => onDelete(order.id)}
                title="Elimina ordine"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>

          {/* Info */}
          <div className="card-info">
            <div className="card-info-row">
              <Clock size={16} className="icon" />
              <span>{formatDate(order.timestamp)}</span>
            </div>
            
            <div className="card-info-row">
              <Users size={16} className="icon" />
              <span>{order.numPeople} {order.numPeople === 1 ? 'persona' : 'persone'}</span>
            </div>

            {order.sessionType !== 'immediate' && (
              <div className="card-info-row">
                <span className="session-badge">
                  {order.sessionType === 'lunch' ? '🌞 Pranzo' : '🌙 Cena'}
                  {order.sessionDate && ` - ${order.sessionDate} ${order.sessionTime || ''}`}
                </span>
              </div>
            )}
          </div>

          {/* Items */}
          <div className="card-items">
            <div className="card-items-title">Articoli:</div>
            {order.items.map((item, idx) => (
              <div key={idx} className="card-item">
                <span className="item-name">{item.name}</span>
                <span className="item-quantity">x{item.quantity}</span>
                <span className="item-price">€{(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>

          {/* Total */}
          <div className="card-total">
            <span className="total-label">Totale:</span>
            <span className="total-value">€{order.total.toFixed(2)}</span>
          </div>

          {/* Notes */}
          {order.notes && (
            <div className="card-note">
              💬 {order.notes}
            </div>
          )}
        </div>
      )}
    </Draggable>
  )
}

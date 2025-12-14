import { useState, useEffect } from 'react'
import './History.css'

export default function History() {
  const [orders, setOrders] = useState([])
  const [filteredOrders, setFilteredOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    orderType: 'all',
    dateFrom: '',
    dateTo: ''
  })
  const [currentPage, setCurrentPage] = useState(1)
  const [viewModal, setViewModal] = useState({ show: false, order: null })
  const ordersPerPage = 20

  useEffect(() => {
    loadAllOrders()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [filters, orders])

  const loadAllOrders = async () => {
    try {
      const response = await fetch('/api/orders.php?all=1')
      if (response.ok) {
        const data = await response.json()
        setOrders(data)
      }
    } catch (error) {
      console.error('Errore caricamento storico:', error)
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...orders]

    // Filtro ricerca (personaggio, email, note)
    if (filters.search) {
      const search = filters.search.toLowerCase()
      filtered = filtered.filter(order => 
        order.character.toLowerCase().includes(search) ||
        (order.email && order.email.toLowerCase().includes(search)) ||
        (order.notes && order.notes.toLowerCase().includes(search))
      )
    }

    // Filtro stato
    if (filters.status !== 'all') {
      filtered = filtered.filter(order => order.status === filters.status)
    }

    // Filtro tipo ordine
    if (filters.orderType !== 'all') {
      filtered = filtered.filter(order => order.orderType === filters.orderType)
    }

    // Filtro data from
    if (filters.dateFrom) {
      filtered = filtered.filter(order => {
        const orderDate = new Date(order.timestamp).toISOString().split('T')[0]
        return orderDate >= filters.dateFrom
      })
    }

    // Filtro data to
    if (filters.dateTo) {
      filtered = filtered.filter(order => {
        const orderDate = new Date(order.timestamp).toISOString().split('T')[0]
        return orderDate <= filters.dateTo
      })
    }

    setFilteredOrders(filtered)
    setCurrentPage(1) // Reset alla prima pagina quando si filtrano
  }

  const exportToCSV = () => {
    const headers = ['Data', 'Personaggio', 'Email', 'Tipo', 'Persone', 'Stato', 'Totale', 'Note']
    const csvData = filteredOrders.map(order => [
      new Date(order.timestamp).toLocaleString('it-IT'),
      order.character,
      order.email || '',
      order.orderType === 'immediate' ? 'Ordina Subito' : 'Prenota Posto',
      order.num_people,
      order.status,
      `€${order.total.toFixed(2)}`,
      (order.notes || '').replace(/,/g, ';') // Sostituisci virgole per CSV
    ])

    const csv = [
      headers.join(','),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `ordini_noel_fest_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#ffc107'
      case 'preparing': return '#17a2b8'
      case 'completed': return '#28a745'
      case 'cancelled': return '#dc3545'
      default: return '#6c757d'
    }
  }

  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending': return 'In Attesa'
      case 'preparing': return 'In Preparazione'
      case 'completed': return 'Completato'
      case 'cancelled': return 'Annullato'
      default: return status
    }
  }

  // Paginazione
  const indexOfLastOrder = currentPage * ordersPerPage
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder)
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage)

  if (loading) {
    return (
      <div className="history-container">
        <div className="loading">
          <div className="spinner"></div>
          <p>Caricamento storico ordini...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="history-container">
      <div className="history-header">
        <div>
          <h1>📜 Storico Ordini</h1>
          <p>Archivio completo di tutti gli ordini</p>
        </div>
        <button className="btn-export" onClick={exportToCSV}>
          📥 Esporta CSV
        </button>
      </div>

      {/* Filtri */}
      <div className="filters-panel">
        <div className="filter-group">
          <label>🔍 Ricerca</label>
          <input
            type="text"
            placeholder="Cerca personaggio, email, note..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />
        </div>

        <div className="filter-group">
          <label>📊 Stato</label>
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          >
            <option value="all">Tutti</option>
            <option value="pending">In Attesa</option>
            <option value="preparing">In Preparazione</option>
            <option value="completed">Completato</option>
            <option value="cancelled">Annullato</option>
          </select>
        </div>

        <div className="filter-group">
          <label>🎯 Tipo Ordine</label>
          <select
            value={filters.orderType}
            onChange={(e) => setFilters({ ...filters, orderType: e.target.value })}
          >
            <option value="all">Tutti</option>
            <option value="immediate">Ordina Subito</option>
            <option value="at_register">Prenota Posto</option>
          </select>
        </div>

        <div className="filter-group">
          <label>📅 Da</label>
          <input
            type="date"
            value={filters.dateFrom}
            onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
          />
        </div>

        <div className="filter-group">
          <label>📅 A</label>
          <input
            type="date"
            value={filters.dateTo}
            onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
          />
        </div>

        <button 
          className="btn-reset-filters"
          onClick={() => setFilters({
            search: '',
            status: 'all',
            orderType: 'all',
            dateFrom: '',
            dateTo: ''
          })}
        >
          🔄 Reset
        </button>
      </div>

      {/* Statistiche rapide */}
      <div className="quick-stats">
        <div className="quick-stat">
          <span className="stat-number">{filteredOrders.length}</span>
          <span className="stat-label">Ordini Trovati</span>
        </div>
        <div className="quick-stat">
          <span className="stat-number">
            €{filteredOrders.reduce((sum, o) => sum + (parseFloat(o.total) || 0), 0).toFixed(2)}
          </span>
          <span className="stat-label">Totale</span>
        </div>
        <div className="quick-stat">
          <span className="stat-number">
            {filteredOrders.reduce((sum, o) => sum + (parseInt(o.num_people) || 0), 0)}
          </span>
          <span className="stat-label">Persone</span>
        </div>
      </div>

      {/* Tabella ordini */}
      <div className="orders-table-container">
        <table className="orders-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Data/Ora</th>
              <th>Personaggio</th>
              <th>Email</th>
              <th>Tipo</th>
              <th>Persone</th>
              <th>Piatti</th>
              <th>Totale</th>
              <th>Stato</th>
              <th>Azioni</th>
            </tr>
          </thead>
          <tbody>
            {currentOrders.map(order => (
              <tr key={order.id} className={`order-row status-${order.status}`}>
                <td className="order-id">#{order.id}</td>
                <td className="order-date">
                  {new Date(order.timestamp).toLocaleString('it-IT', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </td>
                <td className="order-character">{order.character}</td>
                <td className="order-email">{order.email || '-'}</td>
                <td className="order-type">
                  {order.orderType === 'immediate' ? (
                    <span className="type-badge immediate">⚡ Subito</span>
                  ) : (
                    <span className="type-badge register">🪑 Prenota</span>
                  )}
                </td>
                <td className="order-people">
                  <span className="people-badge">👥 {order.num_people}</span>
                </td>
                <td className="order-items">
                  <details className="items-details">
                    <summary>{order.items.length} piatti</summary>
                    <ul className="items-list">
                      {order.items.map((item, idx) => (
                        <li key={idx}>
                          {item.quantity}x {item.name} - €{(item.price * item.quantity).toFixed(2)}
                        </li>
                      ))}
                    </ul>
                  </details>
                </td>
                <td className="order-total">€{parseFloat(order.total || 0).toFixed(2)}</td>
                <td className="order-status">
                  <span 
                    className="status-badge"
                    style={{ background: getStatusColor(order.status) }}
                  >
                    {getStatusLabel(order.status)}
                  </span>
                </td>
                <td className="order-actions">
                  <button 
                    className="btn-view"
                    onClick={() => setViewModal({ show: true, order })}
                  >
                    👁️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredOrders.length === 0 && (
          <div className="no-results">
            <p>📭 Nessun ordine trovato con i filtri selezionati</p>
          </div>
        )}
      </div>

      {/* Paginazione */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="btn-page"
          >
            ← Precedente
          </button>
          
          <div className="page-numbers">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`btn-page-num ${currentPage === page ? 'active' : ''}`}
              >
                {page}
              </button>
            ))}
          </div>

          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="btn-page"
          >
            Successivo →
          </button>
        </div>
      )}

      {/* Modal Dettaglio Ordine */}
      {viewModal.show && viewModal.order && (
        <div className="modal-overlay" onClick={() => setViewModal({ show: false, order: null })}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>📋 Dettaglio Ordine #{viewModal.order.id}</h2>
            
            <div className="modal-info-grid">
              <div className="info-row">
                <strong>Personaggio:</strong>
                <span>{viewModal.order.character}</span>
              </div>
              <div className="info-row">
                <strong>Email:</strong>
                <span>{viewModal.order.email || 'N/A'}</span>
              </div>
              <div className="info-row">
                <strong>Data/Ora:</strong>
                <span>{new Date(viewModal.order.timestamp).toLocaleString('it-IT')}</span>
              </div>
              <div className="info-row">
                <strong>Tipo Ordine:</strong>
                <span>{viewModal.order.orderType === 'immediate' ? 'Ordina Subito' : 'Prenota Posto'}</span>
              </div>
              <div className="info-row">
                <strong>Persone:</strong>
                <span>{viewModal.order.num_people}</span>
              </div>
              <div className="info-row">
                <strong>Stato:</strong>
                <span>{getStatusLabel(viewModal.order.status)}</span>
              </div>
            </div>

            <div className="modal-items">
              <h3>Piatti Ordinati:</h3>
              <ul>
                {viewModal.order.items.map((item, idx) => (
                  <li key={idx}>
                    <strong>{item.quantity}x</strong> {item.name} - €{(item.price * item.quantity).toFixed(2)}
                  </li>
                ))}
              </ul>
            </div>

            {viewModal.order.notes && (
              <div className="modal-notes">
                <h3>Note:</h3>
                <p>{viewModal.order.notes}</p>
              </div>
            )}

            <div className="modal-total">
              <strong>Totale:</strong> <span>€{parseFloat(viewModal.order.total || 0).toFixed(2)}</span>
            </div>

            <button className="btn-modal-close" onClick={() => setViewModal({ show: false, order: null })}>
              ✕ Chiudi
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

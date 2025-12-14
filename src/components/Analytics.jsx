import { useState, useEffect } from 'react'
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend } from 'chart.js'
import { Pie, Bar, Line } from 'react-chartjs-2'
import './Analytics.css'

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend)

export default function Analytics() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('all') // all, today, week

  useEffect(() => {
    loadAnalytics()
    const interval = setInterval(loadAnalytics, 10000) // Aggiorna ogni 10 secondi
    return () => clearInterval(interval)
  }, [timeRange])

  const loadAnalytics = async () => {
    try {
      const response = await fetch(`/api/analytics.php?range=${timeRange}`)
      const data = await response.json()
      if (data.success) {
        // Assicurati che tutti i numeri siano convertiti correttamente
        const stats = {
          ...data.stats,
          totals: {
            ...data.stats.totals,
            revenue: parseFloat(data.stats.totals.revenue) || 0,
            coperto: parseFloat(data.stats.totals.coperto) || 0,
            averageOrder: parseFloat(data.stats.totals.averageOrder) || 0
          },
          topDishes: (data.stats.topDishes || []).map(d => ({
            ...d,
            quantity: parseInt(d.quantity) || 0,
            revenue: parseFloat(d.revenue) || 0
          })),
          topDrinks: (data.stats.topDrinks || []).map(d => ({
            ...d,
            quantity: parseInt(d.quantity) || 0,
            revenue: parseFloat(d.revenue) || 0
          })),
          categories: (data.stats.categories || []).map(c => ({
            ...c,
            quantity: parseInt(c.quantity) || 0,
            revenue: parseFloat(c.revenue) || 0,
            percentage: parseFloat(c.percentage) || 0
          }))
        }
        setStats(stats)
      }
    } catch (error) {
      console.error('Errore caricamento analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="analytics-container">
        <div className="loading">
          <div className="spinner"></div>
          <p>Caricamento statistiche...</p>
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="analytics-container">
        <div className="error-message">
          ⚠️ Errore nel caricamento delle statistiche
        </div>
      </div>
    )
  }

  return (
    <div className="analytics-container">
      <div className="analytics-header">
        <div className="header-title">
          <h1>📊 Analytics Noel Fest</h1>
          <p>Statistiche dettagliate degli ordini e vendite</p>
        </div>
        
        <div className="time-range-selector">
          <button 
            className={timeRange === 'today' ? 'active' : ''}
            onClick={() => setTimeRange('today')}
          >
            📅 Oggi
          </button>
          <button 
            className={timeRange === 'week' ? 'active' : ''}
            onClick={() => setTimeRange('week')}
          >
            📆 Settimana
          </button>
          <button 
            className={timeRange === 'all' ? 'active' : ''}
            onClick={() => setTimeRange('all')}
          >
            🗓️ Tutto
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid">
        <div className="kpi-card" style={{ borderLeftColor: '#8B0000' }}>
          <div className="kpi-icon">💰</div>
          <div className="kpi-content">
            <h3>Incasso Totale</h3>
            <p className="kpi-value">€ {stats.totals.revenue.toFixed(2)}</p>
            <small>Da {stats.totals.orders} ordini</small>
          </div>
        </div>

        <div className="kpi-card" style={{ borderLeftColor: '#1a4d2e' }}>
          <div className="kpi-icon">👥</div>
          <div className="kpi-content">
            <h3>Persone Servite</h3>
            <p className="kpi-value">{stats.totals.people}</p>
            <small>Coperto: € {stats.totals.coperto.toFixed(2)}</small>
          </div>
        </div>

        <div className="kpi-card" style={{ borderLeftColor: '#FFD700' }}>
          <div className="kpi-icon">🍽️</div>
          <div className="kpi-content">
            <h3>Piatti Venduti</h3>
            <p className="kpi-value">{stats.totals.items}</p>
            <small>Media per ordine: {(stats.totals.items / stats.totals.orders).toFixed(1)}</small>
          </div>
        </div>

        <div className="kpi-card" style={{ borderLeftColor: '#17a2b8' }}>
          <div className="kpi-icon">🪑</div>
          <div className="kpi-content">
            <h3>Posti Occupati</h3>
            <p className="kpi-value">{stats.seats.occupied} / {stats.seats.total}</p>
            <small>Walk-in: {stats.seats.walkin_occupied} / {stats.seats.walkin_total}</small>
          </div>
        </div>
      </div>

      {/* Sezione Piatti più venduti */}
      <div className="analytics-section">
        <h2>🍽️ Top 10 Piatti più Venduti</h2>
        <div className="top-items-grid">
          {stats.topDishes.slice(0, 10).map((dish, index) => (
            <div key={index} className="top-item-card">
              <div className="rank-badge" style={{
                background: index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : index === 2 ? '#CD7F32' : '#1a4d2e'
              }}>
                {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
              </div>
              <div className="item-info">
                <h4>{dish.name}</h4>
                <div className="item-stats">
                  <span className="quantity">📦 {dish.quantity} venduti</span>
                  <span className="revenue">💰 € {dish.revenue.toFixed(2)}</span>
                </div>
                <div className="progress-bar">
                  <div 
                    className="progress-fill"
                    style={{ 
                      width: `${(dish.quantity / stats.topDishes[0].quantity) * 100}%`,
                      background: `linear-gradient(90deg, #8B0000, #FFD700)`
                    }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sezione Bibite più vendute */}
      <div className="analytics-section">
        <h2>🥤 Top 10 Bibite più Richieste</h2>
        <div className="top-items-grid">
          {stats.topDrinks.slice(0, 10).map((drink, index) => (
            <div key={index} className="top-item-card">
              <div className="rank-badge" style={{
                background: index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : index === 2 ? '#CD7F32' : '#17a2b8'
              }}>
                {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
              </div>
              <div className="item-info">
                <h4>{drink.name}</h4>
                <div className="item-stats">
                  <span className="quantity">📦 {drink.quantity} vendute</span>
                  <span className="revenue">💰 € {drink.revenue.toFixed(2)}</span>
                </div>
                <div className="progress-bar">
                  <div 
                    className="progress-fill"
                    style={{ 
                      width: `${(drink.quantity / stats.topDrinks[0].quantity) * 100}%`,
                      background: `linear-gradient(90deg, #17a2b8, #FFD700)`
                    }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Statistiche per categoria */}
      <div className="analytics-section">
        <h2>📂 Vendite per Categoria</h2>
        <div className="category-stats">
          {stats.categories.map((cat, index) => (
            <div key={index} className="category-card">
              <h3>{cat.category}</h3>
              <div className="category-details">
                <div className="stat-item">
                  <span className="stat-label">Venduti:</span>
                  <span className="stat-value">{cat.quantity}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Incasso:</span>
                  <span className="stat-value">€ {cat.revenue.toFixed(2)}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">% Totale:</span>
                  <span className="stat-value">{cat.percentage.toFixed(1)}%</span>
                </div>
              </div>
              <div className="category-progress">
                <div 
                  className="category-fill"
                  style={{ width: `${cat.percentage}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Statistiche ordini */}
      <div className="analytics-section">
        <h2>📋 Statistiche Ordini</h2>
        <div className="orders-stats-grid">
          <div className="stat-box">
            <h4>Per Stato</h4>
            <ul className="stat-list">
              <li>
                <span className="status-dot pending"></span>
                In Attesa: <strong>{stats.ordersByStatus.pending || 0}</strong>
              </li>
              <li>
                <span className="status-dot preparing"></span>
                In Preparazione: <strong>{stats.ordersByStatus.preparing || 0}</strong>
              </li>
              <li>
                <span className="status-dot completed"></span>
                Completati: <strong>{stats.ordersByStatus.completed || 0}</strong>
              </li>
              <li>
                <span className="status-dot cancelled"></span>
                Annullati: <strong>{stats.ordersByStatus.cancelled || 0}</strong>
              </li>
            </ul>
          </div>

          <div className="stat-box">
            <h4>Per Tipo</h4>
            <ul className="stat-list">
              <li>
                <span className="type-badge immediate">⚡</span>
                Ordina Subito: <strong>{stats.ordersByType.immediate || 0}</strong>
              </li>
              <li>
                <span className="type-badge register">🪑</span>
                Prenota Posto: <strong>{stats.ordersByType.at_register || 0}</strong>
              </li>
            </ul>
          </div>

          <div className="stat-box">
            <h4>Scontrino Medio</h4>
            <p className="average-ticket">€ {stats.totals.averageOrder.toFixed(2)}</p>
            <small>Calcolato su {stats.totals.orders} ordini</small>
          </div>
        </div>
      </div>

      {/* Sezione Grafici */}
      <div className="charts-grid">
        {/* Grafico Torta Categorie */}
        <div className="chart-card">
          <h3>📊 Distribuzione per Categoria</h3>
          <div className="chart-wrapper">
            <Pie
              data={{
                labels: stats.categories.map(c => c.category),
                datasets: [{
                  data: stats.categories.map(c => c.revenue),
                  backgroundColor: [
                    '#8B0000',
                    '#1a4d2e',
                    '#FFD700',
                    '#17a2b8',
                    '#dc3545',
                    '#6c757d',
                    '#28a745',
                    '#ffc107'
                  ],
                  borderWidth: 2,
                  borderColor: '#fff'
                }]
              }}
              options={{
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                  legend: {
                    position: 'bottom',
                    labels: {
                      padding: 15,
                      font: { size: 12 }
                    }
                  },
                  tooltip: {
                    callbacks: {
                      label: (context) => {
                        const label = context.label || ''
                        const value = context.parsed || 0
                        const total = context.dataset.data.reduce((a, b) => a + b, 0)
                        const percentage = ((value / total) * 100).toFixed(1)
                        return `${label}: €${value.toFixed(2)} (${percentage}%)`
                      }
                    }
                  }
                }
              }}
            />
          </div>
        </div>

        {/* Grafico Barre Top Piatti */}
        <div className="chart-card">
          <h3>🍽️ Top 5 Piatti</h3>
          <div className="chart-wrapper">
            <Bar
              data={{
                labels: stats.topDishes.slice(0, 5).map(d => d.name),
                datasets: [{
                  label: 'Quantità Vendute',
                  data: stats.topDishes.slice(0, 5).map(d => d.quantity),
                  backgroundColor: 'rgba(139, 0, 0, 0.8)',
                  borderColor: '#8B0000',
                  borderWidth: 2
                }]
              }}
              options={{
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                  legend: { display: false },
                  tooltip: {
                    callbacks: {
                      label: (context) => `Venduti: ${context.parsed.y}`
                    }
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: { stepSize: 1 }
                  }
                }
              }}
            />
          </div>
        </div>

        {/* Grafico Barre Top Bibite */}
        <div className="chart-card">
          <h3>🥤 Top 5 Bibite</h3>
          <div className="chart-wrapper">
            <Bar
              data={{
                labels: stats.topDrinks.slice(0, 5).map(d => d.name),
                datasets: [{
                  label: 'Quantità Vendute',
                  data: stats.topDrinks.slice(0, 5).map(d => d.quantity),
                  backgroundColor: 'rgba(23, 162, 184, 0.8)',
                  borderColor: '#17a2b8',
                  borderWidth: 2
                }]
              }}
              options={{
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                  legend: { display: false },
                  tooltip: {
                    callbacks: {
                      label: (context) => `Vendute: ${context.parsed.y}`
                    }
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: { stepSize: 1 }
                  }
                }
              }}
            />
          </div>
        </div>

        {/* Grafico Torta Ordini per Stato */}
        <div className="chart-card">
          <h3>📋 Ordini per Stato</h3>
          <div className="chart-wrapper">
            <Pie
              data={{
                labels: ['In Attesa', 'In Preparazione', 'Completati', 'Annullati'],
                datasets: [{
                  data: [
                    stats.ordersByStatus.pending,
                    stats.ordersByStatus.preparing,
                    stats.ordersByStatus.completed,
                    stats.ordersByStatus.cancelled
                  ],
                  backgroundColor: ['#ffc107', '#17a2b8', '#28a745', '#dc3545'],
                  borderWidth: 2,
                  borderColor: '#fff'
                }]
              }}
              options={{
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                  legend: {
                    position: 'bottom',
                    labels: {
                      padding: 15,
                      font: { size: 12 }
                    }
                  }
                }
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

import { useMemo } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js'
import { Line, Bar, Doughnut } from 'react-chartjs-2'
import { TrendingUp, Clock, Package, DollarSign } from 'lucide-react'
import './AnalyticsDashboard.css'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
)

export default function AnalyticsDashboard({ orders }) {
  // Calculate analytics data
  const analytics = useMemo(() => {
    // Orders by hour
    const ordersByHour = Array(24).fill(0)
    orders.forEach(order => {
      const hour = new Date(order.timestamp).getHours()
      ordersByHour[hour]++
    })

    // Revenue by day (last 7 days)
    const last7Days = Array(7).fill(0).map((_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - (6 - i))
      return {
        date: date.toLocaleDateString('it-IT', { weekday: 'short', day: 'numeric' }),
        revenue: 0,
        orders: 0
      }
    })

    orders.forEach(order => {
      const orderDate = new Date(order.timestamp)
      const today = new Date()
      const diffDays = Math.floor((today - orderDate) / (1000 * 60 * 60 * 24))
      
      if (diffDays >= 0 && diffDays < 7) {
        const index = 6 - diffDays
        if (order.status === 'completed') {
          last7Days[index].revenue += order.total
        }
        last7Days[index].orders++
      }
    })

    // Top products
    const productCounts = {}
    orders.forEach(order => {
      order.items.forEach(item => {
        if (!productCounts[item.name]) {
          productCounts[item.name] = {
            quantity: 0,
            revenue: 0
          }
        }
        productCounts[item.name].quantity += item.quantity
        productCounts[item.name].revenue += item.price * item.quantity
      })
    })

    const topProducts = Object.entries(productCounts)
      .sort((a, b) => b[1].quantity - a[1].quantity)
      .slice(0, 5)

    // Session types distribution
    const sessionTypes = {
      immediate: orders.filter(o => o.sessionType === 'immediate').length,
      lunch: orders.filter(o => o.sessionType === 'lunch').length,
      dinner: orders.filter(o => o.sessionType === 'dinner').length
    }

    // Average order value
    const completedOrders = orders.filter(o => o.status === 'completed')
    const avgOrderValue = completedOrders.length > 0
      ? completedOrders.reduce((sum, o) => sum + o.total, 0) / completedOrders.length
      : 0

    // Peak hours
    const peakHour = ordersByHour.indexOf(Math.max(...ordersByHour))

    return {
      ordersByHour,
      last7Days,
      topProducts,
      sessionTypes,
      avgOrderValue,
      peakHour
    }
  }, [orders])

  // Chart configurations
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: '#fff',
          font: { size: 12 }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#FFD700',
        bodyColor: '#fff',
        borderColor: 'rgba(255, 215, 0, 0.3)',
        borderWidth: 1
      }
    },
    scales: {
      x: {
        ticks: { color: 'rgba(255, 255, 255, 0.7)' },
        grid: { color: 'rgba(255, 255, 255, 0.1)' }
      },
      y: {
        ticks: { color: 'rgba(255, 255, 255, 0.7)' },
        grid: { color: 'rgba(255, 255, 255, 0.1)' }
      }
    }
  }

  // Orders by hour data
  const ordersByHourData = {
    labels: Array(24).fill(0).map((_, i) => `${i}:00`),
    datasets: [{
      label: 'Ordini',
      data: analytics.ordersByHour,
      borderColor: '#fbbf24',
      backgroundColor: 'rgba(251, 191, 36, 0.2)',
      tension: 0.4
    }]
  }

  // Revenue trend data
  const revenueTrendData = {
    labels: analytics.last7Days.map(d => d.date),
    datasets: [
      {
        label: 'Incasso (€)',
        data: analytics.last7Days.map(d => d.revenue),
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.2)',
        yAxisID: 'y'
      },
      {
        label: 'N° Ordini',
        data: analytics.last7Days.map(d => d.orders),
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        yAxisID: 'y1'
      }
    ]
  }

  const revenueTrendOptions = {
    ...chartOptions,
    scales: {
      x: {
        ticks: { color: 'rgba(255, 255, 255, 0.7)' },
        grid: { color: 'rgba(255, 255, 255, 0.1)' }
      },
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        ticks: { color: '#10b981' },
        grid: { color: 'rgba(255, 255, 255, 0.1)' }
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        ticks: { color: '#3b82f6' },
        grid: { display: false }
      }
    }
  }

  // Top products data
  const topProductsData = {
    labels: analytics.topProducts.map(p => p[0]),
    datasets: [{
      label: 'Quantità venduta',
      data: analytics.topProducts.map(p => p[1].quantity),
      backgroundColor: [
        'rgba(251, 191, 36, 0.8)',
        'rgba(59, 130, 246, 0.8)',
        'rgba(16, 185, 129, 0.8)',
        'rgba(168, 85, 247, 0.8)',
        'rgba(236, 72, 153, 0.8)'
      ],
      borderColor: [
        '#fbbf24',
        '#3b82f6',
        '#10b981',
        '#a855f7',
        '#ec4899'
      ],
      borderWidth: 2
    }]
  }

  // Session types data
  const sessionTypesData = {
    labels: ['⚡ Immediato', '🌞 Pranzo', '🌙 Cena'],
    datasets: [{
      data: [
        analytics.sessionTypes.immediate,
        analytics.sessionTypes.lunch,
        analytics.sessionTypes.dinner
      ],
      backgroundColor: [
        'rgba(251, 191, 36, 0.8)',
        'rgba(59, 130, 246, 0.8)',
        'rgba(168, 85, 247, 0.8)'
      ],
      borderColor: ['#fbbf24', '#3b82f6', '#a855f7'],
      borderWidth: 2
    }]
  }

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#fff',
          font: { size: 12 },
          padding: 15
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#FFD700',
        bodyColor: '#fff',
        borderColor: 'rgba(255, 215, 0, 0.3)',
        borderWidth: 1
      }
    }
  }

  return (
    <div className="analytics-dashboard">
      {/* Insight Cards */}
      <div className="insights-grid">
        <div className="insight-card">
          <div className="insight-icon" style={{ background: 'rgba(16, 185, 129, 0.2)' }}>
            <DollarSign size={24} color="#10b981" />
          </div>
          <div className="insight-content">
            <h4>Valore Medio Ordine</h4>
            <p className="insight-value">€{analytics.avgOrderValue.toFixed(2)}</p>
          </div>
        </div>

        <div className="insight-card">
          <div className="insight-icon" style={{ background: 'rgba(251, 191, 36, 0.2)' }}>
            <Clock size={24} color="#fbbf24" />
          </div>
          <div className="insight-content">
            <h4>Orario di Punta</h4>
            <p className="insight-value">{analytics.peakHour}:00 - {analytics.peakHour + 1}:00</p>
          </div>
        </div>

        <div className="insight-card">
          <div className="insight-icon" style={{ background: 'rgba(59, 130, 246, 0.2)' }}>
            <Package size={24} color="#3b82f6" />
          </div>
          <div className="insight-content">
            <h4>Prodotti Diversi</h4>
            <p className="insight-value">{analytics.topProducts.length}</p>
          </div>
        </div>

        <div className="insight-card">
          <div className="insight-icon" style={{ background: 'rgba(168, 85, 247, 0.2)' }}>
            <TrendingUp size={24} color="#a855f7" />
          </div>
          <div className="insight-content">
            <h4>Trend Settimana</h4>
            <p className="insight-value">
              {analytics.last7Days[6].orders > analytics.last7Days[0].orders ? '📈 +' : '📉 '}
              {Math.abs(analytics.last7Days[6].orders - analytics.last7Days[0].orders)}
            </p>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="charts-grid">
        {/* Orders by Hour */}
        <div className="chart-card">
          <h3>📊 Ordini per Orario</h3>
          <div className="chart-container">
            <Line data={ordersByHourData} options={chartOptions} />
          </div>
        </div>

        {/* Revenue Trend */}
        <div className="chart-card">
          <h3>💰 Trend Incassi (7 giorni)</h3>
          <div className="chart-container">
            <Line data={revenueTrendData} options={revenueTrendOptions} />
          </div>
        </div>

        {/* Top Products */}
        <div className="chart-card">
          <h3>🏆 Top 5 Prodotti</h3>
          <div className="chart-container">
            <Bar data={topProductsData} options={chartOptions} />
          </div>
        </div>

        {/* Session Types */}
        <div className="chart-card">
          <h3>🎯 Distribuzione Sessioni</h3>
          <div className="chart-container">
            <Doughnut data={sessionTypesData} options={doughnutOptions} />
          </div>
        </div>
      </div>

      {/* Top Products Table */}
      <div className="top-products-table">
        <h3>📦 Dettaglio Prodotti Top</h3>
        <table>
          <thead>
            <tr>
              <th>Posizione</th>
              <th>Prodotto</th>
              <th>Quantità</th>
              <th>Incasso</th>
            </tr>
          </thead>
          <tbody>
            {analytics.topProducts.map((product, index) => (
              <tr key={product[0]}>
                <td>
                  <span className="rank-badge">{index + 1}</span>
                </td>
                <td className="product-name">{product[0]}</td>
                <td className="quantity">{product[1].quantity}</td>
                <td className="revenue">€{product[1].revenue.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

import { useState, useEffect } from 'react'
import './Sidebar.css'

export default function Sidebar({ currentView, onViewChange, onCollapseChange }) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  const menuItems = [
    { id: 'orders', icon: '📋', label: 'Dashboard Ordini', color: '#8B0000' },
    { id: 'analytics', icon: '📊', label: 'Analytics', color: '#1a4d2e' },
    { id: 'settings', icon: '⚙️', label: 'Configurazione', color: '#FFD700' },
    { id: 'history', icon: '📜', label: 'Storico', color: '#17a2b8' }
  ]

  useEffect(() => {
    if (onCollapseChange) {
      onCollapseChange(isCollapsed)
    }
  }, [isCollapsed, onCollapseChange])

  return (
    <div className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <button 
        className="sidebar-toggle"
        onClick={() => setIsCollapsed(!isCollapsed)}
        title={isCollapsed ? 'Espandi menu' : 'Comprimi menu'}
      >
        {isCollapsed ? '☰' : '✕'}
      </button>

      <div className="sidebar-header">
        {!isCollapsed && (
          <>
            <h2>🎄 Noel Fest</h2>
            <p className="sidebar-subtitle">Pannello Admin</p>
          </>
        )}
      </div>

      <nav className="sidebar-nav">
        {menuItems.map(item => (
          <button
            key={item.id}
            className={`sidebar-item ${currentView === item.id ? 'active' : ''}`}
            onClick={() => onViewChange(item.id)}
            style={{
              '--item-color': item.color
            }}
            title={isCollapsed ? item.label : ''}
          >
            <span className="sidebar-icon">{item.icon}</span>
            {!isCollapsed && <span className="sidebar-label">{item.label}</span>}
          </button>
        ))}
      </nav>

      {!isCollapsed && (
        <div className="sidebar-footer">
          <p className="sidebar-info">
            🎅 Proloco Lanzo TSE<br/>
            <small>Sistema di gestione ordini</small>
          </p>
        </div>
      )}
    </div>
  )
}

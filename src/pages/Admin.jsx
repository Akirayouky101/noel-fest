import { useState, useEffect } from 'react'
import Sidebar from '../components/Sidebar'
import OrdersDashboard from '../components/OrdersDashboard'
import Analytics from '../components/Analytics'
import History from '../components/History'
import Settings from '../components/Settings'
import './AdminLayout.css'

export default function Admin() {
  const [currentView, setCurrentView] = useState('orders')
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

  return (
    <div className="admin-layout">
      <Sidebar 
        currentView={currentView} 
        onViewChange={setCurrentView}
        onCollapseChange={setIsSidebarCollapsed}
      />
      
      <div 
        className="admin-main-content"
        style={{
          marginLeft: isSidebarCollapsed ? '70px' : '280px'
        }}
      >
        {currentView === 'orders' && <OrdersDashboard />}
        {currentView === 'analytics' && <Analytics />}
        {currentView === 'settings' && <Settings />}
        {currentView === 'history' && <History />}
      </div>
    </div>
  )
}

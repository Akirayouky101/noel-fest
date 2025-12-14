import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Menu from './pages/Menu'
import AdminKanban from './pages/AdminKanban'
import './App.css'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Menu />} />
        <Route path="/admin" element={<AdminKanban />} />
      </Routes>
    </Router>
  )
}

export default App

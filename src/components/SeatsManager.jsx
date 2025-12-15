import { useState, useEffect } from 'react'
import { X, Users, UserPlus, UserMinus } from 'lucide-react'
import toast from 'react-hot-toast'
import {
  getAvailableSeats,
  getAvailableWalkinSeats,
  getActiveReservations,
  getWalkinSeats,
  createReservation,
  createWalkinSeats,
  deleteReservation,
  deleteWalkinSeats,
  updateReservationPeople,
  updateWalkinSeats,
  getAllSystemConfig
} from '../lib/supabaseAPI'
import './SeatsManager.css'

export default function SeatsManager({ isOpen, onClose }) {
  const [config, setConfig] = useState({})
  const [availableSeats, setAvailableSeats] = useState(0)
  const [availableWalkin, setAvailableWalkin] = useState(0)
  const [reservations, setReservations] = useState([])
  const [walkinSeats, setWalkinSeats] = useState([])
  const [loading, setLoading] = useState(false)
  
  // Form states
  const [newReservation, setNewReservation] = useState({ character: '', people: 1 })
  const [newWalkin, setNewWalkin] = useState({ character: '', seats: 1 })

  useEffect(() => {
    if (isOpen) {
      loadData()
    }
  }, [isOpen])

  const loadData = async () => {
    setLoading(true)
    try {
      const [configData, seatsData, walkinData, reservationsData, walkinSeatsData] = await Promise.all([
        getAllSystemConfig(),
        getAvailableSeats(),
        getAvailableWalkinSeats(),
        getActiveReservations(),
        getWalkinSeats()
      ])
      
      setConfig(configData)
      setAvailableSeats(seatsData)
      setAvailableWalkin(walkinData)
      setReservations(reservationsData)
      setWalkinSeats(walkinSeatsData)
    } catch (error) {
      console.error('Error loading seats data:', error)
      toast.error('Errore nel caricamento')
    } finally {
      setLoading(false)
    }
  }

  // Add reservation
  const handleAddReservation = async (e) => {
    e.preventDefault()
    
    if (!newReservation.character || newReservation.people < 1) {
      toast.error('Compila tutti i campi')
      return
    }

    if (newReservation.people > availableSeats) {
      toast.error(`Solo ${availableSeats} posti disponibili!`)
      return
    }

    try {
      await createReservation(newReservation.character, newReservation.people)
      toast.success(`Prenotazione per ${newReservation.character} aggiunta`)
      setNewReservation({ character: '', people: 1 })
      loadData()
    } catch (error) {
      console.error('Error adding reservation:', error)
      toast.error('Errore nell\'aggiunta della prenotazione')
    }
  }

  // Delete reservation
  const handleDeleteReservation = async (character) => {
    if (!confirm(`Liberare i posti di ${character}?`)) return

    try {
      await deleteReservation(character)
      toast.success('Posti liberati')
      loadData()
    } catch (error) {
      console.error('Error deleting reservation:', error)
      toast.error('Errore nella cancellazione')
    }
  }

  // Update reservation people
  const handleUpdateReservation = async (character, currentPeople, delta) => {
    const newPeople = currentPeople + delta
    
    if (newPeople < 1) return
    if (delta > 0 && delta > availableSeats) {
      toast.error('Posti insufficienti')
      return
    }

    try {
      await updateReservationPeople(character, newPeople)
      toast.success('Prenotazione aggiornata')
      loadData()
    } catch (error) {
      console.error('Error updating reservation:', error)
      toast.error('Errore nell\'aggiornamento')
    }
  }

  // Add walk-in
  const handleAddWalkin = async (e) => {
    e.preventDefault()
    
    if (!newWalkin.character || newWalkin.seats < 1) {
      toast.error('Compila tutti i campi')
      return
    }

    if (newWalkin.seats > availableWalkin) {
      toast.error(`Solo ${availableWalkin} posti walk-in disponibili!`)
      return
    }

    try {
      await createWalkinSeats(newWalkin.character, newWalkin.seats)
      toast.success(`${newWalkin.seats} posti walk-in occupati`)
      setNewWalkin({ character: '', seats: 1 })
      loadData()
    } catch (error) {
      console.error('Error adding walkin:', error)
      toast.error('Errore nell\'aggiunta walk-in')
    }
  }

  // Delete walk-in
  const handleDeleteWalkin = async (character) => {
    if (!confirm(`Liberare i posti walk-in di ${character}?`)) return

    try {
      await deleteWalkinSeats(character)
      toast.success('Posti walk-in liberati')
      loadData()
    } catch (error) {
      console.error('Error deleting walkin:', error)
      toast.error('Errore nella cancellazione')
    }
  }

  // Update walk-in seats
  const handleUpdateWalkin = async (character, currentSeats, delta) => {
    const newSeats = currentSeats + delta
    
    if (newSeats < 1) return
    if (delta > 0 && delta > availableWalkin) {
      toast.error('Posti walk-in insufficienti')
      return
    }

    try {
      await updateWalkinSeats(character, newSeats)
      toast.success('Walk-in aggiornato')
      loadData()
    } catch (error) {
      console.error('Error updating walkin:', error)
      toast.error('Errore nell\'aggiornamento')
    }
  }

  if (!isOpen) return null

  const totalSeats = parseInt(config.total_seats || 0)
  const totalWalkin = parseInt(config.walkin_seats || 0)
  const occupiedSeats = totalSeats - availableSeats
  const occupiedWalkin = totalWalkin - availableWalkin

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content seats-manager" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <X size={24} />
        </button>

        <h2>🪑 Gestione Posti</h2>

        {loading ? (
          <div className="loading-spinner">
            <div className="spinner"></div>
          </div>
        ) : (
          <>
            {/* Stats Overview */}
            <div className="seats-stats">
              <div className="stat-box reservations">
                <h3>📋 Prenotazioni</h3>
                <div className="stat-main">{occupiedSeats} / {totalSeats}</div>
                <div className="stat-sub">{availableSeats} disponibili</div>
                <div className="stat-bar">
                  <div 
                    className="stat-bar-fill reservations"
                    style={{ width: `${(occupiedSeats / totalSeats) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div className="stat-box walkin">
                <h3>🚶 Walk-in</h3>
                <div className="stat-main">{occupiedWalkin} / {totalWalkin}</div>
                <div className="stat-sub">{availableWalkin} disponibili</div>
                <div className="stat-bar">
                  <div 
                    className="stat-bar-fill walkin"
                    style={{ width: `${(occupiedWalkin / totalWalkin) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Reservations Section */}
            <div className="section">
              <h3>📋 Prenotazioni Attive</h3>
              
              <form onSubmit={handleAddReservation} className="add-form">
                <input
                  type="text"
                  placeholder="Nome character"
                  value={newReservation.character}
                  onChange={(e) => setNewReservation({ ...newReservation, character: e.target.value })}
                />
                <input
                  type="number"
                  min="1"
                  placeholder="N° persone"
                  value={newReservation.people}
                  onChange={(e) => setNewReservation({ ...newReservation, people: parseInt(e.target.value) })}
                />
                <button type="submit" className="btn-add">
                  <UserPlus size={18} />
                  Aggiungi
                </button>
              </form>

              <div className="items-list">
                {reservations.length === 0 ? (
                  <div className="empty-state">Nessuna prenotazione attiva</div>
                ) : (
                  reservations.map((res) => (
                    <div key={res.character_name} className="item-row">
                      <div className="item-info">
                        <span className="item-name">🎭 {res.character_name}</span>
                        <span className="item-count">
                          <Users size={16} />
                          {res.num_people} {res.num_people === 1 ? 'persona' : 'persone'}
                        </span>
                      </div>
                      <div className="item-actions">
                        <button
                          className="btn-icon"
                          onClick={() => handleUpdateReservation(res.character_name, res.num_people, -1)}
                          disabled={res.num_people <= 1}
                        >
                          -
                        </button>
                        <button
                          className="btn-icon"
                          onClick={() => handleUpdateReservation(res.character_name, res.num_people, 1)}
                          disabled={availableSeats < 1}
                        >
                          +
                        </button>
                        <button
                          className="btn-delete"
                          onClick={() => handleDeleteReservation(res.character_name)}
                        >
                          <UserMinus size={16} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Walk-in Section */}
            <div className="section">
              <h3>🚶 Posti Walk-in Occupati</h3>
              
              <form onSubmit={handleAddWalkin} className="add-form">
                <input
                  type="text"
                  placeholder="Nome character"
                  value={newWalkin.character}
                  onChange={(e) => setNewWalkin({ ...newWalkin, character: e.target.value })}
                />
                <input
                  type="number"
                  min="1"
                  placeholder="N° posti"
                  value={newWalkin.seats}
                  onChange={(e) => setNewWalkin({ ...newWalkin, seats: parseInt(e.target.value) })}
                />
                <button type="submit" className="btn-add">
                  <UserPlus size={18} />
                  Occupa
                </button>
              </form>

              <div className="items-list">
                {walkinSeats.length === 0 ? (
                  <div className="empty-state">Nessun posto walk-in occupato</div>
                ) : (
                  walkinSeats.map((walkin) => (
                    <div key={walkin.character_name} className="item-row">
                      <div className="item-info">
                        <span className="item-name">🎭 {walkin.character_name}</span>
                        <span className="item-count">
                          <Users size={16} />
                          {walkin.num_seats} {walkin.num_seats === 1 ? 'posto' : 'posti'}
                        </span>
                      </div>
                      <div className="item-actions">
                        <button
                          className="btn-icon"
                          onClick={() => handleUpdateWalkin(walkin.character_name, walkin.num_seats, -1)}
                          disabled={walkin.num_seats <= 1}
                        >
                          -
                        </button>
                        <button
                          className="btn-icon"
                          onClick={() => handleUpdateWalkin(walkin.character_name, walkin.num_seats, 1)}
                          disabled={availableWalkin < 1}
                        >
                          +
                        </button>
                        <button
                          className="btn-delete"
                          onClick={() => handleDeleteWalkin(walkin.character_name)}
                        >
                          <UserMinus size={16} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

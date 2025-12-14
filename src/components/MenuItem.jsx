import { useState } from 'react'
import './MenuItem.css'

function MenuItem({ item, index, onAddToCart }) {
  const [showInfo, setShowInfo] = useState(false)

  const animationDelay = index * 0.15

  return (
    <>
      <div 
        className="menu-item"
        style={{ animationDelay: `${animationDelay}s` }}
      >
        <div className="item-header">
          <h4 className="item-name">{item.name}</h4>
          <span className="item-price">€{item.price.toFixed(2)}</span>
        </div>
        
        <p className="item-description">{item.description}</p>
        
        <div className="item-actions">
          <button 
            className="info-button"
            onClick={() => setShowInfo(true)}
          >
            ℹ️ Info
          </button>
          <button 
            className="add-button"
            onClick={() => onAddToCart(item)}
          >
            ➕ Aggiungi
          </button>
        </div>
      </div>

      {showInfo && (
        <div className="modal-overlay" onClick={() => setShowInfo(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>{item.name}</h3>
            <div className="modal-body">
              <p><strong>Ingredienti:</strong></p>
              <p>{item.ingredients}</p>
              
              {item.allergens && item.allergens.length > 0 && (
                <>
                  <p className="allergens-title"><strong>⚠️ Allergeni:</strong></p>
                  <ul className="allergens-list">
                    {item.allergens.map((allergen, i) => (
                      <li key={i}>{allergen}</li>
                    ))}
                  </ul>
                </>
              )}
            </div>
            <button className="close-button" onClick={() => setShowInfo(false)}>
              Chiudi
            </button>
          </div>
        </div>
      )}
    </>
  )
}

export default MenuItem

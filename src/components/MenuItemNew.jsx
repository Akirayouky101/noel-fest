import './MenuItemNew.css'

function MenuItemNew({ item, index, onAddToCart, viewOnly = false }) {
  const animationDelay = index * 0.08

  return (
    <div 
      className="product-card"
      style={{ animationDelay: `${animationDelay}s` }}
      onClick={viewOnly ? () => onAddToCart(item) : undefined}
    >
      <div className="product-info">
        <h3 className="product-name">{item.name}</h3>
        {item.description && (
          <p className="product-description">{item.description}</p>
        )}
        <div className="product-footer">
          <span className="product-price">€{item.price.toFixed(2)}</span>
          {!viewOnly && (
            <button 
              className="add-btn"
              onClick={() => onAddToCart(item)}
            >
              <span className="btn-icon">+</span>
              <span className="btn-text">Aggiungi</span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default MenuItemNew

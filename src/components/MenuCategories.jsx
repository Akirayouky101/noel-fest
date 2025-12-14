import { useState } from 'react'
import MenuItem from './MenuItem'
import { menuData } from '../data/menuData'
import './MenuCategories.css'

function MenuCategories({ onAddToCart }) {
  const [openCategory, setOpenCategory] = useState(null)

  const toggleCategory = (category) => {
    setOpenCategory(openCategory === category ? null : category)
  }

  const categories = [
    { id: 'antipasti', title: '🌟 Antipasti del Regno 🌟', icon: '🌟' },
    { id: 'primi', title: '🍝 Primi della Tavola Rotonda 🍝', icon: '🍝' },
    { id: 'secondi', title: '🍖 Secondi del Castello 🍖', icon: '🍖' },
    { id: 'contorni', title: '🥗 Contorni del Giardino Reale 🥗', icon: '🥗' },
    { id: 'dolci', title: '🍰 Dolci della Pasticceria Reale 🍰', icon: '🍰' },
    { id: 'bevande', title: '🍷 Bevande della Cantina Reale 🍷', icon: '🍷' }
  ]

  return (
    <div className="menu-categories">
      {categories.map((category) => (
        <div key={category.id} className="category">
          <h3 
            className="category-title"
            onClick={() => toggleCategory(category.id)}
          >
            {category.title}
          </h3>
          
          <div className={`items ${openCategory === category.id ? 'open' : ''}`}>
            {openCategory === category.id && menuData[category.id]?.map((item, index) => (
              <MenuItem 
                key={item.id}
                item={item}
                index={index}
                onAddToCart={onAddToCart}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export default MenuCategories

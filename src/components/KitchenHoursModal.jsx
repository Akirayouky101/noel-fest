export default function KitchenHoursModal({ show, onClose }) {
  if (!show) return null

  return (
    <div 
      className="modal-overlay"
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
        padding: '20px'
      }}
    >
      <div 
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'linear-gradient(135deg, #8B0000, #580000)',
          borderRadius: '16px',
          border: '3px solid #FFD700',
          maxWidth: '500px',
          width: '100%',
          padding: '30px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
          textAlign: 'center'
        }}
      >
        <div style={{ fontSize: '4rem', marginBottom: '15px' }}>
          🍽️
        </div>

        <h2 style={{
          color: '#FFD700',
          marginBottom: '15px',
          fontSize: '1.8rem',
          textShadow: '0 2px 4px rgba(0,0,0,0.3)'
        }}>
          Orari Cucina
        </h2>
        
        <div style={{
          background: 'rgba(0, 0, 0, 0.3)',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '20px',
          border: '2px solid rgba(255, 215, 0, 0.3)'
        }}>
          <p style={{
            color: 'white',
            fontSize: '1.1rem',
            lineHeight: '1.6',
            margin: 0
          }}>
            La cucina è aperta dalle <strong style={{ color: '#FFD700' }}>19:00 alle 23:00</strong>.
            <br />
            <br />
            Fuori da questi orari è disponibile solo lo <strong style={{ color: '#FFD700' }}>Street Food</strong>.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '15px',
          marginBottom: '20px'
        }}>
          <div style={{
            background: 'rgba(255, 215, 0, 0.1)',
            borderRadius: '12px',
            padding: '15px',
            border: '2px solid rgba(255, 215, 0, 0.3)'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🍝</div>
            <div style={{ color: '#FFD700', fontWeight: 'bold', marginBottom: '5px' }}>
              Cucina
            </div>
            <div style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '0.95rem' }}>
              19:00 - 23:00
            </div>
          </div>

          <div style={{
            background: 'rgba(255, 215, 0, 0.1)',
            borderRadius: '12px',
            padding: '15px',
            border: '2px solid rgba(255, 215, 0, 0.3)'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🌭</div>
            <div style={{ color: '#FFD700', fontWeight: 'bold', marginBottom: '5px' }}>
              Street Food
            </div>
            <div style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '0.95rem' }}>
              10:00 - 00:00
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          style={{
            width: '100%',
            padding: '15px',
            background: 'linear-gradient(135deg, #FFD700, #FFA500)',
            border: 'none',
            borderRadius: '12px',
            color: '#1a4d2e',
            fontSize: '1.1rem',
            fontWeight: 'bold',
            cursor: 'pointer',
            boxShadow: '0 4px 15px rgba(255, 215, 0, 0.4)',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-2px)'
            e.target.style.boxShadow = '0 6px 20px rgba(255, 215, 0, 0.6)'
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)'
            e.target.style.boxShadow = '0 4px 15px rgba(255, 215, 0, 0.4)'
          }}
        >
          Ho Capito
        </button>
      </div>
    </div>
  )
}

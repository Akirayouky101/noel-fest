import { Canvas } from '@react-three/fiber'
import { OrbitControls, Text } from '@react-three/drei'
import { useState } from 'react'

function Room({ position, color, label, onClick, isActive }) {
  const [hovered, setHovered] = useState(false)
  
  return (
    <group position={position}>
      <mesh
        onClick={onClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <boxGeometry args={[3, 2.5, 3]} />
        <meshStandardMaterial 
          color={hovered || isActive ? '#ffd700' : color}
          emissive={hovered || isActive ? '#ff8800' : '#000000'}
          emissiveIntensity={hovered || isActive ? 0.3 : 0}
        />
      </mesh>
      
      {/* Porta */}
      <mesh position={[0, -0.5, 1.51]}>
        <boxGeometry args={[0.8, 1.5, 0.1]} />
        <meshStandardMaterial color="#3e2723" />
      </mesh>
      
      {/* Label */}
      <Text
        position={[0, 2, 0]}
        fontSize={0.3}
        color="#4a148c"
        anchorX="center"
        anchorY="middle"
      >
        {label}
      </Text>
    </group>
  )
}

function MenuItem3D({ item, position, onClick }) {
  const [hovered, setHovered] = useState(false)
  
  return (
    <group position={position}>
      <mesh
        onClick={onClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <boxGeometry args={[1.5, 1.2, 0.1]} />
        <meshStandardMaterial 
          color={hovered ? '#ffffff' : '#fef5e7'}
          emissive={hovered ? '#ffd700' : '#000000'}
          emissiveIntensity={hovered ? 0.4 : 0}
        />
      </mesh>
      
      <Text
        position={[0, 0.3, 0.06]}
        fontSize={0.15}
        color="#4a148c"
        anchorX="center"
        anchorY="middle"
        maxWidth={1.3}
      >
        {item.name}
      </Text>
      
      <Text
        position={[0, -0.3, 0.06]}
        fontSize={0.2}
        color="#c41e3a"
        anchorX="center"
        anchorY="middle"
      >
        €{item.price.toFixed(2)}
      </Text>
    </group>
  )
}

function Castle3D({ currentRoom, setCurrentRoom, menuData, onAddToCart }) {
  const rooms = [
    { id: 'antipasti', label: '🥗 Antipasti', position: [-8, 0, 0], color: '#8d6e63' },
    { id: 'primi', label: '🍝 Primi', position: [-4, 0, 0], color: '#a1887f' },
    { id: 'secondi', label: '🍖 Secondi', position: [0, 0, 0], color: '#8d6e63' },
    { id: 'contorni', label: '🥬 Contorni', position: [4, 0, 0], color: '#a1887f' },
    { id: 'dolci', label: '🍰 Dolci', position: [8, 0, 0], color: '#8d6e63' },
    { id: 'bevande', label: '🍷 Bevande', position: [0, 0, -4], color: '#795548' },
  ]

  return (
    <Canvas
      camera={{ position: [0, 5, 15], fov: 60 }}
      style={{ background: 'linear-gradient(to bottom, #1a237e 0%, #4a148c 100%)' }}
    >
      {/* Luci */}
      <ambientLight intensity={0.6} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, 10, -10]} intensity={0.5} />
      <pointLight position={[0, 15, 0]} intensity={0.8} color="#ffd700" />

      {/* Controlli */}
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={5}
        maxDistance={30}
        maxPolarAngle={Math.PI / 2}
      />

      {/* Pavimento */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.3, 0]}>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial color="#4e342e" />
      </mesh>

      {currentRoom === 'entrance' ? (
        <>
          {/* Mostra tutte le stanze */}
          {rooms.map((room) => (
            <Room
              key={room.id}
              position={room.position}
              color={room.color}
              label={room.label}
              onClick={() => setCurrentRoom(room.id)}
              isActive={false}
            />
          ))}

          {/* Titolo centrale */}
          <Text
            position={[0, 4, 0]}
            fontSize={0.8}
            color="#ffd700"
            anchorX="center"
            anchorY="middle"
          >
            🏰 Castello di Re Agrifoglio 🏰
          </Text>
          
          <Text
            position={[0, 3, 0]}
            fontSize={0.3}
            color="#ffffff"
            anchorX="center"
            anchorY="middle"
          >
            Clicca su una stanza per entrare
          </Text>
        </>
      ) : (
        <>
          {/* Vista della stanza selezionata */}
          <group>
            {/* Pareti della stanza */}
            <mesh position={[0, 1, -4]}>
              <boxGeometry args={[8, 4, 0.2]} />
              <meshStandardMaterial color="#6d4c41" />
            </mesh>
            <mesh position={[0, 1, 4]}>
              <boxGeometry args={[8, 4, 0.2]} />
              <meshStandardMaterial color="#6d4c41" />
            </mesh>
            <mesh position={[-4, 1, 0]}>
              <boxGeometry args={[0.2, 4, 8]} />
              <meshStandardMaterial color="#795548" />
            </mesh>
            <mesh position={[4, 1, 0]}>
              <boxGeometry args={[0.2, 4, 8]} />
              <meshStandardMaterial color="#795548" />
            </mesh>

            {/* Items del menu */}
            {menuData[currentRoom]?.map((item, index) => {
              const cols = 3
              const rows = Math.ceil(menuData[currentRoom].length / cols)
              const col = index % cols
              const row = Math.floor(index / cols)
              const x = (col - 1) * 2
              const y = 2.5 - row * 1.5
              const z = -3.8

              return (
                <MenuItem3D
                  key={item.id}
                  item={item}
                  position={[x, y, z]}
                  onClick={() => onAddToCart(item)}
                />
              )
            })}

            {/* Titolo stanza */}
            <Text
              position={[0, 3.5, -3.8]}
              fontSize={0.4}
              color="#ffd700"
              anchorX="center"
              anchorY="middle"
            >
              {rooms.find(r => r.id === currentRoom)?.label}
            </Text>
          </group>
        </>
      )}

      {/* Stelle di sfondo */}
      {[...Array(100)].map((_, i) => (
        <mesh
          key={i}
          position={[
            (Math.random() - 0.5) * 100,
            Math.random() * 50 + 10,
            (Math.random() - 0.5) * 100
          ]}
        >
          <sphereGeometry args={[0.1, 8, 8]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      ))}
    </Canvas>
  )
}

export default Castle3D

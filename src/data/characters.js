// Lista personaggi del Bosco Incantato e Re Agrifoglio
export const fairytaleCharacters = [
  // Re Agrifoglio e la sua corte
  "Re Agrifoglio",
  "Regina Stella Cometa",
  "Principe Vischio",
  "Principessa Bacca Rossa",
  
  // Fate e Spiriti
  "Fata Cristallo di Neve",
  "Fata Brina Argentata",
  "Spirito del Bosco",
  "Guardiano della Foresta",
  
  // Elfi e Folletti
  "Elfo Campanellino",
  "Elfo Aghi di Pino",
  "Folletto Muschio Verde",
  "Folletto Corteccia",
  
  // Animali del Bosco
  "Renna Zampa Veloce",
  "Scoiattolo Nocciola",
  "Gufo Saggio",
  "Volpe Argentata",
  "Cervo Corna d'Oro",
  "Coniglio Fiocco di Neve",
  
  // Gnomi e Nani
  "Gnomo Barba Bianca",
  "Gnomo Cappello Rosso",
  "Nano Scintilla",
  "Nano Tintinnio",
  
  // Personaggi Magici
  "Mago Inverno",
  "Strega Benevolente",
  "Drago di Ghiaccio",
  "Unicorno Lunare",
  
  // Altri abitanti
  "Candela Danzante",
  "Fiamma Fatata",
  "Stella Cadente",
  "Aurora Boreale",
  "Vento del Nord",
  "Eco della Neve"
]

// Funzione per ottenere un personaggio casuale
export const getRandomCharacter = () => {
  const index = Math.floor(Math.random() * fairytaleCharacters.length)
  return fairytaleCharacters[index]
}

// Funzione per verificare se un personaggio è già usato (opzionale)
export const isCharacterAvailable = (characterName, usedCharacters = []) => {
  return !usedCharacters.includes(characterName)
}

// Ottieni un personaggio unico non ancora usato
export const getUniqueCharacter = (usedCharacters = []) => {
  const available = fairytaleCharacters.filter(char => !usedCharacters.includes(char))
  if (available.length === 0) {
    // Se tutti i personaggi sono usati, ricomincia con suffisso numerico
    return `${getRandomCharacter()} ${Math.floor(Math.random() * 1000)}`
  }
  const index = Math.floor(Math.random() * available.length)
  return available[index]
}

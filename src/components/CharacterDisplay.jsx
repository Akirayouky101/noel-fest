import './CharacterDisplay.css'

function CharacterDisplay({ character }) {
  return (
    <div className="character-display">
      <p>Il tuo ordine sarà identificato come:</p>
      <h2 className="character-name">{character}</h2>
      <p className="character-hint">Ricorda questo nome per ritirare il tuo ordine!</p>
    </div>
  )
}

export default CharacterDisplay

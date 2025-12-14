# 🚶 Sistema Walk-in - Documentazione Completa

## 📋 Panoramica

Sistema a **doppia capacità** per gestire sia prenotazioni online che clienti walk-in (senza prenotazione).

### Capacità Totali
- **150 posti prenotabili** (per ordini "Prenota Posto")
- **100 posti walk-in** (per clienti in cassa senza prenotazione)

---

## 🎯 Logica del Sistema

### Priorità automatica
Quando si usa il pulsante "Occupa Walk-in":

1. **Prima scelta**: Se ci sono posti disponibili nei 150 prenotabili → li usa
2. **Seconda scelta**: Se i 150 sono pieni → usa i 100 walk-in
3. **Errore**: Se entrambe le capacità sono piene → messaggio di errore

### Vantaggi
- **Ottimizzazione**: Massimizza l'uso dei posti prenotabili
- **Flessibilità**: 100 posti di riserva per emergenze/picchi
- **Trasparenza**: Admin vede chiaramente entrambe le disponibilità

---

## 🖥️ Pannello Admin

### Statistiche
Due card separate nel dashboard:

**🪑 Posti Prenotabili: X/150**
- Verde: >20 posti liberi
- Giallo: <20 posti liberi
- Rosso: 0 posti liberi

**🚶 Posti Walk-in: X/100**
- Blu: >20 posti liberi
- Giallo: <20 posti liberi
- Rosso: 0 posti liberi

### Pulsanti nelle Card Ordine

**🚶 Occupa Walk-in**
- Appare solo per: `orderType === 'immediate'` E `num_people > 1`
- Apre modal con visualizzazione disponibilità entrambe le capacità
- Colore blu (#0d6efd) per differenziarlo dagli altri pulsanti

**🚶 Libera Walk-in**
- Appare solo se il personaggio ha posti walk-in occupati
- Libera immediatamente i posti walk-in
- Colore blu (#0d6efd)

**🪑 Libera Posti**
- Appare solo se il personaggio ha prenotazione attiva
- Libera i posti prenotabili (150)
- Colore azzurro (#17a2b8)

---

## 🗄️ Database

### Nuova Tabella: `walkin_seats`

```sql
CREATE TABLE walkin_seats (
    id INT AUTO_INCREMENT PRIMARY KEY,
    character_name VARCHAR(100) NOT NULL,
    num_people INT NOT NULL,
    status ENUM('occupied', 'freed') DEFAULT 'occupied',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    freed_at DATETIME NULL,
    INDEX idx_status (status),
    INDEX idx_character (character_name)
);
```

### Configurazione: `system_config`

```sql
INSERT INTO system_config (config_key, config_value) 
VALUES ('walkin_seats', '100');
```

---

## 🔌 API Endpoint: `/api/walkin-seats.php`

### GET - Disponibilità
```javascript
// Semplice
fetch('/api/walkin-seats.php')
// Risposta: { success: true, total: 100, occupied: 15, available: 85 }

// Con dettagli personaggi
fetch('/api/walkin-seats.php?details=1')
// Risposta: { ..., characters: ['Biancaneve', 'Cenerentola'] }
```

### POST - Occupa posti
```javascript
fetch('/api/walkin-seats.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        character_name: 'Biancaneve',
        num_people: 4
    })
})
// Risposta: { success: true, id: 123 }
```

### PUT - Libera posti
```javascript
fetch('/api/walkin-seats.php', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        character_name: 'Biancaneve'
    })
})
// Risposta: { success: true, rows_affected: 1 }
```

### DELETE - Elimina record
```javascript
fetch('/api/walkin-seats.php', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        character_name: 'Biancaneve'
    })
})
// Risposta: { success: true, rows_deleted: 1 }
```

---

## ⚡ Funzionalità Automatiche

### Liberazione Automatica Posti Walk-in

I posti walk-in vengono liberati automaticamente quando:

1. **Annulla Ordine**: Status → 'cancelled'
2. **Elimina Ordine**: Rimozione completa dell'ordine

**NON vengono liberati quando:**
- Status → 'completed' (tavolo ancora occupato, clienti mangiano)
- Status → 'preparing' (ordine in corso)

### Polling Real-time
Il sistema aggiorna ogni **5 secondi**:
- Lista ordini
- Posti prenotabili disponibili (150)
- Posti walk-in disponibili (100)
- Lista personaggi con prenotazioni attive
- Lista personaggi con walk-in attivi

---

## 🧪 Test del Sistema

### File di Test: `test_walkin.php`

Testa tutte le funzionalità walk-in:
1. ✅ GET disponibilità
2. ✅ POST occupa posti
3. ✅ GET con dettagli personaggi
4. ✅ PUT libera posti
5. ✅ DELETE elimina record

**URL Test**: `https://noelfest.appdataconnect.it/test_walkin.php`

---

## 📦 Deployment

### File da caricare su server

```
/api/walkin-seats.php          ← Nuovo endpoint
/assets/index-Bjn_GWlA.js      ← Build aggiornata (200.75 kB)
/assets/index-CePPvvK7.css     ← Stili
/create_tables.sql             ← Schema database aggiornato
/test_walkin.php               ← Test API
/index.html                    ← HTML principale
```

### Esecuzione SQL
1. Accedi al database `dbgxaxaie7pbze`
2. Esegui `create_tables.sql` per creare `walkin_seats`
3. Verifica con query: `SELECT * FROM system_config WHERE config_key = 'walkin_seats'`

---

## 🎨 Design & UX

### Colori Walk-in
- **Pulsanti**: `#0d6efd` (blu Bootstrap)
- **Card statistica**: `#e7f1ff` (sfondo azzurro chiaro)
- **Bordi**: `#0d6efd`

### Modal Walk-in
```
┌─────────────────────────────────┐
│  🚶 Occupa Posti Walk-in        │
├─────────────────────────────────┤
│  Ordine di: Biancaneve          │
│  Numero posti: 4                │
│                                 │
│  ┌──────────────────────────┐  │
│  │ 🪑 Prenotabili: 75/150   │  │
│  │ 🚶 Walk-in: 92/100       │  │
│  └──────────────────────────┘  │
│                                 │
│  💡 Logica automatica:          │
│  Prima usa i 150, poi i 100     │
│                                 │
│  [Annulla] [🚶 Conferma]       │
└─────────────────────────────────┘
```

---

## 🔧 Funzioni Chiave Admin.jsx

### State Management
```javascript
const [walkinSeats, setWalkinSeats] = useState({ total: 100, occupied: 0 })
const [walkinModal, setWalkinModal] = useState({ show: false, order: null, numSeats: 1 })
const [activeWalkinCharacters, setActiveWalkinCharacters] = useState(new Set())
```

### Funzioni Principali
- `loadWalkinSeats()` - Carica disponibilità e personaggi attivi
- `confirmOccupyWalkin()` - Gestisce occupazione con priorità automatica
- `freeWalkinSeatsForCharacter()` - Libera posti di un personaggio
- Chiamate automatiche in `deleteOrder()` e `updateOrderStatus()`

---

## ✅ Checklist Pre-Test

Prima di iniziare i test:

- [ ] Database: Eseguito `create_tables.sql`
- [ ] Tabella `walkin_seats` creata
- [ ] Config `walkin_seats = 100` inserita
- [ ] File `walkin-seats.php` caricato in `/api/`
- [ ] Build React caricata (`index-Bjn_GWlA.js`)
- [ ] Test `test_walkin.php` accessibile

---

## 🐛 Troubleshooting

### Pulsante "Occupa Walk-in" non appare
- ✅ Verifica: `orderType === 'immediate'`
- ✅ Verifica: `num_people > 1`

### API non risponde
- ✅ Controlla: `db_config.php` corretto
- ✅ Verifica: `getDbConnection()` presente in `walkin-seats.php`
- ✅ Test: Apri `test_walkin.php` nel browser

### Contatore walk-in sempre a 0
- ✅ Verifica query: `SELECT * FROM walkin_seats WHERE status='occupied'`
- ✅ Check: Polling attivo (5 secondi)
- ✅ Console: `loadWalkinSeats()` senza errori

---

## 📊 Statistiche Build

```
Build: index-Bjn_GWlA.js
Dimensione: 200.75 kB
Gzipped: 62.06 kB
Tempo build: 309ms
Moduli: 43
```

**Incremento rispetto a build precedente**: +1.13 kB (walk-in system)

---

## 🚀 Prossimi Passi

1. **Test completo** con `test_walkin.php`
2. **Verifica** occupazione/liberazione posti
3. **Simulazione** scenario completo:
   - Ordine immediato con 4 persone
   - Occupa walk-in → usa 150 se disponibili
   - Se 150 pieni → usa 100
   - Annulla → posti liberati automaticamente
4. **Deploy** su https://noelfest.appdataconnect.it
5. **Training** utenti su nuovo flusso walk-in

---

**Versione**: 2.0 - Sistema Walk-in
**Data**: 17 Novembre 2025
**Build**: index-Bjn_GWlA.js

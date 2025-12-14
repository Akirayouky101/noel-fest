# 🎄 Noel Fest - Sistema Prenotazione Posti

## 📋 ISTRUZIONI DEPLOYMENT

### 1. CARICA I FILE
Carica tutti i file di questa cartella su **noelfest.appdataconnect.it**:
- `index.html`
- `assets/` (cartella completa)
- `api/` (cartella completa)
- `images/` (cartella completa)
- `.htaccess`
- `create_tables.sql`

### 2. CONFIGURAZIONE DATABASE
1. Accedi a phpMyAdmin del tuo hosting
2. Apri il database `dbgxaxaie7pbze`
3. Esegui le query in `create_tables.sql` per creare/aggiornare le tabelle:
   - `orders` (con nuovo schema: character_name, email, num_people, order_type)
   - `seat_reservations` (nuova tabella per prenotazioni posti)
   - `system_config` (configurazione totale posti = 150)

### 3. VERIFICA API
Controlla che `api/db_config.php` abbia le credenziali corrette:
```php
$host = 'localhost';
$dbname = 'dbgxaxaie7pbze';
$username = 'xxxxx'; // Verifica
$password = 'xxxxx'; // Verifica
```

### 4. QR CODE
Il sistema usa UN SOLO QR CODE per tutti gli utenti:
- URL: `https://noelfest.appdataconnect.it`
- Non servono più QR per tavoli specifici

---

## 🆕 COSA È CAMBIATO

### VECCHIO SISTEMA ❌
- 200 tavoli con QR specifici
- Session token per tracciare sessioni multiple
- Sistema di lock con 2 operatori cassa
- Vista tavoli con griglia 200 elementi

### NUOVO SISTEMA ✅
- **Nome Personaggio Casuale**: Ad ogni scan QR viene assegnato un personaggio del Bosco Incantato (32 personaggi disponibili)
- **150 Posti Totali**: Sistema di prenotazione posti globale
- **Due Modalità di Ordine**:
  1. **Ordina Subito** (immediate): Ordine diretto senza prenotazione posto
  2. **Prenota Posto** (at_register): Prenota posto + ordina dopo

### FLUSSO UTENTE
1. Scansiona QR → Assegnazione nome personaggio
2. Scegli modalità (Ordina Subito / Prenota Posto)
3. Inserisci email + numero persone (se prenota)
4. Visualizza schermata personaggio (SCREENSHOT da mostrare in cassa!)
5. Accedi al menù e ordina

### ADMIN PANEL
- URL: `https://noelfest.appdataconnect.it/admin`
- Vista unica con lista ordini
- Ogni ordine mostra:
  * Nome personaggio
  * Email
  * Numero persone
  * Tipo ordine (Immediato/Con Prenotazione)
- Rimossi: Vista tavoli, griglia 200 elementi

---

## 📁 STRUTTURA FILE

```
Ultimate/
├── index.html                    # App React compilata
├── .htaccess                     # React Router + Anti-cache
├── create_tables.sql             # Schema database
├── assets/
│   ├── index-J0iKPIAE.css       # Stili (26.26KB)
│   └── index-Rt8Z_exO.js        # App JS (184.04KB)
├── api/
│   ├── db_config.php            # Configurazione DB
│   ├── orders.php               # CRUD ordini
│   ├── seats.php                # Contatore posti disponibili
│   └── reservations.php         # CRUD prenotazioni posti
└── images/
    └── [immagini del progetto]
```

---

## 🗃️ TABELLE DATABASE

### `orders`
```sql
- id (INT, PK)
- character_name (VARCHAR 255)    -- Nome personaggio
- email (VARCHAR 255)             -- Email utente
- num_people (INT)                -- Numero persone
- order_type (ENUM)               -- 'immediate' o 'at_register'
- items (TEXT JSON)               -- Articoli ordinati
- notes (TEXT)
- total (DECIMAL 10,2)
- status (ENUM)                   -- 'pending', 'preparing', 'completed', 'cancelled'
- timestamp (DATETIME)
```

### `seat_reservations`
```sql
- id (INT, PK)
- character_name (VARCHAR 255)
- email (VARCHAR 255)
- num_people (INT)
- status (ENUM)                   -- 'active', 'completed', 'cancelled'
- created_at (DATETIME)
```

### `system_config`
```sql
- config_key (VARCHAR 100, PK)    -- 'total_seats'
- config_value (VARCHAR 255)      -- '150'
```

---

## 🎨 PERSONAGGI DISPONIBILI

32 personaggi del Bosco Incantato:
- Re Agrifoglio
- Regina Stella Cometa
- Principe Vischio
- Principessa Bacca Rossa
- Fata Cristallo di Neve
- Elfo Campanellino
- Renna Zampa Veloce
- Gufo Saggio
- ... e altri 24

---

## ⚙️ API ENDPOINTS

### GET `/api/orders.php`
Recupera tutti gli ordini

### POST `/api/orders.php`
Crea nuovo ordine
```json
{
  "character": "Re Agrifoglio",
  "email": "utente@email.com",
  "num_people": 2,
  "order_type": "at_register",
  "items": [...],
  "notes": "...",
  "total": 25.50
}
```

### PUT `/api/orders.php`
Aggiorna stato ordine

### DELETE `/api/orders.php`
Elimina ordine

### GET `/api/seats.php`
Restituisce posti disponibili
```json
{
  "total": 150,
  "occupied": 32,
  "available": 118
}
```

### POST `/api/reservations.php`
Crea prenotazione posto

---

## 🔧 MIGRAZIONE DA VECCHIO SISTEMA

Se hai già dati nel database:
1. Esegui le ALTER TABLE in `create_tables.sql` (sezione migrazione)
2. Elimina tabelle vecchie: `reservations`, `operators`
3. Crea nuove tabelle: `seat_reservations`, `system_config`

---

## 📱 TEST LOCALE

```bash
npm run dev
```
Apri http://localhost:5173

---

## 🎯 BUILD PRODUCTION

```bash
npm run build
```

Output in `dist/` → Copia tutto in `Ultimate/`

---

## ✅ CHECKLIST PRE-DEPLOY

- [ ] Database aggiornato con nuove tabelle
- [ ] `db_config.php` con credenziali corrette
- [ ] File `.htaccess` presente
- [ ] Cartella `api/` caricata con permessi PHP
- [ ] Test QR code funzionante
- [ ] Admin panel accessibile a `/admin`
- [ ] Contatore posti si aggiorna in real-time
- [ ] Modali personaggio mostrano nome corretto

---

## 🆘 SUPPORTO

Build: vite 5.4.21
React: 18.3.1
Tempo build: ~300ms
CSS: 26.26KB gzip
JS: 58.60KB gzip

Data build: Corrente
Sistema: Character-based seat reservation

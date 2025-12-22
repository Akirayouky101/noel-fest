# 🤖 AGENT BACKUP - CONTEXT COMPLETO NOEL FEST 2025

> **IMPORTANTE**: Questo file contiene TUTTO il contesto necessario per riprendere il progetto senza dover rispiegare da capo. Da leggere PRIMA di qualsiasi modifica futura.

---

## 📋 INDICE RAPIDO
1. [Stato Progetto](#stato-progetto)
2. [Architettura Tecnica](#architettura-tecnica)
3. [Funzionalità Implementate](#funzionalità-implementate)
4. [Problemi Risolti](#problemi-risolti)
5. [Setup per Elf Fest](#setup-per-elf-fest)
6. [Credenziali & Accessi](#credenziali--accessi)

---

## 🎯 STATO PROGETTO

### Stato Attuale (22 Dicembre 2025)
- ✅ **Evento Noel Fest 2025**: CONCLUSO
- ✅ **Deployment Vercel**: DISATTIVATO (progetto eliminato)
- ✅ **Codice**: Archiviato in branch `noel-fest-2025-archive`
- ✅ **GitHub**: Repository attivo (Akirayouky101/noel-fest)
- ✅ **Backup HDD**: Fatto (senza node_modules)
- ⚠️ **Supabase**: ANCORA ATTIVO (può essere messo in pausa)

### Prossimo Obiettivo
**ELF FEST 2026** - Riutilizzo di questo progetto con nuovo branding

---

## 🏗️ ARCHITETTURA TECNICA

### Stack Tecnologico
```
Frontend: React 18 + Vite 5.4.21
Router: React Router DOM v6.28.0
Database: Supabase (PostgreSQL)
Auth: Supabase Auth
Real-time: Supabase Realtime WebSocket
Email: Custom email service
Deployment: Vercel (attualmente DISATTIVATO)
Repository: GitHub
```

### Struttura File Principale
```
NoelReact/
├── src/
│   ├── pages/
│   │   ├── MenuNew.jsx          # MENU PRINCIPALE UTENTE
│   │   └── AdminKanban.jsx      # PANNELLO ADMIN COMPLETO
│   ├── components/
│   │   ├── Cart.jsx             # Carrello ordini
│   │   ├── SessionSelectionModal.jsx
│   │   ├── MenuItemNew.jsx
│   │   ├── SeatsManager.jsx     # Gestione posti
│   │   └── AnalyticsDashboard.jsx
│   ├── data/
│   │   ├── menuData.js          # DATI MENU (prodotti)
│   │   └── characters.js        # 50 nomi fantasy
│   ├── lib/
│   │   ├── supabase.js          # Client Supabase
│   │   ├── supabaseAPI.js       # API functions
│   │   └── emailService.js      # Invio email
│   └── App.jsx                  # Router principale
├── public/
│   └── images/                  # Immagini prodotti
├── supabase/
│   └── schema.sql               # Schema database
├── package.json
├── vite.config.js
├── ARCHIVIO_NOEL_FEST_2025.md  # Documentazione completa
└── AGENTBACKUP.md              # QUESTO FILE
```

---

## ⚙️ FUNZIONALITÀ IMPLEMENTATE

### 🎫 LATO UTENTE (MenuNew.jsx)

#### 1. Modalità di Accesso
```javascript
// 3 modalità implementate:
1. "Prenota Posto" (at_register)
   - Scegli sessione (pranzo/cena)
   - Scegli data e orario
   - Numero persone
   - Email obbligatoria
   - Ordina OPPURE solo "Occupa Posti"

2. "Ordine Immediato" (immediate)
   - Solo ordine, ritiro in cassa
   - NO prenotazione posti
   - Email obbligatoria

3. "Vedi Menù" (view_only)
   - Esplorazione prodotti
   - NO ordini, NO prenotazioni
   - NO email richiesta
```

#### 2. Sistema Menu
```javascript
// menuData.js - Struttura dati
{
  antipasti: [...],
  primi: [...],
  secondi: [...],
  contorni: [...],
  dolci: [...],
  bevande: [...],
  streetfood: {
    panini: [...],
    fritti: [...],
    golosoni: [...],
    bevande_street: [...]
  }
}

// Ogni prodotto:
{
  id: "unique_id",
  name: "Nome Prodotto",
  price: 5.00,
  description: "Descrizione",
  image: "/images/filename.jpg",
  allergens: ["glutine", "lattosio", ...]
}
```

#### 3. Caratteristiche Speciali
- **Caratteri Casuali**: Ogni utente riceve nome fantasy (Elfo Campanellino, Cervo Corna d'Oro, ecc.)
- **Contatore Posti**: NASCOSTO agli utenti (per non scoraggiarli), visibile solo in admin
- **Orari Cucina**: 19:00 - 23:00 (controllo automatico)
- **Orari Street Food**: 10:00 - 00:00
- **Coperto Automatico**: €1.50/persona aggiunto al totale
- **Email Conferma**: Automatica dopo ordine/prenotazione

#### 4. Funzione "Occupa Posti"
```javascript
// Solo per prenotazioni (at_register)
// Permette di occupare posti SENZA ordinare
// Utile per: "vengo a mangiare ma ordino in loco"
// Crea record in active_reservations con email
```

---

### 🔧 LATO ADMIN (AdminKanban.jsx)

#### 1. Kanban Ordini
```javascript
// 3 colonne drag & drop:
- PENDING (in attesa)
- PREPARING (in preparazione)
- COMPLETED (completato)

// Filtri disponibili:
- Ricerca per nome personaggio
- Sessione (immediate/lunch/dinner)
- Data (today/yesterday/week/all)
```

#### 2. Gestione Prenotazioni
```javascript
// Tab dedicato "Prenotazioni"
// Due tipi:
1. Con ordini: Hanno già ordinato
2. Solo posti: Solo prenotazione, NO ordine

// Funzione speciale: "Crea Ordine Ora"
// Da prenotazione solo posti → ordine completo
// Flow:
1. Click su prenotazione solo posti
2. Button "🛒 Crea Ordine Ora"
3. Naviga a MenuNew in "modalità admin"
4. Dati pre-popolati (nome, email, persone, sessione)
5. Admin aggiunge prodotti
6. Conferma ordine
7. Elimina prenotazione automaticamente
8. Torna al pannello admin
```

#### 3. Dashboard Analytics
- Revenue totale
- Prodotti più venduti
- Grafici ordini
- Statistiche sessioni

#### 4. Gestione Posti
```javascript
// Sistema posti:
- 150 posti prenotabili (active_reservations)
- Sistema walk-in separato
- Contatore real-time
- Visualizzazione admin

// RPC Function Supabase:
get_available_seats() → calcolo automatico
```

#### 5. Real-time Updates
```javascript
// Supabase Realtime:
- Nuovo ordine → suono notifica
- Aggiornamento automatico Kanban
- Sincronizzazione multi-device
- WebSocket connection

// Notifica audio:
public/notification.mp3
```

---

## 🗄️ DATABASE SUPABASE

### Schema Tabelle Principali

#### 1. orders
```sql
CREATE TABLE orders (
  id BIGSERIAL PRIMARY KEY,
  character_name VARCHAR(100) NOT NULL,
  email VARCHAR(255),
  num_people INTEGER DEFAULT 1,
  order_type VARCHAR(20), -- 'immediate', 'at_register'
  session_type VARCHAR(20), -- 'immediate', 'lunch', 'dinner'
  session_date VARCHAR(50),
  session_time VARCHAR(50),
  items JSONB NOT NULL, -- Array di prodotti
  total DECIMAL(10,2),
  status VARCHAR(20) DEFAULT 'pending',
  arrival_group_id UUID,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT
);
```

#### 2. active_reservations
```sql
CREATE TABLE active_reservations (
  id BIGSERIAL PRIMARY KEY,
  character_name VARCHAR(100) UNIQUE NOT NULL,
  num_people INTEGER NOT NULL,
  email VARCHAR(255),
  session_type VARCHAR(20),
  session_date VARCHAR(50),
  session_time VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- IMPORTANTE: character_name è UNIQUE
-- Previene prenotazioni duplicate
```

#### 3. walkin_seats
```sql
CREATE TABLE walkin_seats (
  id BIGSERIAL PRIMARY KEY,
  character_name VARCHAR(100) UNIQUE,
  num_people INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 4. system_settings
```sql
CREATE TABLE system_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  total_seats INTEGER DEFAULT 150,
  walkin_seats INTEGER DEFAULT 50,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Funzioni RPC

#### get_available_seats()
```sql
CREATE OR REPLACE FUNCTION get_available_seats()
RETURNS JSON AS $$
DECLARE
  total_seats INTEGER;
  occupied_seats INTEGER;
BEGIN
  SELECT COALESCE(total_seats, 150) INTO total_seats 
  FROM system_settings WHERE id = 1;
  
  SELECT COALESCE(SUM(num_people), 0) INTO occupied_seats
  FROM active_reservations;
  
  RETURN json_build_object(
    'total', total_seats,
    'occupied', occupied_seats,
    'available', total_seats - occupied_seats
  );
END;
$$ LANGUAGE plpgsql;
```

---

## 🐛 PROBLEMI RISOLTI (HISTORY)

### Problema 1: Duplicate Key Error (23505)
```javascript
// SINTOMO: "duplicate key violates unique constraint"
// CAUSA: In modalità admin, tentava di creare prenotazione esistente
// SOLUZIONE:
if (orderType === 'at_register' && sessionData && !adminData) {
  try {
    await createReservation(...)
  } catch (error) {
    if (error.code === '23505') {
      console.log('⚠️ Prenotazione già esistente, procedo')
      // Non blocca l'ordine
    }
  }
}
```

### Problema 2: Navigazione Admin → Menu (Crash "C is not a function")
```javascript
// SINTOMO: Crash durante navigate() da admin a menu
// CAUSA: React Router location.state non affidabile
// SOLUZIONE: Uso sessionStorage invece di location.state

// AdminKanban.jsx:
sessionStorage.setItem('adminOrderData', JSON.stringify(data))
window.location.href = '/'  // Hard reload invece di navigate()

// MenuNew.jsx:
const adminData = JSON.parse(sessionStorage.getItem('adminOrderData'))
sessionStorage.removeItem('adminOrderData') // Cleanup
```

### Problema 3: Prenotazione Creata Troppo Presto
```javascript
// SINTOMO: Prenotazione creata prima dell'ordine completato
// CAUSA: createReservation chiamata prima di submitOrder
// SOLUZIONE: Spostata in submitOrder, condizionata a !adminData
```

### Problema 4: Contatore Posti Scoraggiante
```javascript
// SINTOMO: Utenti vedevano "12 posti disponibili" e si scoraggiavano
// CAUSA: Contatore visibile in WelcomeModal
// SOLUZIONE: Commentato in MenuNew.jsx linee 815-817
{/* <p className="seats-info">
  🪑 <strong>{availableSeats}</strong> posti disponibili
</p> */}
// Visibile solo in admin
```

### Problema 5: AdminOrderModal Layout Issues
```javascript
// SINTOMO: Modal admin con 45+ prodotti ammassati, solo 4 streetfood
// CAUSA: Componente custom con layout non scalabile
// SOLUZIONE: ELIMINATO AdminOrderModal
// Riutilizzo MenuNew.jsx esistente con modalità admin
// Vantaggi:
// - Stesso UI testato
// - Gestisce bene tanti prodotti
// - No duplicazione codice
// - Manutenzione ridotta
```

---

## 🚀 SETUP PER ELF FEST 2026

### Step 1: Ripristino Progetto
```bash
# Da HDD o da GitHub
cd /percorso/al/backup

# Se da GitHub:
git clone https://github.com/Akirayouky101/noel-fest.git
cd noel-fest
git checkout noel-fest-2025-archive
git checkout -b elf-fest-2026

# Installa dipendenze
npm install
```

### Step 2: Rebranding
```javascript
// File da modificare:

1. package.json
   "name": "noel-react" → "elf-fest"

2. index.html
   <title>Noel Fest</title> → <title>Elf Fest</title>

3. MenuNew.jsx
   - Linea ~810: "Benvenuto al Noel Fest" → "Benvenuto al Elf Fest"
   - Linea ~811: "Il Bosco Incantato di Re Agrifoglio" → nuovo subtitle

4. AdminKanban.jsx
   - Header: "Noel Fest Admin" → "Elf Fest Admin"

5. menuData.js
   - Aggiorna prodotti se necessario
   - Cambia descrizioni tematiche

6. characters.js (opzionale)
   - Cambia tema nomi: da natalizio a elfi
   - Esempio: "Elfo Verdebosco", "Fata Argentea", ecc.

7. CSS (opzionale)
   - Cambia colori tema
   - Rosso/Oro → Verde/Oro (o altro)
```

### Step 3: Database

#### Opzione A: Pulire Database Esistente
```sql
-- Backup prima!
TRUNCATE TABLE orders;
TRUNCATE TABLE active_reservations;
TRUNCATE TABLE walkin_seats;
-- Schema rimane identico
```

#### Opzione B: Nuovo Database Supabase
```bash
1. Crea nuovo progetto Supabase "elf-fest"
2. Esegui supabase/schema.sql
3. Aggiorna .env con nuove credenziali
```

### Step 4: Configurazione .env
```bash
# .env
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJxxxx...
VITE_EMAIL_SERVICE_URL=https://xxx  # Se cambia
```

### Step 5: Test Locale
```bash
npm run dev
# Apri http://localhost:5173
# Testa:
# - Prenotazioni
# - Ordini
# - Admin panel
# - Email (se configurato)
```

### Step 6: Deploy Vercel
```bash
npm run build

# Se non hai vercel CLI:
npm i -g vercel

vercel login
vercel --prod

# Configura dominio: elf-fest.vercel.app
```

---

## 🔐 CREDENZIALI & ACCESSI

### Supabase (Noel Fest - da verificare se ancora attivo)
```
Project ID: iglgrggtrozuhiszxyws
URL: https://iglgrggtrozuhiszxyws.supabase.co
Anon Key: Vedi .env (NON committare mai!)
Service Role: Solo per admin operations
```

### Vercel
```
Account: Akirayouky101
Progetto "noel-react": ELIMINATO (22 dic 2025)
Nuovo progetto: Creare "elf-fest"
```

### GitHub
```
Repository: https://github.com/Akirayouky101/noel-fest
Branch Main: Codice base (con notice archivio)
Branch Archive: noel-fest-2025-archive (codice completo evento)
Branch Futuro: elf-fest-2026 (da creare)
```

### Email Service
```
Servizio: Custom (emailService.js)
API: Da configurare
Template: HTML custom in emailService.js
```

---

## 📊 DATI & ANALYTICS

### Dati da Esportare Prima di Pulire DB

```sql
-- Export ordini completi
COPY (
  SELECT * FROM orders 
  ORDER BY timestamp DESC
) TO '/tmp/noel_fest_orders.csv' CSV HEADER;

-- Export prenotazioni
COPY (
  SELECT * FROM active_reservations 
  ORDER BY created_at DESC
) TO '/tmp/noel_fest_reservations.csv' CSV HEADER;

-- Statistiche prodotti venduti
SELECT 
  items->>'name' as product_name,
  items->>'price' as price,
  SUM((items->>'quantity')::integer) as total_sold,
  SUM((items->>'price')::numeric * (items->>'quantity')::integer) as revenue
FROM orders, 
     jsonb_array_elements(items) as items
WHERE status = 'completed'
GROUP BY items->>'name', items->>'price'
ORDER BY total_sold DESC;

-- Revenue totale
SELECT 
  SUM(total) as total_revenue,
  COUNT(*) as total_orders,
  AVG(total) as avg_order_value
FROM orders
WHERE status = 'completed';
```

---

## 🎨 PERSONALIZZAZIONI SPECIFICHE

### Sistema Caratteri Casuali
```javascript
// characters.js - 50 nomi fantasy
export function getRandomCharacter() {
  const characters = [
    "Elfo Campanellino",
    "Cervo Corna d'Oro",
    "Fata Cristallina",
    // ... 47 altri
  ];
  return characters[Math.floor(Math.random() * characters.length)];
}

// Chiamato in MenuNew.jsx quando utente inizia flow
// Salvato in localStorage per persistenza sessione
```

### Email Automatiche
```javascript
// emailService.js - sendOrderConfirmationEmail()

// Due tipi di email:
1. Ordine Completo
   - Lista prodotti
   - Totale con coperto
   - Info sessione (se prenotazione)

2. Solo Prenotazione Posti (isSeatsOnly: true)
   - Conferma prenotazione
   - Info sessione
   - "Ordinerai in loco"

// Template HTML custom con logo e styling
```

### Gestione Orari
```javascript
// MenuNew.jsx - handleMenuTypeSelection()

const now = new Date();
const currentTime = now.getHours() * 60 + now.getMinutes();

// Orari cucina: 19:00 - 23:00
const kitchenStart = 19 * 60;  // 1140 minuti
const kitchenEnd = 23 * 60;    // 1380 minuti

// Blocca accesso se fuori orario (solo per immediate)
if (type === 'cucina' && (currentTime < kitchenStart || currentTime >= kitchenEnd)) {
  setShowKitchenHoursModal(true);
  return;
}
```

### Modalità Admin in MenuNew
```javascript
// Flow speciale quando admin crea ordine da prenotazione:

1. AdminKanban → sessionStorage.setItem('adminOrderData', ...)
2. window.location.href = '/' (hard reload)
3. MenuNew → getAdminData() legge sessionStorage
4. Pre-popola: character, email, numPeople, session*
5. Skip modals: welcome, email, session, menuType
6. Mostra menu cucina direttamente
7. Badge "🔧 Modalità Admin" visibile
8. Button "⬅️ Torna al Pannello Admin"
9. Dopo ordine: elimina prenotazione (deleteReservationById)
10. Redirect a /admin con window.location.href
```

---

## 📝 COMMIT HISTORY IMPORTANTI

### Ultimi commit (da ricordare)
```bash
a572e51 - feat: Hide available seats counter from user welcome screen
b20aef0 - fix: Handle duplicate reservation key error gracefully
4ef7037 - fix: Use sessionStorage and window.location for admin navigation
d3ba70a - fix: Resolve admin order creation issues
596aaee - refactor: Use existing MenuNew for admin order creation
9cfd5f4 - fix: Improve product cards spacing and button interactivity
db5314d - feat: Add admin order creation for seats-only reservations
75a0290 - fix: Save session data in active_reservations table
```

### Branch creati
```bash
main - Codice attivo (ora con notice archivio)
noel-fest-2025-archive - Backup completo evento (646f6e3)
backup-before-schedule-limits - Backup old version
```

---

## 🎯 QUICK REFERENCE COMANDI

### Development
```bash
npm install          # Installa dipendenze
npm run dev          # Dev server (localhost:5173)
npm run build        # Build produzione
npm run preview      # Preview build locale
```

### Git
```bash
git status           # Stato repo
git log --oneline    # Cronologia commit
git checkout <branch>  # Cambia branch
git branch           # Lista branch
```

### Vercel
```bash
vercel               # Deploy preview
vercel --prod        # Deploy production
vercel list          # Lista progetti
vercel remove <name> # Rimuovi progetto
```

---

## ⚠️ ATTENZIONI IMPORTANTI

### 1. node_modules
```
❌ MAI committare su Git
❌ MAI includere in backup
✅ Rigenera con npm install
```

### 2. .env
```
❌ MAI committare credenziali
✅ File .env in .gitignore
✅ Documentare variabili necessarie
✅ Rigenerare per ogni ambiente
```

### 3. Supabase Keys
```
⚠️ Anon Key: Pubblica (va bene in frontend)
⚠️ Service Role: SEGRETA (solo backend/server)
❌ MAI esporre Service Role in frontend
```

### 4. Vercel Auto-Deploy
```
✅ Auto-deploy da GitHub main branch
⚠️ Ogni push → nuovo deploy
⚠️ Disattivare se non vuoi deploy automatici
```

### 5. Database Migration
```
✅ Testare su database di test prima
✅ Backup prima di truncate/drop
⚠️ active_reservations.character_name è UNIQUE
⚠️ Gestire errori 23505 duplicate key
```

---

## 🔄 CHANGELOG VERSIONI

### v2.1.0 - Final (22 Dic 2025)
- ✅ Progetto archiviato
- ✅ Deployment Vercel disattivato
- ✅ Contatore posti nascosto utenti
- ✅ Branch archive creato
- ✅ Documentazione completa

### v2.0.0 - Admin Order Creation
- ✅ Ordini da prenotazioni solo posti
- ✅ Riutilizzo MenuNew per admin
- ✅ Gestione errori duplicate key
- ✅ SessionStorage per dati admin
- ✅ Eliminato AdminOrderModal custom

### v1.5.0 - UX Improvements
- ✅ Real-time Kanban updates
- ✅ Email confirmations
- ✅ Analytics dashboard
- ✅ Seats manager

### v1.0.0 - Base System
- ✅ Menu system
- ✅ Order creation
- ✅ Reservations
- ✅ Admin panel
- ✅ Supabase integration

---

## 📞 SUPPORTO & TROUBLESHOOTING

### Problemi Comuni

#### Build Fails
```bash
# Pulisci cache
rm -rf node_modules package-lock.json
npm install
npm run build
```

#### Supabase Connection Error
```bash
# Verifica .env
# Controlla URL e keys
# Testa con supabase.auth.getSession()
```

#### Vercel Deploy Error
```bash
# Verifica build locale
npm run build
# Controlla logs Vercel dashboard
# Verifica environment variables su Vercel
```

#### Real-time Non Funziona
```javascript
// Verifica Realtime abilitato su Supabase
// Controlla policies database
// Verifica subscription in AdminKanban.jsx linea ~140
```

---

## ✅ CHECKLIST RIATTIVAZIONE

### Prima di Iniziare
- [ ] Backup HDD connesso e verificato
- [ ] GitHub repository accessibile
- [ ] Account Supabase disponibile
- [ ] Account Vercel disponibile

### Setup Progetto
- [ ] Progetto clonato/ripristinato
- [ ] `npm install` completato
- [ ] `.env` configurato
- [ ] Database setup (pulito o nuovo)
- [ ] Test locale funzionante (`npm run dev`)

### Rebranding
- [ ] package.json aggiornato
- [ ] Titoli e testi modificati
- [ ] Tema colori cambiato (opzionale)
- [ ] Immagini prodotti aggiornate
- [ ] Menu data modificato
- [ ] Caratteri nomi aggiornati (opzionale)

### Deploy
- [ ] Build produzione OK (`npm run build`)
- [ ] Vercel project creato
- [ ] Environment variables configurate
- [ ] Deploy production completato
- [ ] Dominio configurato
- [ ] Test produzione OK

### Post-Deploy
- [ ] Email service testato
- [ ] Real-time testato
- [ ] Admin panel accessibile
- [ ] Ordini test completati
- [ ] Analytics funzionanti

---

## 🎄 NOTE FINALI

### Questo File È Tutto Ciò Che Serve
Quando riprenderai il progetto per Elf Fest:
1. **Leggi questo file per intero**
2. **Segui la checklist riattivazione**
3. **Consulta i problemi risolti** se incontri errori
4. **Usa la documentazione completa** in `ARCHIVIO_NOEL_FEST_2025.md`

### Backup Sicuro
- ✅ GitHub: Branch archive permanente
- ✅ HDD: Backup fisico completo
- ✅ Questo file: Context completo per AI

### Prossimi Step
Quando riattivi:
1. Verifica versioni dipendenze (potrebbero essere obsolete)
2. Testa tutto in locale prima del deploy
3. Aggiorna credenziali e keys
4. Fai test completi prima del go-live

---

**📦 Noel Fest 2025 - Progetto Completo Archiviato**
**🧝 Pronto per Elf Fest 2026**

*Generato: 22 Dicembre 2025*
*Versione: 2.1.0 Final*

---

## 🤖 AI AGENT INSTRUCTIONS

Quando questo file viene letto da un AI assistant:

1. **Context Loading**: Considera TUTTO il contesto di questo file come già noto
2. **No Rispiegazioni**: Non chiedere di rispiegare architettura, stack, problemi risolti
3. **Reference This**: Usa questo file come riferimento per qualsiasi domanda
4. **Problemi Risolti**: Prima di suggerire fix, controlla sezione "Problemi Risolti"
5. **Architettura**: Rispetta le scelte architetturali documentate
6. **Rebranding**: Segui la guida "Setup per Elf Fest" per modifiche
7. **Database**: Mantieni schema invariato salvo richieste specifiche
8. **Credenziali**: Mai committare, sempre .env

**IMPORTANTE**: Questo progetto è ARCHIVIATO. Qualsiasi modifica è per ELF FEST 2026.

---

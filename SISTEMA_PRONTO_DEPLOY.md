# 🎄 NOEL FEST - SISTEMA COMPLETATO

## ✅ STATO: PRONTO PER IL DEPLOY

---

## 📦 COSA È STATO FATTO

### 1. SISTEMA CHARACTER-BASED IMPLEMENTATO
✅ **32 personaggi del Bosco Incantato** creati in `src/data/characters.js`
✅ **Menu.jsx completamente riscritto** con nuovo flusso
✅ **Admin.jsx semplificato** - rimossa vista tavoli
✅ **3 nuove modali**: Benvenuto, Email/Screenshot, Posti Esauriti
✅ **Contatore posti globale** (150 totali)
✅ **API aggiornate**: orders.php, seats.php (nuovo), reservations.php (nuovo)
✅ **Database schema riscritto**: character, email, num_people, order_type

### 2. FILE PRONTI IN `Ultimate/`
```
Ultimate/
├── index.html                           # App React build
├── .htaccess                           # React Router + anti-cache
├── create_tables.sql                   # Schema database NUOVO
├── migration_to_character_system.sql   # Migrazione da vecchio DB
├── README_DEPLOY.md                    # Istruzioni complete
├── assets/
│   ├── index-J0iKPIAE.css (26.26KB)
│   └── index-Rt8Z_exO.js (184.04KB)
├── api/
│   ├── db_config.php
│   ├── orders.php       (AGGIORNATO)
│   ├── seats.php        (NUOVO)
│   └── reservations.php (NUOVO)
└── images/
```

### 3. BUILD COMPLETATO
```
✓ 43 modules transformed
✓ CSS: 26.26 KB (gzip: 4.86 KB)
✓ JS: 184.04 KB (gzip: 58.60 KB)
✓ Build time: 302ms
```

---

## 🚀 COME PROCEDERE ORA

### OPZIONE A: DATABASE NUOVO (consigliata)
Se stai partendo da zero o vuoi ricominciare:

1. **Carica i file**
   ```bash
   Carica TUTTO il contenuto di Ultimate/ su:
   noelfest.appdataconnect.it
   ```

2. **Configura database**
   - Accedi a phpMyAdmin
   - Seleziona database `dbgxaxaie7pbze`
   - Importa `create_tables.sql` (crea 3 tabelle nuove)

3. **Verifica credenziali**
   - Apri `api/db_config.php`
   - Controlla username/password MySQL

4. **Test**
   - Vai su `https://noelfest.appdataconnect.it`
   - Dovrebbe aprirsi la modale benvenuto
   - Prova entrambi i flussi (Ordina Subito / Prenota Posto)

---

### OPZIONE B: MIGRAZIONE DA DATABASE ESISTENTE
Se hai già ordini nel vecchio sistema e vuoi conservarli:

1. **Backup prima di tutto!**
   ```sql
   CREATE TABLE orders_backup AS SELECT * FROM orders;
   ```

2. **Esegui migrazione**
   - In phpMyAdmin, importa `migration_to_character_system.sql`
   - Questo script:
     * Rimuove colonne vecchie (table_number, session_token)
     * Aggiunge colonne nuove (email, num_people, order_type)
     * Crea seat_reservations e system_config
     * Fa backup automatico in `orders_backup_old_system`

3. **Carica nuovi file**
   - Sostituisci `api/orders.php` con quello nuovo
   - Aggiungi `api/seats.php` e `api/reservations.php`
   - Sostituisci `index.html` e cartella `assets/`

---

## 🎯 QR CODE

### GENERA IL QR
1. Apri il file `qr-code-generator.html` nel browser
2. Si genera automaticamente il QR per `https://noelfest.appdataconnect.it`
3. Clicca "📥 Scarica QR Code" per salvare l'immagine
4. Oppure "🖨️ Stampa QR Code" per stampa diretta

### DOVE POSIZIONARE IL QR
- **Ingresso evento** (ben visibile)
- **Vicino alla cassa** (per chi vuole prenotare)
- **Zone di attesa** (tavoli, sedie)
- **Cartellonistica** (banner, poster)

### ⚠️ IMPORTANTE
C'è UN SOLO QR CODE per tutto l'evento!
Non servono QR separati per tavoli.

---

## 📱 FLUSSO UTENTE

### Scenario 1: ORDINA SUBITO
```
1. Scansiona QR
2. Sistema assegna "Re Agrifoglio" (casuale)
3. Clicca [🍽️ Ordina Subito]
4. Inserisce email
5. Vede schermata personaggio → FA SCREENSHOT
6. Accede al menù
7. Aggiunge piatti al carrello
8. Conferma ordine
9. Va in cassa con screenshot
10. Ritira ordine mostrando "Re Agrifoglio"
```

### Scenario 2: PRENOTA POSTO
```
1. Scansiona QR
2. Sistema assegna "Fata Cristallo di Neve" (casuale)
3. Clicca [🪑 Prenota Posto]
4. Inserisce email + numero persone (es. 4)
5. Vede schermata personaggio → FA SCREENSHOT
6. Sistema crea prenotazione (4 posti occupati)
7. Accede al menù
8. Ordina quando vuole
9. Va in cassa con screenshot
10. Mostra "Fata Cristallo di Neve" + ordine
```

### Scenario 3: POSTI ESAURITI
```
1. Scansiona QR
2. Clicca [🪑 Prenota Posto]
3. Sistema controlla: available = 0
4. Mostra modale:
   "⚠️ Posti Esauriti
    Per sapere se sono disponibili ancora 
    dei posti devi recarti in cassa.
    Affrettati!"
5. Utente va fisicamente in cassa
```

---

## 🔧 ADMIN PANEL

### Accesso
URL: `https://noelfest.appdataconnect.it/admin`

### Cosa Vedi
- **Statistiche**: Totale ordini, In attesa, In preparazione, Completati
- **Lista ordini** con:
  * Nome personaggio (es. "Gufo Saggio")
  * Email utente
  * Numero persone (se ha prenotato)
  * Tipo ordine (🍽️ Immediato / 🪑 Con Prenotazione)
  * Items ordinati
  * Totale €
  * Status (pending/preparing/completed/cancelled)

### Azioni
- **👨‍🍳 In Preparazione**: Quando inizi a preparare
- **✅ Completato**: Quando l'ordine è pronto
- **❌ Annulla**: Se c'è un problema
- **🗑️ Elimina**: Rimuove ordine (con conferma)

### ❌ RIMOSSO
- Vista griglia 200 tavoli
- Modale dettaglio tavolo
- Session token tracking

---

## 🎭 PERSONAGGI DISPONIBILI

**32 personaggi totali**, tra cui:
- Re Agrifoglio, Regina Stella Cometa
- Principe Vischio, Principessa Bacca Rossa
- Fata Cristallo di Neve, Fata Brina Argentata
- Elfo Campanellino, Folletto Muschio Verde
- Renna Zampa Veloce, Gufo Saggio
- Gnomo Barba Bianca, Mago Inverno
- Unicorno Lunare, Drago di Ghiaccio
- ... e altri 17

Se tutti i 32 nomi sono occupati, il sistema aggiunge un numero casuale
(es. "Re Agrifoglio 742") per garantire unicità.

---

## 🗄️ DATABASE

### Tabella: orders
```sql
id, character_name, email, num_people, 
order_type, items, notes, total, 
status, timestamp
```

### Tabella: seat_reservations
```sql
id, character_name, email, num_people, 
status, created_at
```

### Tabella: system_config
```sql
config_key: 'total_seats'
config_value: '150'
```

---

## 📊 API ENDPOINTS

### GET `/api/seats.php`
Restituisce posti disponibili
```json
{
  "total": 150,
  "occupied": 32,
  "available": 118
}
```

### GET `/api/orders.php`
Lista tutti gli ordini con character, email, num_people, order_type

### POST `/api/orders.php`
Crea ordine (character, email, num_people, order_type, items, total)

### POST `/api/reservations.php`
Crea prenotazione posto (character, email, num_people)

---

## ✅ CHECKLIST FINALE

Prima del deploy, verifica:

- [ ] Tutti i file di `Ultimate/` caricati sul server
- [ ] Database aggiornato con `create_tables.sql`
- [ ] `api/db_config.php` ha credenziali corrette
- [ ] `.htaccess` presente nella root
- [ ] QR code generato e stampato
- [ ] Test scan QR → modale benvenuto appare
- [ ] Test ordine immediato → salva in database
- [ ] Test prenotazione posto → contatore diminuisce
- [ ] Admin panel accessibile su `/admin`
- [ ] Personale istruito: "Screenshot = nome personaggio"

---

## 📞 NOTE OPERATIVE

### Per il Personale della Cassa
1. **Utente arriva** con smartphone
2. **Mostra screenshot** del suo personaggio (es. "Elfo Campanellino")
3. **Controlla ordine** in admin panel cercando "Elfo Campanellino"
4. **Verifica items** e totale
5. **Prepara/Consegna** ordine
6. **Segna come completato** in admin

### Per Gestione Posti
- Controlla in admin quante prenotazioni attive
- Il contatore si aggiorna in automatico
- Quando posti = 0, nuovi scan vedono modale "Posti esauriti"
- Puoi annullare prenotazioni dall'admin per liberare posti

### Per Problemi
- Se personaggio non si vede → utente non ha fatto screenshot
- Se email mancante → ordine vecchio prima della migrazione
- Se posti negativi → controlla seat_reservations per duplicati

---

## 🎉 SISTEMA PRONTO!

Hai completato la trasformazione da sistema table-based a character-based.

**Vantaggi ottenuti:**
- ✅ 1 solo QR invece di 200
- ✅ Nomi memorabili invece di numeri tavolo
- ✅ Email per contatto diretto
- ✅ Sistema flessibile e scalabile
- ✅ Admin panel più semplice
- ✅ Gestione globale posti (150)

**Prossimi passi:**
1. Deploy su server
2. Test completo con dispositivi reali
3. Stampa QR code
4. Brief al personale
5. Evento! 🎅🎄

---

Data: Oggi
Versione: 2.0 Character-Based
Status: ✅ PRODUCTION READY
Build: vite 5.4.21 (302ms)

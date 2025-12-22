# 🎄 Noel Fest 2025 - Archivio Progetto

## 📅 Informazioni Evento
- **Nome Evento**: Noel Fest 2025
- **Location**: Il Bosco Incantato di Re Agrifoglio
- **Periodo**: Dicembre 2025
- **Stato**: ✅ EVENTO CONCLUSO - PROGETTO ARCHIVIATO

---

## 🗂️ Struttura Progetto

### Frontend (React + Vite)
- **Framework**: React 18
- **Build Tool**: Vite 5.4.21
- **Router**: React Router DOM
- **UI Components**: Custom components + Lucide React icons
- **Styling**: CSS modules

### Backend
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Realtime**: Supabase Realtime subscriptions
- **Email**: Custom email service

### Deployment
- **Platform**: Vercel
- **Repository**: GitHub (Akirayouky101/noel-fest)
- **Branch Archive**: `noel-fest-2025-archive`
- **Domain**: noel-fest.vercel.app (DA DISATTIVARE)

---

## 🎯 Funzionalità Implementate

### Lato Utente
1. ✅ **Sistema di Prenotazione**
   - Selezione sessione (pranzo/cena)
   - Scelta data e orario
   - Numero persone
   - Email di conferma

2. ✅ **Ordini Immediati**
   - Ordine senza prenotazione posto
   - Ritiro in cassa

3. ✅ **Menù Interattivo**
   - Menù Cucina (antipasti, primi, secondi, contorni, dolci, bevande)
   - Street Food (panini, fritti, golosoni, bevande)
   - Visualizzazione prodotti senza ordine

4. ✅ **Carrello & Checkout**
   - Gestione quantità
   - Calcolo totale + coperto (€1.50/persona)
   - Conferma ordine

5. ✅ **Prenotazione Solo Posti**
   - "Occupa Posti" senza ordine
   - Email di conferma prenotazione

### Lato Admin
1. ✅ **Kanban Ordini**
   - Stati: Pending → Preparing → Completed
   - Drag & drop per cambio stato
   - Filtri per sessione/data
   - Ricerca per nome

2. ✅ **Gestione Prenotazioni**
   - Visualizzazione prenotazioni attive
   - Distinzione: con ordine vs solo posti
   - Creazione ordine da prenotazione solo posti
   - Eliminazione prenotazioni

3. ✅ **Dashboard Analytics**
   - Statistiche ordini
   - Revenue tracking
   - Prodotti più venduti

4. ✅ **Gestione Posti**
   - 150 posti prenotabili
   - Contatore real-time
   - Sistema walk-in separato

5. ✅ **Notifiche Real-time**
   - Nuovo ordine → suono notifica
   - Aggiornamento automatico Kanban

---

## 📦 Dipendenze Principali

```json
{
  "react": "^18.3.1",
  "react-router-dom": "^6.28.0",
  "react-hot-toast": "^2.4.1",
  "@supabase/supabase-js": "^2.49.1",
  "lucide-react": "^0.468.0",
  "vite": "^5.4.21"
}
```

---

## 🗄️ Database Schema

### Tabelle Principali
1. **orders** - Ordini completi
2. **active_reservations** - Prenotazioni posti attive
3. **walkin_seats** - Posti walk-in
4. **system_settings** - Configurazioni globali

### Funzioni RPC
- `get_available_seats()` - Calcolo posti disponibili
- Real-time subscriptions per aggiornamenti live

---

## 🔧 Come Riattivare per Elf Fest

### 1. Clona questo branch
```bash
git checkout noel-fest-2025-archive
git checkout -b elf-fest-2026
```

### 2. Modifica Branding
- **Nome**: "Noel Fest" → "Elf Fest"
- **Tema**: Natale → Elfi
- **Colori**: Rosso/Oro → Verde/Oro (o altro tema)
- **Icone**: 🎄 → 🧝 (o simili)

### 3. File da Modificare
```
src/pages/MenuNew.jsx - Titoli e testi
src/pages/AdminKanban.jsx - Nome evento
src/data/menuData.js - Prodotti (se cambiano)
package.json - Nome progetto
index.html - Title e meta tags
vite.config.js - Base URL (se necessario)
```

### 4. Database
- Opzione A: Pulire tabelle esistenti (mantenere schema)
- Opzione B: Nuovo database Supabase dedicato
- Aggiornare `.env` con nuove credenziali

### 5. Deploy
```bash
npm install
npm run build
vercel --prod
```

### 6. Domain Setup
- Configurare nuovo dominio `elf-fest.vercel.app`
- O usare dominio custom

---

## 📊 Dati Evento (da esportare prima della disattivazione)

### Export Consigliati
1. **Ordini totali** - Per statistiche
2. **Prenotazioni** - Per analisi
3. **Prodotti più venduti** - Per menù futuro
4. **Revenue** - Per bilanci

### Query Supabase per Export
```sql
-- Export ordini
SELECT * FROM orders ORDER BY timestamp DESC;

-- Export prenotazioni
SELECT * FROM active_reservations ORDER BY created_at DESC;

-- Statistiche prodotti
SELECT 
  items->>'name' as product,
  SUM((items->>'quantity')::int) as total_sold
FROM orders, jsonb_array_elements(items) as items
GROUP BY items->>'name'
ORDER BY total_sold DESC;
```

---

## 🔐 Credenziali & Accessi

### Supabase
- **Project**: iglgrggtrozuhiszxyws
- **URL**: https://iglgrggtrozuhiszxyws.supabase.co
- **Keys**: In `.env` (non committare!)

### Vercel
- **Account**: Akirayouky101
- **Project**: noel-fest
- **Deployment**: Auto-deploy da GitHub

### GitHub
- **Repository**: github.com/Akirayouky101/noel-fest
- **Branch Main**: Codice attivo
- **Branch Archive**: noel-fest-2025-archive

---

## ⚠️ Note Importanti

### Before Disattivazione
- [ ] Export dati da Supabase
- [ ] Backup database (se necessario)
- [ ] Salvare analytics/statistiche
- [ ] Documentare eventuali problemi risolti

### Per Riattivazione Futura
- Controllare versioni dipendenze (potrebbero essere obsolete)
- Testare build locale prima del deploy
- Verificare compatibilità Supabase API
- Aggiornare credenziali email service

---

## 🎨 Personalizzazioni Specifiche Noel Fest

### Sistema Caratteri Casuali
- 50 nomi fantasy natalizi
- Assegnazione casuale a ogni utente
- Visualizzazione in header e ordini

### Email Personalizzate
- Template HTML custom
- Logo evento
- Informazioni ordine dettagliate
- Conferme prenotazioni separate

### Gestione Orari
- Cucina: 19:00 - 23:00
- Street Food: 10:00 - 00:00
- Controlli automatici accesso menù

### Modalità Admin
- Navigazione da admin panel a menu utente
- Pre-popolamento dati prenotazione
- Conversione prenotazione → ordine
- Return automatico a pannello admin

---

## 📝 Changelog Principali

### v1.0.0 - Sistema Base
- Creazione ordini e menù
- Sistema prenotazioni
- Pannello admin base

### v1.5.0 - Miglioramenti UX
- Kanban drag & drop
- Real-time updates
- Email confirmations

### v2.0.0 - Admin Order Creation
- Ordini da prenotazioni solo posti
- Riutilizzo MenuNew per admin
- Gestione errori duplicate key

### v2.1.0 - Final Tweaks
- Nascosto contatore posti utenti
- Ottimizzazioni performance
- Bug fixes vari

---

## 🤝 Supporto & Manutenzione

Per domande o problemi durante la riattivazione:
1. Consulta questo documento
2. Verifica commit history: `git log --oneline`
3. Controlla issues/PR su GitHub
4. Testa in locale prima del deploy

---

## ✅ Checklist Disattivazione

- [ ] Commit finale su branch archive
- [ ] Push branch archive su GitHub
- [ ] Export dati Supabase
- [ ] Disattivare deployment Vercel
- [ ] (Opzionale) Pause Supabase project
- [ ] Documentazione completa ✅

---

**🎄 Fine Noel Fest 2025 - Grazie per l'Evento! 🎄**

*Pronto per diventare Elf Fest 2026!* 🧝✨

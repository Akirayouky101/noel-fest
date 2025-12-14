# 🎄 Guida Deploy Noel Fest su Server

## 📦 Cosa caricare sul server

### 1. **Cartella `dist/`** (Build React)
Carica **tutto il contenuto** della cartella `dist/` nella root del tuo sito:

```
public_html/  (o www/ o httpdocs/)
├── index.html
├── assets/
│   ├── castle-bg-mobile-xxx.jpg
│   ├── castle-bg-xxx.jpg
│   ├── index-xxx.css
│   └── index-xxx.js
└── api/
    ├── db_config.php
    └── orders.php
```

### 2. **File API** (Backend PHP)
Crea la cartella `api/` e carica:
- `public/api/db_config.php`
- `public/api/orders.php`

### 3. **Database SQL**
Esegui nel database `dbgxaxaie7pbze`:
- `database/create_tables.sql`

---

## 🚀 Passi per il Deploy

### **Passo 1: Prepara i file**
```bash
# La cartella dist/ è già pronta con la build
cd "/Users/akirayouky/Desktop/Siti/Noel Fest/NoelReact"
```

### **Passo 2: Carica su server**
Usa FTP/SFTP (FileZilla, Cyberduck, o pannello hosting):

1. **Carica contenuto di `dist/`** → root del sito (`public_html/`)
   - `index.html`
   - cartella `assets/`

2. **Crea cartella `api/`** in `public_html/api/`

3. **Carica file PHP**:
   - `public/api/db_config.php` → `public_html/api/db_config.php`
   - `public/api/orders.php` → `public_html/api/orders.php`

### **Passo 3: Configura Database**

1. Vai su **phpMyAdmin** (o pannello database del tuo hosting)
2. Seleziona database: `dbgxaxaie7pbze`
3. Vai su **SQL** e esegui il contenuto di `database/create_tables.sql`

### **Passo 4: Verifica DB_HOST**

Modifica `api/db_config.php` se necessario:
```php
define('DB_HOST', 'localhost'); // Cambia se il tuo host è diverso
```

Alcuni hosting usano:
- `localhost` ✅ (più comune)
- `mysql.tuodominio.com`
- Un indirizzo IP specifico

**Controlla nella documentazione del tuo hosting!**

### **Passo 5: Test**

1. Apri il sito: `https://tuodominio.com`
2. Testa ordine:
   - Aggiungi piatti al carrello
   - Invia ordine
   - Verifica che arrivi nel database

3. Testa API direttamente:
   ```
   https://tuodominio.com/api/orders.php
   ```
   Dovrebbe restituire un JSON con gli ordini (array vuoto se nessun ordine)

---

## 📁 Struttura finale su server

```
public_html/
├── index.html                    ← File principale React
├── assets/                       ← CSS, JS, immagini
│   ├── castle-bg-mobile-xxx.jpg
│   ├── castle-bg-xxx.jpg
│   ├── index-xxx.css
│   └── index-xxx.js
└── api/                          ← Backend PHP
    ├── db_config.php             ← Configurazione DB
    └── orders.php                ← API ordini
```

---

## ⚠️ Checklist Pre-Deploy

- [ ] Build completata (`npm run build`)
- [ ] File `dist/` pronti
- [ ] File PHP `api/` pronti
- [ ] Script SQL `create_tables.sql` eseguito
- [ ] `DB_HOST` verificato in `db_config.php`
- [ ] Credenziali database corrette
- [ ] Permessi file 644 per PHP
- [ ] Permessi cartelle 755

---

## 🐛 Troubleshooting

### Errore "Cannot GET /api/orders.php"
- Verifica che la cartella `api/` sia nella root
- URL corretto: `https://sito.com/api/orders.php` (con .php)

### Errore "Access denied" database
- Controlla username/password in `db_config.php`
- Verifica che l'utente `un0izfn5newpz` abbia permessi sul database

### Errore "Table 'orders' doesn't exist"
- Esegui lo script SQL `create_tables.sql` nel database

### Pagina bianca
- Controlla console browser (F12)
- Verifica che i file in `assets/` siano accessibili
- Controlla percorsi nel file `index.html`

### CORS errors
- Le API hanno già header CORS
- Se errori persistono, verifica configurazione server

---

## 🎯 Test Rapido

Dopo il deploy, testa questi URL:

1. **Frontend**: `https://tuodominio.com`
   - Dovrebbe caricare il menu
   
2. **API**: `https://tuodominio.com/api/orders.php`
   - Dovrebbe restituire JSON (anche vuoto `[]`)

3. **Test ordine**: 
   - Aggiungi piatti
   - Conferma ordine
   - Controlla database in phpMyAdmin

---

## 📞 Informazioni Database

**Database**: dbgxaxaie7pbze  
**User**: un0izfn5newpz  
**Password**: Criogenia2024!?  
**Host**: da verificare (probabilmente `localhost`)

---

## ✅ Tutto Pronto!

Una volta caricato tutto, il sito sarà online e funzionante! 🎅✨

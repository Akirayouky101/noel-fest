# Noel Fest - Backend Setup

## Configurazione Database

**Database**: dbgxaxaie7pbze  
**User**: un0izfn5newpz  
**Password**: Criogenia2024!?

## Installazione

### 1. Crea la tabella nel database

Esegui il file SQL sul tuo database:
```sql
-- Vai nel pannello di controllo del tuo hosting (es. phpMyAdmin, cPanel)
-- Seleziona il database: dbgxaxaie7pbze
-- Importa o esegui il file: database/create_tables.sql
```

Oppure esegui direttamente questo SQL:
```sql
CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    character_name VARCHAR(100) NOT NULL,
    items JSON NOT NULL,
    notes TEXT,
    total DECIMAL(10, 2) NOT NULL,
    status ENUM('pending', 'preparing', 'completed', 'cancelled') DEFAULT 'pending',
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_status (status),
    INDEX idx_timestamp (timestamp)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 2. Carica i file PHP sul server

Carica questi file nella directory pubblica del tuo hosting:
```
/public_html/
  └── api/
      ├── db_config.php
      └── orders.php
```

### 3. Verifica configurazione

Modifica `public/api/db_config.php` se il tuo host MySQL è diverso da `localhost`:
```php
define('DB_HOST', 'localhost'); // Cambia se necessario (es. 'mysql.example.com')
```

### 4. Build e Deploy React

```bash
# Build del progetto React
cd NoelReact
npm run build

# Carica la cartella 'dist' sul tuo hosting
# Rinomina 'dist' in qualcosa come 'noel-fest' se necessario
```

### 5. Test API

Testa che le API funzionino:
```bash
# Test GET (recupera ordini)
curl https://tuosito.com/api/orders.php

# Test POST (crea ordine)
curl -X POST https://tuosito.com/api/orders.php \
  -H "Content-Type: application/json" \
  -d '{
    "character": "Test Character",
    "items": [{"id":"test-1","name":"Test Item","price":10,"quantity":1}],
    "total": 10,
    "notes": "Test note"
  }'
```

## API Endpoints

### GET /api/orders.php
Recupera tutti gli ordini (per admin)
```
GET /api/orders.php
GET /api/orders.php?status=pending
GET /api/orders.php?id=123
```

### POST /api/orders.php
Crea nuovo ordine
```json
{
  "character": "Agrifoglio il Saggio",
  "items": [
    {
      "id": "antipasti-1",
      "name": "Bruschette",
      "price": 5.50,
      "quantity": 2
    }
  ],
  "notes": "Senza aglio",
  "total": 11.00
}
```

### PUT /api/orders.php
Aggiorna stato ordine (per admin)
```json
{
  "id": 123,
  "status": "preparing"
}
```

Stati disponibili: `pending`, `preparing`, `completed`, `cancelled`

### DELETE /api/orders.php?id=123
Elimina ordine (per admin)

## Struttura File Creati

```
NoelReact/
├── database/
│   └── create_tables.sql          # Script SQL per creare tabella
├── public/
│   └── api/
│       ├── db_config.php          # Configurazione database
│       └── orders.php             # API endpoints
└── BACKEND_SETUP.md               # Questa guida
```

## Sicurezza

⚠️ **IMPORTANTE**: 
1. Il file `db_config.php` contiene credenziali sensibili
2. Assicurati che la cartella `/api/` sia accessibile solo via HTTP
3. Considera di spostare `db_config.php` fuori dalla document root
4. Aggiungi autenticazione per gli endpoint admin (PUT, DELETE)

## Troubleshooting

### Errore "Access denied for user"
- Verifica username, password, nome database
- Controlla che l'utente abbia i permessi sul database

### Errore "Table 'orders' doesn't exist"
- Esegui lo script SQL `create_tables.sql`

### Errore CORS
- Le API hanno già gli header CORS abilitati
- Se usi un dominio diverso, modifica l'header in `orders.php`

### Errore 404 su /api/orders.php
- Verifica che il file sia nella posizione corretta
- Controlla che il web server possa eseguire PHP
- Verifica il percorso URL (es. `/api/orders.php` non `/api/orders`)

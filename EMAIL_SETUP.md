# 📧 Setup Email di Conferma Ordini

## Sistema Implementato

L'applicazione invia automaticamente email di conferma ai clienti dopo ogni ordine.

## Componenti

1. **Edge Function**: `/supabase/functions/send-order-email/index.ts`
2. **Integrazione Frontend**: `src/pages/MenuNew.jsx` (funzione `submitOrder`)
3. **Servizio Email**: Resend.com (https://resend.com)

## Setup (Per l'Amministratore)

### 1. Crea Account Resend

1. Vai su https://resend.com
2. Registrati gratuitamente (piano gratuito: 100 email/giorno)
3. Verifica il tuo dominio o usa il dominio di test

### 2. Ottieni API Key

1. Nel dashboard Resend, vai su "API Keys"
2. Crea una nuova API Key
3. Copia la chiave (inizia con `re_`)

### 3. Configura Supabase

1. Vai su https://supabase.com/dashboard
2. Apri il progetto "Noel Fest"
3. Vai su "Edge Functions" → "Settings" → "Secrets"
4. Aggiungi un nuovo secret:
   - Name: `RESEND_API_KEY`
   - Value: `<la-tua-api-key-resend>`

### 4. Deploy Edge Function

```bash
# Installa Supabase CLI (se non l'hai già fatto)
npm install -g supabase

# Login in Supabase
supabase login

# Link al progetto
supabase link --project-ref <tuo-project-id>

# Deploy della funzione
supabase functions deploy send-order-email
```

### 5. Testa il Sistema

1. Fai un ordine di test dall'applicazione
2. Controlla che l'email arrivi
3. Verifica i log in Supabase Dashboard → Edge Functions

## Dominio Email

### Opzione 1: Dominio di Test (Immediate)
- Usa `onboarding@resend.dev` come mittente
- Le email arriveranno da Resend
- Perfetto per test

### Opzione 2: Dominio Personalizzato (Consigliato)
1. Aggiungi il tuo dominio in Resend
2. Configura i record DNS (MX, TXT, CNAME)
3. Attendi verifica (5-10 minuti)
4. Modifica `from:` nella Edge Function:
   ```typescript
   from: 'Noel Fest <ordini@tuodominio.com>'
   ```

## Contenuto Email

L'email include:
- ✅ Conferma ordine
- 🎅 Nome personaggio
- 📋 Lista completa piatti ordinati
- 💰 Totale con coperto
- 👥 Numero persone
- 💡 Istruzioni ritiro/prenotazione

## Flusso Ordine Completo

1. Cliente compila carrello
2. Submit ordine → Salva in database
3. **Invia email automatica** (senza bloccare)
4. Mostra "Ordine inviato!"
5. **Auto-logout dopo 3 secondi**
6. Torna alla schermata iniziale

## Risoluzione Problemi

### Email non arriva
- Controlla spam/posta indesiderata
- Verifica API Key in Supabase Secrets
- Controlla log Edge Function
- Verifica dominio verificato in Resend

### Errore 401
- API Key non configurata o errata
- Rigenerica la chiave in Resend

### Errore 403
- Dominio non verificato
- Usa dominio di test `onboarding@resend.dev`

## Alternative a Resend

Se preferisci altri servizi:

### SendGrid
```typescript
// Cambia endpoint e headers
const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
  headers: {
    'Authorization': `Bearer ${SENDGRID_API_KEY}`,
    'Content-Type': 'application/json'
  },
  // ...
})
```

### Mailgun
```typescript
const res = await fetch('https://api.mailgun.net/v3/YOUR_DOMAIN/messages', {
  method: 'POST',
  headers: {
    'Authorization': `Basic ${btoa('api:' + MAILGUN_API_KEY)}`
  },
  // ...
})
```

## Costi

### Resend (Consigliato)
- ✅ **Free**: 100 email/giorno (3000/mese)
- 💰 **Pro**: $20/mese → 50.000 email

### SendGrid
- ✅ **Free**: 100 email/giorno forever
- 💰 **Essentials**: $15/mese → 40.000 email

### Mailgun
- ✅ **Trial**: 1000 email gratis
- 💰 **Foundation**: $35/mese → 50.000 email

## Note Tecniche

- Email **non bloccano** l'ordine (se fallisce, ordine comunque salvato)
- Template HTML responsive
- Compatibile con tutti i client email
- CORS configurato per Vercel/Supabase

---

**Prossimi Step**: Dopo il deploy della funzione, testa con un ordine reale!

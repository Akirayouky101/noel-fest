# 🔐 Setup Autenticazione Admin - Noel Fest 2025

## Creazione Utente Admin su Supabase

### Opzione 1: Da Dashboard Supabase (CONSIGLIATO)

1. **Vai su Supabase Dashboard**
   - Apri: https://supabase.com/dashboard
   - Seleziona il progetto `Noel Fest`

2. **Naviga in Authentication**
   - Menu laterale → `Authentication` → `Users`

3. **Crea nuovo utente**
   - Click su `Add User` (o `Invite User`)
   - Scegli `Create new user`
   
4. **Compila i dati**:
   ```
   Email: admin@noelfest.com
   Password: [SCEGLI UNA PASSWORD SICURA]
   Auto Confirm: ✅ Abilita (così non serve email di conferma)
   ```

5. **Salva**
   - Click su `Create user`
   - ✅ Utente admin creato!

### Opzione 2: Da SQL Editor (Alternativa)

1. Vai su `SQL Editor` nella dashboard Supabase
2. Esegui questo comando:

```sql
-- Crea utente admin
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
)
VALUES (
  '00000000-0000-0000-0000-000000000000'::uuid,
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@noelfest.com',
  crypt('TUA_PASSWORD_QUI', gen_salt('bf')),
  now(),
  now(),
  now(),
  '',
  '',
  '',
  ''
);
```

**⚠️ Sostituisci `TUA_PASSWORD_QUI` con la tua password sicura!**

---

## Test Login

1. Vai su: `https://tuodominio.vercel.app/admin`
2. Dovresti vedere la schermata di login
3. Inserisci:
   - Email: `admin@noelfest.com`
   - Password: [quella che hai scelto]
4. Click su **Accedi**
5. ✅ Dovresti essere dentro il pannello admin!

---

## Credenziali Suggerite per Produzione

```
Email: admin@noelfest.com
Password: NoelFest2025!SecurePass
```

**⚠️ IMPORTANTE: Cambia la password dopo il primo accesso!**

---

## Funzionalità Autenticazione

✅ **Cosa fa ora il sistema**:
- Protegge la route `/admin` - solo utenti autenticati
- Mostra login se non sei loggato
- Session persistente (rimani loggato anche dopo refresh)
- Pulsante logout con conferma
- Mostra email utente loggato nell'header

✅ **Sicurezza**:
- Password criptate con bcrypt
- JWT tokens sicuri
- Session management automatico
- Logout completo pulisce la sessione

---

## Aggiungere Altri Admin

Per aggiungere altri utenti admin in futuro:

1. Dashboard Supabase → Authentication → Users → Add User
2. Oppure dall'app (da implementare in futuro):
   - Creare una pagina `/admin/users`
   - Form per creare nuovi admin

---

## Troubleshooting

### "Email already registered"
- L'email esiste già, usa un'altra email
- Oppure elimina l'utente esistente e ricrealo

### "Invalid login credentials"
- Verifica che email e password siano corretti
- Assicurati che `Auto Confirm` sia abilitato

### "User not confirmed"
- Vai su Authentication → Users
- Trova l'utente e click su `Confirm email`

---

## Password Reset (Se dimentichi la password)

**Metodo 1: Da Dashboard**
1. Authentication → Users
2. Trova l'utente
3. Click sui 3 puntini → `Reset Password`
4. Inserisci nuova password

**Metodo 2: Implementare "Password dimenticata"**
- TODO: Aggiungere link "Forgot password?" nel login
- Supabase invierà email di reset automaticamente

---

## Next Steps

Dopo aver creato l'admin:

1. ✅ Testa il login
2. ✅ Verifica che il pannello admin carichi
3. ✅ Testa real-time updates (fai un ordine e vedi se appare)
4. ✅ Testa le notifiche browser
5. ✅ Testa drag & drop ordini
6. ✅ Testa analytics dashboard

🎄 **Pronto per il Noel Fest 2025!** 🎄

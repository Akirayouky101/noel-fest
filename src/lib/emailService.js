// Email service using PHP endpoint with Siteground SMTP

/**
 * Invia email di conferma ordine usando PHP backend
 * @param {Object} orderData - Dati dell'ordine
 * @returns {Promise} - Risultato dell'invio
 */
export async function sendOrderConfirmationEmail(orderData) {
  try {
    // URL dell'endpoint PHP su Siteground
    const apiUrl = 'https://appdataconnect.it/api/send-email.php'
    
    // Gestisci caso "solo posti" (isSeatsOnly)
    const isSeatsOnly = orderData.isSeatsOnly || false
    
    // Prepara i dati per l'email
    const emailData = {
      email: orderData.email,
      characterName: orderData.characterName,
      orderType: isSeatsOnly 
        ? 'Prenotazione Posti (Ordine in presenza)' 
        : (orderData.orderType === 'immediato' ? 'Ordine Immediato' : 'Prenotazione con Ordine'),
      numPeople: orderData.numPeople,
      total: orderData.total,
      items: orderData.items,
      isSeatsOnly: isSeatsOnly,
      // Aggiungi info sessione per prenotazioni
      sessionType: orderData.sessionData?.sessionType || null,
      sessionDate: orderData.sessionData?.sessionDate || null,
      sessionTime: orderData.sessionData?.sessionTime || null
    }

    console.log('📧 Invio email a:', orderData.email, isSeatsOnly ? '(Solo Posti)' : '(Con Ordine)')

    // Invia richiesta POST al PHP endpoint
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailData)
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
    }

    const result = await response.json()
    
    if (result.success) {
      console.log('✅ Email inviata con successo')
      return { success: true }
    } else {
      console.error('❌ Invio email fallito:', result.error)
      return { success: false, error: result.error }
    }

  } catch (error) {
    console.error('❌ Errore invio email:', error)
    return { success: false, error: error.message }
  }
}

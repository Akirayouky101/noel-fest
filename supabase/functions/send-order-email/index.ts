// Supabase Edge Function per inviare email di conferma ordine
// Usa Resend.com per l'invio email

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

interface OrderEmailRequest {
  email: string
  characterName: string
  items: Array<{
    name: string
    quantity: number
    price: number
  }>
  total: number
  numPeople: number
  orderType: string
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const orderData: OrderEmailRequest = await req.json()
    
    // Costruisci HTML email
    const itemsList = orderData.items
      .map(item => `
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;">${item.quantity}x ${item.name}</td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">€${(item.price * item.quantity).toFixed(2)}</td>
        </tr>
      `)
      .join('')

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Conferma Ordine - Noel Fest</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
        <table role="presentation" style="width: 100%; border-collapse: collapse;">
          <tr>
            <td align="center" style="padding: 40px 0;">
              <table role="presentation" style="width: 600px; max-width: 90%; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
                
                <!-- Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, #8B0000, #CD5C5C); padding: 40px 20px; text-align: center;">
                    <h1 style="margin: 0; color: #FFD700; font-size: 32px;">🎄 Noel Fest 2025</h1>
                    <p style="margin: 10px 0 0; color: white; font-size: 16px;">Il Bosco Incantato di Re Agrifoglio</p>
                  </td>
                </tr>
                
                <!-- Body -->
                <tr>
                  <td style="padding: 40px 20px;">
                    <h2 style="color: #8B0000; margin: 0 0 20px;">✅ Ordine Confermato!</h2>
                    <p style="font-size: 16px; color: #333; line-height: 1.6;">
                      Ciao <strong>${orderData.characterName}</strong>,<br>
                      Il tuo ordine è stato ricevuto con successo!
                    </p>
                    
                    <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
                      <h3 style="color: #8B0000; margin: 0 0 15px;">📋 Riepilogo Ordine</h3>
                      <table style="width: 100%; border-collapse: collapse;">
                        ${itemsList}
                        <tr>
                          <td style="padding: 12px 8px; border-top: 2px solid #8B0000; font-weight: bold;">
                            Totale (${orderData.numPeople} ${orderData.numPeople === 1 ? 'persona' : 'persone'})
                          </td>
                          <td style="padding: 12px 8px; border-top: 2px solid #8B0000; text-align: right; font-weight: bold; color: #8B0000; font-size: 18px;">
                            €${orderData.total.toFixed(2)}
                          </td>
                        </tr>
                      </table>
                    </div>
                    
                    <div style="background: #FFF9E6; border-left: 4px solid #FFD700; padding: 15px; margin: 20px 0;">
                      <p style="margin: 0; font-size: 14px; color: #666;">
                        <strong>💡 Ricorda:</strong> ${
                          orderData.orderType === 'immediate' 
                            ? 'Ritira il tuo ordine in cassa presentando il nome del tuo personaggio.'
                            : 'Il tuo posto è stato prenotato. Ti aspettiamo!'
                        }
                      </p>
                    </div>
                    
                    <p style="font-size: 14px; color: #666; line-height: 1.6; margin-top: 30px;">
                      Grazie per aver scelto Noel Fest!<br>
                      Buon appetito dal Regno di Re Agrifoglio! 🎅
                    </p>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="background: #f4f4f4; padding: 20px; text-align: center; font-size: 12px; color: #666;">
                    <p style="margin: 0;">Noel Fest 2025 - Il Bosco Incantato</p>
                    <p style="margin: 5px 0 0;">Questa è una mail automatica, per favore non rispondere.</p>
                  </td>
                </tr>
                
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `

    // Invia email con Resend
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Noel Fest <ordini@noelfest.com>',
        to: [orderData.email],
        subject: `🎄 Conferma Ordine - ${orderData.characterName}`,
        html: htmlContent,
      }),
    })

    const data = await res.json()

    if (res.ok) {
      return new Response(
        JSON.stringify({ success: true, messageId: data.id }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    } else {
      throw new Error(data.message || 'Failed to send email')
    }

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})

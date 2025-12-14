import html2pdf from 'html2pdf.js'

export function printOrder(order) {
  // small sanitizer to avoid HTML injection
  const s = (v) => (v === null || v === undefined) ? '' : String(v).replace(/</g, '&lt;')

  const itemsHTML = (order.items || []).map(item => `
      <div class="item">
        <span class="item-qty">${s(item.quantity)}x</span>
        <span class="item-name">${s(item.name)}</span>
        <span class="item-price">€${(item.price * item.quantity).toFixed(2)}</span>
      </div>
    `).join('')

  const printContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Comanda #${s(order.id)}</title>
  <style>
    /* Force white background and hide any video/background elements */
    html,body { background: #fff !important; color: #000; }
    .video-background { display: none !important; }

    @media print { 
      @page { 
        size: A5 portrait; 
        margin: 10mm; 
      } 
    }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Courier New', monospace; font-size: 14px; line-height: 1.4; padding: 20px; max-width: 128mm; }
    .header { text-align: center; border-bottom: 2px dashed #000; padding-bottom: 10px; margin-bottom: 15px; }
    .header h1 { font-size: 24px; font-weight: bold; margin-bottom: 5px; }
    .header p { font-size: 14px; margin: 3px 0; }
    .order-info { margin-bottom: 20px; padding-bottom: 10px; border-bottom: 1px dashed #000; }
    .order-info div { display: flex; justify-content: space-between; margin: 5px 0; font-size: 14px; }
    .order-info .label { font-weight: bold; }
    .items-section { margin-bottom: 20px; }
    .items-section h3 { font-size: 18px; font-weight: bold; margin-bottom: 10px; text-align: center; text-decoration: underline; }
    .item { display: flex; justify-content: space-between; margin: 8px 0; padding: 8px 0; border-bottom: 1px dotted #ccc; font-size: 14px; }
    .item-qty { font-weight: bold; margin-right: 15px; min-width: 30px; }
    .item-name { flex: 1; }
    .item-price { font-weight: bold; min-width: 60px; text-align: right; }
    .notes-section { margin: 20px 0; padding: 15px; background: #f0f0f0; border: 1px solid #ccc; border-radius: 5px; }
    .notes-section h4 { font-size: 16px; margin-bottom: 8px; }
    .total-section { margin-top: 20px; padding-top: 15px; border-top: 2px solid #000; font-size: 16px; font-weight: bold; }
    .total-section div { display: flex; justify-content: space-between; margin: 8px 0; }
    .total-section .grand-total { font-size: 22px; border-top: 2px dashed #000; margin-top: 15px; padding-top: 15px; }
    .footer { text-align: center; margin-top: 30px; padding-top: 15px; border-top: 2px dashed #000; font-size: 14px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>🎄 NOEL FEST 🎅</h1>
    <p>Proloco Lanzo TSE</p>
    <p>───────────────────────</p>
    <p><strong>COMANDA #${s(order.id)}</strong></p>
  </div>

  <div class="order-info">
    <div><span class="label">Data/Ora:</span><span>${s(new Date(order.timestamp).toLocaleString('it-IT'))}</span></div>
    <div><span class="label">Personaggio:</span><span>${s(order.character)}</span></div>
    ${order.email ? `<div><span class="label">Email:</span><span>${s(order.email)}</span></div>` : ''}
    <div><span class="label">Persone:</span><span>${s(order.num_people)}</span></div>
    <div><span class="label">Tipo:</span><span>${order.orderType === 'immediate' ? 'ORDINA SUBITO' : 'PRENOTA POSTO'}</span></div>
  </div>

  <div class="items-section">
    <h3>═══ PIATTI ═══</h3>
    ${itemsHTML}
  </div>

  ${order.notes ? `<div class="notes-section"><h4>📝 NOTE:</h4><p>${s(order.notes)}</p></div>` : ''}

  <div class="total-section">
    <div><span>Subtotale Piatti:</span><span>€${(order.items || []).reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)}</span></div>
    <div><span>Coperto (${s(order.num_people)}p × €1.50):</span><span>€${(order.num_people * 1.50).toFixed(2)}</span></div>
    <div class="grand-total"><span>TOTALE:</span><span>€${parseFloat(order.total || 0).toFixed(2)}</span></div>
  </div>

  <div class="footer"><p>Grazie e Buone Feste! 🎁</p><p>───────────────────────</p><p>${s(new Date().toLocaleString('it-IT'))}</p></div>

  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
        setTimeout(function() { window.close(); }, 100);
      }, 250);
    }
  </script>
</body>
</html>`

  // Create blob URL approach
  const blob = new Blob([printContent], { type: 'text/html' })
  const blobUrl = URL.createObjectURL(blob)
  
  const printWindow = window.open(blobUrl, '_blank')
  
  if (!printWindow) {
    URL.revokeObjectURL(blobUrl)
    if (window.confirm('Popup bloccato. Vuoi scaricare un PDF della comanda invece?')) {
      generatePDF(order)
    }
    return
  }

  // Clean up blob URL after window closes
  setTimeout(() => {
    URL.revokeObjectURL(blobUrl)
  }, 5000)
}

export function printMultipleOrders(orders) {
  const printWindow = window.open('', '_blank')
  
  const ordersHTML = orders.map(order => `
    <div class="order-page">
      <div class="header">
        <h1>🎄 NOEL FEST 🎅</h1>
        <p>Proloco Lanzo TSE</p>
        <p>───────────────────────</p>
        <p><strong>COMANDA #${order.id}</strong></p>
      </div>
      
      <div class="order-info">
        <div>
          <span class="label">Data/Ora:</span>
          <span>${new Date(order.timestamp).toLocaleString('it-IT')}</span>
        </div>
        <div>
          <span class="label">Personaggio:</span>
          <span>${order.character}</span>
        </div>
        <div>
          <span class="label">Persone:</span>
          <span>${order.num_people}</span>
        </div>
      </div>
      
      <div class="items-section">
        <h3>═══ PIATTI ═══</h3>
        ${order.items.map(item => `
          <div class="item">
            <span class="item-qty">${item.quantity}x</span>
            <span class="item-name">${item.name}</span>
            <span class="item-price">€${(item.price * item.quantity).toFixed(2)}</span>
          </div>
        `).join('')}
      </div>
      
      ${order.notes ? `
      <div class="notes-section">
        <h4>📝 NOTE:</h4>
        <p>${order.notes}</p>
      </div>
      ` : ''}
      
      <div class="total-section">
        <div class="grand-total">
          <span>TOTALE:</span>
          <span>€${parseFloat(order.total || 0).toFixed(2)}</span>
        </div>
      </div>
      
      <div class="footer">
        <p>Grazie e Buone Feste! 🎁</p>
      </div>
    </div>
  `).join('<div class="page-break"></div>')
  
  const printContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Comande Multiple</title>
  <style>
    @media print {
      @page {
        size: A5 portrait;
        margin: 10mm;
      }
      .page-break {
        page-break-before: always;
      }
    }
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Courier New', monospace;
      font-size: 14px;
      line-height: 1.4;
    }
    
    .order-page {
      padding: 20px;
      max-width: 128mm;
    }
    
    .header {
      text-align: center;
      border-bottom: 2px dashed #000;
      padding-bottom: 10px;
      margin-bottom: 10px;
    }
    
    .header h1 {
      font-size: 20px;
      font-weight: bold;
      margin-bottom: 5px;
    }
    
    .header p {
      font-size: 12px;
      margin: 2px 0;
    }
    
    .order-info {
      margin-bottom: 15px;
      padding-bottom: 10px;
      border-bottom: 1px dashed #000;
    }
    
    .order-info div {
      display: flex;
      justify-content: space-between;
      margin: 3px 0;
      font-size: 13px;
    }
    
    .order-info .label {
      font-weight: bold;
    }
    
    .items-section {
      margin-bottom: 15px;
    }
    
    .items-section h3 {
      font-size: 16px;
      font-weight: bold;
      margin-bottom: 10px;
      text-align: center;
      text-decoration: underline;
    }
    
    .item {
      display: flex;
      justify-content: space-between;
      margin: 5px 0;
      padding: 5px 0;
      border-bottom: 1px dotted #ccc;
    }
    
    .item-qty {
      font-weight: bold;
      margin-right: 10px;
    }
    
    .item-name {
      flex: 1;
    }
    
    .item-price {
      font-weight: bold;
    }
    
    .notes-section {
      margin: 15px 0;
      padding: 10px;
      background: #f0f0f0;
      border: 1px solid #ccc;
    }
    
    .notes-section h4 {
      font-size: 14px;
      margin-bottom: 5px;
    }
    
    .total-section {
      margin-top: 15px;
      padding-top: 10px;
      border-top: 2px solid #000;
      font-size: 16px;
      font-weight: bold;
    }
    
    .total-section .grand-total {
      display: flex;
      justify-content: space-between;
      font-size: 20px;
    }
    
    .footer {
      text-align: center;
      margin-top: 20px;
      padding-top: 10px;
      border-top: 2px dashed #000;
      font-size: 12px;
    }
  </style>
</head>
<body>
  ${ordersHTML}
  
  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print()
        setTimeout(function() {
          window.close()
        }, 100)
      }, 250)
    }
  </script>
</body>
</html>
  `
  
  printWindow.document.write(printContent)
  printWindow.document.close()
}

// Fallback function: generate and download PDF
function generatePDF(order) {
  const s = (v) => (v === null || v === undefined) ? '' : String(v).replace(/</g, '&lt;')
  
  const itemsHTML = (order.items || []).map(item => `
    <div style="display: flex; justify-content: space-between; margin: 5px 0; padding: 5px 0; border-bottom: 1px dotted #ccc;">
      <span style="font-weight: bold; margin-right: 10px;">${s(item.quantity)}x</span>
      <span style="flex: 1;">${s(item.name)}</span>
      <span style="font-weight: bold;">€${(item.price * item.quantity).toFixed(2)}</span>
    </div>
  `).join('')

  const htmlContent = `
    <div style="font-family: 'Courier New', monospace; font-size: 14px; line-height: 1.4; padding: 20px; max-width: 80mm; background: #fff; color: #000;">
      <div style="text-align: center; border-bottom: 2px dashed #000; padding-bottom: 10px; margin-bottom: 10px;">
        <h1 style="font-size: 20px; font-weight: bold; margin-bottom: 5px;">🎄 NOEL FEST 🎅</h1>
        <p style="font-size: 12px; margin: 2px 0;">Proloco Lanzo TSE</p>
        <p style="font-size: 12px;">───────────────────────</p>
        <p style="font-size: 12px;"><strong>COMANDA #${s(order.id)}</strong></p>
      </div>
      
      <div style="margin-bottom: 15px; padding-bottom: 10px; border-bottom: 1px dashed #000;">
        <div style="display: flex; justify-content: space-between; margin: 3px 0; font-size: 13px;">
          <span style="font-weight: bold;">Data/Ora:</span>
          <span>${s(new Date(order.timestamp).toLocaleString('it-IT'))}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin: 3px 0; font-size: 13px;">
          <span style="font-weight: bold;">Personaggio:</span>
          <span>${s(order.character)}</span>
        </div>
        ${order.email ? `<div style="display: flex; justify-content: space-between; margin: 3px 0; font-size: 13px;">
          <span style="font-weight: bold;">Email:</span>
          <span>${s(order.email)}</span>
        </div>` : ''}
        <div style="display: flex; justify-content: space-between; margin: 3px 0; font-size: 13px;">
          <span style="font-weight: bold;">Persone:</span>
          <span>${s(order.num_people)}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin: 3px 0; font-size: 13px;">
          <span style="font-weight: bold;">Tipo:</span>
          <span>${order.orderType === 'immediate' ? 'ORDINA SUBITO' : 'PRENOTA POSTO'}</span>
        </div>
      </div>
      
      <div style="margin-bottom: 15px;">
        <h3 style="font-size: 16px; font-weight: bold; margin-bottom: 10px; text-align: center; text-decoration: underline;">═══ PIATTI ═══</h3>
        ${itemsHTML}
      </div>
      
      ${order.notes ? `<div style="margin: 15px 0; padding: 10px; background: #f0f0f0; border: 1px solid #ccc;">
        <h4 style="font-size: 14px; margin-bottom: 5px;">📝 NOTE:</h4>
        <p>${s(order.notes)}</p>
      </div>` : ''}
      
      <div style="margin-top: 15px; padding-top: 10px; border-top: 2px solid #000; font-size: 16px; font-weight: bold;">
        <div style="display: flex; justify-content: space-between; margin: 5px 0;">
          <span>Subtotale Piatti:</span>
          <span>€${(order.items || []).reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin: 5px 0;">
          <span>Coperto (${s(order.num_people)}p × €1.50):</span>
          <span>€${(order.num_people * 1.50).toFixed(2)}</span>
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 20px; border-top: 2px dashed #000; margin-top: 10px; padding-top: 10px;">
          <span>TOTALE:</span>
          <span>€${parseFloat(order.total || 0).toFixed(2)}</span>
        </div>
      </div>
      
      <div style="text-align: center; margin-top: 20px; padding-top: 10px; border-top: 2px dashed #000; font-size: 12px;">
        <p>Grazie e Buone Feste! 🎁</p>
        <p>───────────────────────</p>
        <p>${s(new Date().toLocaleString('it-IT'))}</p>
      </div>
    </div>
  `

  const element = document.createElement('div')
  element.innerHTML = htmlContent
  
  const opt = {
    margin: 10,
    filename: `Comanda_${order.id}_${order.character}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: 'mm', format: 'a5', orientation: 'portrait' }
  }

  html2pdf().set(opt).from(element).save()
}

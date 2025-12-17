import { supabase } from './supabase'

// =============================================
// ORDINI
// =============================================

export async function getAllOrders() {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('timestamp', { ascending: true })
  
  if (error) throw error
  
  // Trasforma dal formato PostgreSQL al formato dell'app
  return data.map(order => ({
    id: order.id,
    characterName: order.character_name, // FIXATO: era 'character'
    email: order.email,
    numPeople: order.num_people, // FIXATO: era 'num_people'
    orderType: order.order_type,
    sessionType: order.session_type,
    sessionDate: order.session_date,
    sessionTime: order.session_time,
    items: order.items,
    notes: order.notes,
    total: parseFloat(order.total),
    status: order.status,
    timestamp: order.timestamp,
    arrivalGroupId: order.arrival_group_id // FIXATO: era 'arrival_group_id'
  }))
}

export async function createOrder(orderData) {
  // Supporta sia camelCase che snake_case per compatibilità
  const characterName = orderData.characterName || orderData.character
  const numPeople = orderData.numPeople || orderData.num_people || 1
  const orderType = orderData.orderType || orderData.order_type
  const sessionType = orderData.sessionData?.sessionType || orderData.sessionType || 'immediate'
  const sessionDate = orderData.sessionData?.sessionDate || orderData.sessionDate || null
  const sessionTime = orderData.sessionData?.sessionTime || orderData.sessionTime || null
  
  console.log('📦 Creating order:', { characterName, email: orderData.email, numPeople, orderType })
  
  if (!characterName) {
    throw new Error('character_name is required')
  }
  
  const total = orderData.total || orderData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  
  const newOrder = {
    character_name: characterName,
    email: orderData.email,
    num_people: numPeople,
    order_type: orderType,
    session_type: sessionType,
    session_date: sessionDate,
    session_time: sessionTime,
    items: orderData.items,
    notes: orderData.notes || '',
    total: total,
    status: 'pending',
    arrival_group_id: orderData.arrival_group_id || crypto.randomUUID()
  }
  
  console.log('📤 Sending to Supabase:', newOrder)
  
  const { data, error } = await supabase
    .from('orders')
    .insert([newOrder])
    .select()
  
  if (error) {
    console.error('❌ Order insert error:', error)
    throw error
  }
  
  console.log('✅ Order created successfully:', data[0])
  return data[0]
}

export async function updateOrderStatus(orderId, newStatus) {
  const { error } = await supabase
    .from('orders')
    .update({ status: newStatus })
    .eq('id', orderId)
  
  if (error) throw error
}

export async function deleteOrder(orderId) {
  // Prima di eliminare l'ordine, elimina le prenotazioni e i posti walk-in associati
  try {
    // 1. Get order info to know character name
    const { data: order, error: fetchError } = await supabase
      .from('orders')
      .select('character_name, num_people')
      .eq('id', orderId)
      .single()
    
    if (fetchError) throw fetchError
    
    if (order && order.character_name) {
      console.log(`🧹 Cleaning up seats for: ${order.character_name}`)
      
      // 2. Delete from active_reservations
      const { error: resError } = await supabase
        .from('active_reservations')
        .delete()
        .eq('character_name', order.character_name)
      
      if (resError) {
        console.warn('Warning deleting reservation:', resError)
      } else {
        console.log(`✅ Deleted reservation for ${order.character_name}`)
      }
      
      // 3. Delete from walkin_seats
      const { error: walkinError } = await supabase
        .from('walkin_seats')
        .delete()
        .eq('character_name', order.character_name)
      
      if (walkinError) {
        console.warn('Warning deleting walk-in:', walkinError)
      } else {
        console.log(`✅ Deleted walk-in for ${order.character_name}`)
      }
    }
    
    // 4. Finally delete the order
    const { error: deleteError } = await supabase
      .from('orders')
      .delete()
      .eq('id', orderId)
    
    if (deleteError) throw deleteError
    
    console.log(`✅ Order ${orderId} and associated seats deleted successfully`)
    return { success: true, freedSeats: order?.num_people || 0 }
    
  } catch (error) {
    console.error('Error in deleteOrder:', error)
    throw error
  }
}

export async function updateOrderPeople(orderId, numPeople) {
  const { error } = await supabase
    .from('orders')
    .update({ num_people: numPeople })
    .eq('id', orderId)
  
  if (error) throw error
}

export async function updateMultipleOrdersStatus(orderIds, newStatus) {
  const { error } = await supabase
    .from('orders')
    .update({ status: newStatus })
    .in('id', orderIds)
  
  if (error) throw error
}

export async function deleteMultipleOrders(orderIds) {
  // Delete seats for each order before deleting the orders
  try {
    let totalFreedSeats = 0
    
    for (const orderId of orderIds) {
      // 1. Get order info
      const { data: order, error: fetchError } = await supabase
        .from('orders')
        .select('character_name, num_people')
        .eq('id', orderId)
        .single()
      
      if (fetchError) {
        console.warn(`Warning fetching order ${orderId}:`, fetchError)
        continue
      }
      
      if (order && order.character_name) {
        console.log(`🧹 Cleaning up seats for: ${order.character_name}`)
        
        // 2. Delete reservations
        await supabase
          .from('active_reservations')
          .delete()
          .eq('character_name', order.character_name)
        
        // 3. Delete walk-in
        await supabase
          .from('walkin_seats')
          .delete()
          .eq('character_name', order.character_name)
        
        totalFreedSeats += order.num_people || 0
      }
    }
    
    // 4. Finally delete all orders
    const { error: deleteError } = await supabase
      .from('orders')
      .delete()
      .in('id', orderIds)
    
    if (deleteError) throw deleteError
    
    console.log(`✅ ${orderIds.length} orders deleted, ${totalFreedSeats} seats freed`)
    return { success: true, freedSeats: totalFreedSeats }
    
  } catch (error) {
    console.error('Error in deleteMultipleOrders:', error)
    throw error
  }
}

// =============================================
// POSTI DISPONIBILI
// =============================================

export async function getAvailableSeats() {
  const { data, error } = await supabase.rpc('get_available_seats')
  if (error) throw error
  return data || 150
}

export async function getAvailableWalkinSeats() {
  const { data, error } = await supabase.rpc('get_available_walkin_seats')
  if (error) throw error
  return data || 100
}

// =============================================
// PRENOTAZIONI ATTIVE
// =============================================

export async function getActiveReservations() {
  const { data, error } = await supabase
    .from('active_reservations')
    .select('*')
  
  if (error) throw error
  return data
}

export async function createReservation(characterName, email, numPeople, sessionData) {
  try {
    console.log('📝 Creating reservation:', { characterName, email, numPeople, sessionData })
    
    // La tabella active_reservations ha solo: character_name e num_people
    // Email e session data sono salvati solo nell'ordine finale
    const { error } = await supabase
      .from('active_reservations')
      .insert([{ 
        character_name: characterName,
        num_people: numPeople
      }])
    
    if (error) {
      console.error('❌ Reservation error:', error)
      throw error
    }
    
    console.log('✅ Reservation created successfully')
  } catch (error) {
    console.error('Error in createReservation:', error)
    throw error
  }
}

export async function deleteReservation(characterName) {
  try {
    console.log(`🧹 Deleting all data for character: ${characterName}`)
    
    // 1. Delete from active_reservations
    const { error: resError } = await supabase
      .from('active_reservations')
      .delete()
      .eq('character_name', characterName)
    
    if (resError) {
      console.warn('Warning deleting reservation:', resError)
    } else {
      console.log(`✅ Deleted active_reservation for ${characterName}`)
    }
    
    // 2. Delete ALL orders for this character (immediate, lunch, dinner)
    const { error: ordersError } = await supabase
      .from('orders')
      .delete()
      .eq('character_name', characterName)
    
    if (ordersError) {
      console.warn('Warning deleting orders:', ordersError)
    } else {
      console.log(`✅ Deleted all orders for ${characterName}`)
    }
    
    // 3. Delete from walkin_seats if exists
    const { error: walkinError } = await supabase
      .from('walkin_seats')
      .delete()
      .eq('character_name', characterName)
    
    if (walkinError) {
      console.warn('Warning deleting walk-in:', walkinError)
    } else {
      console.log(`✅ Deleted walk-in for ${characterName}`)
    }
    
    console.log(`✅ Complete cleanup for ${characterName}`)
  } catch (error) {
    console.error('Error in deleteReservation:', error)
    throw error
  }
}

// Libera solo i posti di prenotazione, mantenendo gli ordini (per ordini completati)
export async function freeReservationSeats(characterName) {
  try {
    console.log(`🪑 Freeing reservation seats for: ${characterName}`)
    
    // 1. Delete from active_reservations (libera i posti)
    const { error: resError } = await supabase
      .from('active_reservations')
      .delete()
      .eq('character_name', characterName)
    
    if (resError) {
      console.warn('Warning freeing reservation seats:', resError)
    } else {
      console.log(`✅ Freed reservation seats for ${characterName}`)
    }
    
    // 2. Delete from walkin_seats if exists (libera i posti walk-in)
    const { error: walkinError } = await supabase
      .from('walkin_seats')
      .delete()
      .eq('character_name', characterName)
    
    if (walkinError) {
      console.warn('Warning freeing walk-in seats:', walkinError)
    } else {
      console.log(`✅ Freed walk-in seats for ${characterName}`)
    }
    
    // NON elimina gli ordini - rimangono in "completed" per lo storico
    console.log(`✅ Reservation seats freed for ${characterName}, orders preserved`)
  } catch (error) {
    console.error('Error in freeReservationSeats:', error)
    throw error
  }
}

export async function updateReservationPeople(characterName, numPeople) {
  // Aggiorna la prenotazione
  const { error: reservationError } = await supabase
    .from('active_reservations')
    .update({ num_people: numPeople })
    .eq('character_name', characterName)
  
  if (reservationError) throw reservationError
  
  // Aggiorna anche gli ordini associati
  const { error: ordersError } = await supabase
    .from('orders')
    .update({ num_people: numPeople })
    .eq('character_name', characterName)
    .neq('status', 'cancelled') // Solo ordini attivi
  
  if (ordersError) {
    console.warn('Errore aggiornamento ordini:', ordersError)
    // Non bloccare se gli ordini falliscono, la prenotazione è già aggiornata
  }
  
  console.log(`✅ Aggiornati num_people per ${characterName}: ${numPeople}`)
}

// =============================================
// WALK-IN SEATS
// =============================================

export async function getWalkinSeats() {
  const { data, error } = await supabase
    .from('walkin_seats')
    .select('*')
  
  if (error) throw error
  return data
}

export async function createWalkinSeats(characterName, numSeats) {
  const { error } = await supabase
    .from('walkin_seats')
    .insert([{ character_name: characterName, num_seats: numSeats }])
  
  if (error) throw error
}

export async function deleteWalkinSeats(characterName) {
  const { error } = await supabase
    .from('walkin_seats')
    .delete()
    .eq('character_name', characterName)
  
  if (error) throw error
}

export async function updateWalkinSeats(characterName, numSeats) {
  const { error } = await supabase
    .from('walkin_seats')
    .update({ num_seats: numSeats })
    .eq('character_name', characterName)
  
  if (error) throw error
}

// =============================================
// CONFIGURAZIONE SISTEMA
// =============================================

export async function getSystemConfig(key) {
  const { data, error } = await supabase
    .from('system_config')
    .select('config_value')
    .eq('config_key', key)
    .single()
  
  if (error) throw error
  return data?.config_value
}

export async function getAllSystemConfig() {
  const { data, error } = await supabase
    .from('system_config')
    .select('*')
  
  if (error) throw error
  
  // Converte array in oggetto chiave-valore
  const config = {}
  data.forEach(item => {
    config[item.config_key] = item.config_value
  })
  return config
}

export async function updateSystemConfig(key, value) {
  const { error } = await supabase
    .from('system_config')
    .update({ config_value: value })
    .eq('config_key', key)
  
  if (error) throw error
}

export async function updateMultipleConfigs(configs) {
  // configs è un oggetto { key: value, ... }
  const promises = Object.entries(configs).map(([key, value]) =>
    updateSystemConfig(key, value)
  )
  
  await Promise.all(promises)
}

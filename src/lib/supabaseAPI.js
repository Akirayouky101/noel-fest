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
    character: order.character_name,
    email: order.email,
    num_people: order.num_people,
    orderType: order.order_type,
    sessionType: order.session_type,
    sessionDate: order.session_date,
    sessionTime: order.session_time,
    items: order.items,
    notes: order.notes,
    total: parseFloat(order.total),
    status: order.status,
    timestamp: order.timestamp,
    arrival_group_id: order.arrival_group_id
  }))
}

export async function createOrder(orderData) {
  const newOrder = {
    character_name: orderData.character,
    email: orderData.email,
    num_people: orderData.num_people,
    order_type: orderData.orderType,
    session_type: orderData.sessionType || 'immediate',
    session_date: orderData.sessionDate || null,
    session_time: orderData.sessionTime || null,
    items: orderData.items,
    notes: orderData.notes || '',
    total: orderData.total,
    status: 'pending',
    // PostgreSQL genererà automaticamente l'UUID via gen_random_uuid() di default
    // oppure possiamo usare crypto.randomUUID() se servisse lato client
    arrival_group_id: orderData.arrival_group_id || crypto.randomUUID()
  }
  
  const { data, error } = await supabase
    .from('orders')
    .insert([newOrder])
    .select()
  
  if (error) throw error
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
  const { error } = await supabase
    .from('orders')
    .delete()
    .eq('id', orderId)
  
  if (error) throw error
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
  const { error } = await supabase
    .from('orders')
    .delete()
    .in('id', orderIds)
  
  if (error) throw error
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

export async function createReservation(characterName, numPeople) {
  const { error } = await supabase
    .from('active_reservations')
    .insert([{ character_name: characterName, num_people: numPeople }])
  
  if (error) throw error
}

export async function deleteReservation(characterName) {
  const { error } = await supabase
    .from('active_reservations')
    .delete()
    .eq('character_name', characterName)
  
  if (error) throw error
}

export async function updateReservationPeople(characterName, numPeople) {
  const { error } = await supabase
    .from('active_reservations')
    .update({ num_people: numPeople })
    .eq('character_name', characterName)
  
  if (error) throw error
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

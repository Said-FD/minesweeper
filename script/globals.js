const SUPABASE_URL = 'https://tihtcfbjmlklbtvrhbyq.supabase.co'
const SUPABASE_PUBLIC_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRpaHRjZmJqbWxrbGJ0dnJoYnlxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUyNTg0OTIsImV4cCI6MjA3MDgzNDQ5Mn0.L5fMYHl1Fuf5CV1GywPKUMiIAZSSymqxcSXdZA7cWJg'
const LS_STATS_KEY = 'sb-poopsweeper-stats'
const LS_STATS_DISPLAY_KEY = 'sb-poopsweeper-stats-display'
const LS_BOARD_SIZE_KEY = 'boardSize'

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_PUBLIC_ANON_KEY)

let clickCount = 0

const getLsItem = key => {
  const item = localStorage.getItem(key)
  return item ? JSON.parse(item) : null
}

const setLsItem = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value))
}

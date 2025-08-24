const SUPABASE_URL = 'https://nmrprnvjxmkqgaeeemfx.supabase.co'
const SUPABASE_PUBLIC_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5tcnBybnZqeG1rcWdhZWVlbWZ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYwMjYwNzgsImV4cCI6MjA3MTYwMjA3OH0.HD4E8kNgCyMQXBEyHEQIojULlhlACempzCiMPDnatzQ'

const LS_STATS_KEY = 'sb-poopsweeper-stats'
const LS_STATS_DISPLAY_KEY = 'sb-poopsweeper-stats-display'
const LS_BOARD_SIZE_KEY = 'boardSize'

const SIGNUP_TYPE = 'signup'
const LOGIN_TYPE = 'login'
const WIN_TYPE = 'win'
const LOSE_TYPE = 'restart'

let clickCount = 0

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_PUBLIC_ANON_KEY)

const getLsItem = key => {
  const item = localStorage.getItem(key)
  return item ? JSON.parse(item) : null
}

const setLsItem = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value))
}

const removeLsItem = key => {
  localStorage.removeItem(key)
}

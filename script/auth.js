const authButton = document.querySelector('.auth-button')
const authDialog = document.querySelector('.auth-dialog')
const authDialogCloseButton = authDialog.querySelector('.dialog-close-button')
const form = authDialog.querySelector('.form')
const loginButton = form.querySelector('.login-button')
const signupButton = form.querySelector('.signup-button')
const signoutButtonGroup = authDialog.querySelector('.signout-button-group')
const signoutButton = signoutButtonGroup.querySelector('.signout-button')

const transformMillsToHhMmSs = milliseconds => {
  if (!milliseconds) return ''

  const totalSeconds = Math.floor(milliseconds / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  const leftPad = num => num.toString().padStart(2, '0')
  let hh = ''
  let mm = ''
  let ss = `${leftPad(seconds)}s`

  if (hours > 0) {
    hh = `${hours}h `
    mm = `${leftPad(minutes)}m `
  }
  else if (minutes > 0) mm = `${minutes}m `
  else if (seconds > 0) ss = `${seconds}s`

  return `${hh}${mm}${ss}`
}

const handleAuthError = error => {
  if (error) {
    authDialog.classList.add('auth-error')
    console.error('Auth Error: ', error)
  }
  else {
    authDialog.close()
    authDialog.classList.remove('auth-error')
  }
}

const resetForm = () => {
  form.reset()
  authDialog.classList.remove('auth-error')
}

const signUp = async (email, password) => {
  const { data, error } = await supabaseClient.auth.signUp({ email, password })
  handleAuthError(error)
  // TODO: Finish Sign Up flow
  // console.log("Signed up: ", data)
}

const logIn = async (email, password) => {
  clickCount = 0
  const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password })
  handleAuthError(error)
  if (data?.user?.id) {
    const userId = data.user.id

    const { data: statsData, error: statsError } = await supabaseClient
      .from('users_stats')
      .select()
      .eq('user_id', userId)

    if (statsError) console.error('Stats Error: ', statsError)
    if (statsData?.[0]) setUserStats(statsData[0])
    else {
      const { data: upsertStatsData, error: upsertError } = await supabaseClient
        .from('users_stats')
        .upsert({ user_id: userId })
        .select()

      if (upsertError) console.error('Upsert Error: ', upsertError)
      if (upsertStatsData?.[0]) setUserStats(upsertStatsData[0])
      else console.error('Something went wrong with Upsert request: ', upsertStatsData)
    }
  } else console.error('User account is not found: ', data)
}

const sendAuthRequest = async (type) => {
  const formData = new FormData(form)
  const email = formData.get('email')
  const password = formData.get('password')
  if (!email || !password) return

  if (type === 'login') logIn(email, password)
  else signUp(email, password)
}

authButton.addEventListener('click', async () => {
  const { data: { user } } = await supabaseClient.auth.getUser()
  if (user) {
    form.classList.add('hidden')
    signoutButtonGroup.classList.remove('hidden')
  } else {
    form.classList.remove('hidden')
    signoutButtonGroup.classList.add('hidden')
  }
  resetForm()
  authDialog.showModal()
})

authDialogCloseButton.addEventListener('click', () => authDialog.close())
authDialog.addEventListener('close', () => resetForm())
loginButton.addEventListener('click', async () => await sendAuthRequest('login'))
signupButton.addEventListener('click', async () => await sendAuthRequest('signup'))
form.addEventListener('submit', event => event.preventDefault())

signoutButton.addEventListener('click', async () => {
  const { error } = await supabaseClient.auth.signOut()
  handleAuthError(error)
})

// authDialog.showModal()
// logIn('frontendmax.pl@gmail.com', 'TEST_Account#12345')

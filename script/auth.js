const authButton = document.querySelector('.auth-button')
const authDialog = document.querySelector('.auth-dialog')
const authDialogCloseButton = authDialog.querySelector('.dialog-close-button')
const form = authDialog.querySelector('.form')
const loginButton = form.querySelector('.login-button')
const signupButton = form.querySelector('.signup-button')
const signoutButtonGroup = authDialog.querySelector('.signout-button-group')
const signoutButton = signoutButtonGroup.querySelector('.signout-button')

const handleAuthError = error => {
  if (error) {
    authDialog.classList.add('auth-error')
    console.error('Auth Error: ', error)
  } else {
    authDialog.close()
    authDialog.classList.remove('auth-error')
  }
}

const handleAuth = async (data, error, type) => {
  clickCount = 0
  handleAuthError(error)

  if (data?.user?.id) {
    const userId = data.user.id

    const { data: statsData, error: statsError } = await supabaseClient
      .from('user_stats')
      .select()
      .eq('user_id', userId)

    if (statsError) console.error('Stats Error: ', statsError)
    if (statsData?.[0]) setInitialStats(statsData[0])
    else {
      const { data: upsertStatsData, error: upsertError } = await supabaseClient
        .from('user_stats')
        .upsert({ user_id: userId })
        .select()

      if (upsertError) console.error('Upsert Error: ', upsertError)
      if (upsertStatsData?.[0]) setInitialStats(upsertStatsData[0])
      else {
        console.error('Something went wrong with Upsert request: ', upsertStatsData)
        if (type === SIGNUP_TYPE) console.warn('User account may already exist')
      }
    }
  } else console.warn('User account is not found: ', data)
}

const resetForm = () => {
  form.reset()
  authDialog.classList.remove('auth-error')
}

const signUp = async (email, password) => {
  const { data, error } = await supabaseClient.auth.signUp({ email, password })
  handleAuth(data, error, SIGNUP_TYPE)
}

const logIn = async (email, password) => {
  const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password })
  handleAuth(data, error, LOGIN_TYPE)
}

const sendAuthRequest = type => {
  const formData = new FormData(form)
  const email = formData.get('email')
  const password = formData.get('password')
  if (!email || !password) return

  if (type === LOGIN_TYPE) logIn(email, password)
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
loginButton.addEventListener('click', () => sendAuthRequest(LOGIN_TYPE))
signupButton.addEventListener('click', () => sendAuthRequest(SIGNUP_TYPE))
form.addEventListener('submit', event => event.preventDefault())

signoutButton.addEventListener('click', async () => {
  const { error } = await supabaseClient.auth.signOut()
  handleAuthError(error)
})

const setUserStats = async (data) => {
  const { best_time, games_started, user_name, wins } = data
  const bestTime = best_time ? transformMillsToHhMmSs(best_time) : 'No boards cleared yet'
  const totalWins = wins || 'None'
  const totalGames = games_started || 'Zero'
  const userDisplayStats = { bestTime, totalWins, totalGames }

  const stats = getLsItem(LS_STATS_KEY)
  if (stats) {
    const { id, games_started: lsGamesStarted } = stats
    if (lsGamesStarted > games_started) {
      const { data, error } = await supabaseClient
        .from('users_stats')
        .update({ games_started: lsGamesStarted })
        .eq('id', id)
        .select()

      if (error) console.error('Set User Stats Error: ', error)
      return
    }
  }

  setLsItem(LS_STATS_KEY, data)
  setLsItem(LS_STATS_DISPLAY_KEY, userDisplayStats)
}

const sendGameStarted = async () => {
  const stats = getLsItem(LS_STATS_KEY)
  if (stats) {
    const { id, games_started } = stats
    const gamesStarted = games_started + 1

    const { data, error } = await supabaseClient
      .from('users_stats')
      .update({ games_started: gamesStarted })
      .eq('id', id)
      .select()
    if (error) console.error('Send Game Started Error: ', error)

    setLsItem(LS_STATS_KEY, { ...stats, games_started: gamesStarted })

    const statsDisplay = getLsItem(LS_STATS_DISPLAY_KEY)
    if (statsDisplay) {
      setLsItem(LS_STATS_DISPLAY_KEY, { ...statsDisplay, totalGames: gamesStarted })
    }
  } else console.warn('You need to log in to sync game stats')
}

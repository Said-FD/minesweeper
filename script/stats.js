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

const requestStatsUpdate = async (id, newStats) => {
  const { data, error } = await supabaseClient
    .from('user_stats')
    .update(newStats)
    .eq('id', id)
    .select()
  return { data, error }
}

const setInitialStats = data => {
  const { id, best_time, games_started, user_name, wins } = data
  const bestTime = best_time ? transformMillsToHhMmSs(best_time) : 'No boards cleared yet'
  const totalWins = wins || 'None'
  const totalGames = games_started || 'Zero'
  const userDisplayStats = { bestTime, totalWins, totalGames }

  const stats = getLsItem(LS_STATS_KEY)
  if (stats) {
    const { id: lsId, games_started: lsGamesStarted } = stats

    if (id !== lsId) {
      removeLsItem(LS_STATS_KEY)
      removeLsItem(LS_STATS_DISPLAY_KEY)
    } else if (lsGamesStarted > games_started) {
      const updatedStats = {
        games_started: lsGamesStarted,
        updated_at: new Date()
      }
      const { data, error } = requestStatsUpdate(id, updatedStats)
      if (error) console.error('Set User Stats Error: ', error)
      return
    }
  }

  setLsItem(LS_STATS_KEY, data)
  setLsItem(LS_STATS_DISPLAY_KEY, userDisplayStats)
}

const sendGameStarted = () => {
  const stats = getLsItem(LS_STATS_KEY)
  if (stats) {
    const { id, games_started } = stats
    const totalGames = games_started + 1
    const updatedStats = {
      games_started: totalGames,
      updated_at: new Date()
    }

    const { data, error } = requestStatsUpdate(id, updatedStats)
    if (error) console.error('Send Game Started Error: ', error)

    setLsItem(LS_STATS_KEY, { ...stats, games_started: totalGames })

    const statsDisplay = getLsItem(LS_STATS_DISPLAY_KEY)
    if (statsDisplay) {
      setLsItem(LS_STATS_DISPLAY_KEY, { ...statsDisplay, totalGames })
    }
  } else console.warn('You need to log in to sync game stats')
}

const updateStatsOnFinish = type => {
  const stats = getLsItem(LS_STATS_KEY)
  if (stats) {
    const { id, best_time, games_finished, loses, wins } = stats
    const totalWins = type === WIN_TYPE ? wins + 1 : wins
    const bestTime = best_time // TODO: Update best time

    const updatedStats = {
      best_time: bestTime, 
      wins: totalWins,
      loses: type === LOSE_TYPE ? loses + 1 : loses,
      games_finished: games_finished + 1,
      updated_at: new Date()
    }

    const { data, error } = requestStatsUpdate(id, updatedStats)
    if (error) console.error('Stats Update Error: ', error)

    setLsItem(LS_STATS_KEY, { ...stats, ...updatedStats })

    const statsDisplay = getLsItem(LS_STATS_DISPLAY_KEY)
    if (statsDisplay) {
      setLsItem(LS_STATS_DISPLAY_KEY, { ...statsDisplay, bestTime, totalWins })
    }
  }
}

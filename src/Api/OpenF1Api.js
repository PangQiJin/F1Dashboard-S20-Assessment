const BaseUrl = 'https://api.openf1.org/v1'

export async function GetRaceSessions(Year) {
  const Response = await fetch(
    `${BaseUrl}/sessions?year=${Year}&session_name=Race`
  )

  if (!Response.ok) {
    throw new Error('Unable to retrieve F1 races.')
  }

  const Data = await Response.json()

  const RaceSessions = Data
    .filter((Race) => !Race.is_cancelled)
    .sort(
      (RaceA, RaceB) =>
        new Date(RaceA.date_start) -
        new Date(RaceB.date_start)
    )

  return RaceSessions
}

export async function GetRaceResults(SessionKey) {
  const Response = await fetch(
    `${BaseUrl}/session_result?session_key=${SessionKey}`
  )

  if (!Response.ok) {
    throw new Error('Unable to retrieve race results.')
  }

  const Data = await Response.json()

  const SortedResults = [...Data].sort(
    (ResultA, ResultB) => {
      const PositionA = ResultA.position
      const PositionB = ResultB.position

      const HasPositionA =
        PositionA !== null && PositionA !== undefined

      const HasPositionB =
        PositionB !== null && PositionB !== undefined

      if (HasPositionA && HasPositionB) {
        return PositionA - PositionB
      }

      if (HasPositionA) {
        return -1
      }

      if (HasPositionB) {
        return 1
      }

      return GetStatusOrder(ResultA) - GetStatusOrder(ResultB)
    }
  )

  return SortedResults
}

export async function GetDrivers(SessionKey) {
  const Response = await fetch(
    `${BaseUrl}/drivers?session_key=${SessionKey}`
  )

  if (!Response.ok) {
    throw new Error('Unable to retrieve driver data.')
  }

  const Data = await Response.json()

  return Data
}

function GetStatusOrder(Result) {
  if (Result.dnf) {
    return 1
  }

  if (Result.dns) {
    return 2
  }

  if (Result.dsq) {
    return 3
  }

  return 4
}
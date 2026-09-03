const BaseUrl = 'https://api.openf1.org/v1'

function Wait(Milliseconds) {
  return new Promise((Resolve) => {
    setTimeout(Resolve, Milliseconds)
  })
}

async function FetchOpenF1(Endpoint) {
  const MaximumAttempts = 3

  for (
    let Attempt = 1;
    Attempt <= MaximumAttempts;
    Attempt++
  ) {
    try {
      const Response = await fetch(
        `${BaseUrl}${Endpoint}`
      )

      if (Response.ok) {
        return await Response.json()
      }

      const ShouldRetry =
        Response.status === 429 ||
        Response.status >= 500

      if (
        !ShouldRetry ||
        Attempt === MaximumAttempts
      ) {
        throw new Error(
          `OpenF1 request failed with status ${Response.status}.`
        )
      }
    } catch (Error) {
      if (Attempt === MaximumAttempts) {
        throw Error
      }
    }

    const RetryDelay = Attempt * 1000

    await Wait(RetryDelay)
  }

  throw new Error('Unable to retrieve OpenF1 data.')
}

export async function GetRaceSessions(Year) {
  const Data = await FetchOpenF1(
    `/sessions?year=${Year}&session_name=Race`
  )

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
  const Data = await FetchOpenF1(
    `/session_result?session_key=${SessionKey}`
  )

  const SortedResults = [...Data].sort(
    (ResultA, ResultB) => {
      const PositionA = ResultA.position
      const PositionB = ResultB.position

      const HasPositionA =
        PositionA !== null &&
        PositionA !== undefined

      const HasPositionB =
        PositionB !== null &&
        PositionB !== undefined

      if (HasPositionA && HasPositionB) {
        return PositionA - PositionB
      }

      if (HasPositionA) {
        return -1
      }

      if (HasPositionB) {
        return 1
      }

      return (
        GetStatusOrder(ResultA) -
        GetStatusOrder(ResultB)
      )
    }
  )

  return SortedResults
}

export async function GetDrivers(SessionKey) {
  const Data = await FetchOpenF1(
    `/drivers?session_key=${SessionKey}`
  )

  return Data
}

export async function GetDriverChampionship(
  SessionKey
) {
  const Data = await FetchOpenF1(
    `/championship_drivers?session_key=${SessionKey}`
  )

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
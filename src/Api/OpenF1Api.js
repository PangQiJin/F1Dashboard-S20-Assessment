const BaseUrl = 'https://api.openf1.org/v1'

const MaximumAttempts = 3
const RequestTimeout = 5000

// Cache previously retrieved API responses so revisiting a season
// or race does not repeatedly request the same data from OpenF1.
const RaceSessionCache = new Map()
const RaceResultCache = new Map()
const DriverCache = new Map()
const ChampionshipCache = new Map()

function Wait(Milliseconds) {
  return new Promise((Resolve) => {
    setTimeout(Resolve, Milliseconds)
  })
}

// Central OpenF1 request function.
//
// Requests are given a timeout and are automatically retried when
// OpenF1 temporarily returns a rate-limit or server error.
// An external AbortSignal can also cancel outdated requests when
// the user changes race or season before the previous request finishes.
async function FetchOpenF1(
  Endpoint,
  ExternalSignal = null
) {
  let LastError = null

  for (
    let Attempt = 1;
    Attempt <= MaximumAttempts;
    Attempt++
  ) {
    const Controller =
      new AbortController()

    function CancelRequest() {
      Controller.abort()
    }

    if (ExternalSignal) {
      if (ExternalSignal.aborted) {
        Controller.abort()
      } else {
        ExternalSignal.addEventListener(
          'abort',
          CancelRequest,
          { once: true }
        )
      }
    }

    // Prevent an OpenF1 request from leaving the dashboard
    // permanently stuck in a loading state.
    const TimeoutId =
      setTimeout(() => {
        Controller.abort()
      }, RequestTimeout)

    try {
      const Response =
        await fetch(
          `${BaseUrl}${Endpoint}`,
          {
            signal:
              Controller.signal,
          }
        )

      clearTimeout(
        TimeoutId
      )

      if (ExternalSignal) {
        ExternalSignal.removeEventListener(
          'abort',
          CancelRequest
        )
      }

      if (Response.ok) {
        return await Response.json()
      }

      // Temporary API failures are worth retrying.
      // Other HTTP errors are returned immediately.
      const ShouldRetry =
        Response.status === 429 ||
        Response.status >= 500

      if (
        !ShouldRetry ||
        Attempt ===
          MaximumAttempts
      ) {
        throw new Error(
          `OpenF1 request failed with status ${Response.status}.`
        )
      }

      // Respect OpenF1's Retry-After header when available.
      // Otherwise use a gradually increasing delay.
      const RetryAfterHeader =
        Response.headers.get(
          'Retry-After'
        )

      const RetryDelay =
        RetryAfterHeader
          ? Number(
              RetryAfterHeader
            ) * 1000
          : Attempt * 1200

      await Wait(
        RetryDelay
      )
    } catch (Error) {
      clearTimeout(
        TimeoutId
      )

      if (ExternalSignal) {
        ExternalSignal.removeEventListener(
          'abort',
          CancelRequest
        )
      }

      // User-triggered cancellations should not be treated as
      // normal API failures or retried.
      if (
        ExternalSignal?.aborted
      ) {
        throw Error
      }

      LastError = Error

      if (
        Attempt ===
        MaximumAttempts
      ) {
        break
      }

      await Wait(
        Attempt * 1200
      )
    }
  }

  throw (
    LastError ??
    new Error(
      'Unable to retrieve OpenF1 data.'
    )
  )
}

// Retrieve race sessions for a season and sort them chronologically.
export async function GetRaceSessions(
  Year,
  Signal = null
) {
  if (
    RaceSessionCache.has(
      Year
    )
  ) {
    return RaceSessionCache.get(
      Year
    )
  }

  const Data =
    await FetchOpenF1(
      `/sessions?year=${Year}&session_name=Race`,
      Signal
    )

  const RaceSessions =
    Data
      .filter(
        (Race) =>
          !Race.is_cancelled
      )
      .sort(
        (
          RaceA,
          RaceB
        ) =>
          new Date(
            RaceA.date_start
          ) -
          new Date(
            RaceB.date_start
          )
      )

  RaceSessionCache.set(
    Year,
    RaceSessions
  )

  return RaceSessions
}

// Retrieve the final classification for a race.
// Classified drivers are ordered by finishing position while
// non-finishers are placed after them using their race status.
export async function GetRaceResults(
  SessionKey,
  Signal = null
) {
  if (
    RaceResultCache.has(
      SessionKey
    )
  ) {
    return RaceResultCache.get(
      SessionKey
    )
  }

  const Data =
    await FetchOpenF1(
      `/session_result?session_key=${SessionKey}`,
      Signal
    )

  const SortedResults =
    [...Data].sort(
      (
        ResultA,
        ResultB
      ) => {
        const PositionA =
          ResultA.position

        const PositionB =
          ResultB.position

        const HasPositionA =
          PositionA !== null &&
          PositionA !==
            undefined

        const HasPositionB =
          PositionB !== null &&
          PositionB !==
            undefined

        if (
          HasPositionA &&
          HasPositionB
        ) {
          return (
            PositionA -
            PositionB
          )
        }

        if (HasPositionA) {
          return -1
        }

        if (HasPositionB) {
          return 1
        }

        return (
          GetStatusOrder(
            ResultA
          ) -
          GetStatusOrder(
            ResultB
          )
        )
      }
    )

  RaceResultCache.set(
    SessionKey,
    SortedResults
  )

  return SortedResults
}

// Driver data supplies information not included directly in the
// session-result endpoint, such as driver name, team and team colour.
export async function GetDrivers(
  SessionKey,
  Signal = null
) {
  if (
    DriverCache.has(
      SessionKey
    )
  ) {
    return DriverCache.get(
      SessionKey
    )
  }

  const Data =
    await FetchOpenF1(
      `/drivers?session_key=${SessionKey}`,
      Signal
    )

  DriverCache.set(
    SessionKey,
    Data
  )

  return Data
}

// Championship data is used to calculate how many points each
// driver earned specifically during the selected race.
export async function GetDriverChampionship(
  SessionKey,
  Signal = null
) {
  if (
    ChampionshipCache.has(
      SessionKey
    )
  ) {
    return ChampionshipCache.get(
      SessionKey
    )
  }

  const Data =
    await FetchOpenF1(
      `/championship_drivers?session_key=${SessionKey}`,
      Signal
    )

  ChampionshipCache.set(
    SessionKey,
    Data
  )

  return Data
}

// Provide a consistent ordering for drivers without a numeric
// finishing position.
function GetStatusOrder(
  Result
) {
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
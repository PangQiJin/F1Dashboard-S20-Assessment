import {
  useEffect,
  useState,
} from 'react'

import {
  GetDriverChampionship,
  GetDrivers,
  GetRaceResults,
  GetRaceSessions,
} from './Api/OpenF1Api'

import DashboardHeader from './Components/DashboardHeader'
import DriverPointsChart from './Components/DriverPointsChart'
import RaceList from './Components/RaceList'
import RaceSummary from './Components/RaceSummary'
import ResultsTable from './Components/ResultsTable'
import TeamPointsChart from './Components/TeamPointsChart'

import './App.css'

function App() {
  // Application-level state remains in App so the separate
  // components can share the same selected season and race data.
  const [
    Season,
    setSeason,
  ] = useState(2025)

  const [
    Races,
    setRaces,
  ] = useState([])

  const [
    SelectedRace,
    setSelectedRace,
  ] = useState(null)

  const [
    RaceResults,
    setRaceResults,
  ] = useState([])

  // Team analytics use separate hover and selected states so
  // desktop hover and mobile tap interactions can coexist.
  const [
    HoveredTeamIndex,
    setHoveredTeamIndex,
  ] = useState(null)

  const [
    SelectedTeamIndex,
    setSelectedTeamIndex,
  ] = useState(null)

  const [
    SelectedDriverPoint,
    setSelectedDriverPoint,
  ] = useState(null)

  // Charts use a different layout on smaller screens.
  const [
    IsCompactLayout,
    setIsCompactLayout,
  ] = useState(false)

  const [
    IsLoading,
    setIsLoading,
  ] = useState(true)

  const [
    ErrorTitle,
    setErrorTitle,
  ] = useState('')

  const [
    ErrorMessage,
    setErrorMessage,
  ] = useState('')

  const [
    IsResultsLoading,
    setIsResultsLoading,
  ] = useState(false)

  const [
    ResultsErrorMessage,
    setResultsErrorMessage,
  ] = useState('')

  const [
    PointsWarningMessage,
    setPointsWarningMessage,
  ] = useState('')

  // Incrementing these keys re-runs the corresponding effect when
  // the user selects "Try Again" after an API failure.
  const [
    RaceReloadKey,
    setRaceReloadKey,
  ] = useState(0)

  const [
    ResultsReloadKey,
    setResultsReloadKey,
  ] = useState(0)

  // Detect the mobile chart breakpoint in JavaScript because
  // Recharts requires different chart structures for desktop
  // vertical bars and mobile horizontal bars.
  useEffect(() => {
    const MediaQuery =
      window.matchMedia(
        '(max-width: 760px)'
      )

    function UpdateLayout() {
      setIsCompactLayout(
        MediaQuery.matches
      )
    }

    UpdateLayout()

    MediaQuery.addEventListener(
      'change',
      UpdateLayout
    )

    return () => {
      MediaQuery.removeEventListener(
        'change',
        UpdateLayout
      )
    }
  }, [])

  // Retrieve the race list whenever the selected season changes
  // or the user retries a failed race-list request.
  useEffect(() => {
    const Controller =
      new AbortController()

    async function LoadRaces() {
      try {
        const RaceData =
          await GetRaceSessions(
            Season,
            Controller.signal
          )

        // Ignore outdated responses if this request was cancelled
        // because the season changed.
        if (
          Controller.signal.aborted
        ) {
          return
        }

        setErrorTitle('')
        setErrorMessage('')

        setRaces(
          RaceData
        )
      } catch (Error) {
        if (
          Controller.signal.aborted
        ) {
          return
        }

        console.error(
          Error
        )

        // OpenF1 temporarily restricts unauthenticated API access
        // while a live F1 session is taking place.
        if (
          Error.code ===
          'OPENF1_LIVE_SESSION'
        ) {
          setErrorTitle(
            'Temporarily unavailable'
          )

          setErrorMessage(
            'A live F1 session is currently in progress, so OpenF1 has temporarily restricted free API access. Race data will be available again after the session ends.'
          )
        } else {
          setErrorTitle(
            'Unable to load races'
          )

          setErrorMessage(
            'We could not retrieve the race list from OpenF1.'
          )
        }

        setRaces([])
      } finally {
        if (
          !Controller.signal.aborted
        ) {
          setIsLoading(
            false
          )
        }
      }
    }

    LoadRaces()

    // Abort the previous request when the effect runs again.
    return () => {
      Controller.abort()
    }
  }, [
    Season,
    RaceReloadKey,
  ])

  // Load all information needed for the selected race.
  useEffect(() => {
    if (!SelectedRace) {
      return
    }

    const Controller =
      new AbortController()

    async function LoadRaceResults() {
      try {
        // Result and driver requests are independent, so they can
        // run simultaneously to reduce loading time.
        const [
          ResultData,
          DriverData,
        ] = await Promise.all([
          GetRaceResults(
            SelectedRace.session_key,
            Controller.signal
          ),

          GetDrivers(
            SelectedRace.session_key,
            Controller.signal
          ),
        ])

        if (
          Controller.signal.aborted
        ) {
          return
        }

        let ChampionshipData = []

        try {
          ChampionshipData =
            await GetDriverChampionship(
              SelectedRace.session_key,
              Controller.signal
            )
        } catch (
          PointsError
        ) {
          if (
            Controller.signal.aborted
          ) {
            return
          }

          console.error(
            'Points request failed:',
            PointsError
          )

          if (
            PointsError.code ===
            'OPENF1_LIVE_SESSION'
          ) {
            setPointsWarningMessage(
              'Points are temporarily unavailable because OpenF1 is restricting free API access during a live F1 session.'
            )
          } else {
            // Championship points are treated as optional so a
            // temporary failure does not hide the actual race results.
            setPointsWarningMessage(
              'Points are temporarily unavailable. Race results are still shown below.'
            )
          }
        }

        // Merge data from multiple OpenF1 endpoints into one object
        // that the dashboard components can consume easily.
        const CombinedResults =
          ResultData.map(
            (Result) => {
              const Driver =
                DriverData.find(
                  (
                    DriverItem
                  ) =>
                    DriverItem.driver_number ===
                    Result.driver_number
                )

              const Championship =
                ChampionshipData.find(
                  (
                    ChampionshipItem
                  ) =>
                    ChampionshipItem.driver_number ===
                    Result.driver_number
                )

              let RacePoints = null

              if (Championship) {
                const PointsStart =
                  Number(
                    Championship.points_start
                  )

                const PointsCurrent =
                  Number(
                    Championship.points_current
                  )

                /*
                  OpenF1 championship data supplies the driver's points
                  before and after the race. Their difference represents
                  the championship points earned in this race.
                */
                if (
                  !Number.isNaN(
                    PointsStart
                  ) &&
                  !Number.isNaN(
                    PointsCurrent
                  )
                ) {
                  RacePoints =
                    Number(
                      (
                        PointsCurrent -
                        PointsStart
                      ).toFixed(2)
                    )
                }
              }

              return {
                ...Result,

                full_name:
                  Driver?.full_name ??
                  `Driver #${Result.driver_number}`,

                team_name:
                  Driver?.team_name ??
                  'Team unavailable',

                team_colour:
                  Driver?.team_colour ??
                  null,

                points:
                  RacePoints,
              }
            }
          )

        if (
          !Controller.signal.aborted
        ) {
          setRaceResults(
            CombinedResults
          )
        }
      } catch (Error) {
        if (
          Controller.signal.aborted
        ) {
          return
        }

        console.error(
          Error
        )

        if (
          Error.code ===
          'OPENF1_LIVE_SESSION'
        ) {
          setResultsErrorMessage(
            'A live F1 session is currently in progress, so OpenF1 has temporarily restricted free API access. Please try again after the session ends.'
          )
        } else {
          setResultsErrorMessage(
            'We could not retrieve the results for this race.'
          )
        }

        setRaceResults([])
      } finally {
        if (
          !Controller.signal.aborted
        ) {
          setIsResultsLoading(
            false
          )
        }
      }
    }

    LoadRaceResults()

    // Prevent an older race request from overwriting the results
    // of a newly selected race.
    return () => {
      Controller.abort()
    }
  }, [
    SelectedRace,
    ResultsReloadKey,
  ])

  // Clear persistent chart selections when the user taps/clicks
  // somewhere outside the interactive analytics.
  function ClearAnalyticsSelections() {
    setHoveredTeamIndex(
      null
    )

    setSelectedTeamIndex(
      null
    )

    setSelectedDriverPoint(
      null
    )
  }

  function ChangeSeason(
    NewSeason
  ) {
    if (
      IsLoading ||
      IsResultsLoading ||
      NewSeason === Season
    ) {
      return
    }

    // Reset race-specific state before loading the new season.
    setSeason(
      NewSeason
    )

    setRaces([])
    setSelectedRace(null)
    setRaceResults([])

    ClearAnalyticsSelections()

    setErrorTitle('')
    setErrorMessage('')
    setResultsErrorMessage('')
    setPointsWarningMessage('')

    setIsLoading(true)
    setIsResultsLoading(false)
  }

  function SelectRace(
    Race
  ) {
    if (
      IsResultsLoading
    ) {
      return
    }

    // Selecting the already active race would unnecessarily repeat
    // the same API/data-loading process.
    if (
      SelectedRace
        ?.session_key ===
      Race.session_key
    ) {
      return
    }

    setRaceResults([])

    ClearAnalyticsSelections()

    setResultsErrorMessage('')
    setPointsWarningMessage('')

    setIsResultsLoading(
      true
    )

    setSelectedRace(
      Race
    )
  }

  // Retry race-list loading by changing a dependency of the
  // corresponding useEffect.
  function RetryRaceList() {
    setRaces([])

    setErrorTitle('')
    setErrorMessage('')

    setIsLoading(
      true
    )

    setRaceReloadKey(
      (CurrentKey) =>
        CurrentKey + 1
    )
  }

  // Retry the selected race without requiring another race
  // to be selected first.
  function RetryRaceResults() {
    if (!SelectedRace) {
      return
    }

    setRaceResults([])

    ClearAnalyticsSelections()

    setResultsErrorMessage('')
    setPointsWarningMessage('')

    setIsResultsLoading(
      true
    )

    setResultsReloadKey(
      (CurrentKey) =>
        CurrentKey + 1
    )
  }

  // Selecting one analytics type clears the other so the UI has
  // only one persistent mobile selection at a time.
  function SelectDriverPoint(
    DriverData
  ) {
    setSelectedDriverPoint(
      DriverData
    )

    setSelectedTeamIndex(
      null
    )

    setHoveredTeamIndex(
      null
    )
  }

  function SelectTeam(
    Index
  ) {
    setSelectedTeamIndex(
      Index
    )

    setSelectedDriverPoint(
      null
    )
  }

  // Analytics should only appear once valid result data exists.
  const CanShowAnalytics =
    SelectedRace &&
    !IsResultsLoading &&
    !ResultsErrorMessage &&
    RaceResults.length > 0

  return (
    <div
      className="dashboard"
      onClick={
        ClearAnalyticsSelections
      }
    >
      <DashboardHeader
        Season={Season}
        IsLoading={
          IsLoading
        }
        IsResultsLoading={
          IsResultsLoading
        }
        ChangeSeason={
          ChangeSeason
        }
      />

      <main className="dashboard-content">
        <RaceList
          Races={Races}
          SelectedRace={
            SelectedRace
          }
          IsLoading={
            IsLoading
          }
          ErrorTitle={
            ErrorTitle
          }
          ErrorMessage={
            ErrorMessage
          }
          IsResultsLoading={
            IsResultsLoading
          }
          SelectRace={
            SelectRace
          }
          RetryRaceList={
            RetryRaceList
          }
        />

        <section className="results-panel">
          <RaceSummary
            SelectedRace={
              SelectedRace
            }
            RaceResults={
              RaceResults
            }
            IsResultsLoading={
              IsResultsLoading
            }
            ResultsErrorMessage={
              ResultsErrorMessage
            }
          />

          {CanShowAnalytics && (
            <>
              <DriverPointsChart
                RaceResults={
                  RaceResults
                }
                IsCompactLayout={
                  IsCompactLayout
                }
                SelectedDriverPoint={
                  SelectedDriverPoint
                }
                OnSelectDriverPoint={
                  SelectDriverPoint
                }
              />

              <TeamPointsChart
                RaceResults={
                  RaceResults
                }
                IsCompactLayout={
                  IsCompactLayout
                }
                HoveredTeamIndex={
                  HoveredTeamIndex
                }
                SetHoveredTeamIndex={
                  setHoveredTeamIndex
                }
                SelectedTeamIndex={
                  SelectedTeamIndex
                }
                OnSelectTeam={
                  SelectTeam
                }
              />
            </>
          )}

          <ResultsTable
            SelectedRace={
              SelectedRace
            }
            RaceResults={
              RaceResults
            }
            IsResultsLoading={
              IsResultsLoading
            }
            ResultsErrorMessage={
              ResultsErrorMessage
            }
            PointsWarningMessage={
              PointsWarningMessage
            }
            RetryRaceResults={
              RetryRaceResults
            }
          />
        </section>
      </main>
    </div>
  )
}

export default App
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

  const [
    IsCompactLayout,
    setIsCompactLayout,
  ] = useState(false)

  const [
    IsLoading,
    setIsLoading,
  ] = useState(true)

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

  const [
    RaceReloadKey,
    setRaceReloadKey,
  ] = useState(0)

  const [
    ResultsReloadKey,
    setResultsReloadKey,
  ] = useState(0)

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

        if (
          Controller.signal.aborted
        ) {
          return
        }

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

        setErrorMessage(
          'We could not retrieve the race list from OpenF1.'
        )

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

    return () => {
      Controller.abort()
    }
  }, [
    Season,
    RaceReloadKey,
  ])

  useEffect(() => {
    if (!SelectedRace) {
      return
    }

    const Controller =
      new AbortController()

    async function LoadRaceResults() {
      try {
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

          setPointsWarningMessage(
            'Points are temporarily unavailable. Race results are still shown below.'
          )
        }

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

        setResultsErrorMessage(
          'We could not retrieve the results for this race.'
        )

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

    return () => {
      Controller.abort()
    }
  }, [
    SelectedRace,
    ResultsReloadKey,
  ])

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

    setSeason(
      NewSeason
    )

    setRaces([])
    setSelectedRace(null)
    setRaceResults([])

    ClearAnalyticsSelections()

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

  function RetryRaceList() {
    setRaces([])

    setErrorMessage('')

    setIsLoading(
      true
    )

    setRaceReloadKey(
      (CurrentKey) =>
        CurrentKey + 1
    )
  }

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
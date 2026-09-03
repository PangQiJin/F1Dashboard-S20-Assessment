import { useEffect, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  GetRaceSessions,
  GetRaceResults,
  GetDrivers,
  GetDriverChampionship,
} from './Api/OpenF1Api'
import './App.css'

function App() {
  const [Season, setSeason] = useState(2025)

  const [Races, setRaces] = useState([])
  const [SelectedRace, setSelectedRace] = useState(null)
  const [RaceResults, setRaceResults] = useState([])

  const [IsLoading, setIsLoading] = useState(true)
  const [ErrorMessage, setErrorMessage] = useState('')

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
    const Controller = new AbortController()

    async function LoadRaces() {
      try {
        const RaceData =
          await GetRaceSessions(
            Season,
            Controller.signal
          )

        if (Controller.signal.aborted) {
          return
        }

        setRaces(RaceData)
      } catch (Error) {
        if (Controller.signal.aborted) {
          return
        }

        console.error(Error)

        setErrorMessage(
          'We could not retrieve the race list from OpenF1.'
        )

        setRaces([])
      } finally {
        if (!Controller.signal.aborted) {
          setIsLoading(false)
        }
      }
    }

    LoadRaces()

    return () => {
      Controller.abort()
    }
  }, [Season, RaceReloadKey])

  useEffect(() => {
    if (!SelectedRace) {
      return
    }

    const Controller = new AbortController()

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

        if (Controller.signal.aborted) {
          return
        }

        let ChampionshipData = []

        try {
          ChampionshipData =
            await GetDriverChampionship(
              SelectedRace.session_key,
              Controller.signal
            )
        } catch (PointsError) {
          if (Controller.signal.aborted) {
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
          ResultData.map((Result) => {
            const Driver =
              DriverData.find(
                (DriverItem) =>
                  DriverItem.driver_number ===
                  Result.driver_number
              )

            const Championship =
              ChampionshipData.find(
                (ChampionshipItem) =>
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
                !Number.isNaN(PointsStart) &&
                !Number.isNaN(PointsCurrent)
              ) {
                RacePoints = Number(
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

              points: RacePoints,
            }
          })

        if (!Controller.signal.aborted) {
          setRaceResults(
            CombinedResults
          )
        }
      } catch (Error) {
        if (Controller.signal.aborted) {
          return
        }

        console.error(Error)

        setResultsErrorMessage(
          'We could not retrieve the results for this race.'
        )

        setRaceResults([])
      } finally {
        if (!Controller.signal.aborted) {
          setIsResultsLoading(false)
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

  function ChangeSeason(NewSeason) {
    if (
      IsLoading ||
      IsResultsLoading ||
      NewSeason === Season
    ) {
      return
    }

    setSeason(NewSeason)

    setRaces([])
    setSelectedRace(null)
    setRaceResults([])

    setErrorMessage('')
    setResultsErrorMessage('')
    setPointsWarningMessage('')

    setIsLoading(true)
    setIsResultsLoading(false)
  }

  function SelectRace(Race) {
    if (IsResultsLoading) {
      return
    }

    if (
      SelectedRace?.session_key ===
      Race.session_key
    ) {
      return
    }

    setRaceResults([])

    setResultsErrorMessage('')
    setPointsWarningMessage('')

    setIsResultsLoading(true)

    setSelectedRace(Race)
  }

  function RetryRaceList() {
    setRaces([])
    setErrorMessage('')
    setIsLoading(true)

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
    setResultsErrorMessage('')
    setPointsWarningMessage('')
    setIsResultsLoading(true)

    setResultsReloadKey(
      (CurrentKey) =>
        CurrentKey + 1
    )
  }

  function FormatRaceDate(DateValue) {
    if (!DateValue) {
      return 'Date unavailable'
    }

    return new Date(
      DateValue
    ).toLocaleDateString(
      'en-GB',
      {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }
    )
  }

  function GetPositionDisplay(Result) {
    if (
      Result.position !== null &&
      Result.position !== undefined
    ) {
      return Result.position
    }

    if (Result.dsq) {
      return 'DSQ'
    }

    if (Result.dns) {
      return 'DNS'
    }

    if (Result.dnf) {
      return 'DNF'
    }

    return '—'
  }

  function GetPointsDisplay(Result) {
    if (
      Result.points === null ||
      Result.points === undefined
    ) {
      return '—'
    }

    return Result.points
  }

  function GetShortDriverName(FullName) {
    if (!FullName) {
      return 'Unknown'
    }

    const NameParts =
      FullName.trim().split(' ')

    if (NameParts.length === 1) {
      return NameParts[0]
    }

    return NameParts[
      NameParts.length - 1
    ]
  }

  const Winner =
    RaceResults.find(
      (Result) =>
        Result.position === 1
    ) ?? null

  const ClassifiedDrivers =
    RaceResults.filter(
      (Result) =>
        Result.position !== null &&
        Result.position !== undefined
    ).length

  const PointsChartData =
    RaceResults
      .filter(
        (Result) =>
          Result.points !== null &&
          Result.points !== undefined &&
          Result.points > 0
      )
      .map((Result) => ({
        driver: GetShortDriverName(
          Result.full_name
        ),
        points: Result.points,
      }))
      .sort(
        (ResultA, ResultB) =>
          ResultB.points -
          ResultA.points
      )
      .slice(0, 10)

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div>
          <p className="dashboard-label">
            FORMULA 1
          </p>

          <h1>
            Race Dashboard
          </h1>
        </div>

        <div className="season-selector">
          <label htmlFor="season">
            Season
          </label>

          <select
            id="season"
            value={Season}
            disabled={
              IsLoading ||
              IsResultsLoading
            }
            onChange={(Event) =>
              ChangeSeason(
                Number(
                  Event.target.value
                )
              )
            }
          >
            <option value="2025">
              2025
            </option>

            <option value="2024">
              2024
            </option>

            <option value="2023">
              2023
            </option>
          </select>
        </div>
      </header>

      <main className="dashboard-content">
        <aside className="race-panel">
          <div className="panel-heading">
            <p>RACES</p>

            <span>
              {IsLoading
                ? 'Loading...'
                : ErrorMessage
                  ? 'Unavailable'
                  : `${Races.length} races`}
            </span>
          </div>

          <div className="race-list">
            {IsLoading && (
              <div className="sidebar-state">
                <div className="loading-spinner"></div>

                <p>
                  Loading races...
                </p>
              </div>
            )}

            {!IsLoading &&
              ErrorMessage && (
                <div className="sidebar-state error-state">
                  <strong>
                    Unable to load races
                  </strong>

                  <p>
                    {ErrorMessage}
                  </p>

                  <button
                    className="retry-button"
                    onClick={
                      RetryRaceList
                    }
                  >
                    Try Again
                  </button>
                </div>
              )}

            {!IsLoading &&
              !ErrorMessage &&
              Races.length === 0 && (
                <div className="sidebar-state">
                  <strong>
                    No races found
                  </strong>

                  <p>
                    There are no races
                    available for this
                    season.
                  </p>
                </div>
              )}

            {!IsLoading &&
              !ErrorMessage &&
              Races.map(
                (Race, Index) => (
                  <button
                    className={
                      SelectedRace?.session_key ===
                      Race.session_key
                        ? 'race-card selected'
                        : 'race-card'
                    }
                    key={
                      Race.session_key
                    }
                    onClick={() =>
                      SelectRace(Race)
                    }
                    disabled={
                      IsResultsLoading
                    }
                  >
                    <span className="race-round">
                      Round{' '}
                      {Index + 1}
                    </span>

                    <strong>
                      {Race.location}{' '}
                      Grand Prix
                    </strong>

                    <span>
                      {
                        Race.country_name
                      }
                      {' • '}
                      {
                        Race.circuit_short_name
                      }
                    </span>
                  </button>
                )
              )}
          </div>
        </aside>

        <section className="results-panel">
          {SelectedRace ? (
            <div className="race-information">
              <p className="dashboard-label">
                SELECTED RACE
              </p>

              <h2>
                {
                  SelectedRace.location
                }{' '}
                Grand Prix
              </h2>

              <p>
                {
                  SelectedRace.country_name
                }
                {' • '}
                {
                  SelectedRace.circuit_short_name
                }
                {' • '}
                {FormatRaceDate(
                  SelectedRace.date_start
                )}
              </p>
            </div>
          ) : (
            <div className="race-information">
              <p className="dashboard-label">
                RACE RESULTS
              </p>

              <h2>
                Select a race
              </h2>

              <p>
                Choose a race from the
                list to view its results.
              </p>
            </div>
          )}

          {SelectedRace &&
            !IsResultsLoading &&
            !ResultsErrorMessage &&
            RaceResults.length > 0 && (
              <>
                <div className="summary-grid">
                  <div className="summary-card">
                    <span className="summary-label">
                      WINNER
                    </span>

                    <strong>
                      {Winner
                        ? Winner.full_name
                        : 'Unavailable'}
                    </strong>
                  </div>

                  <div className="summary-card">
                    <span className="summary-label">
                      WINNING TEAM
                    </span>

                    <strong>
                      {Winner
                        ? Winner.team_name
                        : 'Unavailable'}
                    </strong>
                  </div>

                  <div className="summary-card">
                    <span className="summary-label">
                      CLASSIFIED DRIVERS
                    </span>

                    <strong>
                      {ClassifiedDrivers}
                    </strong>
                  </div>
                </div>

                <div className="chart-card">
                  <div className="section-heading">
                    <div>
                      <p className="dashboard-label">
                        RACE ANALYTICS
                      </p>

                      <h3>
                        Driver Points
                      </h3>
                    </div>

                    <span>
                      Top point scorers
                    </span>
                  </div>

                  {PointsChartData.length >
                  0 ? (
                    <div className="chart-container">
                      <ResponsiveContainer
                        width="100%"
                        height="100%"
                      >
                        <BarChart
                          data={
                            PointsChartData
                          }
                          margin={{
                            top: 10,
                            right: 20,
                            left: 0,
                            bottom: 10,
                          }}
                        >
                          <CartesianGrid
                            stroke="#333333"
                            strokeDasharray="3 3"
                            vertical={false}
                          />

                          <XAxis
                            dataKey="driver"
                            stroke="#a8a8a8"
                            tick={{
                              fill: '#a8a8a8',
                              fontSize: 12,
                            }}
                          />

                          <YAxis
                            stroke="#a8a8a8"
                            tick={{
                              fill: '#a8a8a8',
                              fontSize: 12,
                            }}
                            allowDecimals={
                              false
                            }
                          />

                          <Tooltip
                            cursor={{
                              fill: '#292929',
                            }}
                            contentStyle={{
                              backgroundColor:
                                '#202020',
                              border:
                                '1px solid #444444',
                              borderRadius:
                                '6px',
                              color:
                                '#ffffff',
                            }}
                          />

                          <Bar
                            dataKey="points"
                            name="Points"
                            fill="#e10600"
                            radius={[
                              5,
                              5,
                              0,
                              0,
                            ]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="chart-empty">
                      Points data is
                      unavailable for this
                      race.
                    </div>
                  )}
                </div>
              </>
            )}

          <div className="results-table">
            <div className="results-header">
              <span>POS</span>
              <span>DRIVER</span>
              <span>TEAM</span>
              <span>POINTS</span>
            </div>

            {!SelectedRace && (
              <div className="empty-results">
                <div className="state-icon">
                  🏁
                </div>

                <h3>
                  No race selected
                </h3>

                <p>
                  Select one of the races
                  on the left to view the
                  final classification.
                </p>
              </div>
            )}

            {SelectedRace &&
              IsResultsLoading && (
                <div className="empty-results">
                  <div className="loading-spinner large-spinner"></div>

                  <h3>
                    Loading results...
                  </h3>

                  <p>
                    Retrieving race,
                    driver and points
                    data from OpenF1.
                  </p>
                </div>
              )}

            {SelectedRace &&
              !IsResultsLoading &&
              ResultsErrorMessage && (
                <div className="empty-results error-state">
                  <div className="state-icon">
                    !
                  </div>

                  <h3>
                    Unable to load
                    results
                  </h3>

                  <p>
                    {
                      ResultsErrorMessage
                    }
                  </p>

                  <button
                    className="retry-button"
                    onClick={
                      RetryRaceResults
                    }
                  >
                    Try Again
                  </button>
                </div>
              )}

            {SelectedRace &&
              !IsResultsLoading &&
              !ResultsErrorMessage &&
              RaceResults.length ===
                0 && (
                <div className="empty-results">
                  <div className="state-icon">
                    —
                  </div>

                  <h3>
                    No results
                    available
                  </h3>

                  <p>
                    OpenF1 did not return
                    result data for this
                    race.
                  </p>
                </div>
              )}

            {SelectedRace &&
              !IsResultsLoading &&
              !ResultsErrorMessage &&
              RaceResults.length >
                0 && (
                <div className="results-body">
                  {PointsWarningMessage && (
                    <div className="points-warning">
                      <strong>
                        Points notice
                      </strong>

                      <span>
                        {
                          PointsWarningMessage
                        }
                      </span>
                    </div>
                  )}

                  {RaceResults.map(
                    (Result) => (
                      <div
                        className="result-row"
                        key={
                          Result.driver_number
                        }
                      >
                        <span>
                          {
                            GetPositionDisplay(
                              Result
                            )
                          }
                        </span>

                        <span>
                          {
                            Result.full_name
                          }
                        </span>

                        <span>
                          {
                            Result.team_name
                          }
                        </span>

                        <span>
                          {
                            GetPointsDisplay(
                              Result
                            )
                          }
                        </span>
                      </div>
                    )
                  )}
                </div>
              )}
          </div>
        </section>
      </main>
    </div>
  )
}

export default App
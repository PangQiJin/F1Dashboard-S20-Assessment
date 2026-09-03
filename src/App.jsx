import { useEffect, useState } from 'react'
import { GetRaceSessions } from './Api/OpenF1Api'
import './App.css'

function App() {
  const [Season, setSeason] = useState(2025)
  const [Races, setRaces] = useState([])
  const [IsLoading, setIsLoading] = useState(true)
  const [ErrorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    async function LoadRaces() {
      try {
        setIsLoading(true)
        setErrorMessage('')

        const RaceData = await GetRaceSessions(Season)

        setRaces(RaceData)
      } catch (Error) {
        console.error(Error)
        setErrorMessage('Unable to load F1 races.')
        setRaces([])
      } finally {
        setIsLoading(false)
      }
    }

    LoadRaces()
  }, [Season])

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div>
          <p className="dashboard-label">FORMULA 1</p>
          <h1>Race Dashboard</h1>
        </div>

        <div className="season-selector">
          <label htmlFor="season">Season</label>

          <select
            id="season"
            value={Season}
            onChange={(Event) => setSeason(Number(Event.target.value))}
          >
            <option value="2025">2025</option>
            <option value="2024">2024</option>
            <option value="2023">2023</option>
          </select>
        </div>
      </header>

      <main className="dashboard-content">
        <aside className="race-panel">
          <div className="panel-heading">
            <p>RACES</p>

            <span>
              {IsLoading ? 'Loading...' : `${Races.length} races`}
            </span>
          </div>

          <div className="race-list">
            {IsLoading && (
              <p>Loading races...</p>
            )}

            {!IsLoading && ErrorMessage && (
              <p>{ErrorMessage}</p>
            )}

            {!IsLoading &&
              !ErrorMessage &&
              Races.length === 0 && (
                <p>No races found for this season.</p>
              )}

            {!IsLoading &&
              !ErrorMessage &&
              Races.map((Race, Index) => (
                <button
                  className="race-card"
                  key={Race.session_key}
                >
                  <span className="race-round">
                    Round {Index + 1}
                  </span>

                  <strong>
                    {Race.location} Grand Prix
                  </strong>

                  <span>
                    {Race.country_name} • {Race.circuit_short_name}
                  </span>
                </button>
              ))}
          </div>
        </aside>

        <section className="results-panel">
          <div className="race-information">
            <p className="dashboard-label">RACE RESULTS</p>

            <h2>Select a race</h2>

            <p>
              Choose a race from the list to view its results.
            </p>
          </div>

          <div className="results-table">
            <div className="results-header">
              <span>POS</span>
              <span>DRIVER</span>
              <span>TEAM</span>
              <span>POINTS</span>
            </div>

            <div className="empty-results">
              <h3>No race selected</h3>

              <p>
                Select one of the races on the left to continue.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

export default App
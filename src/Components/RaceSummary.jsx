import {
  FormatRaceDate,
} from '../Utils/RaceUtils'

// Displays the selected race information and high-level
// summary statistics before the detailed analytics.
function RaceSummary({
  SelectedRace,
  RaceResults,
  IsResultsLoading,
  ResultsErrorMessage,
}) {
  // The winning driver is the result with finishing position 1.
  const Winner =
    RaceResults.find(
      (Result) =>
        Result.position === 1
    ) ?? null

  // Only drivers with a numeric finishing position are counted
  // as classified drivers.
  const ClassifiedDrivers =
    RaceResults.filter(
      (Result) =>
        Result.position !== null &&
        Result.position !== undefined
    ).length

  return (
    <>
      {SelectedRace ? (
        <div className="race-information">
          <p className="dashboard-label">
            SELECTED RACE
          </p>

          <h2>
            {SelectedRace.location}{' '}
            Grand Prix
          </h2>

          <p>
            {SelectedRace.country_name}
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
            Choose a race from the list
            to view its results.
          </p>
        </div>
      )}

      {/* Summary cards appear only after valid race results
          have successfully loaded. */}
      {SelectedRace &&
        !IsResultsLoading &&
        !ResultsErrorMessage &&
        RaceResults.length > 0 && (
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
        )}
    </>
  )
}

export default RaceSummary
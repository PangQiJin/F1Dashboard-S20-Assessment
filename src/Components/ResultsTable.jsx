import {
  GetPointsDisplay,
  GetPositionDisplay,
} from '../Utils/RaceUtils'

// Displays the final race classification and all states associated
// with retrieving race-result data.
//
// CSS converts the desktop table into individual result cards on
// smaller screens so mobile users do not need horizontal scrolling.
function ResultsTable({
  SelectedRace,
  RaceResults,
  IsResultsLoading,
  ResultsErrorMessage,
  PointsWarningMessage,
  RetryRaceResults,
}) {
  return (
    <div className="results-table">
      <div className="results-header">
        <span>
          POS
        </span>

        <span>
          DRIVER
        </span>

        <span>
          TEAM
        </span>

        <span>
          POINTS
        </span>
      </div>

      {/* Initial empty state before the user chooses a race. */}
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
            to view the final
            classification.
          </p>
        </div>
      )}

      {/* Loading state shown while result, driver and point data
          are being combined. */}
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

      {/* API error state allows the selected race to be retried
          without requiring the entire application to reload. */}
      {SelectedRace &&
        !IsResultsLoading &&
        ResultsErrorMessage && (
          <div className="empty-results error-state">
            <div className="state-icon">
              !
            </div>

            <h3>
              Unable to load results
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

      {/* Valid request with no returned classification data. */}
      {SelectedRace &&
        !IsResultsLoading &&
        !ResultsErrorMessage &&
        RaceResults.length === 0 && (
          <div className="empty-results">
            <div className="state-icon">
              —
            </div>

            <h3>
              No results available
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
        RaceResults.length > 0 && (
          <div className="results-body">
            {/* Championship point data is optional. Race results can
                still be displayed if only the points request fails. */}
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
                  <span className="result-position">
                    {
                      GetPositionDisplay(
                        Result
                      )
                    }
                  </span>

                  <span className="result-driver">
                    {
                      Result.full_name
                    }
                  </span>

                  <span className="result-team">
                    {
                      Result.team_name
                    }
                  </span>

                  <span className="result-points">
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
  )
}

export default ResultsTable
function RaceList({
  Races,
  SelectedRace,
  IsLoading,
  ErrorMessage,
  IsResultsLoading,
  SelectRace,
  RetryRaceList,
}) {
  return (
    <aside className="race-panel">
      <div className="panel-heading">
        <p>
          RACES
        </p>

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
            (
              Race,
              Index
            ) => (
              <button
                className={
                  SelectedRace
                    ?.session_key ===
                  Race.session_key
                    ? 'race-card selected'
                    : 'race-card'
                }
                key={
                  Race.session_key
                }
                onClick={() =>
                  SelectRace(
                    Race
                  )
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
                  {
                    Race.location
                  }{' '}
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
  )
}

export default RaceList
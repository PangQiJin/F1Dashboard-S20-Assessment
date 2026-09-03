function DashboardHeader({
  Season,
  IsLoading,
  IsResultsLoading,
  ChangeSeason,
}) {
  return (
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
  )
}

export default DashboardHeader
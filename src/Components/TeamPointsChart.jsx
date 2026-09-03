import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
} from 'recharts'

// Prevent chart interactions from reaching the dashboard-level
// deselection handler.
function StopChartEvent(
  EventArguments
) {
  const Event =
    EventArguments.find(
      (Argument) =>
        typeof Argument
          ?.stopPropagation ===
        'function'
    )

  Event?.stopPropagation()
}

function TeamPointsChart({
  RaceResults,
  IsCompactLayout,
  HoveredTeamIndex,
  SetHoveredTeamIndex,
  SelectedTeamIndex,
  OnSelectTeam,
}) {
  const TeamPointsMap = {}

  // Combine points from both drivers belonging to the same team.
  RaceResults.forEach(
    (Result) => {
      if (
        Result.points === null ||
        Result.points ===
          undefined ||
        Result.points <= 0 ||
        Result.team_name ===
          'Team unavailable'
      ) {
        return
      }

      if (
        !TeamPointsMap[
          Result.team_name
        ]
      ) {
        TeamPointsMap[
          Result.team_name
        ] = {
          team:
            Result.team_name,

          points: 0,

          // OpenF1 supplies official team colours where available.
          colour:
            Result.team_colour
              ? `#${Result.team_colour}`
              : null,
        }
      }

      TeamPointsMap[
        Result.team_name
      ].points +=
        Result.points
    }
  )

  // Fallback colours ensure the visualization remains usable if
  // OpenF1 does not provide a colour for a team.
  const FallbackColours = [
    '#e10600',
    '#ff8700',
    '#00a19c',
    '#6c98ff',
    '#b6babd',
  ]

  // Only the five highest-scoring teams are displayed to keep
  // the donut chart easy to interpret.
  const TeamPointsData =
    Object.values(
      TeamPointsMap
    )
      .sort(
        (
          TeamA,
          TeamB
        ) =>
          TeamB.points -
          TeamA.points
      )
      .slice(0, 5)
      .map(
        (
          Team,
          Index
        ) => ({
          ...Team,

          colour:
            Team.colour ??
            FallbackColours[
              Index
            ],
        })
      )

  // Desktop hover temporarily takes priority over a persistent
  // selected team. On mobile, SelectedTeamIndex supplies the
  // persistent tap interaction.
  const ActiveTeamIndex =
    HoveredTeamIndex !== null
      ? HoveredTeamIndex
      : SelectedTeamIndex

  const ActiveTeam =
    ActiveTeamIndex !== null
      ? TeamPointsData[
          ActiveTeamIndex
        ]
      : null

  function SelectTeam(
    Index,
    EventArguments
  ) {
    StopChartEvent(
      EventArguments
    )

    OnSelectTeam(Index)
  }

  return (
    <div className="chart-card team-analytics-card">
      <div className="section-heading">
        <div>
          <p className="dashboard-label">
            TEAM ANALYTICS
          </p>

          <h3>
            Top 5 Team Points
          </h3>
        </div>

        <span>
          Highest-scoring teams
        </span>
      </div>

      {TeamPointsData.length > 0 ? (
        <div className="team-analytics-content">
          {/* Separate information card prevents statistics from
              overlapping the donut chart itself. */}
          <div className="pie-popup-slot">
            {ActiveTeam ? (
              <div className="pie-hover-popup">
                <span className="pie-popup-label">
                  TEAM
                </span>

                <div className="pie-popup-team">
                  <span
                    className="pie-popup-colour"
                    style={{
                      backgroundColor:
                        ActiveTeam.colour,
                    }}
                  ></span>

                  <strong>
                    {ActiveTeam.team}
                  </strong>
                </div>

                <span className="pie-popup-points">
                  {ActiveTeam.points}
                </span>

                <small>
                  RACE POINTS
                </small>
              </div>
            ) : (
              <div className="pie-popup-placeholder">
                <span>
                  Select a team
                </span>

                <small>
                  Hover or tap to view
                  points
                </small>
              </div>
            )}
          </div>

          <div className="pie-chart-main">
            <div className="pie-chart-container">
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <PieChart>
                  {/*
                    Visible donut chart.

                    paddingAngle is zero so the team slices form one
                    connected ring instead of separated segments.
                  */}
                  <Pie
                    data={
                      TeamPointsData
                    }
                    dataKey="points"
                    nameKey="team"
                    cx="50%"
                    cy="50%"
                    innerRadius="57%"
                    outerRadius="82%"
                    paddingAngle={0}
                    isAnimationActive={
                      true
                    }
                  >
                    {TeamPointsData.map(
                      (
                        Team,
                        Index
                      ) => (
                        <Cell
                          key={
                            Team.team
                          }
                          fill={
                            Team.colour
                          }
                          opacity={
                            ActiveTeamIndex ===
                              null ||
                            ActiveTeamIndex ===
                              Index
                              ? 1
                              : 0.3
                          }
                          stroke={
                            ActiveTeamIndex ===
                            Index
                              ? '#ffffff'
                              : 'none'
                          }
                          strokeWidth={
                            ActiveTeamIndex ===
                            Index
                              ? 4
                              : 0
                          }
                        />
                      )
                    )}
                  </Pie>

                  {/*
                    Invisible interaction layer.

                    This second pie is deliberately larger than the
                    visible ring. It increases the mouse/touch hit area,
                    making thin donut sections much easier to select on
                    mobile without changing the chart's appearance.
                  */}
                  <Pie
                    data={
                      TeamPointsData
                    }
                    dataKey="points"
                    nameKey="team"
                    cx="50%"
                    cy="50%"
                    innerRadius={
                      IsCompactLayout
                        ? '37%'
                        : '43%'
                    }
                    outerRadius={
                      IsCompactLayout
                        ? '96%'
                        : '92%'
                    }
                    paddingAngle={0}
                    isAnimationActive={
                      false
                    }
                    onMouseEnter={
                      IsCompactLayout
                        ? undefined
                        : (
                            _,
                            Index
                          ) =>
                            SetHoveredTeamIndex(
                              Index
                            )
                    }
                    onMouseLeave={
                      IsCompactLayout
                        ? undefined
                        : () =>
                            SetHoveredTeamIndex(
                              null
                            )
                    }
                    onClick={(
                      _,
                      Index,
                      ...EventArguments
                    ) =>
                      SelectTeam(
                        Index,
                        EventArguments
                      )
                    }
                  >
                    {TeamPointsData.map(
                      (Team) => (
                        <Cell
                          key={`hit-${Team.team}`}
                          fill="rgba(255,255,255,0.001)"
                          stroke="none"
                          className="pie-hit-slice"
                        />
                      )
                    )}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Centre text changes according to the hovered or
                selected team while remaining independent of the chart. */}
            <div className="pie-centre-label">
              {ActiveTeam ? (
                <>
                  <strong>
                    {ActiveTeam.team}
                  </strong>

                  <span>
                    {ActiveTeam.points}{' '}
                    pts
                  </span>
                </>
              ) : (
                <>
                  <strong>
                    TOP 5
                  </strong>

                  <span>
                    TEAMS
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Ranking rows provide another accessible way to select
              a team instead of requiring interaction with the donut. */}
          <div className="team-ranking-list">
            {TeamPointsData.map(
              (
                Team,
                Index
              ) => (
                <div
                  className={
                    ActiveTeamIndex ===
                    Index
                      ? 'team-ranking-row active'
                      : 'team-ranking-row'
                  }
                  key={
                    Team.team
                  }
                  onMouseEnter={
                    IsCompactLayout
                      ? undefined
                      : () =>
                          SetHoveredTeamIndex(
                            Index
                          )
                  }
                  onMouseLeave={
                    IsCompactLayout
                      ? undefined
                      : () =>
                          SetHoveredTeamIndex(
                            null
                          )
                  }
                  onClick={(
                    Event
                  ) =>
                    SelectTeam(
                      Index,
                      [Event]
                    )
                  }
                >
                  <span className="team-rank-number">
                    {Index + 1}
                  </span>

                  <span
                    className="team-colour-dot"
                    style={{
                      backgroundColor:
                        Team.colour,
                    }}
                  ></span>

                  <span className="team-rank-name">
                    {Team.team}
                  </span>

                  <strong>
                    {Team.points}{' '}
                    pts
                  </strong>
                </div>
              )
            )}
          </div>

          <div className="touch-hint">
            Tap a team or donut
            section to view its points.
          </div>
        </div>
      ) : (
        <div className="chart-empty">
          Team points data is
          unavailable.
        </div>
      )}
    </div>
  )
}

export default TeamPointsChart
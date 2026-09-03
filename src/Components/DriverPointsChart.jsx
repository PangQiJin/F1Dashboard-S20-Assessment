import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import {
  GetDriverChartLabel,
} from '../Utils/RaceUtils'

// Custom desktop tooltip keeps the complete driver name available
// even though compact five-character labels are used on the axis.
function DriverPointsTooltip({
  active,
  payload,
}) {
  if (
    !active ||
    !payload ||
    payload.length === 0
  ) {
    return null
  }

  const DriverData =
    payload[0].payload

  return (
    <div className="driver-tooltip">
      <strong>
        {DriverData.fullName}
      </strong>

      <span>
        Points: {DriverData.points}
      </span>
    </div>
  )
}

// Prevent chart taps from reaching the dashboard-level click
// handler, which would otherwise immediately clear the selection.
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

function DriverPointsChart({
  RaceResults,
  IsCompactLayout,
  SelectedDriverPoint,
  OnSelectDriverPoint,
}) {
  // Only drivers who earned points are useful in this chart.
  // Results are ranked from highest to lowest and limited to 10
  // to prevent the chart from becoming visually overcrowded.
  const PointsChartData =
    RaceResults
      .filter(
        (Result) =>
          Result.points !== null &&
          Result.points !== undefined &&
          Result.points > 0
      )
      .map((Result) => ({
        driver:
          GetDriverChartLabel(
            Result.full_name
          ),

        fullName:
          Result.full_name,

        points:
          Result.points,
      }))
      .sort(
        (
          ResultA,
          ResultB
        ) =>
          ResultB.points -
          ResultA.points
      )
      .slice(0, 10)

  function SelectDriver(
    Index,
    EventArguments
  ) {
    StopChartEvent(
      EventArguments
    )

    const DriverData =
      PointsChartData[Index]

    if (!DriverData) {
      return
    }

    OnSelectDriverPoint(
      DriverData
    )
  }

  return (
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

      {PointsChartData.length > 0 ? (
        <>
          <div
            className={
              IsCompactLayout
                ? 'chart-container mobile-driver-chart'
                : 'chart-container'
            }
          >
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              {IsCompactLayout ? (
                /*
                  Mobile uses horizontal bars because driver names
                  are easier to read and the larger bars provide
                  better touch targets than narrow vertical columns.
                */
                <BarChart
                  data={
                    PointsChartData
                  }
                  layout="vertical"
                  margin={{
                    top: 5,
                    right: 10,
                    left: 0,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid
                    stroke="#333333"
                    strokeDasharray="3 3"
                    horizontal={false}
                  />

                  <XAxis
                    type="number"
                    stroke="#a8a8a8"
                    allowDecimals={
                      false
                    }
                    tick={{
                      fill: '#a8a8a8',
                      fontSize: 10,
                    }}
                  />

                  <YAxis
                    type="category"
                    dataKey="driver"
                    width={48}
                    stroke="#a8a8a8"
                    tick={{
                      fill: '#a8a8a8',
                      fontSize: 10,
                    }}
                  />

                  <Bar
                    dataKey="points"
                    name="Points"
                    barSize={18}
                    radius={[
                      0,
                      5,
                      5,
                      0,
                    ]}
                    onClick={(
                      _,
                      Index,
                      ...EventArguments
                    ) =>
                      SelectDriver(
                        Index,
                        EventArguments
                      )
                    }
                  >
                    {PointsChartData.map(
                      (DriverData) => (
                        <Cell
                          key={
                            DriverData.fullName
                          }
                          fill="#e10600"
                          opacity={
                            SelectedDriverPoint ===
                              null ||
                            SelectedDriverPoint.fullName ===
                              DriverData.fullName
                              ? 1
                              : 0.35
                          }
                          stroke={
                            SelectedDriverPoint
                              ?.fullName ===
                            DriverData.fullName
                              ? '#ffffff'
                              : 'none'
                          }
                          strokeWidth={
                            SelectedDriverPoint
                              ?.fullName ===
                            DriverData.fullName
                              ? 2
                              : 0
                          }
                          className="driver-bar"
                        />
                      )
                    )}
                  </Bar>
                </BarChart>
              ) : (
                /*
                  Desktop keeps the traditional vertical bar chart
                  and provides additional detail through hover.
                */
                <BarChart
                  data={
                    PointsChartData
                  }
                  margin={{
                    top: 10,
                    right: 10,
                    left: 0,
                    bottom: 5,
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
                    interval={0}
                    tick={{
                      fill: '#a8a8a8',
                      fontSize: 12,
                    }}
                  />

                  <YAxis
                    stroke="#a8a8a8"
                    allowDecimals={
                      false
                    }
                  />

                  <Tooltip
                    cursor={{
                      fill: '#292929',
                    }}
                    content={
                      <DriverPointsTooltip />
                    }
                  />

                  <Bar
                    dataKey="points"
                    name="Points"
                    radius={[
                      5,
                      5,
                      0,
                      0,
                    ]}
                    onClick={(
                      _,
                      Index,
                      ...EventArguments
                    ) =>
                      SelectDriver(
                        Index,
                        EventArguments
                      )
                    }
                  >
                    {PointsChartData.map(
                      (DriverData) => (
                        <Cell
                          key={
                            DriverData.fullName
                          }
                          fill="#e10600"
                          opacity={
                            SelectedDriverPoint ===
                              null ||
                            SelectedDriverPoint.fullName ===
                              DriverData.fullName
                              ? 1
                              : 0.35
                          }
                          stroke={
                            SelectedDriverPoint
                              ?.fullName ===
                            DriverData.fullName
                              ? '#ffffff'
                              : 'none'
                          }
                          strokeWidth={
                            SelectedDriverPoint
                              ?.fullName ===
                            DriverData.fullName
                              ? 2
                              : 0
                          }
                          className="driver-bar"
                        />
                      )
                    )}
                  </Bar>
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>

          <div className="touch-hint">
            Tap a driver to view their
            points.
          </div>

          {/* Touch devices keep selected statistics visible because
              they do not have a persistent hover state. */}
          {SelectedDriverPoint && (
            <div className="mobile-stat-card">
              <span className="mobile-stat-label">
                DRIVER
              </span>

              <strong>
                {
                  SelectedDriverPoint.fullName
                }
              </strong>

              <span className="mobile-stat-value">
                {
                  SelectedDriverPoint.points
                }{' '}
                points
              </span>
            </div>
          )}
        </>
      ) : (
        <div className="chart-empty">
          Points data is unavailable
          for this race.
        </div>
      )}
    </div>
  )
}

export default DriverPointsChart
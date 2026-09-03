// Convert the OpenF1 date value into a readable race date.
export function FormatRaceDate(
  DateValue
) {
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

// Return either the driver's finishing position or the
// appropriate race status when no numeric position exists.
export function GetPositionDisplay(
  Result
) {
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

// Keep unavailable point values visually consistent throughout
// the dashboard.
export function GetPointsDisplay(
  Result
) {
  if (
    Result.points === null ||
    Result.points === undefined
  ) {
    return '—'
  }

  return Result.points
}

// Extract the driver's surname for compact chart labels.
export function GetShortDriverName(
  FullName
) {
  if (!FullName) {
    return 'Unknown'
  }

  const NameParts =
    FullName
      .trim()
      .split(' ')

  return NameParts[
    NameParts.length - 1
  ]
}

// Driver chart labels are limited to five characters so that
// several drivers can fit without overlapping on smaller screens.
// The complete name remains available through the chart interaction.
export function GetDriverChartLabel(
  FullName
) {
  const Surname =
    GetShortDriverName(
      FullName
    )

  return Surname
    .substring(0, 5)
    .toUpperCase()
}
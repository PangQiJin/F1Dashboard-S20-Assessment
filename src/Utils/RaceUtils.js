export function FormatRaceDate(DateValue) {
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
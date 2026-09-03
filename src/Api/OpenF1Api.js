const BaseUrl = 'https://api.openf1.org/v1'

export async function GetRaceSessions(Year) {
  const Response = await fetch(
    `${BaseUrl}/sessions?year=${Year}&session_name=Race`
  )

  if (!Response.ok) {
    throw new Error('Unable to retrieve F1 races.')
  }

  const Data = await Response.json()

  const RaceSessions = Data
    .filter((Race) => !Race.is_cancelled)
    .sort(
      (RaceA, RaceB) =>
        new Date(RaceA.date_start) - new Date(RaceB.date_start)
    )

  return RaceSessions
}
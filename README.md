# F1 Race Dashboard

A responsive data-driven Formula 1 race results dashboard built using React, Vite and the OpenF1 API.

The dashboard allows users to explore Formula 1 races across multiple seasons, select individual races and view detailed race results and analytics.

## Features

- View a list of Formula 1 races
- Switch between available F1 seasons
- Select a race to view its results
- View driver finishing positions
- View driver and team information
- View race points earned by drivers
- View race winner and winning team
- View the number of classified drivers
- Interactive driver points bar chart
- Interactive Top 5 Team Points donut chart
- Desktop hover interactions
- Mobile tap interactions
- Loading states
- Error states with retry functionality
- Empty states
- Responsive desktop, tablet and mobile layouts

## Technologies Used

- React
- JavaScript
- JSX
- CSS
- Vite
- Recharts
- OpenF1 API

## API

Race data is retrieved from the OpenF1 API.

OpenF1 provides Formula 1 data including race sessions, drivers, session results and championship information.

API documentation:

https://openf1.org/

## Project Structure

```text
src/
│
├── Api/
│   └── OpenF1Api.js
│
├── Components/
│   ├── DashboardHeader.jsx
│   ├── DriverPointsChart.jsx
│   ├── RaceList.jsx
│   ├── RaceSummary.jsx
│   ├── ResultsTable.jsx
│   └── TeamPointsChart.jsx
│
├── Utils/
│   └── RaceUtils.js
│
├── App.jsx
├── App.css
├── index.css
└── main.jsx
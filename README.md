# F1 Race Dashboard

A responsive, data-driven Formula 1 race results dashboard built using React, Vite, Recharts and the OpenF1 API.

The dashboard allows users to explore Formula 1 races across multiple seasons, select individual races, view detailed race results and analyse driver and team performance through interactive data visualisations.

## Live Demo

The deployed dashboard can be viewed here:

https://pangqijin.github.io/F1Dashboard-S20-Assessment/

## Features

- View a list of Formula 1 races
- Switch between available F1 seasons
- Select a race to view its results
- View driver finishing positions
- View driver and team information
- View race points earned by drivers
- View the race winner and winning team
- View the number of classified drivers
- Interactive Driver Points bar chart
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
- GitHub Actions
- GitHub Pages

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
```

## Component Overview

### DashboardHeader

Displays the Formula 1 dashboard title and allows the user to switch between available seasons.

### RaceList

Displays the races available for the selected season and allows the user to select an individual race.

The component also handles:

- Race list loading state
- Race list error state
- Empty race list state
- Retry functionality

### RaceSummary

Displays important information about the selected race, including:

- Race location
- Circuit
- Race date
- Race winner
- Winning team
- Number of classified drivers

### DriverPointsChart

Displays the highest-scoring drivers from the selected race using an interactive bar chart.

On desktop devices, users can hover over the chart to view the driver's full name and points.

On smaller touch devices, the chart changes to a mobile-friendly horizontal layout and users can tap a driver to keep their statistics visible.

### TeamPointsChart

Combines the points earned by drivers belonging to the same team and displays the top five highest-scoring teams using an interactive donut chart.

Users can:

- Hover over teams on desktop
- Tap teams on mobile
- View the selected team's race points
- Select teams using either the donut chart or ranking list

A larger invisible interaction area is also used on mobile devices to make the donut chart easier to tap.

### ResultsTable

Displays the final classification for the selected race, including:

- Finishing position
- Driver
- Team
- Points

On mobile devices, the table automatically changes into individual result cards to keep the information readable without requiring horizontal page scrolling.

## Loading, Error and Empty States

The dashboard provides user feedback when data is unavailable or still being retrieved.

### Loading State

Loading indicators are displayed while race or result data is being retrieved from OpenF1.

### Error State

If an API request fails, an error message is displayed together with a **Try Again** button so the user can retry the request.

### Empty State

Before a race is selected, the dashboard displays a message instructing the user to select a race.

An additional empty state is available if OpenF1 returns no results for a selected race.

## API Reliability

The application includes several features to improve reliability when communicating with OpenF1:

- Request timeout handling
- Automatic retries for temporary API failures
- Rate-limit retry handling
- API response caching
- Request cancellation using `AbortController`
- Protection against outdated requests replacing newer race data

Race results, driver information and championship information from different OpenF1 endpoints are combined before being displayed by the dashboard.

## Responsive Design

The dashboard supports:

- Desktop
- Laptop
- Tablet
- Mobile

The layout automatically adapts depending on the screen size.

Desktop users primarily interact with charts using hover effects, while mobile users can tap chart elements to keep their selected statistics visible.

The mobile layout also uses:

- Vertically scrollable race selection
- Horizontal driver points bars
- Larger chart touch areas
- Stacked summary cards
- Mobile race result cards

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/PangQiJin/F1Dashboard-S20-Assessment.git
```

### 2. Open the Project Folder

```bash
cd F1Dashboard-S20-Assessment
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Start the Development Server

```bash
npm run dev
```

Vite will display a local development address, usually similar to:

```text
http://localhost:5173/
```

Open the address in a web browser to view the dashboard.

## Production Build

Create a production version of the application using:

```bash
npm run build
```

The generated production files will be placed inside the `dist` folder.

## Code Quality

ESLint is used to check the project for code-quality issues.

Run:

```bash
npm run lint
```

## Deployment

The application is deployed using GitHub Pages.

A GitHub Actions workflow automatically:

1. Checks out the repository
2. Installs Node.js
3. Installs project dependencies
4. Builds the Vite application
5. Uploads the generated production files
6. Deploys the dashboard to GitHub Pages

New commits pushed to the `main` branch automatically trigger a new deployment.

## Assessment Requirements

The dashboard satisfies the required functionality by providing:

1. A list of Formula 1 races
2. Race selection
3. Selected race results
4. Driver information
5. Team information
6. Finishing positions
7. Race points
8. Loading states
9. Error states
10. Empty states

Additional analytics, responsive layouts and interactive visualisations were implemented to improve usability and provide a more complete data-dashboard experience.

## Testing

The application was tested for:

- Race list loading
- Race selection
- Season switching
- Driver and team data
- Finishing positions
- Race points
- Driver chart interactions
- Team chart interactions
- Loading states
- Error states
- Error recovery using retry buttons
- Empty states
- Desktop responsiveness
- Tablet responsiveness
- Mobile responsiveness
- Production build
- ESLint validation
- GitHub Pages deployment

## Data Source

Formula 1 data is provided by the OpenF1 API:

https://openf1.org/
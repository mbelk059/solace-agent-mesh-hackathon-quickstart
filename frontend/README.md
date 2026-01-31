# CrisisAI Frontend

React frontend for the CrisisAI real-time global emergency monitoring platform.

## Features

- **3D Interactive Globe**: Rotating Earth with crisis markers
- **Crisis Dashboard**: List and detail views
- **NGO Donation Links**: Verified humanitarian organization campaigns
- **Real-time Updates**: Simulated live crisis monitoring
- **Severity Visualization**: Color-coded crisis markers

## Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

The frontend will be available at http://localhost:3000

## Tech Stack

- **React 18** - UI framework
- **Vite** - Build tool
- **Three.js + React Three Fiber** - 3D globe visualization
- **Tailwind CSS** - Styling
- **Lucide React** - Icons

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── Globe.jsx          # 3D globe with crisis markers
│   │   ├── Dashboard.jsx      # Crisis list and detail views
│   │   ├── Header.jsx         # Stats bar
│   │   ├── CrisisMarker.jsx   # Individual crisis marker
│   │   └── SeverityLegend.jsx  # Severity color legend
│   ├── services/
│   │   └── crisisService.js   # API/data service
│   ├── App.jsx                # Main app component
│   └── main.jsx               # Entry point
├── public/
│   └── data/
│       └── crises/            # Mock crisis data
└── package.json
```

## Development

### Adding New Crises

Edit `public/data/crises/mock_actionable_crises.json` to add new crisis data.

### Customizing Styles

Modify Tailwind classes in components or update `tailwind.config.js` for theme customization.

### Globe Customization

Edit `src/components/Globe.jsx` to modify:
- Camera position and controls
- Earth appearance
- Marker rendering
- Animation settings

## Production Build

```bash
npm run build
```

Output will be in the `dist/` directory, ready for deployment.

# CrisisAI - Real-Time Global Emergency Monitoring Platform

A hackathon project demonstrating an AI-powered crisis monitoring system using Solace Agent Mesh (SAM) architecture. The platform shows how AI agents detect global emergencies in real-time, verify them, score their severity, and connect users to verified humanitarian organizations for donations.

## 🎯 Project Overview

CrisisAI solves the problem of fragmented, delayed, and overwhelming emergency information. People want to help during crises but don't know where, how urgent, or who to trust. CrisisAI uses AI to analyze, prioritize, and clearly present crises in real-time with direct action links to trusted NGOs.

## 🏗️ Architecture

### 4 AI Agents (SAM-based)

1. **Crisis Detection Agent** (`crisis-detection-agent.yaml`)
   - Monitors mock emergency sources (GDACS, USGS, news feeds)
   - Publishes to: `crisis/raw/[source]/[crisis_id]`
   - Tool: `detect_crises()`

2. **Verification & Scoring Agent** (`crisis-verification-agent.yaml`)
   - Verifies raw crises across multiple sources
   - Calculates severity scores (1-10)
   - Publishes to: `crisis/verified/[crisis_id]`
   - Tool: `verify_and_score_crisis()`

3. **NGO Matching Agent** (`crisis-ngo-agent.yaml`)
   - Matches verified crises to NGO donation campaigns
   - Verifies campaign URLs
   - Publishes to: `crisis/actionable/[crisis_id]`
   - Tool: `match_ngo_campaigns()`

4. **Update Monitor Agent** (`crisis-update-agent.yaml`)
   - Monitors ongoing crises for updates
   - Tracks casualty changes and status updates
   - Publishes to: `crisis/updates/[crisis_id]`
   - Tool: `monitor_crisis_updates()`

### Frontend (React + Three.js)

- **3D Interactive Globe**: Shows crisis locations with color-coded severity markers
- **Crisis Dashboard**: Lists and details view with NGO donation links
- **Real-time Updates**: Simulates live crisis monitoring
- **Stats Bar**: Global crisis statistics

## 📁 Project Structure

```
├── configs/agents/
│   ├── crisis-detection-agent.yaml
│   ├── crisis-verification-agent.yaml
│   ├── crisis-ngo-agent.yaml
│   └── crisis-update-agent.yaml
├── src/
│   └── crisis_tools.py          # Python tools for all agents
├── data/crises/
│   ├── mock_raw_crises.json     # Raw crisis detections
│   ├── mock_verified_crises.json
│   ├── mock_actionable_crises.json
│   └── mock_crisis_updates.json
└── frontend/
    ├── src/
    │   ├── components/          # React components
    │   ├── services/            # API services
    │   └── App.jsx
    └── package.json
```

## 🚀 Quick Start

### 1. Backend (SAM Agents)

Ensure you have your `.env` file configured with LLM API credentials (see `docs/llm-setup.md`).

```bash
# Run with Docker
docker build -t sam-hackathon-quickstart .
docker run -d --rm -p 8000:8000 --env-file .env --name sam-app sam-hackathon-quickstart

# Or run with CLI
uv sync
uv run sam run configs/
```

The SAM agents will be available at http://localhost:8000

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at http://localhost:3000

## 📊 Mock Data

The project includes 6 diverse crisis examples:

1. **Earthquake** - Turkey/Syria (severity: 9.2)
2. **Flooding** - Pakistan (severity: 8.5)
3. **Humanitarian Crisis** - Gaza (severity: 9.5)
4. **Drought/Famine** - Somalia (severity: 7.8)
5. **Hurricane** - Florida, USA (severity: 6.5)
6. **Wildfire** - Greece (severity: 6.0)

Each crisis includes:
- Location data (lat/lng for globe visualization)
- Impact statistics (deaths, injured, displaced, affected)
- Verified NGO donation links
- Time-series updates

## 🎨 Features

### 3D Globe
- Rotating Earth with crisis markers
- Color-coded by severity (Critical/High/Medium/Low)
- Pulsing animations for "live" status
- Click markers to view details

### Crisis Dashboard
- List view: All active crises sorted by severity or time
- Detail view: Full crisis information with:
  - Impact statistics cards
  - Verification sources
  - NGO donation links (3-5 per crisis)
  - Real-time update timestamps

### Severity Scoring
- **9-10**: Critical (massive casualties, widespread destruction)
- **7-8.9**: High (significant impact, many affected)
- **5-6.9**: Medium (moderate impact, localized)
- **3-4.9**: Low (minor impact, contained)

## 🔄 Solace Event Flow

```
[Mock Data Files] 
    ↓
[Detection Agent] → publishes → crisis/raw/[source]/[id]
    ↓
[Verification Agent] → subscribes → crisis/raw/*/* 
                     → publishes → crisis/verified/[id]
    ↓
[NGO Matching Agent] → subscribes → crisis/verified/*
                      → publishes → crisis/actionable/[id]
    ↓
[Update Monitor] → monitors → crisis/actionable/*
                → publishes → crisis/updates/[id]
    ↓
[Frontend] → subscribes → crisis/actionable/* + crisis/updates/*
```

## 🛠️ Development

### Testing Agents

You can interact with agents via the SAM Web UI at http://localhost:8000:

- "Detect new crises" → Crisis Detection Agent
- "Verify and score crises" → Verification Agent
- "Match NGOs for crises" → NGO Matching Agent
- "Check for crisis updates" → Update Monitor Agent

### Modifying Mock Data

Edit files in `data/crises/`:
- `mock_raw_crises.json` - Add new raw detections
- `mock_verified_crises.json` - Add verified crises
- `mock_actionable_crises.json` - Add crises with NGO links
- `mock_crisis_updates.json` - Add time-series updates

### Frontend Customization

- **Globe**: Edit `frontend/src/components/Globe.jsx`
- **Dashboard**: Edit `frontend/src/components/Dashboard.jsx`
- **Styling**: Modify Tailwind classes or `tailwind.config.js`

## 📝 Demo Script

1. **Start SAM backend** - Agents are running
2. **Start frontend** - Globe loads with 6 crisis markers
3. **Show globe** - Rotating Earth with color-coded markers
4. **Click marker** - Opens crisis detail panel
5. **Show NGO links** - Highlight verified donation options
6. **Simulate update** - Show how crisis data evolves over time

## 🎯 Success Criteria

✅ Globe rotates smoothly with visible crisis markers  
✅ Clicking marker shows full crisis details  
✅ NGO donation links are prominent and verified  
✅ Severity scoring is clear and color-coded  
✅ Demo shows "live" crisis detection/update  
✅ Clean, professional UI that looks like a real product  
✅ Can explain Solace Agent Mesh architecture clearly  

## 📚 Resources

- [Solace Agent Mesh Documentation](https://solacelabs.github.io/solace-agent-mesh/)
- [AGENTS.md](./AGENTS.md) - SAM agent development guide
- [docs/llm-setup.md](./docs/llm-setup.md) - LLM API configuration

## 🤝 Contributing

This is a hackathon demo project. For production use, you would:
- Connect to real emergency APIs (GDACS, USGS, NOAA)
- Implement actual Solace topic subscriptions
- Add real-time webhook integrations
- Enhance NGO verification with charity registries
- Add user authentication and preferences
- Implement notification system

---

**Built for Solace Agent Mesh Hackathon** 🚀

# AMBER Alert Simulation - Solace Agent Mesh

An event-driven, multi-agent AI system that simulates an intelligent AMBER Alert response network. This demonstration shows how multiple independent agents communicate through events to coordinate emergency response.

## Features

- **Event-Driven Architecture**: All agents communicate via events, not direct calls
- **Real-Time Visualization**: Live dashboard showing agent status and event flow
- **Multi-Agent System**: 6 specialized agents working together
- **Failure Recovery**: Demonstrates how the system continues when agents fail
- **AI-Powered Analysis**: Uses AI to assess alert urgency and process tips

## Architecture

### Agents

1. **Alert Receiver** - Receives and validates AMBER Alert reports
2. **AI Analyzer** - Assesses alert urgency and priority using AI reasoning
3. **Broadcast Agent** - Coordinates alert broadcasting across multiple channels
4. **Camera Agent** - Manages automated camera scanning in geofence zones
5. **Tip Processor** - Receives, processes, and verifies tips from the public
6. **Geo Intelligence** - Creates geofence zones for camera scanning

### Event Flow

```
Alert Reported → AI Analyzer → Broadcast Agent
                ↓
         Geo Intelligence → Camera Agent
                ↓
         Tip Processor → AI Analyzer
```

## Setup

### Prerequisites

- Node.js 18+ and npm
- Python 3.11
- uv package manager (for Python dependencies)

### Installation

1. **Install Python dependencies:**
   ```bash
   uv sync
   ```

2. **Install Node.js dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your LLM API credentials (see docs/llm-setup.md)
   ```

## Running the Application

### Option 1: Development Mode (Recommended)

**Terminal 1 - Start SAM Backend:**
```bash
uv run sam run configs/
```

**Terminal 2 - Start Next.js Frontend:**
```bash
npm run dev
```

Then open http://localhost:3000 in your browser.

### Option 2: Docker (Alternative)

```bash
docker build -t amber-alert-sim .
docker run -d --rm -p 8000:8000 -p 3000:3000 --env-file .env --name amber-sim amber-alert-sim
```

## Usage

1. **Trigger an Alert**: Click "🚨 Trigger AMBER Alert" to start a simulation
2. **Watch Agents**: See agents change color as they process events:
   - 🟢 Green = Success/Active
   - 🟡 Yellow = Processing
   - 🔴 Red = Error/Failed
   - ⚫ Gray = Idle
3. **View Events**: Check the Event Timeline on the right to see all events
4. **Simulate Failure**: Click any agent's failure button to see recovery
5. **Reset**: Click "Reset Simulation" to start over

## How It Works

### Event-Driven Communication

Agents don't call each other directly. Instead:
- Agents publish events to the event broker
- Other agents subscribe to relevant events
- Each agent reacts independently to events

### Failure Recovery

When an agent fails:
1. Failure event is emitted
2. Other agents continue working (they're decoupled)
3. System automatically attempts recovery
4. Agent status updates when recovered

### Data Sources

All data comes from JSON files in the `data/` directory:
- `amber_alert.json` - Alert information
- `tips.json` - Public tips
- `resolutions.json` - Resolution outcomes

## Project Structure

```
.
├── app/                    # Next.js frontend
│   ├── components/        # React components
│   └── api/               # API routes
├── configs/               # SAM agent configurations
│   └── agents/            # Individual agent YAML files
├── src/                   # Python tools
│   └── amber_tools.py     # Agent tools
├── data/                  # JSON data files
└── package.json           # Node.js dependencies
```

## Development

### Adding a New Agent

1. Create a YAML file in `configs/agents/`
2. Follow the pattern from existing agents
3. Add tools in `src/amber_tools.py` if needed
4. Update the frontend to include the new agent

### Modifying Event Flow

Events are emitted in:
- Python tools (`src/amber_tools.py`) - via HTTP to frontend API
- API routes (`app/api/`) - for simulation triggers


## License

MIT

# Quick Setup Guide

## 1. Install Dependencies

```bash
# Python dependencies
uv sync

# Node.js dependencies  
npm install
```

## 2. Configure Environment

Copy `.env.example` to `.env` and add your LLM API credentials:

```bash
cp .env.example .env
```

See `docs/llm-setup.md` for free API options (Cerebras recommended).

## 3. Run the Application

**Terminal 1** - SAM Backend:
```bash
uv run sam run configs/
```

**Terminal 2** - Next.js Frontend:
```bash
npm run dev
```

Open http://localhost:3000

## 4. Test It

1. Click "🚨 Trigger AMBER Alert"
2. Watch agents process the alert
3. Try "Simulate Failure" on any agent
4. See how other agents continue working

## Troubleshooting

- **Frontend not connecting**: Make sure SAM backend is running on port 8000
- **Agents not responding**: Check `.env` has correct LLM API credentials
- **Port conflicts**: Change ports in `next.config.js` and SAM configs

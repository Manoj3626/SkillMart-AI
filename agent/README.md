# SkillMatch AI — Interview Agent

The Python agent that powers live AI voice interviews using LiveKit Agents.

## Prerequisites

- Python 3.11+
- LiveKit account (free tier: https://livekit.io)
- Google AI Studio API key (free: https://aistudio.google.com/) OR OpenAI API key

## Setup

```bash
cd agent

# Create virtual environment
python -m venv .venv

# Activate (Windows)
.venv\Scripts\activate

# Activate (macOS / Linux)
source .venv/bin/activate

# Install dependencies
pip install -e .

# Configure environment
copy .env.example .env
# Edit .env and add your LiveKit + AI credentials
```

## Running

```bash
# Development mode (auto-reconnects, verbose logs)
python -m src.main dev

# Production mode
python -m src.main start
```

## How It Works

1. The Next.js frontend creates a LiveKit room with interview config as room metadata (JSON).
2. The LiveKit server dispatches a job to this agent process.
3. The agent joins the room and starts an `AgentSession` with:
   - **STT** (Speech-to-Text): Google / OpenAI
   - **LLM**: Gemini 2.0 Flash / GPT-4o-mini
   - **TTS** (Text-to-Speech): Google / OpenAI
   - **VAD**: Silero (voice activity detection)
4. The agent conducts the interview using prompts from `src/prompts.py`.
5. When the session ends, the transcript is available for feedback generation.

## Providers

| Provider | STT | LLM | TTS | Free Tier |
|---|---|---|---|---|
| Google | ✅ | Gemini 2.0 Flash | ✅ | Yes (AI Studio) |
| OpenAI | ✅ | GPT-4o-mini | ✅ | No (billing required) |

## Configuration

See `.env.example` for all available options.

Required:
- `LIVEKIT_URL`
- `LIVEKIT_API_KEY`
- `LIVEKIT_API_SECRET`
- `GOOGLE_API_KEY` (if `AI_PROVIDER=google`)
- `OPENAI_API_KEY` (if `AI_PROVIDER=openai`)

## Troubleshooting

- **Agent not joining rooms**: Check `LIVEKIT_URL`, `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET` are correct.
- **No audio**: Ensure the candidate's browser has microphone permission granted.
- **Plugin not found**: Run `pip install livekit-plugins-google` or `livekit-plugins-openai`.
- **Rate limits**: Google AI Studio free tier has per-minute limits. For production, upgrade or switch providers.

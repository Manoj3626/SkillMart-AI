"""
SkillMatch AI — LiveKit Interview Agent
Main entry point for the Python agent process.

Setup:
    cd agent
    python -m venv .venv
    .venv\\Scripts\\activate          # Windows
    pip install -e ".[dev]"
    cp .env.example .env
    # Fill in .env credentials
    python -m src.main dev

Production:
    python -m src.main start
"""

import asyncio
import logging
import os
from dataclasses import dataclass
from typing import Any

from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger("skillmatch.agent")
logging.basicConfig(
    level=getattr(logging, os.getenv("AGENT_LOG_LEVEL", "INFO")),
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)


# ─── Config ───────────────────────────────────────────────────────────────────

@dataclass
class InterviewConfig:
    job_role: str = "Software Engineer"
    interview_type: str = "mixed"
    difficulty: str = "intermediate"
    experience_level: str = "junior"
    duration_minutes: int = 20
    job_description: str | None = None
    focus_skills: list[str] | None = None
    transcript_consented: bool = True


def _parse_room_metadata(metadata: str | None) -> InterviewConfig:
    """Parse JSON metadata attached to the LiveKit room by the Next.js frontend."""
    if not metadata:
        return InterviewConfig()
    try:
        import json
        data = json.loads(metadata)
        return InterviewConfig(
            job_role=data.get("jobRole", "Software Engineer"),
            interview_type=data.get("interviewType", "mixed"),
            difficulty=data.get("difficulty", "intermediate"),
            experience_level=data.get("experienceLevel", "junior"),
            duration_minutes=int(data.get("durationMinutes", 20)),
            job_description=data.get("jobDescription"),
            focus_skills=data.get("focusSkills") or [],
            transcript_consented=bool(data.get("consentTranscript", True)),
        )
    except Exception as exc:
        logger.warning("Failed to parse room metadata: %s", exc)
        return InterviewConfig()


# ─── Agent ────────────────────────────────────────────────────────────────────

async def _run_agent_with_google(ctx: Any, config: InterviewConfig) -> None:
    """Run the interview agent using Google Gemini via LiveKit Agents."""
    from livekit.agents import (
        AgentSession,
        Agent,
        RoomInputOptions,
    )
    from livekit.plugins import google, silero
    from src.prompts import build_system_prompt

    system_prompt = build_system_prompt(
        job_role=config.job_role,
        interview_type=config.interview_type,
        difficulty=config.difficulty,
        experience_level=config.experience_level,
        duration_minutes=config.duration_minutes,
        job_description=config.job_description,
        focus_skills=config.focus_skills,
    )

    session = AgentSession(
        stt=google.STT(),
        llm=google.LLM(model="gemini-2.0-flash"),
        tts=google.TTS(),
        vad=silero.VAD.load(),
    )

    await session.start(
        agent=Agent(instructions=system_prompt),
        room=ctx.room,
        room_input_options=RoomInputOptions(
            noise_cancellation=True,
        ),
    )


async def _run_agent_with_openai(ctx: Any, config: InterviewConfig) -> None:
    """Run the interview agent using OpenAI Realtime API via LiveKit Agents."""
    from livekit.agents import AgentSession, Agent, RoomInputOptions
    from livekit.plugins import openai, silero
    from src.prompts import build_system_prompt

    system_prompt = build_system_prompt(
        job_role=config.job_role,
        interview_type=config.interview_type,
        difficulty=config.difficulty,
        experience_level=config.experience_level,
        duration_minutes=config.duration_minutes,
        job_description=config.job_description,
        focus_skills=config.focus_skills,
    )

    session = AgentSession(
        stt=openai.STT(),
        llm=openai.LLM(model="gpt-4o-mini"),
        tts=openai.TTS(),
        vad=silero.VAD.load(),
    )

    await session.start(
        agent=Agent(instructions=system_prompt),
        room=ctx.room,
        room_input_options=RoomInputOptions(noise_cancellation=True),
    )


async def entrypoint(ctx: Any) -> None:
    """Called by LiveKit Agents framework when a new room connects."""
    logger.info("Agent joining room: %s", ctx.room.name)

    # Parse interview config from room metadata
    metadata = getattr(ctx.room, "metadata", None)
    config = _parse_room_metadata(metadata)
    logger.info(
        "Interview config: role=%s type=%s difficulty=%s",
        config.job_role,
        config.interview_type,
        config.difficulty,
    )

    provider = os.getenv("AI_PROVIDER", "google").lower()

    try:
        if provider == "google":
            if not os.getenv("GOOGLE_API_KEY"):
                raise EnvironmentError(
                    "GOOGLE_API_KEY not set. Copy agent/.env.example to agent/.env and add your key."
                )
            await _run_agent_with_google(ctx, config)
        elif provider == "openai":
            if not os.getenv("OPENAI_API_KEY"):
                raise EnvironmentError(
                    "OPENAI_API_KEY not set. Copy agent/.env.example to agent/.env and add your key."
                )
            await _run_agent_with_openai(ctx, config)
        else:
            raise ValueError(f"Unsupported AI_PROVIDER: {provider}. Use 'google' or 'openai'.")

    except ImportError as exc:
        logger.error(
            "Missing plugin: %s. Run: pip install livekit-plugins-google livekit-plugins-openai",
            exc,
        )
        raise
    except EnvironmentError as exc:
        logger.error("Configuration error: %s", exc)
        raise


def cli() -> None:
    """CLI entry point — used by `python -m src.main` or `agent` script."""
    try:
        from livekit.agents import cli as agents_cli, WorkerOptions
    except ImportError:
        logger.error(
            "livekit-agents not installed. Run: pip install -e . inside the agent/ directory."
        )
        return

    agents_cli.run_app(
        WorkerOptions(
            entrypoint_fnc=entrypoint,
            # Agent connects to the LiveKit server on LIVEKIT_URL automatically
        )
    )


if __name__ == "__main__":
    cli()

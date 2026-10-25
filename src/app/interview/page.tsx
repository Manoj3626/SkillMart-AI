"use client";

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  Suspense,
} from "react";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Upload,
  FileText,
  ChevronRight,
  RotateCcw,
  CheckCircle,
  AlertCircle,
  Volume2,
  VolumeX,
  Loader2,
  Brain,
  Star,
  TrendingUp,
  TrendingDown,
  Zap,
  MessageSquare,
  Award,
  Target,
  SkipForward,
  Clock,
  Sparkles,
  RefreshCw,
  Send,
  BookOpen,
  Briefcase,
  GraduationCap,
  Play,
  Check,
  Pause,
  Maximize,
  Minimize,
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────
interface RecommendedRole {
  title: string;
  matchScore: number;
  matchReason: string;
  matchingSkills: string[];
  skillsToImprove: string[];
  suggestedInterviewFocus: string;
}

interface Question {
  id: number;
  question: string;
  category: string;
  followUpHints?: string[];
}

interface Message {
  role: "assistant" | "user";
  content: string;
  timestamp: number;
}

interface QuestionFeedbackItem {
  question: string;
  candidateAnswerSummary?: string;
  quality: "excellent" | "good" | "needs-work" | "skipped";
  comment: string;
  idealAnswer?: string;
}

interface FeedbackData {
  overallScore: number;
  summary: string;
  scores: {
    technicalKnowledge?: number;
    communicationClarity?: number;
    problemSolving?: number;
    resumeUnderstanding?: number;
    answerCompleteness?: number;
    [key: string]: number | undefined;
  };
  strengths: { title: string; detail: string }[];
  improvements: { title: string; detail: string }[];
  questionFeedback: QuestionFeedbackItem[];
  recommendations: string[];
  recommendedTopics?: string[];
  hiringSuggestion?: string;
  disclaimer?: string;
}

type Phase = "upload" | "ready" | "interview" | "generating" | "feedback";
type LiveState = "connecting" | "ai_speaking" | "listening" | "processing" | "paused" | "completed";
type AnsweringState =
  | "AI_SPEAKING"
  | "WAITING_FOR_CANDIDATE"
  | "CANDIDATE_SPEAKING"
  | "ANSWER_READY"
  | "SUBMITTING_ANSWER"
  | "AI_PROCESSING"
  | "AI_SPEAKING_NEXT_QUESTION"
  | "COMPLETED";

// ── Score Ring Component ───────────────────────────────────────────────────
function ScoreRing({ score, size = 110, label }: { score: number; size?: number; label?: string }) {
  const strokeWidth = 8;
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(score, 100) / 100) * circumference;

  const color =
    score >= 80 ? "#0f766e" : score >= 65 ? "#0d9488" : score >= 50 ? "#d97706" : "#e11d48";

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg className="rotate-[-90deg]" width={size} height={size}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#e2e8f0"
            strokeWidth={strokeWidth}
            fill="none"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-black text-slate-900">{score}</span>
          <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">/100</span>
        </div>
      </div>
      {label && <p className="text-slate-600 text-xs font-semibold mt-2 text-center">{label}</p>}
    </div>
  );
}

// ── Quality Badge ──────────────────────────────────────────────────────────
function QualityBadge({ quality }: { quality: string }) {
  const styles: Record<string, { bg: string; text: string; label: string }> = {
    excellent: { bg: "bg-emerald-50 border-emerald-200", text: "text-emerald-800", label: "Strong Answer" },
    good: { bg: "bg-teal-50 border-teal-200", text: "text-teal-800", label: "Good Answer" },
    "needs-work": { bg: "bg-amber-50 border-amber-200", text: "text-amber-800", label: "Needs More Depth" },
    skipped: { bg: "bg-stone-100 border-stone-200", text: "text-stone-600", label: "Skipped" },
  };
  const s = styles[quality] || styles.good;
  return (
    <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${s.bg} ${s.text}`}>
      {s.label}
    </span>
  );
}

// ── Audio Waveform Visualizer ──────────────────────────────────────────────
function VoiceWave({ active, color = "#0f766e" }: { active: boolean; color?: string }) {
  return (
    <div className="flex items-center gap-1 h-6">
      {[10, 18, 14, 22, 12, 20, 15, 17, 13, 21, 11, 16].map((h, i) => (
        <div
          key={i}
          className="w-1 rounded-full transition-all duration-150"
          style={{
            backgroundColor: color,
            height: active ? `${h}px` : "4px",
            animation: active ? `waveAnim ${0.35 + (i % 5) * 0.08}s ease-in-out infinite alternate` : "none",
            animationDelay: `${i * 0.04}s`,
          }}
        />
      ))}
    </div>
  );
}


// ── AI Interviewer Avatar Component with Synchronized Speaking ──────────────
interface AIAvatarInterviewerProps {
  isSpeaking: boolean;
  liveState: LiveState;
  muteAI: boolean;
  onToggleMute: () => void;
}

function AIAvatarInterviewer({
  isSpeaking,
  liveState,
  muteAI,
  onToggleMute,
}: AIAvatarInterviewerProps) {
  return (
    <div className="bg-slate-900 border border-stone-200/90 rounded-2xl overflow-hidden relative flex flex-col justify-end p-3 shadow-2xs w-full h-full">
      {/* Background with synchronized subtle breathing / speaking animation */}
      <div
        className={`absolute inset-0 bg-cover bg-center transition-all duration-700 ${
          isSpeaking
            ? "scale-[1.025] animate-avatar-speaking brightness-[1.03]"
            : liveState === "listening"
            ? "scale-100 animate-avatar-breathe brightness-100"
            : "scale-100 brightness-[0.98]"
        }`}
        style={{ backgroundImage: `url('/interviewer.jpg')` }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/15 to-transparent pointer-events-none" />

      {/* Synchronized Speaking Lip/Mouth Modulation Overlay */}
      {isSpeaking && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {/* Subtle natural mouth phoneme movement synchronized with speaking */}
          <div className="relative w-12 h-6 mt-16 opacity-75 mix-blend-multiply">
            <div className="w-full h-full rounded-full bg-rose-950/50 blur-[0.5px] animate-lip-sync" />
          </div>
        </div>
      )}

      {/* Speaking / Listening State Overlay Badges */}
      <div className="absolute top-3 right-3 flex items-center gap-2">
        {isSpeaking && (
          <div className="bg-teal-800/95 text-white text-[11px] font-bold px-3 py-1 rounded-full flex items-center gap-2 shadow-xs backdrop-blur speaking-glow">
            <div className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
            <span>AI Speaking</span>
            <VoiceWave active={true} color="#ffffff" />
          </div>
        )}

        {liveState === "listening" && (
          <div className="bg-emerald-700/95 text-white text-[11px] font-bold px-3 py-1 rounded-full flex items-center gap-2 shadow-xs backdrop-blur listening-glow">
            <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            <span>Listening to you...</span>
          </div>
        )}

        {liveState === "processing" && (
          <div className="bg-stone-800/90 text-stone-200 text-[11px] font-semibold px-3 py-1 rounded-full flex items-center gap-1.5 backdrop-blur">
            <Loader2 size={11} className="animate-spin text-teal-400" />
            <span>Evaluating answer...</span>
          </div>
        )}
      </div>

      {/* Connection Indicator Top-Left */}
      <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-black/40 backdrop-blur px-2.5 py-1 rounded-full text-[10px] font-medium text-white/90">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        <span>Live HD AI Recruiter</span>
      </div>

      {/* Recruiter Details Overlay */}
      <div className="relative z-10 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-white font-extrabold text-sm md:text-base tracking-tight drop-shadow">
              Sarah Jenkins
            </h3>
            <span className="bg-teal-700 text-white text-[10px] font-bold px-2 py-0.5 rounded backdrop-blur">
              AI RECRUITER
            </span>
          </div>
          <p className="text-[11px] text-white/80 drop-shadow">Senior Placement Lead · Placement Cell</p>
        </div>

        <button
          onClick={onToggleMute}
          className={`p-2 rounded-xl backdrop-blur transition-all cursor-pointer ${
            muteAI ? "bg-rose-600 text-white" : "bg-black/40 hover:bg-black/60 text-white/90"
          }`}
          title={muteAI ? "Unmute AI Voice" : "Mute AI Voice"}
        >
          {muteAI ? <VolumeX size={15} /> : <Volume2 size={15} />}
        </button>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════
// MAIN APPLICATION COMPONENT
// ══════════════════════════════════════════════════════════════════════════
function InterviewApp() {
  const [phase, setPhase] = useState<Phase>("upload");
  const [answeringState, setAnsweringState] = useState<AnsweringState>("WAITING_FOR_CANDIDATE");
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStageText, setUploadStageText] = useState("");
  const [parseError, setParseError] = useState<string | null>(null);

  // Resume analysis & Role recommendation state
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [candidateName, setCandidateName] = useState("Candidate");
  const [education, setEducation] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [projects, setProjects] = useState<string[]>([]);
  const [resumeContext, setResumeContext] = useState("");
  const [recommendedRoles, setRecommendedRoles] = useState<RecommendedRole[]>([]);
  const [selectedRole, setSelectedRole] = useState("Software Engineer");
  const [customRoleInput, setCustomRoleInput] = useState("");
  const [isGeneratingRoleQuestions, setIsGeneratingRoleQuestions] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);

  // Focus Mode / Proctoring State
  const [isFocusModeEnabled, setIsFocusModeEnabled] = useState(true);
  const [focusViolations, setFocusViolations] = useState(0);
  const [showFocusAlert, setShowFocusAlert] = useState(false);
  const [focusAlertMsg, setFocusAlertMsg] = useState("");

  // Live Interview State
  const [currentQIdx, setCurrentQIdx] = useState(0);
  const [messages, setMessages] = useState<Message[]>([]);
  const [answerText, setAnswerText] = useState("");
  const [liveTranscript, setLiveTranscript] = useState("");
  const [isMicListening, setIsMicListening] = useState(false);
  const [micError, setMicError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [muteAI, setMuteAI] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFsChange);
    return () => document.removeEventListener("fullscreenchange", handleFsChange);
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (typeof document === "undefined") return;
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    }
  }, []);

  // Derived state
  const isAISpeaking =
    answeringState === "AI_SPEAKING" || answeringState === "AI_SPEAKING_NEXT_QUESTION";
  const liveState: LiveState =
    answeringState === "COMPLETED"
      ? "completed"
      : isAISpeaking
      ? "ai_speaking"
      : answeringState === "SUBMITTING_ANSWER" || answeringState === "AI_PROCESSING"
      ? "processing"
      : "listening";

  // Testing voice audio preview state
  const [isTestingVoice, setIsTestingVoice] = useState(false);

  // Webcam State (Ref-based lifecycle prevents accidental track stop)
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isCameraVideoEnabled, setIsCameraVideoEnabled] = useState(true);
  const cameraStreamRef = useRef<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Audio Playback & Voice Engine Refs
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const isAudioPlayingRef = useRef(false);
  const preloadedGreetingAudioRef = useRef<Blob | null>(null);
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const speechWatchdogRef = useRef<NodeJS.Timeout | null>(null);
  const speechHeartbeatRef = useRef<NodeJS.Timeout | null>(null);

  // Speech Recognition (Mic) Refs
  const recognitionRef = useRef<any>(null);
  const isListeningRef = useRef(false);
  const finalTranscriptPrefixRef = useRef("");
  const currentAnswerTextRef = useRef("");

  // Sync ref with current answerText
  useEffect(() => {
    currentAnswerTextRef.current = answerText;
  }, [answerText]);

  // Feedback State
  const [feedback, setFeedback] = useState<FeedbackData | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, liveTranscript, liveState]);

  // Elapsed interview timer
  useEffect(() => {
    if (phase !== "interview" || liveState === "completed") return;
    const interval = setInterval(() => {
      setElapsedSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [phase, liveState]);

  // ── QUESTION SHUFFLER (KEEP WARMUP AT #1, SHUFFLE TECHNICAL/BEHAVIORAL) ────
  const shuffleQuestionList = useCallback((list: Question[]): Question[] => {
    if (list.length <= 2) return [...list];
    const first = list[0];
    const remaining = [...list.slice(1)];
    for (let i = remaining.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [remaining[i], remaining[j]] = [remaining[j], remaining[i]];
    }
    return [first, ...remaining];
  }, []);

  // ── FOCUS MODE PROCTORING: TAB SWITCH & WINDOW BLUR LISTENERS ──────────────
  useEffect(() => {
    if (phase !== "interview" || !isFocusModeEnabled) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setFocusViolations((v) => v + 1);
        setFocusAlertMsg("Tab switch or minimization detected. Please stay focused on the interview room.");
        setShowFocusAlert(true);
      }
    };

    const handleWindowBlur = () => {
      setFocusViolations((v) => v + 1);
      setFocusAlertMsg("Window focus lost. Please maintain focus on your interview session.");
      setShowFocusAlert(true);
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleWindowBlur);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleWindowBlur);
    };
  }, [phase, isFocusModeEnabled]);

  // Auto-dismiss focus alert banner after 6 seconds
  useEffect(() => {
    if (showFocusAlert) {
      const timer = setTimeout(() => setShowFocusAlert(false), 6000);
      return () => clearTimeout(timer);
    }
  }, [showFocusAlert]);

  // ── WEBCAM LIFECYCLE (STABLE REF-BASED) ───────────────────────────────────
  // Initializes webcam without triggering effect cleanups that kill tracks
  const initWebcam = useCallback(async () => {
    if (cameraStreamRef.current && cameraStreamRef.current.active) {
      if (videoRef.current && videoRef.current.srcObject !== cameraStreamRef.current) {
        videoRef.current.srcObject = cameraStreamRef.current;
      }
      setIsCameraActive(true);
      return;
    }

    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 640 }, height: { ideal: 480 } },
          audio: false,
        });
        cameraStreamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setIsCameraActive(true);
        setIsCameraVideoEnabled(true);
      }
    } catch (err) {
      console.warn("Webcam access notice:", err);
      setIsCameraActive(false);
    }
  }, []);

  // Soft toggle: Mutes/unmutes video tracks WITHOUT killing hardware lock
  const toggleCamera = useCallback(() => {
    if (cameraStreamRef.current) {
      const tracks = cameraStreamRef.current.getVideoTracks();
      const willEnable = !isCameraVideoEnabled;
      tracks.forEach((t) => {
        t.enabled = willEnable;
      });
      setIsCameraVideoEnabled(willEnable);
    } else {
      initWebcam();
    }
  }, [isCameraVideoEnabled, initWebcam]);

  // Stop tracks ONLY on hard exit / restart
  const stopWebcam = useCallback(() => {
    if (cameraStreamRef.current) {
      cameraStreamRef.current.getTracks().forEach((t) => t.stop());
      cameraStreamRef.current = null;
      setIsCameraActive(false);
    }
  }, []);

  // Ensure webcam feed stays bound to videoRef when phase is interview
  useEffect(() => {
    if (phase === "interview" && videoRef.current && cameraStreamRef.current) {
      if (videoRef.current.srcObject !== cameraStreamRef.current) {
        videoRef.current.srcObject = cameraStreamRef.current;
      }
    }
  }, [phase, isCameraActive]);

  // ── REAL AUDIO SPEECH ENGINE ─────────────────────────────────────────────
  const stopSpeech = useCallback(() => {
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      audioPlayerRef.current.currentTime = 0;
    }
    if (speechWatchdogRef.current) {
      clearTimeout(speechWatchdogRef.current);
      speechWatchdogRef.current = null;
    }
    if (speechHeartbeatRef.current) {
      clearInterval(speechHeartbeatRef.current);
      speechHeartbeatRef.current = null;
    }
    if (typeof window !== "undefined" && window.speechSynthesis) {
      try {
        if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
          window.speechSynthesis.cancel();
        }
      } catch {}
    }
    currentUtteranceRef.current = null;
    isAudioPlayingRef.current = false;
  }, []);

  // Speaks aloud using speech synthesis engine with auto-recovery watchdog
  const speakAloud = useCallback(
    async (text: string, onDone?: () => void) => {
      stopSpeech();
      isAudioPlayingRef.current = true;

      const cleanText = text
        .replace(/[*#_`]/g, "")
        .replace(/\[Skipped\]/g, "Question skipped.")
        .trim();

      fallbackBrowserSpeak(cleanText, onDone);
    },
    [stopSpeech]
  );

  const fallbackBrowserSpeak = (text: string, onEnd?: () => void) => {
    let hasFinished = false;
    const onSpeechFinished = () => {
      if (hasFinished) return;
      hasFinished = true;
      if (speechWatchdogRef.current) {
        clearTimeout(speechWatchdogRef.current);
        speechWatchdogRef.current = null;
      }
      if (speechHeartbeatRef.current) {
        clearInterval(speechHeartbeatRef.current);
        speechHeartbeatRef.current = null;
      }
      currentUtteranceRef.current = null;
      isAudioPlayingRef.current = false;
      onEnd?.();
    };

    if (typeof window === "undefined" || !window.speechSynthesis) {
      onSpeechFinished();
      return;
    }

    try {
      window.speechSynthesis.resume();
    } catch {}

    setTimeout(() => {
      try {
        const utterance = new SpeechSynthesisUtterance(text);
        currentUtteranceRef.current = utterance;
        if (typeof window !== "undefined") {
          (window as any).__activeUtterance = utterance;
        }

        utterance.rate = 1.0;
        utterance.pitch = 1.03;

        const voices = window.speechSynthesis.getVoices();
        const preferred =
          voices.find(
            (v) =>
              v.lang.startsWith("en") &&
              (v.name.includes("Google") ||
                v.name.includes("Natural") ||
                v.name.includes("Samantha") ||
                v.name.includes("Zira") ||
                v.name.includes("Female"))
          ) || voices.find((v) => v.lang.startsWith("en"));

        if (preferred) utterance.voice = preferred;

        utterance.onstart = () => {
          isAudioPlayingRef.current = true;
        };
        utterance.onend = () => {
          onSpeechFinished();
        };
        utterance.onerror = (e) => {
          console.warn("Speech error event:", e);
          onSpeechFinished();
        };

        const wordCount = text.split(/\s+/).filter(Boolean).length;
        const maxDurationMs = Math.max(5000, Math.ceil((wordCount / 2.2) * 1000) + 3500);
        speechWatchdogRef.current = setTimeout(() => {
          console.warn("[Speech Watchdog] Auto-releasing speaking lock to keep conversation progressing");
          onSpeechFinished();
        }, maxDurationMs);

        speechHeartbeatRef.current = setInterval(() => {
          if (typeof window !== "undefined" && window.speechSynthesis?.speaking) {
            window.speechSynthesis.pause();
            window.speechSynthesis.resume();
          }
        }, 10000);

        window.speechSynthesis.speak(utterance);
      } catch (err) {
        console.warn("Speech synthesis error:", err);
        onSpeechFinished();
      }
    }, 40);
  };

  // ── MICROPHONE & AUTOMATIC SPEECH RECOGNITION ─────────────────────────────
  const stopListening = useCallback(() => {
    isListeningRef.current = false;
    setIsMicListening(false);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
      recognitionRef.current = null;
    }
  }, []);

  const startListening = useCallback(() => {
    if (typeof window === "undefined") return;

    // Do not start mic while AI is speaking
    if (isAudioPlayingRef.current) {
      return;
    }

    stopListening();
    setMicError(null);

    const SR =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SR) {
      setMicError(
        "Speech recognition not natively supported in this browser. Please use Chrome/Edge or type your answer directly."
      );
      setIsMicListening(false);
      return;
    }

    try {
      const recognition = new SR();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";
      recognition.maxAlternatives = 1;

      finalTranscriptPrefixRef.current = currentAnswerTextRef.current
        ? currentAnswerTextRef.current.trim() + " "
        : "";

      recognition.onstart = () => {
        isListeningRef.current = true;
        setIsMicListening(true);
      };

      recognition.onresult = (e: any) => {
        let sessionFinal = "";
        let interim = "";
        for (let i = 0; i < e.results.length; ++i) {
          if (e.results[i].isFinal) {
            sessionFinal += e.results[i][0].transcript + " ";
          } else {
            interim += e.results[i][0].transcript;
          }
        }
        const fullSpoken = (finalTranscriptPrefixRef.current + sessionFinal + interim).trim();
        if (fullSpoken) {
          setAnswerText(fullSpoken);
          setLiveTranscript(fullSpoken);
          setAnsweringState("ANSWER_READY");
        }
      };

      recognition.onend = () => {
        // Natural end of candidate utterance or silence pause.
        // Cleanly finish listening without restarting in a tight loop.
        // This stops Chrome/Edge from repeatedly emitting the speech start audio chime (the repeated beep).
        isListeningRef.current = false;
        setIsMicListening(false);
      };

      recognition.onerror = (e: any) => {
        if (e.error === "not-allowed" || e.error === "permission-denied") {
          setMicError(
            "Microphone permission was denied. Please allow mic access in your browser or type your answer below."
          );
          isListeningRef.current = false;
          setIsMicListening(false);
        } else if (e.error !== "no-speech") {
          console.warn("Speech recognition notice:", e.error);
        }
      };

      recognition.start();
      recognitionRef.current = recognition;
      isListeningRef.current = true;
      setIsMicListening(true);
    } catch (err) {
      console.warn("Failed to start speech recognition:", err);
      setIsMicListening(false);
    }
  }, [stopListening]);

  const toggleMic = useCallback(() => {
    if (isMicListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isMicListening, stopListening, startListening]);

  // ── RESUME PARSING & PRE-FETCHING ─────────────────────────────────────────
  const processFile = useCallback(async (file: File) => {
    setResumeFile(file);
    setParseError(null);
    setUploadProgress(15);
    setUploadStageText("Extracting resume text from document...");

    const fd = new FormData();
    fd.append("resume", file);

    const stageTimer1 = setTimeout(() => {
      setUploadProgress(45);
      setUploadStageText("Analyzing candidate projects & core skills with Gemini...");
    }, 800);

    const stageTimer2 = setTimeout(() => {
      setUploadProgress(75);
      setUploadStageText("Recommending top placement roles & personalized questions...");
    }, 1800);

    try {
      const res = await fetch("/api/interview/parse-resume", {
        method: "POST",
        body: fd,
      });

      clearTimeout(stageTimer1);
      clearTimeout(stageTimer2);
      setUploadProgress(100);

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Resume analysis failed");

      setCandidateName(data.candidateName || "Candidate");
      setEducation(data.education || "");
      setSkills(Array.isArray(data.skills) ? data.skills : []);
      setProjects(Array.isArray(data.projects) ? data.projects : []);
      setResumeContext(data.resumeText || "");

      const roles = Array.isArray(data.recommendedRoles) ? data.recommendedRoles : [];
      setRecommendedRoles(roles);

      const bestRole = roles[0]?.title || data.jobRole || "Software Engineer";
      setSelectedRole(bestRole);

      const qList = (Array.isArray(data.questions) ? data.questions : []).slice(0, 5);
      setQuestions(qList);

      // Pre-fetch greeting audio in background so "Start Interview" has 0 latency
      if (qList[0]?.question) {
        const greetingText = `Hello ${data.candidateName || "Candidate"}! I'm Sarah Jenkins, your Technical HR interviewer for today's placement practice for the ${bestRole} position. Let's begin with our first question: ${qList[0].question}`;
        fetch("/api/interview/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: greetingText }),
        })
          .then((r) => (r.ok ? r.blob() : null))
          .then((b) => {
            if (b) preloadedGreetingAudioRef.current = b;
          })
          .catch(() => {});
      }

      setTimeout(() => setPhase("ready"), 350);
    } catch (err: any) {
      clearTimeout(stageTimer1);
      clearTimeout(stageTimer2);
      setUploadProgress(0);
      setParseError(err.message || "Failed to analyze resume. Please try again with a valid PDF or DOCX.");
    }
  }, []);

  // Verified sample resume for instant demonstration
  const loadSampleResume = useCallback(async () => {
    setParseError(null);
    setUploadProgress(30);
    setUploadStageText("Loading verified placement sample profile...");

    setTimeout(() => {
      setUploadProgress(70);
      setUploadStageText("Evaluating placement roles & generating questions...");
    }, 400);

    setTimeout(() => {
      setUploadProgress(100);
      const name = "Rahul Sharma";
      setCandidateName(name);
      setEducation("B.Tech in Computer Science & Engineering (2025)");
      setSkills(["React.js", "Node.js", "TypeScript", "PostgreSQL", "Docker", "REST APIs", "Git", "ServiceNow"]);
      setProjects([
        "SkillMatch Career Platform — Real-time talent assessment engine with Next.js & PostgreSQL",
        "Campus Connect App — Microservices-based college event tracker with Redis caching",
      ]);

      const sampleRoles: RecommendedRole[] = [
        {
          title: "Full Stack Software Engineer",
          matchScore: 95,
          matchReason: "Demonstrated full lifecycle experience with React, Node.js, and PostgreSQL in project portfolio.",
          matchingSkills: ["React.js", "Node.js", "TypeScript", "PostgreSQL"],
          skillsToImprove: ["Distributed Tracing", "Kubernetes Deployment"],
          suggestedInterviewFocus: "Frontend-backend state synchronization & API performance",
        },
        {
          title: "Frontend React Developer",
          matchScore: 90,
          matchReason: "Strong modern component architecture and reactive UI implementation skills.",
          matchingSkills: ["React.js", "TypeScript", "REST APIs"],
          skillsToImprove: ["Web Performance (Lighthouse)", "Micro-frontends"],
          suggestedInterviewFocus: "Rendering optimization, React hooks, and responsive UX",
        },
        {
          title: "ServiceNow / Cloud Platform Associate",
          matchScore: 82,
          matchReason: "Foundational ServiceNow awareness combined with enterprise backend knowledge.",
          matchingSkills: ["ServiceNow", "Node.js", "Docker", "Git"],
          skillsToImprove: ["ITSM Workflows", "ServiceNow Scripting"],
          suggestedInterviewFocus: "Workflow automation, business rules, and integration APIs",
        },
      ];

      setRecommendedRoles(sampleRoles);
      setSelectedRole(sampleRoles[0].title);

      const qList: Question[] = [
        {
          id: 1,
          question: "Welcome Rahul! Could you please introduce yourself, share what inspired you to pursue software engineering, and highlight your experience with full stack development?",
          category: "warmup",
        },
        {
          id: 2,
          question: "In your resume, you highlighted React and Node.js. Can you explain how you handle state management and API data fetching to ensure optimal frontend rendering speed?",
          category: "technical",
        },
        {
          id: 3,
          question: "Tell me about your SkillMatch Career Platform project. What was the toughest technical hurdle you ran into, and how did you debug and resolve it?",
          category: "project",
        },
        {
          id: 4,
          question: "Suppose an API endpoint handling candidate search begins experiencing 5-second latency under placement rush. How would you systematically diagnose and optimize it?",
          category: "problem-solving",
        },
        {
          id: 5,
          question: "Can you share an instance where you worked with a tight project deadline or had a disagreement with a team member on architecture? How did you resolve it?",
          category: "behavioral",
        },
      ];

      setQuestions(qList);
      setResumeContext("Candidate: Rahul Sharma, B.Tech CSE. Skills: React, Node, TypeScript, Postgres, Docker, ServiceNow. Projects: SkillMatch, Campus Connect.");

      // Preload greeting audio
      const greeting = `Hello ${name}! I'm Sarah Jenkins, your Technical HR interviewer for today's placement practice for the ${sampleRoles[0].title} position. Let's begin with our first question: ${qList[0].question}`;
      fetch("/api/interview/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: greeting }),
      })
        .then((r) => (r.ok ? r.blob() : null))
        .then((b) => {
          if (b) preloadedGreetingAudioRef.current = b;
        })
        .catch(() => {});

      setPhase("ready");
    }, 900);
  }, []);

  // ── ROLE SELECTION & DYNAMIC RE-PLANNING ──────────────────────────────────
  const selectRole = useCallback(
    async (role: RecommendedRole) => {
      setSelectedRole(role.title);
      setCustomRoleInput(role.title);
      setIsGeneratingRoleQuestions(true);

      try {
        const res = await fetch("/api/interview/generate-questions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            roleTitle: role.title,
            candidateName,
            resumeContext,
            skills,
            projects,
          }),
        });

        const data = await res.json();
        if (data.questions && data.questions.length > 0) {
          const shuffled = shuffleQuestionList(data.questions.slice(0, 5));
          setQuestions(shuffled);

          // Update preloaded audio for this new role
          const greetingText = `Hello ${candidateName}! I'm Sarah Jenkins, your Technical HR interviewer for today's placement practice for the ${role.title} position. Let's begin with our first question: ${shuffled[0].question}`;
          fetch("/api/interview/tts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: greetingText }),
          })
            .then((r) => (r.ok ? r.blob() : null))
            .then((b) => {
              if (b) preloadedGreetingAudioRef.current = b;
            })
            .catch(() => {});
        }
      } catch (err) {
        console.warn("Could not regenerate questions for role:", err);
      } finally {
        setIsGeneratingRoleQuestions(false);
      }
    },
    [candidateName, resumeContext, skills, projects, shuffleQuestionList]
  );

  // ── CUSTOM ROLE ENTRY & QUESTION GENERATION ──────────────────────────────
  const applyCustomRole = useCallback(
    async (customRoleTitle: string) => {
      const cleanRole = customRoleTitle.trim();
      if (!cleanRole) return;
      setSelectedRole(cleanRole);
      setCustomRoleInput(cleanRole);
      setIsGeneratingRoleQuestions(true);

      try {
        const res = await fetch("/api/interview/generate-questions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            roleTitle: cleanRole,
            candidateName,
            resumeContext,
            skills,
            projects,
          }),
        });

        const data = await res.json();
        if (data.questions && data.questions.length > 0) {
          const shuffled = shuffleQuestionList(data.questions.slice(0, 5));
          setQuestions(shuffled);

          // Update preloaded audio for this custom role
          const greetingText = `Hello ${candidateName}! I'm Sarah Jenkins, your Technical HR interviewer for today's placement practice for the ${cleanRole} position. Let's begin with our first question: ${shuffled[0].question}`;
          fetch("/api/interview/tts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: greetingText }),
          })
            .then((r) => (r.ok ? r.blob() : null))
            .then((b) => {
              if (b) preloadedGreetingAudioRef.current = b;
            })
            .catch(() => {});
        }
      } catch (err) {
        console.warn("Could not generate questions for custom role:", err);
      } finally {
        setIsGeneratingRoleQuestions(false);
      }
    },
    [candidateName, resumeContext, skills, projects, shuffleQuestionList]
  );

  const reshuffleCurrentQuestions = useCallback(() => {
    setQuestions((prev) => shuffleQuestionList(prev));
  }, [shuffleQuestionList]);

  // ── TEST RECRUITER VOICE AUDIO IN PHASE 2 ────────────────────────────────
  const testRecruiterVoice = useCallback(() => {
    setIsTestingVoice(true);
    const sampleGreeting = `Hello ${candidateName}! I am Sarah Jenkins. My audio is working clearly, and I am ready to conduct your placement interview whenever you are!`;
    speakAloud(sampleGreeting, () => {
      setIsTestingVoice(false);
    });
  }, [candidateName, speakAloud]);

  // ── SUBMIT CANDIDATE ANSWER & GET AI REACTION ────────────────────────────
  const submitAnswer = useCallback(
    async (overrideAnswer?: string) => {
      const textToSubmit = (overrideAnswer !== undefined ? overrideAnswer : answerText).trim();
      if (!textToSubmit) return;
      if (isSubmitting) return;

      // 1. Lock submission state
      setIsSubmitting(true);
      setSubmitError(null);
      setAnsweringState("SUBMITTING_ANSWER");

      // 2. Stop microphone and current speech
      stopListening();
      stopSpeech();

      // 3. Append candidate's answer to transcript
      const userMsg: Message = {
        role: "user",
        content: textToSubmit,
        timestamp: Date.now(),
      };
      const updatedMessages = [...messages, userMsg];
      setMessages(updatedMessages);

      // 4. Set state to AI_PROCESSING
      setAnsweringState("AI_PROCESSING");

      const isFinal = currentQIdx + 1 >= questions.length;
      const nextQ = !isFinal ? questions[currentQIdx + 1] : null;

      const abortCtrl = new AbortController();
      const timeoutId = setTimeout(() => abortCtrl.abort(), 16000);

      try {
        const res = await fetch("/api/interview/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: abortCtrl.signal,
          body: JSON.stringify({
            messages: updatedMessages,
            currentQuestion: questions[currentQIdx]?.question || "",
            nextQuestion: nextQ?.question || "",
            isFinalQuestion: isFinal,
            resumeContext: `Candidate: ${candidateName}, Target Role: ${selectedRole}. ${resumeContext}`,
            questionIndex: currentQIdx,
            totalQuestions: questions.length,
          }),
        });
        clearTimeout(timeoutId);

        if (!res.ok) throw new Error("Recruiter agent connection error");

        const data = await res.json();
        const reply =
          data.reply ||
          (isFinal
            ? "Thank you for sharing that perspective! That concludes all our placement interview questions today. You did an excellent job. Let's now examine your comprehensive evaluation report."
            : `Thank you for explaining that. Let's move on to our next question:\n\n${nextQ?.question}`);

        const aiMsg: Message = {
          role: "assistant",
          content: reply,
          timestamp: Date.now(),
        };
        const finalMessages = [...updatedMessages, aiMsg];
        setMessages(finalMessages);

        if (!isFinal) {
          setCurrentQIdx((prev) => prev + 1);
        }

        // 5. Sarah speaks reaction and next question aloud
        setAnsweringState("AI_SPEAKING_NEXT_QUESTION");
        speakAloud(reply, () => {
          if (isFinal) {
            setAnsweringState("COMPLETED");
          } else {
            // Clear previous answer ONLY after submission succeeded and next question begins
            setAnswerText("");
            setLiveTranscript("");
            setIsSubmitting(false);
            setAnsweringState("WAITING_FOR_CANDIDATE");
            // Automatically open microphone for candidate to speak!
            startListening();
          }
        });
      } catch (err: any) {
        console.warn("AI chat error:", err);
        setSubmitError("Failed to submit answer to AI agent. Please click Submit Answer to retry.");
        setIsSubmitting(false);
        setAnsweringState("ANSWER_READY");
      }
    },
    [
      answerText,
      isSubmitting,
      messages,
      questions,
      currentQIdx,
      candidateName,
      selectedRole,
      resumeContext,
      stopListening,
      stopSpeech,
      speakAloud,
      startListening,
    ]
  );

  // ── START INTERVIEW CLICK ────────────────────────────────────────────────
  const startInterview = useCallback(async () => {
    // 1. Synchronously unlock HTML5 audio element within direct user click
    if (audioPlayerRef.current) {
      audioPlayerRef.current.play().catch(() => {});
    }

    // Shuffle questions for this specific session
    const sessionQuestions = shuffleQuestionList(questions);
    setQuestions(sessionQuestions);

    // 2. Set phase & initial state
    setPhase("interview");
    setCurrentQIdx(0);
    setMessages([]);
    setElapsedSeconds(0);
    setAnswerText("");
    setLiveTranscript("");
    setIsSubmitting(false);
    setSubmitError(null);
    setAnsweringState("AI_SPEAKING");

    // 3. Initialize webcam safely in background
    initWebcam();

    // 4. Greeting with sessionQuestions[0]
    const firstQ = sessionQuestions[0];
    if (!firstQ) return;

    const totalCount = sessionQuestions.length;
    const greeting = `Hello ${candidateName}! I'm Sarah Jenkins, your Technical HR interviewer for today's placement practice for the ${selectedRole} position. We will walk through ${totalCount} tailored questions. Speak naturally, take your time, and enjoy the conversation. Let's begin with Question 1:\n\n${firstQ.question}`;

    const msg: Message = {
      role: "assistant",
      content: greeting,
      timestamp: Date.now(),
    };
    setMessages([msg]);

    // 5. Genuinely speak aloud, and when Sarah finishes, AUTOMATICALLY open the mic in WAITING_FOR_CANDIDATE!
    speakAloud(greeting, () => {
      setAnsweringState("WAITING_FOR_CANDIDATE");
      startListening();
    });
  }, [questions, candidateName, selectedRole, initWebcam, speakAloud, startListening, shuffleQuestionList]);

  // ── REPEAT & SKIP CONTROLS ────────────────────────────────────────────────
  const repeatCurrentQuestion = useCallback(() => {
    const curr = questions[currentQIdx];
    if (!curr) return;
    stopListening();
    setAnsweringState("AI_SPEAKING");
    const repeatMsg = `Certainly! Here is Question ${currentQIdx + 1} again: ${curr.question}`;
    speakAloud(repeatMsg, () => {
      setAnsweringState("WAITING_FOR_CANDIDATE");
      startListening();
    });
  }, [questions, currentQIdx, stopListening, speakAloud, startListening]);

  const skipQuestion = useCallback(() => {
    submitAnswer("[Skipped]");
  }, [submitAnswer]);

  // ── GENERATE FINAL FEEDBACK REPORT ────────────────────────────────────────
  const generateFeedback = useCallback(async () => {
    stopSpeech();
    stopListening();
    stopWebcam();
    setPhase("generating");

    try {
      const res = await fetch("/api/interview/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transcript: messages,
          questions,
          candidateName,
          jobRole: selectedRole,
        }),
      });

      const data = await res.json();
      setFeedback(data);
      setPhase("feedback");
    } catch (err) {
      console.error("Feedback generation error:", err);
      setPhase("feedback");
      setFeedback(null);
    }
  }, [messages, questions, candidateName, selectedRole, stopSpeech, stopListening, stopWebcam]);

  // ── RESTART APP ──────────────────────────────────────────────────────────
  const restart = useCallback(() => {
    stopSpeech();
    stopListening();
    stopWebcam();
    setPhase("upload");
    setAnsweringState("WAITING_FOR_CANDIDATE");
    setResumeFile(null);
    setMessages([]);
    setQuestions([]);
    setSkills([]);
    setProjects([]);
    setRecommendedRoles([]);
    setFeedback(null);
    setCurrentQIdx(0);
    setUploadProgress(0);
    setParseError(null);
    setAnswerText("");
    setLiveTranscript("");
    setIsSubmitting(false);
    setSubmitError(null);
    setElapsedSeconds(0);
    setCustomRoleInput("");
    setFocusViolations(0);
    setShowFocusAlert(false);
    setFocusAlertMsg("");
  }, [stopSpeech, stopListening, stopWebcam]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div
      className={`${
        phase === "interview"
          ? "h-[100dvh] max-h-[100dvh] overflow-hidden"
          : "min-h-screen"
      } bg-[#f8faf9] text-slate-800 flex flex-col font-sans selection:bg-teal-100 selection:text-teal-900 transition-colors`}
    >
      {/* Hidden Persistent Audio Player (Always unlocked in user gesture) */}
      <audio ref={audioPlayerRef} playsInline preload="auto" className="hidden" />

      {/* Dynamic Keyframes */}
      <style>{`
        @keyframes waveAnim {
          from { transform: scaleY(0.25); }
          to { transform: scaleY(1); }
        }
        @keyframes pulseGlowTeal {
          0%, 100% { box-shadow: 0 0 0 0 rgba(15, 118, 110, 0.4); }
          50% { box-shadow: 0 0 0 10px rgba(15, 118, 110, 0); }
        }
        @keyframes pulseGlowMint {
          0%, 100% { box-shadow: 0 0 0 0 rgba(13, 148, 136, 0.35); }
          50% { box-shadow: 0 0 0 10px rgba(13, 148, 136, 0); }
        }
        @keyframes avatarBreathe {
          0%, 100% { transform: scale(1) translateY(0); }
          50% { transform: scale(1.008) translateY(-1px); }
        }
        @keyframes avatarSpeaking {
          0%, 100% { transform: scale(1.02) translateY(0); }
          25% { transform: scale(1.028) translateY(-1.5px); }
          75% { transform: scale(1.018) translateY(1px); }
        }
        @keyframes lipSync {
          0%, 100% { transform: scaleY(0.4) scaleX(0.85); opacity: 0.3; }
          25% { transform: scaleY(1.4) scaleX(1.15); opacity: 0.85; }
          50% { transform: scaleY(0.6) scaleX(0.9); opacity: 0.45; }
          75% { transform: scaleY(1.25) scaleX(1.08); opacity: 0.8; }
        }
        .speaking-glow {
          animation: pulseGlowTeal 2.2s infinite;
        }
        .listening-glow {
          animation: pulseGlowMint 2s infinite;
        }
        .animate-avatar-breathe {
          animation: avatarBreathe 4s ease-in-out infinite;
        }
        .animate-avatar-speaking {
          animation: avatarSpeaking 1.8s ease-in-out infinite;
        }
        .animate-lip-sync {
          animation: lipSync 0.26s ease-in-out infinite alternate;
        }
      `}</style>

      {/* ── Top Navigation Bar ── */}
      <header className="border-b border-stone-200/90 bg-white/95 backdrop-blur sticky top-0 z-50 shrink-0 shadow-2xs">
        <div className="w-full px-4 md:px-8 h-14 md:h-15 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-teal-700 flex items-center justify-center text-white shadow-xs">
              <Zap size={17} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold tracking-tight text-slate-900 text-sm md:text-base">
                  SkillMatch AI
                </span>
                <span className="bg-teal-50 text-teal-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-teal-200/80">
                  REAL-TIME VOICE AGENT
                </span>
              </div>
              <p className="text-[11px] text-slate-500">Campus Placement Interview Practice</p>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            {phase === "interview" && (
              <>
                <div className="hidden sm:flex items-center gap-1.5 bg-stone-100/90 border border-stone-200 text-slate-700 px-2.5 py-1 rounded-lg text-xs font-medium">
                  <Briefcase size={12} className="text-teal-700" />
                  <span className="max-w-[140px] truncate">{selectedRole}</span>
                </div>

                <div className="flex items-center gap-1.5 bg-stone-100/90 border border-stone-200 px-2.5 py-1 rounded-lg text-xs font-mono text-slate-700">
                  <Clock size={12} className="text-teal-700" />
                  <span>{formatTime(elapsedSeconds)}</span>
                </div>

                <button
                  onClick={toggleFullscreen}
                  className="flex items-center gap-1 text-xs text-slate-700 hover:text-slate-900 bg-white hover:bg-stone-100 border border-stone-200 px-2.5 py-1 rounded-lg transition-all shadow-2xs"
                  title={isFullscreen ? "Exit Fullscreen" : "Toggle Fullscreen"}
                >
                  {isFullscreen ? <Minimize size={13} /> : <Maximize size={13} />}
                  <span className="hidden md:inline">{isFullscreen ? "Exit Fullscreen" : "Fullscreen"}</span>
                </button>
              </>
            )}

            {phase !== "upload" && (
              <button
                onClick={restart}
                className="flex items-center gap-1 text-xs text-slate-600 hover:text-slate-900 bg-white hover:bg-stone-100 border border-stone-200 px-2.5 py-1 rounded-lg transition-all shadow-2xs"
              >
                <RotateCcw size={13} />
                <span>Restart</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ════════════════════════════════════════════════════════════════════
          PHASE 1: UPLOAD RESUME
         ════════════════════════════════════════════════════════════════════ */}
      {phase === "upload" && (
        <main className="flex-1 w-full max-w-[1350px] mx-auto px-4 md:px-8 py-8 md:py-12 flex flex-col justify-center">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-teal-50 border border-teal-200/80 rounded-full px-4 py-1.5 text-teal-800 text-xs font-semibold mb-4">
              <Sparkles size={13} className="text-teal-600" />
              AI HR Recruiter for College Placement Practice
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight mb-3">
              Ace Your Campus{" "}
              <span className="text-teal-700">
                Placement Interview
              </span>
            </h1>
            <p className="text-slate-600 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
              Upload your resume. Our AI agent extracts your projects, skills, and coursework, recommends suitable placement job roles, conducts a genuine live voice interview, and gives you actionable recruiter feedback.
            </p>
          </div>

          {/* Upload Dropzone */}
          <div
            className={`border-2 border-dashed rounded-3xl p-8 md:p-12 text-center transition-all cursor-pointer relative overflow-hidden bg-white shadow-xs ${
              isDragging
                ? "border-teal-600 bg-teal-50/40 scale-[1.01]"
                : "border-stone-300 hover:border-teal-600 hover:bg-teal-50/20"
            }`}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              const file = e.dataTransfer.files[0];
              if (file) processFile(file);
            }}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,.doc,.txt"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) processFile(f);
              }}
            />

            {uploadProgress > 0 && uploadProgress < 100 ? (
              <div className="flex flex-col items-center gap-4 py-6">
                <div className="w-16 h-16 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center">
                  <Brain size={32} className="text-teal-700 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-slate-900 font-bold text-lg mb-1">Analyzing Your Resume</h3>
                  <p className="text-slate-600 text-sm">{uploadStageText}</p>
                </div>
                <div className="w-64 bg-stone-100 rounded-full h-2.5 overflow-hidden border border-stone-200">
                  <div
                    className="bg-teal-700 h-full rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-2xl bg-teal-50 border border-teal-200/80 flex items-center justify-center mb-4 text-teal-700">
                  <Upload size={28} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Drop your resume here to begin</h3>
                <p className="text-slate-500 text-sm mb-6 max-w-sm">
                  Supported formats: PDF, DOCX, or TXT (Max 10MB). Text is parsed securely on the server.
                </p>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    className="bg-teal-700 hover:bg-teal-800 text-white font-semibold text-sm px-6 py-3 rounded-xl transition-all shadow-xs flex items-center gap-2 cursor-pointer"
                  >
                    <FileText size={16} />
                    Browse Files
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      loadSampleResume();
                    }}
                    className="bg-stone-100 hover:bg-stone-200 text-slate-700 font-medium text-sm px-4 py-3 rounded-xl transition-all border border-stone-200 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Sparkles size={14} className="text-amber-600" />
                    Load Sample Resume
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Error Message */}
          {parseError && (
            <div className="mt-5 p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-800 text-sm">
              <AlertCircle size={18} className="shrink-0 mt-0.5 text-rose-600" />
              <div className="flex-1">
                <p className="font-semibold text-rose-900">Unable to analyze resume</p>
                <p className="text-xs text-rose-700 mt-0.5">{parseError}</p>
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs bg-white hover:bg-rose-100 text-rose-900 font-semibold px-3 py-1.5 rounded-lg border border-rose-300"
                  >
                    Select Another File
                  </button>
                  <button
                    onClick={loadSampleResume}
                    className="text-xs bg-white hover:bg-stone-100 text-slate-800 font-semibold px-3 py-1.5 rounded-lg border border-stone-300"
                  >
                    Try Sample Resume
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Feature Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            <div className="bg-white border border-stone-200/90 rounded-2xl p-5 flex items-start gap-3 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200/80 flex items-center justify-center shrink-0 text-teal-700">
                <Brain size={18} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 mb-1">Resume-Driven Questions</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Questions focus on your actual projects, claimed frameworks, and individual contributions.
                </p>
              </div>
            </div>

            <div className="bg-white border border-stone-200/90 rounded-2xl p-5 flex items-start gap-3 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200/80 flex items-center justify-center shrink-0 text-teal-700">
                <Volume2 size={18} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 mb-1">Real Spoken Audio</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Sarah speaks aloud using authentic generated speech audio and listens to your spoken voice.
                </p>
              </div>
            </div>

            <div className="bg-white border border-stone-200/90 rounded-2xl p-5 flex items-start gap-3 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200/80 flex items-center justify-center shrink-0 text-teal-700">
                <Award size={18} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 mb-1">Placement Report Card</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Detailed evaluation covering 5 placement competencies with question-by-question advice.
                </p>
              </div>
            </div>
          </div>
        </main>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          PHASE 2: RESUME SUMMARY, ROLE RECOMMENDATIONS & READY ROOM
         ════════════════════════════════════════════════════════════════════ */}
      {phase === "ready" && (
        <main className="flex-1 w-full max-w-[1450px] mx-auto px-4 md:px-8 py-4 md:py-6 flex flex-col justify-center">
          <div className="bg-white border border-stone-200/90 rounded-3xl p-6 md:p-8 shadow-xs">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-stone-200/80">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
                  <CheckCircle size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Resume Analyzed Successfully</h2>
                  <p className="text-xs text-slate-500">
                    Candidate: <strong className="text-slate-800">{candidateName}</strong> {education ? `· ${education}` : ""}
                  </p>
                </div>
              </div>

              {/* Speaker Test Button */}
              <button
                onClick={testRecruiterVoice}
                disabled={isTestingVoice || isAudioPlayingRef.current}
                className="flex items-center gap-1.5 text-xs bg-teal-50 hover:bg-teal-100/80 border border-teal-200 text-teal-800 px-3.5 py-2 rounded-xl transition-all cursor-pointer"
                title="Test recruiter voice audio playback"
              >
                {isTestingVoice ? (
                  <>
                    <Loader2 size={13} className="animate-spin text-teal-700" />
                    <span>Speaking...</span>
                  </>
                ) : (
                  <>
                    <Volume2 size={13} className="text-teal-700" />
                    <span>Test Recruiter Voice</span>
                  </>
                )}
              </button>
            </div>

            {/* ── Section: Recommended Job Roles ── */}
            {recommendedRoles.length > 0 && (
              <div className="my-6">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                      <Briefcase size={14} className="text-teal-700" />
                      Recommended Placement Roles Based on Your Resume
                    </h3>
                    <p className="text-xs text-slate-500">
                      Select your target role. The interview plan and questions will adapt specifically to your choice.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {recommendedRoles.map((role, idx) => {
                    const isSelected = selectedRole.toLowerCase() === role.title.toLowerCase();
                    return (
                      <div
                        key={idx}
                        onClick={() => selectRole(role)}
                        className={`rounded-2xl p-4 border transition-all cursor-pointer relative flex flex-col justify-between ${
                          isSelected
                            ? "bg-teal-50/70 border-teal-600 ring-2 ring-teal-600/20 shadow-xs"
                            : "bg-white border-stone-200 hover:border-stone-300 hover:bg-stone-50/60"
                        }`}
                      >
                        <div>
                          <div className="flex items-start justify-between gap-2 mb-1.5">
                            <h4 className="text-sm font-bold text-slate-900 leading-tight">{role.title}</h4>
                            <span className="text-[11px] font-black bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full shrink-0">
                              {role.matchScore}% Match
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 mb-2.5 leading-relaxed">{role.matchReason}</p>

                          {role.matchingSkills && role.matchingSkills.length > 0 && (
                            <div className="mb-2">
                              <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">
                                Matching Skills:
                              </span>
                              <div className="flex flex-wrap gap-1">
                                {role.matchingSkills.map((s, i) => (
                                  <span
                                    key={i}
                                    className="text-[10px] bg-teal-50 text-teal-800 px-1.5 py-0.5 rounded border border-teal-200/70 font-medium"
                                  >
                                    {s}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {role.skillsToImprove && role.skillsToImprove.length > 0 && (
                            <div className="mb-2 text-[11px] text-amber-800">
                              <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                                Suggested Brush-up:
                              </span>
                              <span>{role.skillsToImprove.join(", ")}</span>
                            </div>
                          )}
                        </div>

                        <div className="pt-2 border-t border-stone-200/70 flex items-center justify-between text-xs mt-2">
                          <span className="text-slate-500 text-[11px]">
                            Focus: {role.suggestedInterviewFocus}
                          </span>
                          {isSelected && (
                            <span className="text-teal-700 font-bold flex items-center gap-1 text-[11px]">
                              <Check size={12} /> Active
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── Section: Custom Job Role Practise Input ── */}
            <div className="my-5 p-5 bg-gradient-to-r from-teal-50/70 via-stone-50/60 to-emerald-50/60 border border-teal-200/80 rounded-2xl shadow-2xs">
              <div className="mb-3">
                <label htmlFor="custom-role-input" className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Sparkles size={15} className="text-teal-700" />
                  Which job role do you want to practise for?
                </label>
                <p className="text-xs text-slate-600 mt-0.5">
                  Enter any specific job role you wish to prepare for. Even if not listed in the AI suggestions, we will formulate role-specific and foundational interview questions.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <Briefcase size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    id="custom-role-input"
                    type="text"
                    value={customRoleInput}
                    onChange={(e) => setCustomRoleInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && customRoleInput.trim()) {
                        applyCustomRole(customRoleInput.trim());
                      }
                    }}
                    placeholder="e.g. ServiceNow Developer, Full Stack Developer, Software Engineer, Java Developer, Technical Support Engineer..."
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-stone-300 rounded-xl text-xs md:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-600 shadow-2xs"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => applyCustomRole(customRoleInput)}
                  disabled={!customRoleInput.trim() || isGeneratingRoleQuestions}
                  className="bg-teal-700 hover:bg-teal-800 disabled:opacity-50 text-white font-bold text-xs md:text-sm px-5 py-2.5 rounded-xl transition-all shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                >
                  {isGeneratingRoleQuestions ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Customizing...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={14} />
                      <span>Apply Role</span>
                    </>
                  )}
                </button>
              </div>

              {/* Quick suggestion role chips */}
              <div className="mt-3 flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] text-slate-500 font-semibold mr-1">Popular roles:</span>
                {[
                  "ServiceNow Developer",
                  "Full Stack Developer",
                  "Software Engineer",
                  "Java Developer",
                  "Technical Support Engineer",
                  "QA Automation Engineer",
                  "Data Engineer",
                ].map((roleChip) => {
                  const isCurrent = selectedRole.toLowerCase() === roleChip.toLowerCase();
                  return (
                    <button
                      key={roleChip}
                      type="button"
                      onClick={() => {
                        setCustomRoleInput(roleChip);
                        applyCustomRole(roleChip);
                      }}
                      className={`text-xs px-2.5 py-1 rounded-lg border transition-all cursor-pointer font-medium ${
                        isCurrent
                          ? "bg-teal-700 text-white border-teal-700 shadow-2xs"
                          : "bg-white hover:bg-stone-100 text-slate-700 border-stone-200"
                      }`}
                    >
                      {roleChip}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Detected Skills & Projects */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {skills.length > 0 && (
                <div className="bg-stone-50/80 border border-stone-200/80 rounded-2xl p-4">
                  <p className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Sparkles size={12} className="text-teal-700" />
                    Detected Core Skills ({skills.length})
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {skills.map((s, i) => (
                      <span
                        key={i}
                        className="text-xs font-medium bg-white text-teal-800 border border-stone-200 px-2.5 py-0.5 rounded-lg shadow-2xs"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {projects.length > 0 && (
                <div className="bg-stone-50/80 border border-stone-200/80 rounded-2xl p-4">
                  <p className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <BookOpen size={12} className="text-teal-700" />
                    Targeted Projects ({projects.length})
                  </p>
                  <ul className="space-y-1 text-xs text-slate-600">
                    {projects.map((p, i) => (
                      <li key={i} className="flex items-start gap-1.5 line-clamp-1">
                        <span className="text-teal-700">▪</span> {p}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Questions preview */}
            <div className="mb-6">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Live Placement Interview Plan ({questions.length} Questions for {selectedRole})
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={reshuffleCurrentQuestions}
                    className="text-xs bg-stone-100 hover:bg-stone-200 text-slate-700 px-2.5 py-1 rounded-lg border border-stone-200 flex items-center gap-1 transition-colors cursor-pointer"
                    title="Reshuffle question sequence for fresh practice"
                  >
                    <RefreshCw size={11} />
                    <span>🔀 Reshuffle Questions</span>
                  </button>
                  {isGeneratingRoleQuestions && (
                    <span className="text-xs text-teal-700 flex items-center gap-1 font-medium">
                      <Loader2 size={12} className="animate-spin" /> Customizing...
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                {questions.slice(0, 3).map((q, idx) => (
                  <div key={q.id || idx} className="flex items-start gap-3 bg-stone-50/80 p-3 rounded-xl border border-stone-200/80 text-xs">
                    <span className="w-5 h-5 rounded-md bg-teal-100 text-teal-800 font-bold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <div className="flex-1">
                      <p className="text-slate-800 font-medium line-clamp-1">{q.question}</p>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider mt-0.5 inline-block capitalize font-semibold">
                        Category: {q.category}
                      </span>
                    </div>
                  </div>
                ))}
                {questions.length > 3 && (
                  <p className="text-xs text-slate-400 text-center pt-1">
                    + {questions.length - 3} more tailored questions queued for the live interview
                  </p>
                )}
              </div>
            </div>

            {/* ── Focus Mode Proctoring Consent / Toggle ── */}
            <div className="mb-5 p-3.5 bg-stone-50 border border-stone-200 rounded-2xl flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                  isFocusModeEnabled ? "bg-teal-100 text-teal-800" : "bg-stone-200 text-slate-500"
                }`}>
                  <Target size={16} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">Placement Focus Mode</span>
                    <span className="text-[10px] bg-teal-50 text-teal-800 border border-teal-200 px-1.5 py-0.2 rounded font-semibold">
                      Campus Proctoring Practice
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Monitors tab switches, window blur, and clipboard paste to simulate strict recruitment interview integrity.
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isFocusModeEnabled}
                  onChange={(e) => setIsFocusModeEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-stone-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-700"></div>
              </label>
            </div>

            {/* Start Button */}
            <button
              onClick={startInterview}
              disabled={isGeneratingRoleQuestions}
              className="w-full bg-teal-700 hover:bg-teal-800 text-white font-bold text-base py-4 rounded-2xl flex items-center justify-center gap-2 shadow-xs transition-all hover:scale-[1.005] cursor-pointer"
            >
              <Mic size={18} />
              <span>Start Live Voice Interview ({selectedRole})</span>
              <ChevronRight size={18} />
            </button>
          </div>
        </main>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          PHASE 3: LIVE AI HR INTERVIEW ROOM
         ════════════════════════════════════════════════════════════════════ */}
      {phase === "interview" && (
        <main className="flex-1 min-h-0 w-full h-full px-3 md:px-6 py-2 flex flex-col gap-2 overflow-hidden">
          {/* Top Progress & Controls Bar */}
          <div className="bg-white border border-stone-200/90 rounded-2xl px-3.5 py-2 flex flex-wrap items-center justify-between gap-2 shadow-2xs shrink-0">
            <div className="flex items-center gap-2 md:gap-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Q{currentQIdx + 1} of {questions.length}
              </span>
              <span className="text-xs bg-teal-50 text-teal-800 font-semibold px-2.5 py-0.5 rounded-full border border-teal-200 capitalize">
                {questions[currentQIdx]?.category || "Technical"}
              </span>

              {/* Status Badge */}
              {answeringState === "AI_SPEAKING" && (
                <span className="text-xs bg-teal-50 text-teal-800 border border-teal-200 px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-600 animate-ping" />
                  AI Speaking Question
                </span>
              )}
              {answeringState === "AI_SPEAKING_NEXT_QUESTION" && (
                <span className="text-xs bg-teal-50 text-teal-800 border border-teal-200 px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-600 animate-ping" />
                  Sarah Speaking Next Question
                </span>
              )}
              {answeringState === "WAITING_FOR_CANDIDATE" && (
                <span className="text-xs bg-stone-100 text-slate-700 border border-stone-200 px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1.5">
                  <Mic size={11} className="text-teal-700 animate-pulse" />
                  Microphone Ready
                </span>
              )}
              {answeringState === "CANDIDATE_SPEAKING" && (
                <span className="text-xs bg-emerald-50 text-emerald-800 border border-emerald-300 px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                  Candidate Speaking
                </span>
              )}
              {answeringState === "ANSWER_READY" && (
                <span className="text-xs bg-teal-50 text-teal-800 border border-teal-200 px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1.5">
                  <CheckCircle size={11} className="text-teal-700" />
                  Answer Ready to Submit
                </span>
              )}
              {(answeringState === "SUBMITTING_ANSWER" || answeringState === "AI_PROCESSING") && (
                <span className="text-xs bg-stone-100 text-slate-700 border border-stone-200 px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1.5">
                  <Loader2 size={11} className="animate-spin text-teal-700" />
                  Processing Answer
                </span>
              )}

              {/* Proctoring Focus Mode Badge */}
              {isFocusModeEnabled && (
                <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1 border ${
                  focusViolations === 0
                    ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                    : "bg-amber-50 text-amber-800 border-amber-300 animate-pulse"
                }`}>
                  <Target size={11} />
                  Focus: {focusViolations === 0 ? "Strict" : `${focusViolations} switch(es)`}
                </span>
              )}
            </div>

            {/* Progress Bar */}
            <div className="flex-1 max-w-[120px] bg-stone-100 border border-stone-200 h-2 rounded-full overflow-hidden hidden lg:block">
              <div
                className="bg-teal-700 h-full rounded-full transition-all duration-500"
                style={{ width: `${((currentQIdx + 1) / questions.length) * 100}%` }}
              />
            </div>

            <div className="flex items-center gap-1.5 md:gap-2">
              <button
                onClick={repeatCurrentQuestion}
                className="text-xs bg-stone-50 hover:bg-stone-100 text-slate-700 px-2.5 py-1 rounded-lg border border-stone-200 flex items-center gap-1 transition-colors cursor-pointer"
                title="Repeat current question aloud"
              >
                <RefreshCw size={11} />
                <span className="hidden sm:inline">Repeat</span>
              </button>

              <button
                onClick={skipQuestion}
                className="text-xs bg-stone-50 hover:bg-stone-100 text-slate-600 px-2.5 py-1 rounded-lg border border-stone-200 flex items-center gap-1 transition-colors cursor-pointer"
                title="Skip this question"
              >
                <SkipForward size={11} />
                <span className="hidden sm:inline">Skip</span>
              </button>

              <button
                onClick={generateFeedback}
                className="text-xs bg-amber-50 hover:bg-amber-100 text-amber-900 px-3 py-1 rounded-lg border border-amber-200 font-semibold transition-colors cursor-pointer"
              >
                Finish & Evaluate
              </button>
            </div>
          </div>

          {/* Focus Mode Proctoring Alert Banner */}
          {showFocusAlert && (
            <div className="bg-amber-500 text-white text-xs px-3.5 py-1.5 rounded-xl flex items-center justify-between shadow-xs shrink-0 animate-pulse">
              <div className="flex items-center gap-2">
                <AlertCircle size={14} className="shrink-0" />
                <span><strong>Placement Focus Alert:</strong> {focusAlertMsg} (Violation #{focusViolations})</span>
              </div>
              <button
                onClick={() => setShowFocusAlert(false)}
                className="text-white hover:text-white/80 font-bold ml-2 cursor-pointer text-sm"
              >
                ×
              </button>
            </div>
          )}

          {/* Video Grid (AI Recruiter Avatar + Candidate Webcam) - Side-by-Side Viewport Fitted */}
          <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-2 gap-2.5 md:gap-3">
            {/* Left: Professional AI HR Recruiter Avatar with Synchronized Speaking Motion */}
            <AIAvatarInterviewer
              isSpeaking={isAISpeaking}
              liveState={liveState}
              muteAI={muteAI}
              onToggleMute={() => {
                if (liveState === "ai_speaking") stopSpeech();
                setMuteAI((m) => !m);
              }}
            />

            {/* Right: Candidate Live Webcam Stream */}
            <div className="bg-slate-900 border border-stone-200/90 rounded-2xl overflow-hidden relative flex flex-col justify-end p-3 shadow-2xs">
              {isCameraActive && isCameraVideoEnabled ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="absolute inset-0 w-full h-full object-cover -scale-x-100"
                />
              ) : (
                <div className="absolute inset-0 bg-slate-950 flex flex-col items-center justify-center text-white/50">
                  <VideoOff size={36} className="mb-2 text-slate-400" />
                  <p className="text-xs md:text-sm font-semibold">
                    {isCameraActive ? "Camera Muted" : "Webcam Disabled"}
                  </p>
                  <p className="text-[11px] text-slate-400">Click camera toggle below to switch on</p>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none" />

              {/* Listening State Overlay */}
              {liveState === "listening" && (
                <div className="absolute top-3 right-3 bg-emerald-700/95 text-white text-[11px] font-bold px-3 py-1 rounded-full flex items-center gap-2 shadow-xs backdrop-blur listening-glow">
                  <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  <span>Listening...</span>
                  <VoiceWave active={true} color="#ffffff" />
                </div>
              )}

              {/* Candidate Info & Camera Toggle */}
              <div className="relative z-10 flex items-center justify-between">
                <div>
                  <h3 className="text-white font-extrabold text-sm md:text-base tracking-tight drop-shadow">
                    {candidateName}
                  </h3>
                  <p className="text-[11px] text-white/80 drop-shadow">Candidate · {selectedRole}</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={toggleCamera}
                    className={`p-2 rounded-xl backdrop-blur transition-all ${
                      isCameraVideoEnabled ? "bg-black/40 hover:bg-black/60 text-white/90" : "bg-rose-600 text-white"
                    }`}
                    title={isCameraVideoEnabled ? "Mute camera" : "Enable camera"}
                  >
                    {isCameraVideoEnabled ? <Video size={15} /> : <VideoOff size={15} />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Current Question Card - Compact & Clear */}
          {liveState !== "completed" && questions[currentQIdx] && (
            <div className="bg-teal-50/90 border border-teal-200/80 rounded-xl px-3.5 py-2 shadow-2xs shrink-0 select-none">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-bold text-teal-900 uppercase tracking-wider flex items-center gap-1.5">
                  <MessageSquare size={13} className="text-teal-700" />
                  Current Spoken Question
                </span>
                <span className="text-[11px] text-teal-800/70 font-mono font-semibold">
                  Question {currentQIdx + 1}
                </span>
              </div>
              <p className="text-slate-900 text-xs md:text-sm font-semibold leading-relaxed">
                {questions[currentQIdx].question}
              </p>
            </div>
          )}

          {/* Conversation Transcript Log - Smooth Compact Scrollable */}
          <div className="bg-white border border-stone-200/90 rounded-xl p-2.5 h-20 md:h-24 shrink-0 overflow-y-auto space-y-2 shadow-2xs">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
              >
                <div
                  className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold shrink-0 ${
                    msg.role === "assistant" ? "bg-teal-700 text-white" : "bg-stone-700 text-white"
                  }`}
                >
                  {msg.role === "assistant" ? "AI" : "You"}
                </div>
                <div
                  className={`max-w-[85%] rounded-xl px-3 py-1.5 text-xs leading-relaxed ${
                    msg.role === "assistant"
                      ? "bg-stone-50 border border-stone-200 text-slate-800 rounded-tl-none"
                      : "bg-teal-50 border border-teal-200 text-teal-950 rounded-tr-none"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {/* AI Processing Animation */}
            {liveState === "processing" && (
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-teal-700 flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                  AI
                </div>
                <div className="bg-stone-50 border border-stone-200 rounded-xl rounded-tl-none px-3 py-1.5 flex items-center gap-1.5 text-xs text-slate-600">
                  <span>Sarah is analyzing your answer...</span>
                  <div className="w-1.5 h-1.5 rounded-full bg-teal-600 animate-bounce" />
                  <div className="w-1.5 h-1.5 rounded-full bg-teal-600 animate-bounce [animation-delay:0.2s]" />
                  <div className="w-1.5 h-1.5 rounded-full bg-teal-600 animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            )}

            {/* Live Microphone Transcript Preview */}
            {liveState === "listening" && liveTranscript && (
              <div className="flex gap-2 flex-row-reverse">
                <div className="w-6 h-6 rounded-md bg-teal-700 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                  You
                </div>
                <div className="max-w-[85%] rounded-xl rounded-tr-none px-3 py-1.5 bg-teal-50/70 border border-teal-200/60 text-xs text-teal-800 italic">
                  &ldquo;{liveTranscript}&rdquo;
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Interactive Response Bar - Clean Compact White Card */}
          <div className="bg-white border border-stone-200/90 rounded-2xl p-2.5 md:p-3 shadow-xs shrink-0">
            {answeringState === "COMPLETED" ? (
              <div className="text-center py-2">
                <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 border border-teal-200 flex items-center justify-center mx-auto mb-2">
                  <Award size={22} />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-0.5">Interview Completed!</h3>
                <p className="text-slate-500 text-xs mb-3">
                  Sarah has recorded all your responses for {selectedRole}. Ready to inspect your placement feedback report?
                </p>
                <button
                  onClick={generateFeedback}
                  className="bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs md:text-sm px-6 py-2.5 rounded-xl shadow-xs transition-all cursor-pointer"
                >
                  View Performance Feedback Report
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {/* State Pill & Mic Control Bar */}
                <div className="flex flex-wrap items-center justify-between gap-2 px-0.5">
                  <div className="flex items-center gap-2">
                    {answeringState === "AI_SPEAKING" && (
                      <span className="text-[11px] bg-teal-50 text-teal-800 border border-teal-200 px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1.5">
                        <Volume2 size={12} className="animate-pulse text-teal-700" />
                        AI Interviewer Speaking Question
                      </span>
                    )}
                    {answeringState === "AI_SPEAKING_NEXT_QUESTION" && (
                      <span className="text-[11px] bg-teal-50 text-teal-800 border border-teal-200 px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1.5">
                        <Volume2 size={12} className="animate-pulse text-teal-700" />
                        Sarah Speaking Next Question
                      </span>
                    )}
                    {answeringState === "WAITING_FOR_CANDIDATE" && (
                      <span className="text-[11px] bg-stone-100 text-slate-700 border border-stone-200 px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1.5">
                        <Mic size={12} className="animate-pulse text-teal-700" />
                        Microphone Active — Speak your answer now
                      </span>
                    )}
                    {answeringState === "CANDIDATE_SPEAKING" && (
                      <span className="text-[11px] bg-emerald-50 text-emerald-800 border border-emerald-300 px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-ping" />
                        Recording Your Voice...
                      </span>
                    )}
                    {answeringState === "ANSWER_READY" && (
                      <span className="text-[11px] bg-teal-50 text-teal-800 border border-teal-200 px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1.5">
                        <CheckCircle size={12} className="text-teal-700" />
                        Answer Captured — Ready to Submit
                      </span>
                    )}
                    {answeringState === "SUBMITTING_ANSWER" && (
                      <span className="text-[11px] bg-stone-100 text-slate-700 border border-stone-200 px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1.5">
                        <Loader2 size={12} className="animate-spin text-teal-700" />
                        Submitting Answer...
                      </span>
                    )}
                    {answeringState === "AI_PROCESSING" && (
                      <span className="text-[11px] bg-stone-100 text-slate-700 border border-stone-200 px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1.5">
                        <Loader2 size={12} className="animate-spin text-teal-700" />
                        Sarah is analyzing your answer...
                      </span>
                    )}
                  </div>

                  {/* Mic toggle and clear button for candidate */}
                  {!isAISpeaking &&
                    answeringState !== "SUBMITTING_ANSWER" &&
                    answeringState !== "AI_PROCESSING" && (
                      <div className="flex items-center gap-2 text-xs">
                        <button
                          type="button"
                          onClick={toggleMic}
                          className={`px-2.5 py-0.5 rounded-lg border flex items-center gap-1.5 transition-colors font-medium text-xs ${
                            isMicListening
                              ? "bg-emerald-50 border-emerald-300 text-emerald-800 hover:bg-emerald-100"
                              : "bg-stone-100 border-stone-200 text-slate-700 hover:bg-stone-200"
                          }`}
                          title={isMicListening ? "Pause microphone" : "Start microphone"}
                        >
                          {isMicListening ? (
                            <>
                              <Mic size={12} className="text-emerald-700" />
                              <span>Mic Active</span>
                            </>
                          ) : (
                            <>
                              <MicOff size={12} className="text-slate-500" />
                              <span>Mic Paused</span>
                            </>
                          )}
                        </button>

                        {answerText && (
                          <button
                            type="button"
                            onClick={() => {
                              setAnswerText("");
                              setLiveTranscript("");
                              setAnsweringState("WAITING_FOR_CANDIDATE");
                            }}
                            className="text-slate-400 hover:text-slate-700 px-2 py-0.5 rounded-lg hover:bg-stone-100 transition-colors"
                            title="Clear answer text"
                          >
                            Clear
                          </button>
                        )}
                      </div>
                    )}
                </div>

                {/* Microphone notice if permission denied or unsupported */}
                {micError && (
                  <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2">
                    <AlertCircle size={14} className="shrink-0 text-amber-700" />
                    <span>{micError}</span>
                  </div>
                )}

                {/* Candidate Captured Answer Area */}
                <div className="bg-stone-50 border border-stone-200 rounded-xl p-2.5 focus-within:border-teal-600 focus-within:bg-white transition-all">
                  <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1 px-0.5">
                    <span className="flex items-center gap-1.5 font-semibold text-slate-700">
                      <Sparkles size={11} className="text-teal-700" />
                      Candidate Spoken / Typed Response:
                    </span>
                    {answerText.length > 0 && (
                      <span className="text-slate-400 font-mono text-[10px]">
                        {answerText.length} chars
                      </span>
                    )}
                  </div>

                  <textarea
                    rows={2}
                    value={answerText}
                    onPaste={(e) => {
                      if (isFocusModeEnabled) {
                        setFocusViolations((v) => v + 1);
                        setFocusAlertMsg("Clipboard paste detected. In Placement Focus Mode, speaking or typing your own thoughts is monitored.");
                        setShowFocusAlert(true);
                      }
                    }}
                    onChange={(e) => {
                      const val = e.target.value;
                      setAnswerText(val);
                      if (val.trim().length >= 3) {
                        if (
                          answeringState !== "SUBMITTING_ANSWER" &&
                          answeringState !== "AI_PROCESSING"
                        ) {
                          setAnsweringState("ANSWER_READY");
                        }
                      } else if (answeringState === "ANSWER_READY") {
                        setAnsweringState(
                          isMicListening ? "CANDIDATE_SPEAKING" : "WAITING_FOR_CANDIDATE"
                        );
                      }
                    }}
                    onKeyDown={(e) => {
                      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
                        e.preventDefault();
                        if (answerText.trim() && !isAISpeaking && !isSubmitting) {
                          submitAnswer();
                        }
                      }
                    }}
                    disabled={
                      isAISpeaking ||
                      answeringState === "SUBMITTING_ANSWER" ||
                      answeringState === "AI_PROCESSING"
                    }
                    placeholder={
                      isAISpeaking
                        ? "Sarah is speaking... The microphone will automatically listen when she finishes."
                        : "Speak your response into the microphone... Recognized speech appears here in real time. You may also edit or type directly."
                    }
                    className="w-full bg-transparent text-xs md:text-sm text-slate-900 placeholder-slate-400 resize-none focus:outline-none leading-relaxed disabled:opacity-50"
                  />

                  {/* Submission and Action Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-stone-200/70 mt-1">
                    <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                      {isAISpeaking ? (
                        <span>Please listen until Sarah finishes speaking</span>
                      ) : answeringState === "ANSWER_READY" ? (
                        <span className="text-teal-800 font-medium flex items-center gap-1">
                          <Check size={12} className="text-teal-700" />
                          Answer ready. Click Submit Answer (or press Ctrl+Enter)
                        </span>
                      ) : (
                        <span>Speak naturally into your microphone or type above</span>
                      )}
                    </div>

                    {/* Submit Answer Button */}
                    <button
                      type="button"
                      onClick={() => submitAnswer()}
                      disabled={
                        isAISpeaking ||
                        answeringState === "SUBMITTING_ANSWER" ||
                        answeringState === "AI_PROCESSING" ||
                        !answerText.trim()
                      }
                      className={`px-5 py-2 rounded-xl font-bold text-xs md:text-sm flex items-center gap-2 transition-all shadow-xs ${
                        answeringState === "ANSWER_READY"
                          ? "bg-teal-700 hover:bg-teal-800 text-white shadow-xs cursor-pointer ring-2 ring-teal-600/20"
                          : answeringState === "SUBMITTING_ANSWER" || answeringState === "AI_PROCESSING"
                          ? "bg-stone-200 text-slate-400 cursor-wait border border-stone-200"
                          : "bg-stone-100 text-slate-400 cursor-not-allowed border border-stone-200"
                      }`}
                    >
                      {answeringState === "SUBMITTING_ANSWER" || answeringState === "AI_PROCESSING" ? (
                        <>
                          <Loader2 size={14} className="animate-spin text-teal-700" />
                          <span>Submitting...</span>
                        </>
                      ) : (
                        <>
                          <Send size={14} />
                          <span>Submit Answer</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Submit Error message */}
                {submitError && (
                  <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between">
                    <span>{submitError}</span>
                    <button
                      type="button"
                      onClick={() => submitAnswer()}
                      className="bg-rose-100 hover:bg-rose-200 text-rose-900 px-2.5 py-1 rounded-lg text-xs font-semibold"
                    >
                      Retry
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          PHASE 4: EVALUATING / GENERATING REPORT
         ════════════════════════════════════════════════════════════════════ */}
      {phase === "generating" && (
        <main className="flex-1 max-w-md mx-auto px-4 py-24 text-center flex flex-col justify-center">
          <div className="w-18 h-18 rounded-3xl bg-teal-50 border border-teal-200 flex items-center justify-center mx-auto mb-5">
            <Brain size={36} className="text-teal-700 animate-pulse" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-2">Evaluating Placement Performance</h2>
          <p className="text-slate-600 text-sm mb-6 leading-relaxed">
            Analyzing your answers against competencies for {selectedRole}... Evaluating technical depth, problem solving, and communication clarity.
          </p>
          <div className="flex justify-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-teal-700 animate-bounce" />
            <div className="w-2.5 h-2.5 rounded-full bg-teal-600 animate-bounce [animation-delay:0.2s]" />
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.4s]" />
          </div>
        </main>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          PHASE 5: PLACEMENT FEEDBACK REPORT
         ════════════════════════════════════════════════════════════════════ */}
      {phase === "feedback" && (
        <main className="flex-1 w-full max-w-[1450px] mx-auto px-4 md:px-8 py-6 md:py-10">
          {!feedback ? (
            <div className="text-center py-16 bg-white border border-stone-200/90 rounded-3xl p-8 shadow-xs">
              <AlertCircle size={44} className="text-rose-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-900 mb-2">Could Not Generate Complete Report</h3>
              <p className="text-slate-600 text-sm mb-6 max-w-md mx-auto">
                We ran into a connection issue while compiling the feedback. You can retry generating it or restart.
              </p>
              <div className="flex justify-center gap-3">
                <button
                  onClick={generateFeedback}
                  className="bg-teal-700 hover:bg-teal-800 text-white font-semibold text-sm px-6 py-2.5 rounded-xl cursor-pointer"
                >
                  Retry Evaluation
                </button>
                <button
                  onClick={restart}
                  className="bg-stone-100 hover:bg-stone-200 text-slate-700 font-semibold text-sm px-6 py-2.5 rounded-xl border border-stone-200 cursor-pointer"
                >
                  Start Over
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Header Card */}
              <div className="bg-white border border-stone-200/90 rounded-3xl p-6 md:p-8 shadow-xs flex flex-col md:flex-row items-center gap-8">
                <ScoreRing score={feedback.overallScore} size={130} label="Readiness Score" />

                <div className="flex-1 text-center md:text-left">
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-2">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Target Role: {selectedRole}
                    </span>
                    <span
                      className={`text-xs font-bold px-3 py-0.5 rounded-full border ${
                        feedback.overallScore >= 80
                          ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                          : feedback.overallScore >= 65
                          ? "bg-teal-50 text-teal-800 border-teal-200"
                          : "bg-amber-50 text-amber-800 border-amber-200"
                      }`}
                    >
                      {feedback.overallScore >= 80
                        ? "Placement Ready · Strong Candidate"
                        : feedback.overallScore >= 65
                        ? "Good Foundation · Minor Polish Needed"
                        : "Needs More Practice Before Placement"}
                    </span>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-2">
                    {candidateName}
                  </h2>
                  <p className="text-sm text-slate-600 leading-relaxed">{feedback.summary}</p>
                </div>
              </div>

              {/* Placement Focus Mode & Proctoring Integrity Summary */}
              {isFocusModeEnabled && (
                <div className="bg-white border border-stone-200/90 rounded-3xl p-6 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                      focusViolations === 0
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-amber-50 text-amber-700 border border-amber-200"
                    }`}>
                      <Target size={24} />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm font-bold text-slate-900">Placement Focus & Integrity Assessment</h3>
                        <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                          focusViolations === 0
                            ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                            : "bg-amber-50 text-amber-800 border-amber-300"
                        }`}>
                          {focusViolations === 0 ? "100% Focused · Zero Tab Switches" : `${focusViolations} Distraction / Switch Event(s)`}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        {focusViolations === 0
                          ? "Candidate maintained continuous eye contact and application focus without switching tabs, minimizing browser, or pasting external answers."
                          : `Candidate triggered ${focusViolations} window blur, tab switch, or monitored clipboard event(s) during live questioning.`}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[11px] font-mono font-bold text-slate-400 uppercase block">Audit Rating</span>
                    <span className={`text-base font-extrabold ${focusViolations === 0 ? "text-emerald-700" : "text-amber-700"}`}>
                      {focusViolations === 0 ? "Verified Clean" : "Recorded in Report"}
                    </span>
                  </div>
                </div>
              )}

              {/* Sub-Score Competency Pillars */}
              {feedback.scores && (
                <div className="bg-white border border-stone-200/90 rounded-3xl p-6 shadow-xs">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-5 flex items-center gap-2">
                    <Target size={15} className="text-teal-700" />
                    Core Placement Competencies Evaluated
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                    {Object.entries(feedback.scores).map(([metric, val]) => (
                      <div key={metric} className="bg-stone-50/80 border border-stone-200/80 rounded-2xl p-4 text-center">
                        <ScoreRing
                          score={typeof val === "number" ? val : 75}
                          size={70}
                          label={metric
                            .replace(/([A-Z])/g, " $1")
                            .replace(/^./, (str) => str.toUpperCase())}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Strengths & Improvements */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Strengths */}
                <div className="bg-white border border-emerald-200 rounded-3xl p-6 shadow-xs">
                  <h3 className="text-base font-bold text-emerald-800 mb-4 flex items-center gap-2">
                    <TrendingUp size={18} />
                    Key Candidate Strengths
                  </h3>
                  <div className="space-y-3">
                    {feedback.strengths?.map((s, i) => (
                      <div key={i} className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-4">
                        <p className="text-sm font-bold text-emerald-950 mb-1">{s.title}</p>
                        <p className="text-xs text-emerald-800 leading-relaxed">{s.detail}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Improvements */}
                <div className="bg-white border border-amber-200 rounded-3xl p-6 shadow-xs">
                  <h3 className="text-base font-bold text-amber-900 mb-4 flex items-center gap-2">
                    <TrendingDown size={18} />
                    Placement Improvement Areas
                  </h3>
                  <div className="space-y-3">
                    {feedback.improvements?.map((imp, i) => (
                      <div key={i} className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4">
                        <p className="text-sm font-bold text-amber-950 mb-1">{imp.title}</p>
                        <p className="text-xs text-amber-800 leading-relaxed">{imp.detail}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Question-By-Question Detailed Breakdown */}
              {feedback.questionFeedback && feedback.questionFeedback.length > 0 && (
                <div className="bg-white border border-stone-200/90 rounded-3xl p-6 shadow-xs">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <MessageSquare size={16} className="text-teal-700" />
                    Question-by-Question Placement Breakdown
                  </h3>
                  <div className="space-y-4">
                    {feedback.questionFeedback.map((qf, i) => (
                      <div key={i} className="bg-stone-50/80 border border-stone-200/80 rounded-2xl p-4">
                        <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                          <p className="text-sm font-bold text-slate-900 flex-1">
                            Q{i + 1}: {qf.question}
                          </p>
                          <QualityBadge quality={qf.quality} />
                        </div>

                        {qf.candidateAnswerSummary && (
                          <div className="mb-2 text-xs text-slate-600 italic bg-white p-2.5 rounded-xl border border-stone-200">
                            Candidate response recap: &ldquo;{qf.candidateAnswerSummary}&rdquo;
                          </div>
                        )}

                        <p className="text-xs text-slate-700 leading-relaxed mb-2">
                          <strong className="text-teal-800">Recruiter Feedback: </strong>
                          {qf.comment}
                        </p>

                        {qf.idealAnswer && (
                          <p className="text-xs text-emerald-900 leading-relaxed bg-emerald-50/80 border border-emerald-200 p-2.5 rounded-xl">
                            <strong className="text-emerald-800">What Interviewers Expect: </strong>
                            {qf.idealAnswer}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommended Topics for Placement Study */}
              {feedback.recommendedTopics && feedback.recommendedTopics.length > 0 && (
                <div className="bg-white border border-stone-200/90 rounded-3xl p-6 shadow-xs">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <BookOpen size={15} className="text-teal-700" />
                    Recommended Study Topics for {selectedRole} Placements
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {feedback.recommendedTopics.map((topic, i) => (
                      <span
                        key={i}
                        className="text-xs font-semibold bg-teal-50 text-teal-800 border border-teal-200 px-3 py-1.5 rounded-xl"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Disclaimer */}
              <div className="text-center py-3">
                <p className="text-[11px] text-slate-400 max-w-xl mx-auto">
                  {feedback.disclaimer ||
                    "Notice: This score is an AI-generated practice assessment designed for college placement preparation, not an objective guarantee of recruitment or employment."}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={restart}
                  className="flex-1 min-w-[200px] bg-teal-700 hover:bg-teal-800 text-white font-bold py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer"
                >
                  <RotateCcw size={16} />
                  <span>Practice Another Role / Interview</span>
                </button>

                <button
                  onClick={() => window.print()}
                  className="flex-1 min-w-[200px] bg-white hover:bg-stone-50 text-slate-800 font-bold py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2 border border-stone-300 transition-all shadow-2xs cursor-pointer"
                >
                  <FileText size={16} />
                  <span>Print / Save PDF Report</span>
                </button>
              </div>
            </div>
          )}
        </main>
      )}
    </div>
  );
}

export default function InterviewPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#f8faf9] flex items-center justify-center">
          <Loader2 size={36} className="text-teal-700 animate-spin" />
        </div>
      }
    >
      <InterviewApp />
    </Suspense>
  );
}

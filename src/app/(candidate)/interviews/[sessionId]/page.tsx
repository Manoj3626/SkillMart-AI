"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  Clock,
  MessageSquare,
  AlertTriangle,
  Send,
  Volume2,
  RefreshCw,
  Sparkles,
  SkipForward,
  Maximize,
  Minimize,
  X,
  CheckCircle2,
} from "lucide-react";
import { formatDuration } from "@/lib/utils";
import { toast } from "@/components/ui/Toaster";

interface InterviewConfig {
  jobRole: string;
  experienceLevel: string;
  interviewType: string;
  difficulty: string;
  durationMinutes: number;
  jobDescription?: string;
  focusSkills: string[];
  consentTranscript: boolean;
}

interface Message {
  role: "assistant" | "user";
  content: string;
  timestamp: Date;
}

interface InterviewQuestion {
  id: number;
  question: string;
  category: string;
  followUpHints?: string[];
}

type InterviewPhase = "ready" | "speaking" | "listening" | "processing_answer" | "completed";

export default function InterviewStudioPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const router = useRouter();

  const [config, setConfig] = useState<InterviewConfig | null>(null);
  const [phase, setPhase] = useState<InterviewPhase>("ready");
  const [micEnabled, setMicEnabled] = useState(true);
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [elapsed, setElapsed] = useState(0);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [permissionError, setPermissionError] = useState<string | null>(null);

  // Fullscreen & Focus Integrity states
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showEndModal, setShowEndModal] = useState(false);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [showTabWarning, setShowTabWarning] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isSpeakingRef = useRef(false);

  // Load config from sessionStorage or default to Software Engineer
  useEffect(() => {
    const raw = sessionStorage.getItem(`interview-config-${sessionId}`);
    if (raw) {
      try {
        setConfig(JSON.parse(raw));
      } catch {
        setConfig({
          jobRole: "Software Engineer",
          experienceLevel: "junior",
          interviewType: "mixed",
          difficulty: "intermediate",
          durationMinutes: 20,
          focusSkills: [],
          consentTranscript: true,
        });
      }
    } else {
      setConfig({
        jobRole: "Software Engineer",
        experienceLevel: "junior",
        interviewType: "mixed",
        difficulty: "intermediate",
        durationMinutes: 20,
        focusSkills: [],
        consentTranscript: true,
      });
    }
  }, [sessionId]);

  // Request camera + mic with robust error reporting
  useEffect(() => {
    async function initMedia() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
      } catch (err) {
        if (err instanceof DOMException && err.name === "NotAllowedError") {
          setPermissionError("Camera/Microphone permission was denied. Please allow camera and microphone in your browser bar.");
        } else {
          setPermissionError("Could not access camera/microphone device.");
        }
        setMicEnabled(false);
        setCameraEnabled(false);
      }
    }
    initMedia();
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  // Guarantee video stream stays attached whenever camera is enabled
  useEffect(() => {
    if (cameraEnabled && streamRef.current && videoRef.current) {
      if (videoRef.current.srcObject !== streamRef.current) {
        videoRef.current.srcObject = streamRef.current;
      }
      videoRef.current.play().catch(() => {});
    }
  }, [cameraEnabled]);

  // Fullscreen management
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        if (document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        }
      }
    } catch (err) {
      console.warn("Fullscreen toggle restricted:", err);
    }
  };

  // Visibility / Tab switch integrity monitor
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && interviewStarted && phase !== "completed") {
        setTabSwitchCount((prev) => {
          const nextCount = prev + 1;
          setShowTabWarning(true);
          return nextCount;
        });
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [interviewStarted, phase]);

  // ── Speech Synthesis Engine ────────────────────────────────────────────────
  const stopSpeech = useCallback(() => {
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      audioPlayerRef.current.currentTime = 0;
    }
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    isSpeakingRef.current = false;
  }, []);

  const speakAloud = useCallback(
    (text: string, onDone?: () => void) => {
      stopSpeech();
      isSpeakingRef.current = true;
      setPhase("speaking");

      const cleanText = text
        .replace(/[*#_`]/g, "")
        .replace(/\[Skipped\]/g, "Question skipped.")
        .trim();

      const onSpeechFinished = () => {
        isSpeakingRef.current = false;
        onDone?.();
      };

      if (typeof window === "undefined" || !window.speechSynthesis) {
        onSpeechFinished();
        return;
      }

      window.speechSynthesis.cancel();
      window.speechSynthesis.resume();

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 1.02;
      utterance.pitch = 1.04;

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
        isSpeakingRef.current = true;
        setPhase("speaking");
      };

      utterance.onend = () => {
        onSpeechFinished();
      };

      utterance.onerror = (e) => {
        console.warn("SpeechSynthesis error:", e);
        onSpeechFinished();
      };

      window.speechSynthesis.speak(utterance);
    },
    [stopSpeech]
  );

  // ── Speech-to-Text Microphone Engine ──────────────────────────────────────
  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
      recognitionRef.current = null;
    }
  }, []);

  const startListening = useCallback(() => {
    if (typeof window === "undefined" || isSpeakingRef.current) return;

    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) return;

    try {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    } catch {}

    try {
      const recognition = new SpeechRec();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onstart = () => {
        setPhase("listening");
      };

      recognition.onresult = (event: any) => {
        let transcript = "";
        for (let i = 0; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setCurrentAnswer((prev) => (transcript.length > prev.length ? transcript : prev));
      };

      recognition.onerror = (e: any) => {
        if (e.error !== "no-speech") {
          console.warn("[SpeechRecognition error]", e.error);
        }
      };

      recognition.onend = () => {
        if (!isSpeakingRef.current && micEnabled && phase === "listening") {
          try {
            recognition.start();
          } catch {}
        }
      };

      recognition.start();
      recognitionRef.current = recognition;
      setPhase("listening");
    } catch (err) {
      console.warn("Could not start speech recognition:", err);
    }
  }, [micEnabled, phase]);

  // ── Ask Initial Question (Stage 3 Zero-Lag Prompting) ─────────────────────
  const askQuestion = useCallback(
    (index: number, qList: InterviewQuestion[], prefixMsg = "") => {
      const targetQ = qList[index];
      if (!targetQ) return;

      stopListening();
      const spokenText = prefixMsg ? `${prefixMsg} ${targetQ.question}` : targetQ.question;

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: spokenText,
          timestamp: new Date(),
        },
      ]);

      speakAloud(spokenText, () => {
        setPhase("listening");
        startListening();
      });
    },
    [speakAloud, startListening, stopListening]
  );

  // ── Initialize Interview Session With Zero Latency ────────────────────────
  useEffect(() => {
    if (!config || interviewStarted) return;
    setInterviewStarted(true);

    const targetRole = config?.jobRole || "Software Engineer";
    const initialQ: InterviewQuestion = {
      id: 1,
      question: `Welcome to your ${targetRole} placement interview! Could you briefly introduce yourself and share what interests you most about this role?`,
      category: "warmup",
    };

    const initialList: InterviewQuestion[] = [
      initialQ,
      {
        id: 2,
        question: `What core technologies and programming languages do you use most frequently for ${targetRole} projects?`,
        category: "technical",
      },
      {
        id: 3,
        question: "Can you describe a challenging technical problem you solved in one of your recent projects?",
        category: "project",
      },
      {
        id: 4,
        question: "How do you approach debugging when your code encounters unexpected behavior in production?",
        category: "problem-solving",
      },
      {
        id: 5,
        question: "How do you collaborate and handle high-pressure deadlines with your teammates?",
        category: "behavioral",
      },
    ];

    setQuestions(initialList);
    setCurrentQuestionIndex(0);

    // Speak Question 1 promptly (<300ms)
    const greetingPrefix = `Hello! Welcome to your ${targetRole} placement interview.`;
    askQuestion(0, initialList, greetingPrefix);

    // Asynchronously fetch tailored AI questions in background via low-latency Gemini
    async function prefetchAiQuestions() {
      try {
        const res = await fetch("/api/interview/generate-questions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            roleTitle: targetRole,
            candidateName: "Candidate",
            skills: config?.focusSkills || [],
          }),
        });

        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.questions) && data.questions.length > 0) {
            setQuestions((prev) => {
              const q1 = prev[0] || initialQ;
              const remaining = data.questions.filter((q: InterviewQuestion) => q.id !== 1).slice(0, 4);
              return [q1, ...remaining];
            });
          }
        }
      } catch (err) {
        console.warn("Background AI questions prefetch note:", err);
      }
    }

    prefetchAiQuestions();
  }, [config, interviewStarted, askQuestion]);

  // ── End Interview & Route to Feedback ─────────────────────────────────────
  const handleEnd = useCallback(
    async (finalMessages?: Message[]) => {
      if (timerRef.current) clearInterval(timerRef.current);
      stopSpeech();
      stopListening();
      streamRef.current?.getTracks().forEach((t) => t.stop());
      setPhase("completed");

      const transcriptToSave = (finalMessages || messages)
        .map((m) => `${m.role === "assistant" ? "Interviewer" : "Candidate"}: ${m.content}`)
        .join("\n\n");

      sessionStorage.setItem(`interview-transcript-${sessionId}`, transcriptToSave);

      // Trigger feedback generation in background
      try {
        const res = await fetch("/api/analysis/feedback", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId,
            transcript: transcriptToSave,
            jobRole: config?.jobRole ?? "Software Engineer",
            interviewType: config?.interviewType ?? "mixed",
            difficulty: config?.difficulty ?? "intermediate",
            experienceLevel: config?.experienceLevel ?? "junior",
          }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data?.feedback) {
            sessionStorage.setItem(`interview-feedback-${sessionId}`, JSON.stringify(data.feedback));
          }
        }
      } catch (err) {
        console.warn("Feedback caching notice:", err);
      }

      setTimeout(() => {
        router.push(`/interviews/${sessionId}/feedback`);
      }, 1200);
    },
    [messages, sessionId, config, router, stopListening, stopSpeech]
  );

  // ── Submit Candidate Answer & State Machine Progression ───────────────────
  const handleAnswerSubmit = async () => {
    if (!currentAnswer.trim() || phase === "processing_answer") return;

    stopListening();
    setPhase("processing_answer");

    const answeredText = currentAnswer.trim();
    setCurrentAnswer("");

    // Add candidate message to transcript
    const updatedMessages: Message[] = [
      ...messages,
      {
        role: "user",
        content: answeredText,
        timestamp: new Date(),
      },
    ];
    setMessages(updatedMessages);

    const nextIndex = currentQuestionIndex + 1;
    const isFinal = nextIndex >= questions.length;
    const nextQ = questions[nextIndex];

    try {
      const res = await fetch("/api/interview/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages.map((m) => ({ role: m.role, content: m.content })),
          currentQuestion: questions[currentQuestionIndex]?.question || "",
          nextQuestion: nextQ?.question || "",
          isFinalQuestion: isFinal,
          questionIndex: currentQuestionIndex,
          totalQuestions: questions.length,
        }),
      });

      let aiReply = "";
      if (res.ok) {
        const data = await res.json();
        aiReply = data.reply || "";
      }

      if (!aiReply) {
        aiReply = isFinal
          ? "Thank you for answering. That completes all our interview questions today. Let's review your final evaluation report."
          : `Thank you for sharing that. Let's move on to the next question: ${nextQ?.question}`;
      }

      // Update Live Question Card to next question immediately
      if (!isFinal) {
        setCurrentQuestionIndex(nextIndex);
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: aiReply,
          timestamp: new Date(),
        },
      ]);

      speakAloud(aiReply, () => {
        if (isFinal) {
          handleEnd(updatedMessages);
        } else {
          setPhase("listening");
          startListening();
        }
      });
    } catch (err) {
      console.error("Failed to evaluate answer:", err);
      if (isFinal) {
        handleEnd(updatedMessages);
      } else {
        setCurrentQuestionIndex(nextIndex);
        askQuestion(nextIndex, questions);
      }
    }
  };

  const handleSkipQuestion = () => {
    setCurrentAnswer("[Skipped this question]");
    setTimeout(() => {
      handleAnswerSubmit();
    }, 100);
  };

  const handleReplayQuestion = () => {
    const activeQ = questions[currentQuestionIndex];
    if (activeQ) {
      speakAloud(activeQ.question, () => {
        setPhase("listening");
        startListening();
      });
    }
  };

  // Timer
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setElapsed((e) => {
        if (config && e >= config.durationMinutes * 60 - 1) {
          handleEnd();
          return e;
        }
        return e + 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [config, handleEnd]);

  // Auto-scroll transcript
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function toggleMic() {
    if (!streamRef.current) return;
    const audioTrack = streamRef.current.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      setMicEnabled(audioTrack.enabled);
      if (!audioTrack.enabled) {
        stopListening();
      } else if (phase === "listening") {
        startListening();
      }
    }
  }

  function toggleCamera() {
    if (!streamRef.current) return;
    const videoTrack = streamRef.current.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      setCameraEnabled(videoTrack.enabled);
    }
  }

  if (phase === "completed") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[var(--color-surface-900)] text-white p-8 text-center animate-fade-in">
        <div className="w-16 h-16 rounded-full bg-emerald-600/30 border border-emerald-500/50 flex items-center justify-center mb-4 text-3xl shadow-xl">
          <Sparkles className="text-emerald-400" size={32} />
        </div>
        <h2 className="text-2xl font-bold mb-2">Interview Complete!</h2>
        <p className="text-white/60 mb-6 max-w-sm text-sm">
          Generating your comprehensive placement feedback report and scoring analysis...
        </p>
        <div className="w-48 h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div className="h-full bg-emerald-500 rounded-full animate-pulse w-3/4" />
        </div>
      </div>
    );
  }

  const currentQ = questions[currentQuestionIndex];
  const isAISpeaking = phase === "speaking";
  const isListening = phase === "listening";
  const isEvaluating = phase === "processing_answer";

  return (
    <div className="flex flex-col h-screen bg-[var(--color-surface-900)] text-white overflow-hidden relative">
      {/* Hidden audio element */}
      <audio ref={audioPlayerRef} className="hidden" preload="auto" />

      {/* Header bar */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-white/10 shrink-0 bg-[var(--color-surface-950)]">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-1.5">
            <div className="status-dot status-dot-green animate-pulse" />
            <span className="text-xs font-semibold text-white/90 hidden sm:inline">
              Live AI Interview Studio
            </span>
          </div>
          <span className="badge bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] px-2.5 py-0.5 rounded-full font-medium">
            Question {Math.min(currentQuestionIndex + 1, questions.length || 1)} of {questions.length || 5}
          </span>
        </div>

        <div className="text-xs sm:text-sm font-mono text-white/80 flex items-center gap-1.5">
          <Clock size={13} className="text-white/50" />
          {formatDuration(elapsed)}
          {config && <span className="text-white/40">/ {formatDuration(config.durationMinutes * 60)}</span>}
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="text-xs font-semibold text-emerald-400 bg-emerald-950/50 border border-emerald-800/40 px-2.5 py-1 rounded-md hidden md:block">
            {config?.jobRole ?? "Software Engineer"}
          </div>

          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            className="flex items-center gap-1 text-xs bg-white/10 hover:bg-white/20 text-white/80 hover:text-white px-2.5 py-1 rounded-md transition-colors border border-white/10"
            title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen Mode"}
          >
            {isFullscreen ? <Minimize size={13} /> : <Maximize size={13} />}
            <span className="hidden sm:inline">{isFullscreen ? "Exit Fullscreen" : "Fullscreen"}</span>
          </button>
        </div>
      </div>

      {/* Focus & Integrity Tab Switch Warning Banner */}
      {showTabWarning && (
        <div className="flex items-center justify-between px-4 sm:px-6 py-2.5 bg-amber-950/90 border-b border-amber-600/50 text-xs text-amber-200 animate-fade-in shrink-0">
          <div className="flex items-center gap-2">
            <AlertTriangle size={15} className="text-amber-400 shrink-0" />
            <span>
              <strong>Integrity Notice ({tabSwitchCount}):</strong> Window/tab change detected. Please maintain continuous focus on your interview window.
            </span>
          </div>
          <button
            onClick={() => setShowTabWarning(false)}
            className="text-amber-300 hover:text-white underline text-[11px] ml-3 shrink-0"
          >
            Dismiss
          </button>
        </div>
      )}

      {permissionError && (
        <div className="flex items-center gap-3 px-6 py-2.5 bg-red-950/40 border-b border-red-800/30 text-xs text-red-200 shrink-0">
          <AlertTriangle size={14} className="shrink-0 text-red-400" />
          <span>{permissionError}</span>
        </div>
      )}

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Video & Interview Interaction area */}
        <div className="flex-1 flex flex-col p-3 sm:p-4 gap-3 sm:gap-4 overflow-hidden">
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 min-h-0">
            {/* AI interviewer tile */}
            <div className="video-tile flex flex-col items-center justify-center bg-[var(--color-surface-950)] border border-white/10 rounded-2xl relative shadow-lg p-4">
              <div
                className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-3xl sm:text-4xl shadow-xl mb-3 transition-transform duration-300 ${
                  isAISpeaking ? "scale-105 ring-4 ring-emerald-400/40 animate-pulse" : ""
                }`}
              >
                🤖
              </div>
              <span className="text-sm font-semibold text-white/90 mb-0.5">SkillMatch AI Interviewer</span>
              <span className="text-xs text-white/40 mb-2">Sarah Jenkins (Senior Technical Placement Lead)</span>

              {isAISpeaking && (
                <div className="flex items-end gap-1 h-6 mb-2">
                  {[...Array(9)].map((_, i) => (
                    <div
                      key={i}
                      className="w-1 bg-emerald-400 rounded-full animate-pulse"
                      style={{
                        height: `${Math.sin(i * 0.7) * 10 + 14}px`,
                        animationDelay: `${i * 0.1}s`,
                      }}
                    />
                  ))}
                </div>
              )}

              <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-black/50 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10">
                <div className={`status-dot ${isAISpeaking ? "status-dot-green animate-pulse" : isListening ? "status-dot-yellow" : "status-dot-gray"}`} />
                <span className="text-[10px] font-medium text-white/90">
                  {isAISpeaking ? "Speaking aloud" : isListening ? "Listening to your answer" : isEvaluating ? "Processing answer" : "Ready"}
                </span>
              </div>

              {/* Repeat voice button */}
              <button
                onClick={handleReplayQuestion}
                disabled={isAISpeaking || isEvaluating}
                className="absolute top-3 right-3 flex items-center gap-1 text-[11px] bg-white/10 hover:bg-white/20 px-2.5 py-1 rounded-full text-white/80 disabled:opacity-40 transition-colors border border-white/10"
                title="Replay Question Audio"
              >
                <Volume2 size={13} />
                <span>Repeat</span>
              </button>
            </div>

            {/* Candidate camera tile (persistent video stream attaching properly) */}
            <div className="video-tile relative bg-[var(--color-surface-950)] border border-white/10 rounded-2xl overflow-hidden shadow-lg flex items-center justify-center">
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className={`w-full h-full object-cover ${cameraEnabled ? "block" : "hidden"}`}
              />
              {!cameraEnabled && (
                <div className="flex flex-col items-center justify-center h-full gap-3 p-4">
                  <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center">
                    <VideoOff size={22} className="text-white/40" />
                  </div>
                  <span className="text-xs text-white/40 font-medium">Camera is turned off</span>
                </div>
              )}
              <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-black/50 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10 z-10">
                <div className={`status-dot ${micEnabled ? "status-dot-green" : "status-dot-red"}`} />
                <span className="text-[10px] font-medium text-white/90">You (Candidate)</span>
              </div>
            </div>
          </div>

          {/* Dedicated Live Question Card */}
          <div
            className="bg-white/5 border border-white/10 rounded-xl p-3 sm:p-4 select-none flex flex-col gap-1.5 shrink-0 shadow-sm"
            onCopy={(e) => {
              e.preventDefault();
              toast.error("Copying interview questions is disabled for academic integrity.");
            }}
          >
            <div className="flex items-center justify-between text-[11px] text-white/60">
              <span className="font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles size={12} /> Live Question {currentQuestionIndex + 1} of {questions.length} ({currentQ?.category || "general"})
              </span>
              <button
                onClick={handleReplayQuestion}
                disabled={isAISpeaking || isEvaluating}
                className="text-white/60 hover:text-white flex items-center gap-1 transition-colors text-[11px]"
              >
                <Volume2 size={12} /> Repeat audio
              </button>
            </div>
            <p className="text-xs sm:text-sm font-medium text-white/95 leading-relaxed">
              {currentQ?.question || "Preparing your placement question..."}
            </p>
          </div>

          {/* Answer Input & Turn-Taking Interaction Bar */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex flex-col gap-2 shrink-0">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 text-white/70 font-medium">
                {isListening ? (
                  <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold animate-pulse">
                    <Mic size={14} /> <span>Microphone Active — Speak your answer aloud...</span>
                  </span>
                ) : isAISpeaking ? (
                  <span className="text-amber-300">
                    🔊 Interviewer speaking. Please listen attentively...
                  </span>
                ) : isEvaluating ? (
                  <span className="inline-flex items-center gap-1 text-teal-300">
                    <RefreshCw size={12} className="animate-spin" /> Evaluating answer & generating tailored response...
                  </span>
                ) : (
                  <span>Answer box (Voice transcript or type below):</span>
                )}
              </span>

              <button
                onClick={handleSkipQuestion}
                disabled={isEvaluating}
                className="text-white/40 hover:text-white/70 text-[11px] flex items-center gap-1 transition-colors"
              >
                <SkipForward size={12} /> Skip question
              </button>
            </div>

            <div className="flex gap-2">
              <textarea
                value={currentAnswer}
                onChange={(e) => setCurrentAnswer(e.target.value)}
                onPaste={(e) => {
                  e.preventDefault();
                  toast.error("Copy and paste is disabled during the interview for academic integrity.");
                }}
                onCopy={(e) => {
                  e.preventDefault();
                  toast.error("Copying text is disabled during the interview.");
                }}
                onCut={(e) => {
                  e.preventDefault();
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleAnswerSubmit();
                  }
                }}
                placeholder={
                  isAISpeaking
                    ? "Interviewer is speaking aloud... Your spoken answer will be captured when she finishes."
                    : isEvaluating
                    ? "Evaluating your answer..."
                    : "Speak through your microphone or type your response here..."
                }
                rows={2}
                disabled={isEvaluating}
                className="flex-1 bg-black/40 border border-white/10 rounded-lg p-2.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-emerald-500 resize-none transition-colors"
              />

              <button
                onClick={handleAnswerSubmit}
                disabled={!currentAnswer.trim() || isEvaluating}
                className="px-4 bg-emerald-600 hover:bg-emerald-500 disabled:bg-white/10 disabled:text-white/30 text-white rounded-lg font-medium text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm shrink-0"
              >
                {isEvaluating ? (
                  <RefreshCw size={14} className="animate-spin" />
                ) : (
                  <>
                    <span>Submit</span>
                    <Send size={13} />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Bottom Call Controls */}
          <div className="flex items-center justify-center gap-4 py-1 shrink-0">
            <button
              onClick={toggleMic}
              className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${
                micEnabled
                  ? "bg-white/10 border border-white/20 hover:bg-white/20 text-white"
                  : "bg-red-600 text-white shadow-lg"
              }`}
              aria-label={micEnabled ? "Mute microphone" : "Unmute microphone"}
              title={micEnabled ? "Mute microphone" : "Unmute microphone"}
            >
              {micEnabled ? <Mic size={18} /> : <MicOff size={18} />}
            </button>
            <button
              onClick={toggleCamera}
              className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${
                cameraEnabled
                  ? "bg-white/10 border border-white/20 hover:bg-white/20 text-white"
                  : "bg-red-600 text-white shadow-lg"
              }`}
              aria-label={cameraEnabled ? "Turn off camera" : "Turn on camera"}
              title={cameraEnabled ? "Turn off camera" : "Turn on camera"}
            >
              {cameraEnabled ? <Video size={18} /> : <VideoOff size={18} />}
            </button>
            <button
              onClick={() => setShowEndModal(true)}
              className="w-12 h-12 rounded-full bg-red-600 hover:bg-red-500 flex items-center justify-center text-white transition-all shadow-lg hover:shadow-red-500/20"
              aria-label="End interview"
              title="End Interview & View Performance Analysis"
            >
              <PhoneOff size={20} />
            </button>
          </div>
        </div>

        {/* Live Transcript Sidebar */}
        <div className="hidden lg:flex flex-col w-84 border-l border-white/10 bg-[var(--color-surface-950)]">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10 shrink-0">
            <MessageSquare size={14} className="text-emerald-400" />
            <span className="text-xs font-semibold text-white/80 uppercase tracking-wider">
              Live Transcript & Dialogue
            </span>
          </div>

          <div
            className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 select-none"
            onCopy={(e) => {
              e.preventDefault();
              toast.error("Copying transcripts is disabled during live session.");
            }}
          >
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                  <Sparkles size={16} className="text-emerald-400/60" />
                </div>
                <p className="text-xs text-white/40 leading-relaxed">
                  The interviewer will speak each question aloud. The live transcript records your interview conversation.
                </p>
              </div>
            )}

            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex flex-col gap-1 ${msg.role === "user" ? "items-end" : "items-start"}`}
              >
                <span className="text-[10px] font-medium text-white/40 uppercase tracking-wider">
                  {msg.role === "assistant" ? "Sarah Jenkins (Interviewer)" : "You"}
                </span>
                <div
                  className={`max-w-[92%] rounded-xl px-3 py-2 text-xs leading-relaxed shadow-xs ${
                    msg.role === "assistant"
                      ? "bg-white/10 border border-white/10 text-white/90"
                      : "bg-emerald-700 text-white font-normal"
                  }`}
                >
                  {msg.content}
                </div>
                <span className="text-[9px] text-white/20">
                  {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      {/* Safe Exit End Interview Confirmation Modal */}
      {showEndModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[var(--color-surface-950)] border border-white/20 rounded-2xl max-w-md w-full p-6 text-white shadow-2xl relative">
            <button
              onClick={() => setShowEndModal(false)}
              className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>
            <div className="w-12 h-12 rounded-full bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-400 mb-4">
              <PhoneOff size={22} />
            </div>
            <h3 className="text-lg font-bold mb-2">End Interview Session?</h3>
            <p className="text-xs text-white/60 mb-6 leading-relaxed">
              Are you sure you want to exit? Your answers so far will be compiled into your placement readiness score and comprehensive evaluation report.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowEndModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                Resume Interview
              </button>
              <button
                onClick={() => {
                  setShowEndModal(false);
                  handleEnd();
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-red-600 hover:bg-red-500 text-white transition-colors shadow-lg"
              >
                End & View Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

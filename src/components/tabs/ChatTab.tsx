/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useRef, useState } from "react";
import {
  createOrUpdateSession,
  endSession,
  getPersonaRecommendations,
  getSessionDetails,
  voiceChat,
} from "../../api";
import { Send, Crown, Mic, Play, Pause, Square } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { formatMessage } from "../../utils/messageFormatter";

// const recognitionInstance: any = null;

// Attempts to get an accurate audio duration. Falls back to HTMLAudio if
// the Web Audio API cannot decode the blob. Returns null if not finite.
const getAudioDurationSeconds = async (blob: Blob): Promise<number | null> => {
  try {
    const AudioCtx =
      (window as any).AudioContext || (window as any).webkitAudioContext;
    if (AudioCtx) {
      const ctx = new AudioCtx();
      const arrayBuffer = await blob.arrayBuffer();
      const audioBuffer: AudioBuffer = await new Promise((resolve, reject) => {
        ctx.decodeAudioData(arrayBuffer.slice(0), resolve, reject);
      });
      const duration = audioBuffer.duration;
      ctx.close?.();
      return Number.isFinite(duration) ? duration : null;
    }
  } catch {
    // Fall through to HTMLAudio fallback
  }

  return await new Promise<number | null>((resolve) => {
    const objectUrl = URL.createObjectURL(blob);
    const tempAudio = new Audio(objectUrl);
    const cleanup = () => URL.revokeObjectURL(objectUrl);
    tempAudio.addEventListener(
      "loadedmetadata",
      () => {
        const duration = tempAudio.duration;
        cleanup();
        resolve(Number.isFinite(duration) ? duration : null);
      },
      { once: true }
    );
    // In case metadata never fires, resolve after a timeout
    setTimeout(() => {
      cleanup();
      resolve(null);
    }, 4000);
  });
};

const formatSeconds = (seconds: number): string => {
  const mins = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const secs = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0");
  return `${mins}:${secs}`;
};

const blobToBase64 = (blob: Blob): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onloadend = () => {
      const res = reader.result as string;
      const commaIdx = res.indexOf(",");
      resolve(commaIdx >= 0 ? res.slice(commaIdx + 1) : res);
    };
    reader.readAsDataURL(blob);
  });

interface VoiceNotePlayerProps {
  src: string;
  durationSeconds?: number | null;
}

const VoiceNotePlayer: React.FC<VoiceNotePlayerProps> = ({ src, durationSeconds }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState<number>(
    Number.isFinite(durationSeconds || 0) && (durationSeconds || 0) > 0
      ? (durationSeconds as number)
      : 0
  );

  useEffect(() => {
    const audio = new Audio(src);
    audioRef.current = audio;

    const handleLoaded = () => {
      if (Number.isFinite(audio.duration) && audio.duration > 0) {
        setDuration(audio.duration);
      }
    };
    const handleTime = () => setCurrentTime(audio.currentTime || 0);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener("loadedmetadata", handleLoaded);
    audio.addEventListener("timeupdate", handleTime);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.pause();
      audio.removeEventListener("loadedmetadata", handleLoaded);
      audio.removeEventListener("timeupdate", handleTime);
      audio.removeEventListener("ended", handleEnded);
      audioRef.current = null;
    };
  }, [src]);

  // If duration was not provided or is invalid, attempt to decode from the blob URL
  useEffect(() => {
    if (duration > 0) return;
    let isCancelled = false;
    const detect = async () => {
      try {
        const res = await fetch(src);
        const blob = await res.blob();
        const d = await getAudioDurationSeconds(blob);
        if (!isCancelled && d && Number.isFinite(d) && d > 0) {
          setDuration(d);
        }
      } catch {
        // ignore
      }
    };
    void detect();
    return () => {
      isCancelled = true;
    };
  }, [src, duration]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play();
      setIsPlaying(true);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;
    const value = Number(e.target.value);
    audio.currentTime = (value / 100) * duration;
  };

  const hasFiniteDuration = Number.isFinite(duration) && duration > 0;
  const progressPercent = hasFiniteDuration
    ? Math.min(100, (currentTime / duration) * 100)
    : 0;

  return (
    <div className="flex items-center space-x-3 bg-slate-900/40 border border-slate-700 rounded-md px-3 py-2">
      <button
        type="button"
        onClick={togglePlay}
        className="p-2 rounded-md bg-slate-800 hover:bg-slate-700 text-white"
        aria-label={isPlaying ? "Pause" : "Play"}
      >
        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
      </button>

      <input
        type="range"
        min={0}
        max={100}
        value={progressPercent}
        onChange={handleSeek}
        className="flex-1 accent-amber-400"
        disabled={!hasFiniteDuration}
        aria-label="Seek"
      />

      <div className="text-xs text-slate-300 w-14 text-right tabular-nums">
        {formatSeconds(currentTime)} / {hasFiniteDuration ? formatSeconds(duration) : "--:--"}
      </div>
    </div>
  );
};

const ChatTab: React.FC = () => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null
  );

  const userId = localStorage.getItem("userId");
  const aiPersona = JSON.parse(localStorage.getItem("aiPersona") || "{}");
  const [isListening, setIsListening] = useState(false);

  // useEffect(() => {
  //   // const script = document.createElement("script");
  //   // script.src = "https://unpkg.com/@elevenlabs/convai-widget-embed";
  //   // script.async = true;
  //   // script.type = "text/javascript";
  //   // document.body.appendChild(script);

  //   return () => {
  //     // document.body.removeChild(script);
  //   };
  // }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    const loadExistingSession = async () => {
      const savedSessionId = localStorage.getItem("currentSessionId");
      if (savedSessionId && userId) {
        try {
          const response = await getSessionDetails(savedSessionId, userId);
          const sessionData = response.data.data;
          if (sessionData.sessionId) {
            setSessionId(sessionData.sessionId);
          }
          if (sessionData.messages && sessionData.messages.length > 0) {
            const formattedMessages = sessionData.messages.map((msg: any) => ({
              id: msg.id || Date.now().toString() + Math.random().toString(),
              sender: msg.role === "user" ? "user" : "agent",
              content: msg.content,
              timestamp: new Date(msg.timestamp),
            }));
            setMessages(formattedMessages);
          }
        } catch (error) {
          console.error("Error loading saved session:", error);
          localStorage.removeItem("currentSessionId");
        }
      }
    };

    loadExistingSession();
  }, [userId]);

  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!userId || messages.length > 0) return;

      setIsTyping(true);

      try {
        const res = await getPersonaRecommendations(userId);
        const recos = res.data?.data?.recommendations || [];
        setRecommendations(recos);
      } catch (err) {
        console.error("Failed to get recommendations", err);
      } finally {
        setIsTyping(false); // stop loader
      }
    };

    fetchRecommendations();
  }, [userId, messages.length]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !userId) return;

    const userMsg = {
      id: Date.now().toString(),
      sender: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    try {
      const res = await createOrUpdateSession({
        userId,
        sessionId: sessionId ?? undefined,
        question: input,
        persona: JSON.stringify(aiPersona),
      });

      const agentResponse =
        res?.data?.agentResponse || "I've processed your request.";

      const agentMsg = {
        id: Date.now().toString() + "-agent",
        sender: "agent",
        content: agentResponse,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, agentMsg]);
      if (res?.data?.sessionId) {
        setSessionId(res.data.sessionId);
        localStorage.setItem("currentSessionId", res.data.sessionId);
      }
      setIsTyping(false);

      if (res?.data?.status === "ended") {
        console.log("Session ended. Ticket ID:", res.data.ticketId);
      }
    } catch (error: any) {
      console.error(
        "API error:",
        error,
        error?.response?.data || error.message
      );
      setIsTyping(false);
    }
  };

  const handleEndSession = async () => {
    if (!userId || !sessionId) return;
    try {
      await endSession(sessionId, {
        userId,
        reason: "User ended chat manually",
      });
      setSessionId(null);
      setMessages([]);
      localStorage.removeItem("currentSessionId");
    } catch (error) {
      console.error("Error ending session:", error);
    }
  };

  const handleMicClick = async () => {
    if (isListening && mediaRecorder) {
      mediaRecorder.stop();
      setIsListening(false);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Prefer formats supported by backend (ogg). Fallback to webm if needed.
      const preferredMimeTypes = [
        "audio/ogg;codecs=opus",
        "audio/ogg",
        "audio/webm;codecs=opus",
        "audio/webm",
      ];
      const selectedMimeType = preferredMimeTypes.find((mt) =>
        (window as any).MediaRecorder?.isTypeSupported?.(mt)
      );
      const recorder = selectedMimeType
        ? new MediaRecorder(stream, { mimeType: selectedMimeType })
        : new MediaRecorder(stream);
      setMediaRecorder(recorder);
      const chunks: Blob[] = [];

      recorder.onstart = () => {
        setIsListening(true);
        console.log("🎙️ Recording started");
      };

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      recorder.onstop = async () => {
        setIsListening(false);
        const mimeType = (recorder as any).mimeType || "audio/webm";
        const audioBlob = new Blob(chunks, { type: mimeType });
        const audioUrl = URL.createObjectURL(audioBlob);
        const audioDuration = await getAudioDurationSeconds(audioBlob);

        const userMsg = {
          id: Date.now().toString(),
          sender: "user",
          content:
            audioDuration !== null
              ? `Voice note (${Math.round(audioDuration)}s)`
              : `Voice note`,
          audio: audioUrl,
          duration: audioDuration ?? undefined,
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMsg]);

        // Send audio to Voice Chat endpoint
        try {
          setIsTyping(true);
          // Ensure we have a session id
          let currentSessionId = sessionId;
          if (!currentSessionId && userId) {
            try {
              const bootstrap = await createOrUpdateSession({
                userId,
                sessionId: undefined,
                question: "",
                persona: JSON.stringify(aiPersona),
              });
              currentSessionId = bootstrap?.data?.sessionId || null;
              if (currentSessionId) {
                setSessionId(currentSessionId);
                localStorage.setItem("currentSessionId", currentSessionId);
              }
            } catch (e) {
              console.error("Failed to bootstrap session for voice chat", e);
            }
          }

          const base64Audio = await blobToBase64(audioBlob);
          const audioFormat = mimeType.includes("ogg")
            ? "ogg"
            : mimeType.includes("webm")
            ? "webm"
            : "wav"; // fallback label

          if (currentSessionId) {
            const vcRes = await voiceChat({
              audio_data: base64Audio,
              audio_format: audioFormat,
              language: "en",
              session_id: currentSessionId,
              user_id: userId || undefined,
            });

            const agentAudioFormat = vcRes.data.audio_format || "mp3";
            const agentAudioBase64 = vcRes.data.agent_audio;
            const agentAudioUrl = agentAudioBase64
              ? `data:audio/${agentAudioFormat};base64,${agentAudioBase64}`
              : undefined;

            const agentMsg = {
              id: Date.now().toString() + "-agent",
              sender: "agent",
              content: vcRes.data.agent_response || "",
              audio: agentAudioUrl,
              timestamp: new Date(),
            };
            setMessages((prev) => [...prev, agentMsg]);
          }
        } catch (error) {
          console.error("Voice chat error:", error);
        } finally {
          setIsTyping(false);
        }

        // Clean up media stream and recorder instance
        try {
          stream.getTracks().forEach((track) => track.stop());
        } catch {
          console.error("Error stopping media stream");
        }
        setMediaRecorder(null);
      };

      recorder.start();
    } catch (err) {
      console.error("Mic access denied or error:", err);
      alert("Microphone access is required to send voice notes.");
    }
  };

  // const handleMicClick = () => {
  //   const SpeechRecognition =
  //     (window as any).SpeechRecognition ||
  //     (window as any).webkitSpeechRecognition;

  //   if (!SpeechRecognition) {
  //     alert("Speech recognition is not supported in this browser.");
  //     return;
  //   }

  //   // If already listening, stop recognition
  //   if (isListening && recognitionInstance) {
  //     recognitionInstance.stop();
  //     setIsListening(false);
  //     return;
  //   }

  //   const recognition = new SpeechRecognition();
  //   recognitionInstance = recognition;
  //   recognition.continuous = false;
  //   recognition.interimResults = false;
  //   recognition.lang = "en-US";

  //   recognition.onstart = () => {
  //     setIsListening(true);
  //     console.log("Voice recognition started");
  //   };

  //   recognition.onend = () => {
  //     setIsListening(false);
  //     recognitionInstance = null;
  //     console.log("Voice recognition ended");
  //   };

  //   recognition.onerror = (event: any) => {
  //     console.error("Speech recognition error", event);
  //     setIsListening(false);
  //     recognitionInstance = null;
  //   };

  //   recognition.onresult = (event: any) => {
  //     const transcript = event.results[0][0].transcript.trim();
  //     if (transcript) {
  //       setInput("");
  //       const syntheticEvent = {
  //         preventDefault: () => {},
  //       } as React.FormEvent;
  //       setInput(transcript);
  //       setTimeout(() => handleSubmit(syntheticEvent), 100);
  //     }
  //   };

  //   recognition.start();
  // };

  const handleCardClick = async (recommendation: any) => {
    if (!userId) return;

    const userMsg = {
      id: Date.now().toString(),
      sender: "user",
      content: recommendation.title,
      timestamp: new Date(),
    };

    setMessages([userMsg]);
    setIsTyping(true);

    try {
      const res = await createOrUpdateSession({
        userId,
        sessionId: undefined, // Start new session
        question: recommendation.title,
        persona: JSON.stringify(aiPersona),
      });

      const agentResponse =
        res?.data?.agentResponse || "I've processed your request.";

      const agentMsg = {
        id: Date.now().toString() + "-agent",
        sender: "agent",
        content: agentResponse,
        timestamp: new Date(),
      };

      setMessages([userMsg, agentMsg]);
      if (res?.data?.sessionId) {
        setSessionId(res.data.sessionId);
        localStorage.setItem("currentSessionId", res.data.sessionId);
      }
      setIsTyping(false);

      if (res?.data?.status === "ended") {
        console.log("Session ended. Ticket ID:", res.data.ticketId);
      }
    } catch (error: any) {
      console.error(
        "API error:",
        error,
        error?.response?.data || error.message
      );
      setIsTyping(false);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="bg-slate-800/30 backdrop-blur-lg border-b border-slate-700/50 px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-light text-white">
              kai<span className="text-amber-400">°</span>
            </h1>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 min-h-0">
          <AnimatePresence>
            {messages.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-start text-center h-full"
              >
                {/* Welcome */}
                <div className="mt-8 mb-4">
                  <div className="flex items-center justify-center mb-3">
                    <Crown className="w-7 h-7 text-amber-400" />
                  </div>
                  <h2 className="text-xl font-light text-white mb-1">
                    Welcome to <span className="text-amber-400">kai°</span>
                  </h2>
                  <p className="text-slate-300 text-sm">
                    Your exclusive AI-powered concierge
                  </p>
                </div>

                {/* Cards */}
                {isTyping ? (
                  <div className="mt-6 text-slate-300 text-sm">
                    Generating recommendations for you...
                  </div>
                ) : (
                  recommendations.length > 0 && (
                    <div className="w-full max-w-4xl px-4 grid grid-cols-2 gap-3">
                      {recommendations.slice(0, 4).map((r, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.05 }}
                          whileHover={{
                            scale: 1.02,
                            y: -2,
                            transition: { duration: 0.2, ease: "easeOut" },
                          }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleCardClick(r)}
                          className="bg-slate-800/60 border border-slate-700/50 rounded-lg p-3 shadow-sm hover:shadow-amber-500/20 hover:shadow-lg transition-all duration-300 hover:border-amber-400/30 hover:bg-slate-800/80 backdrop-blur-sm group cursor-pointer"
                        >
                          <h3 className="text-sm font-medium text-white mb-1 line-clamp-1 group-hover:text-amber-300 transition-colors duration-300">
                            {r.title}
                          </h3>

                          <p className="text-xs text-slate-400 line-clamp-2 mb-2 group-hover:text-slate-300 transition-colors duration-300">
                            {r.reasoning}
                          </p>

                          <div className="text-xs text-slate-500 group-hover:text-slate-400 transition-colors duration-300">
                            <span className="font-medium">Cost:</span>{" "}
                            {r.estimated_cost}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )
                )}
              </motion.div>
            ) : (
              <div className="mt-4 space-y-4">
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${
                      msg.sender === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-2xl p-4 rounded-xl space-y-2 ${
                        msg.sender === "user"
                          ? "bg-amber-400/10 text-amber-300 border border-amber-400/20"
                          : "bg-slate-800/50 text-white border border-slate-700"
                      }`}
                    >
                      {msg.audio ? (
                        <div className="space-y-1">
                          <VoiceNotePlayer src={msg.audio} durationSeconds={(msg as any).duration} />
                        </div>
                      ) : (
                        formatMessage(msg.content)
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Floating End Session Button */}
        {messages.length > 0 && (
          <div className="flex justify-center mb-4">
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleEndSession}
              className="px-4 py-2 text-sm font-medium text-red-300 hover:text-red-200 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition-all duration-200 border border-red-500/30 hover:border-red-400/40 backdrop-blur-lg shadow-lg"
            >
              End Session
            </motion.button>
          </div>
        )}

        {/* Input Area */}
        <div className="p-8 bg-slate-800/30 backdrop-blur-lg">
          <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
            <div className="relative">
              <div className="flex items-center space-x-3 bg-slate-900/50 border border-slate-700/50 rounded-xl p-3 hover:border-slate-600 transition-colors">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="How may I assist you today?"
                  className="flex-1 bg-transparent text-white placeholder-slate-400 focus:outline-none"
                />
                <div className="relative flex items-center">
                  <button
                    type="button"
                    onClick={handleMicClick}
                    className={`p-2 rounded-lg transition-colors ${
                      isListening ? "bg-amber-400/20" : "hover:bg-slate-700/50"
                    }`}
                    aria-pressed={isListening}
                    aria-label={
                      isListening ? "Stop recording" : "Start voice recording"
                    }
                  >
                    {isListening ? (
                      <Square className="w-6 h-6 text-amber-400" />
                    ) : (
                      <Mic className="w-6 h-6 text-slate-400" />
                    )}
                  </button>

                  {isListening && (
                    <div className="absolute right-full top-1/2 -translate-y-1/2 mr-4 px-2 py-1 text-xs text-white bg-slate-800 border border-slate-600 rounded shadow-md pointer-events-none whitespace-nowrap z-10">
                      Recording… click to stop
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={!input.trim()}
                  className="p-2 bg-amber-400 hover:bg-amber-500 disabled:bg-slate-700/50 disabled:text-slate-400 rounded-lg transition-colors"
                >
                  <Send className="w-6 h-6" />
                </button>
              </div>
            </div>
          </form>
          
        </div>
      </div>
    </div>
  );
};

export default ChatTab;

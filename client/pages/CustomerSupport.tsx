import { useState, useRef, useEffect } from "react";
import { Send, Loader2, CheckCircle, XCircle, Mic, Square, RotateCcw } from "lucide-react";
import type { ChatMessage, ProcessRefundResponse } from "@shared/api";
import { Link } from "react-router-dom";

// Type definitions for Web APIs
interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognition;
    webkitSpeechRecognition?: new () => SpeechRecognition;
  }
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
  onend: ((this: SpeechRecognition, ev: Event) => any) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

// Utility to generate unique IDs
const generateUniqueId = (): string => {
  return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export default function CustomerSupport() {
  const [customerId, setCustomerId] = useState("cust_001");
  const [orderId, setOrderId] = useState("ORD_20240315");
  const [amount, setAmount] = useState("89.99");
  const [reason, setReason] = useState("Product does not match description");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: generateUniqueId(),
      role: "system",
      content:
        "Welcome to AI Customer Support. I'll help process your refund request using intelligent policy validation.",
      timestamp: Date.now(),
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [decision, setDecision] = useState<
    | (ProcessRefundResponse & { processing: boolean })
    | null
  >(null);
  const [isRecording, setIsRecording] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(true);
  const [recordingError, setRecordingError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [showRetry, setShowRetry] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const finalTranscriptRef = useRef<string>("");
  const networkErrorTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const maxRetries = 3;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const hasWebSpeechAPI =
      typeof window !== "undefined" &&
      (window.SpeechRecognition || (window as any).webkitSpeechRecognition);
    setVoiceSupported(!!hasWebSpeechAPI);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // Ignore cleanup errors
        }
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (networkErrorTimeoutRef.current) {
        clearTimeout(networkErrorTimeoutRef.current);
      }
    };
  }, []);

  const initializeRecognition = (onRetry = false) => {
    const SpeechRecognition =
      typeof window !== "undefined"
        ? (window.SpeechRecognition ||
            (window as any).webkitSpeechRecognition)
        : null;

    if (!SpeechRecognition) {
      setRecordingError(
        "Speech Recognition not supported in this browser. Please use Chrome, Edge, or Safari."
      );
      setTimeout(() => setRecordingError(null), 4000);
      return null;
    }

    // Stop and abort any existing recognition
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {
        // Ignore errors
      }
    }

    // Clear timeout if exists
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Reset transcript
    finalTranscriptRef.current = "";
    setRecordingError(null);
    setShowRetry(false);

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;

    // Configuration
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    let interimTranscript = "";
    let hasReceivedResult = false;

    // Start handler
    recognition.onstart = () => {
      console.log(`Voice recording started (attempt ${retryCount + 1})`);
      setIsRecording(true);
      if (!onRetry) {
        setReason(""); // Clear previous text only on first attempt
      }
      setRecordingError(null);
      setShowRetry(false);

      // Set 30-second timeout to auto-stop recording
      timeoutRef.current = setTimeout(() => {
        if (recognitionRef.current) {
          try {
            recognitionRef.current.stop();
          } catch {
            // Ignore stop errors
          }
        }
      }, 30000);
    };

    // Result handler
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      hasReceivedResult = true;
      interimTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;

        if (event.results[i].isFinal) {
          finalTranscriptRef.current += transcript + " ";
        } else {
          interimTranscript += transcript;
        }
      }

      // Update the reason field with live text
      const displayText = finalTranscriptRef.current + interimTranscript;
      setReason(displayText.trim());
    };

    // Error handler with retry logic
    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error("Speech recognition error:", event.error);
      setIsRecording(false);

      let errorMessage = "";
      let isRetryable = false;

      switch (event.error) {
        case "aborted":
          console.log("Speech recognition was aborted");
          return;
        case "no-speech":
          errorMessage =
            "No speech detected. Please make sure your microphone is working and try again.";
          isRetryable = true;
          break;
        case "audio-capture":
          errorMessage =
            "No microphone found. Please check your audio input device.";
          break;
        case "network":
          errorMessage =
            "Speech service temporarily unavailable. This is not your internet connection. Please wait a moment and try again.";
          isRetryable = true;
          break;
        case "not-allowed":
          errorMessage =
            "Microphone access denied. Please allow microphone access in your browser settings.";
          break;
        case "service-not-allowed":
          errorMessage = "Speech Recognition service is not allowed.";
          break;
        case "bad-grammar":
          errorMessage = "Grammar error. Please try again.";
          isRetryable = true;
          break;
        default:
          errorMessage = `Speech recognition error: ${event.error}. Please try again.`;
          isRetryable = true;
      }

      setRecordingError(errorMessage);

      // Show retry button for retryable errors if we haven't exceeded max retries
      if (isRetryable && retryCount < maxRetries) {
        setShowRetry(true);
      }

      // Auto-hide error message after 5 seconds if not showing retry
      if (!isRetryable) {
        setTimeout(() => setRecordingError(null), 5000);
      }
    };

    // End handler
    recognition.onend = () => {
      console.log("Voice recording ended");
      setIsRecording(false);

      // Clear timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      if (finalTranscriptRef.current.trim()) {
        setReason(finalTranscriptRef.current.trim());
        setMessages((prev) => [
          ...prev,
          {
            id: generateUniqueId(),
            role: "user",
            content: `[Voice message] ${finalTranscriptRef.current.trim()}`,
            timestamp: Date.now(),
          },
        ]);
        // Reset retry count on success
        setRetryCount(0);
      }
    };

    return recognition;
  };

  const startRecording = () => {
    const recognition = initializeRecognition(false);
    if (!recognition) return;

    try {
      recognition.start();
    } catch (error) {
      console.error("Error starting speech recognition:", error);
      setRecordingError("Failed to start voice input. Please try again.");
      setIsRecording(false);
      setTimeout(() => setRecordingError(null), 3000);
    }
  };

  const retryRecording = () => {
    if (retryCount < maxRetries) {
      setRetryCount((prev) => prev + 1);
      const recognition = initializeRecognition(true);
      if (!recognition) return;

      // Add small delay before retrying
      setTimeout(() => {
        try {
          recognition.start();
        } catch (error) {
          console.error("Error retrying speech recognition:", error);
        }
      }, 500);
    } else {
      setRecordingError(
        "Maximum retry attempts reached. Please try again later or type your reason manually."
      );
      setShowRetry(false);
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
        setIsRecording(false);
        setShowRetry(false);

        // Clear timeout
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
      } catch (error) {
        console.error("Error stopping speech recognition:", error);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerId || !orderId || !amount || !reason) {
      alert("Please fill in all fields");
      return;
    }

    setLoading(true);
    setDecision(null);

    try {
      const response = await fetch("/api/refund/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId,
          orderId,
          amount: parseFloat(amount),
          reason,
        }),
      });

      const data = (await response.json()) as ProcessRefundResponse;

      // Ensure all messages from API have unique IDs
      const apiMessages = (data.messages || []).map((msg) => ({
        ...msg,
        id: generateUniqueId(),
      }));

      setMessages((prev) => [...prev, ...apiMessages]);
      setDecision({ ...data, processing: true });

      setTimeout(() => {
        setDecision((prev) =>
          prev ? { ...prev, processing: false } : null
        );
      }, 1000);
    } catch (error) {
      console.error("Error processing refund:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: generateUniqueId(),
          role: "system",
          content: "Error processing refund. Please try again.",
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
              AI Refund Assistant
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 hidden sm:block">
              Intelligent policy validation in real-time
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-4">
            <Link
              to="/admin"
              className="text-xs sm:text-sm font-medium text-primary hover:text-primary/80 transition-colors"
            >
              Admin Dashboard →
            </Link>
            <Link
              to="/"
              className="text-xs sm:text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
            >
              ← Home
            </Link>
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-6xl mx-auto w-full px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
          {/* Chat Section */}
          <div className="lg:col-span-2 flex flex-col">
            <div className="flex-1 bg-white rounded-lg sm:rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-3 sm:space-y-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${
                      msg.role === "user"
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-xs sm:max-w-sm px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-sm ${
                        msg.role === "user"
                          ? "bg-primary text-white rounded-br-none"
                          : msg.role === "agent"
                            ? "bg-slate-100 text-slate-900 rounded-bl-none border border-slate-200"
                            : "bg-blue-50 text-blue-900 border border-blue-200 rounded-bl-none"
                      }`}
                    >
                      <p className="leading-relaxed">{msg.content}</p>
                      {msg.agentReasoning &&
                        msg.agentReasoning.length > 0 && (
                          <div className="mt-2 pt-2 border-t border-slate-300 text-xs opacity-75">
                            <p className="font-semibold mb-1">Reasoning:</p>
                            <ul className="space-y-0.5">
                              {msg.agentReasoning.slice(0, 3).map(
                                (reason, i) => (
                                  <li key={i}>
                                    • {reason.substring(0, 60)}
                                    {reason.length > 60 ? "..." : ""}
                                  </li>
                                )
                              )}
                            </ul>
                          </div>
                        )}
                    </div>
                  </div>
                ))}

                {/* Decision Display */}
                {decision && (
                  <div
                    className={`flex justify-start animate-fade-in ${
                      decision.processing ? "opacity-75" : ""
                    }`}
                  >
                    <div
                      className={`max-w-xs sm:max-w-sm px-4 sm:px-6 py-3 sm:py-4 rounded-lg border text-sm ${
                        decision.approved
                          ? "bg-green-50 border-green-200"
                          : "bg-red-50 border-red-200"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-3">
                        {decision.processing ? (
                          <Loader2 className="w-5 h-5 text-slate-600 animate-spin" />
                        ) : decision.approved ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-600" />
                        )}
                        <span
                          className={`font-semibold ${
                            decision.approved
                              ? "text-green-900"
                              : "text-red-900"
                          }`}
                        >
                          {decision.approved ? "Approved" : "Denied"}
                        </span>
                      </div>
                      <p
                        className={`mb-3 ${
                          decision.approved
                            ? "text-green-800"
                            : "text-red-800"
                        }`}
                      >
                        {decision.reason}
                      </p>
                      <details className="text-xs">
                        <summary
                          className={`font-semibold cursor-pointer ${
                            decision.approved
                              ? "text-green-700 hover:text-green-900"
                              : "text-red-700 hover:text-red-900"
                          }`}
                        >
                          View Full Reasoning
                        </summary>
                        <ul className="mt-2 space-y-1 opacity-75">
                          {decision.reasoning.map((r, i) => (
                            <li key={i}>• {r}</li>
                          ))}
                        </ul>
                      </details>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </div>
          </div>

          {/* Form Section */}
          <div className="lg:col-span-1">
            <form
              onSubmit={handleSubmit}
              className="bg-white rounded-lg sm:rounded-xl border border-slate-200 shadow-sm p-4 sm:p-6 sticky top-4"
            >
              <h2 className="text-base sm:text-lg font-semibold text-slate-900 mb-4">
                Refund Request
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-2">
                    Customer ID
                  </label>
                  <select
                    value={customerId}
                    onChange={(e) => setCustomerId(e.target.value)}
                    disabled={loading}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
                  >
                    <option value="cust_001">Sarah Johnson (cust_001)</option>
                    <option value="cust_002">Michael Chen (cust_002)</option>
                    <option value="cust_003">Emma Williams (cust_003)</option>
                    <option value="cust_004">
                      James Rodriguez (cust_004)
                    </option>
                    <option value="cust_005">Lisa Anderson (cust_005)</option>
                    <option value="cust_006">David Park (cust_006)</option>
                    <option value="cust_007">Jessica Brown (cust_007)</option>
                    <option value="cust_008">Robert Taylor (cust_008)</option>
                    <option value="cust_009">Nicole Davis (cust_009)</option>
                    <option value="cust_010">
                      Christopher Moore (cust_010)
                    </option>
                    <option value="cust_011">
                      Amanda Martinez (cust_011)
                    </option>
                    <option value="cust_012">Kevin Thompson (cust_012)</option>
                    <option value="cust_013">Rachel White (cust_013)</option>
                    <option value="cust_014">Matthew Harris (cust_014)</option>
                    <option value="cust_015">Victoria Garcia (cust_015)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-2">
                    Order ID
                  </label>
                  <input
                    type="text"
                    value={orderId}
                    onChange={(e) => setOrderId(e.target.value)}
                    disabled={loading}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-2">
                    Amount ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    disabled={loading}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs sm:text-sm font-medium text-slate-700">
                      Reason
                    </label>
                    {voiceSupported && (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={
                            isRecording ? stopRecording : startRecording
                          }
                          disabled={loading}
                          className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded transition-colors ${
                            isRecording
                              ? "bg-red-100 text-red-700 hover:bg-red-200"
                              : "bg-primary/10 text-primary hover:bg-primary/20"
                          } disabled:opacity-50`}
                          title={
                            isRecording
                              ? "Click to stop recording"
                              : "Click to start voice input"
                          }
                        >
                          {isRecording ? (
                            <>
                              <Square className="w-3 h-3" />
                              Stop
                            </>
                          ) : (
                            <>
                              <Mic className="w-3 h-3" />
                              Voice
                            </>
                          )}
                        </button>
                        {showRetry && retryCount < maxRetries && (
                          <button
                            type="button"
                            onClick={retryRecording}
                            disabled={loading}
                            className="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded transition-colors bg-yellow-100 text-yellow-700 hover:bg-yellow-200 disabled:opacity-50"
                            title="Retry voice input"
                          >
                            <RotateCcw className="w-3 h-3" />
                            Retry ({retryCount}/{maxRetries})
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Error message display with retry info */}
                  {recordingError && (
                    <div className={`mb-3 p-2 rounded text-xs border ${
                      showRetry && retryCount < maxRetries
                        ? "bg-yellow-50 border-yellow-200 text-yellow-700"
                        : "bg-red-50 border-red-200 text-red-700"
                    }`}>
                      <p className="font-medium">{recordingError}</p>
                      {showRetry && retryCount < maxRetries && (
                        <p className="text-xs mt-1">
                          Attempt {retryCount + 1} of {maxRetries + 1}. The speech service may be temporarily unavailable.
                        </p>
                      )}
                    </div>
                  )}

                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    disabled={loading}
                    rows={4}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 resize-none"
                    placeholder={
                      isRecording
                        ? "🎤 Recording... Speak now"
                        : "Type your reason or use voice input"
                    }
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Submit Request
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
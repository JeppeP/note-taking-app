"use client";

import { useState, useCallback, useRef, useEffect } from "react";

interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

export function useVoice() {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const isSupported = typeof window !== "undefined" &&
    (!!window.SpeechRecognition || !!window.webkitSpeechRecognition);

  const requestMicrophonePermission = useCallback(async () => {
    try {
      // Request microphone access explicitly to trigger browser prompt
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Stop the stream immediately - we just needed the permission
      stream.getTracks().forEach(track => track.stop());

      return true;
    } catch (err) {
      console.error("[Voice] Microphone permission denied:", err);

      const errorMessage = err instanceof Error && err.name === "NotAllowedError"
        ? "Microphone permission denied. Please allow microphone access when prompted."
        : `Failed to access microphone: ${err instanceof Error ? err.message : String(err)}`;

      setError(errorMessage);
      return false;
    }
  }, []);

  const startRecording = useCallback(async () => {
    if (!isSupported) {
      setError("Speech recognition is not supported in this browser");
      return;
    }

    setError(null);
    setTranscript("");
    setInterimTranscript("");

    // REQUEST MICROPHONE PERMISSION FIRST
    const hasPermission = await requestMicrophonePermission();
    if (!hasPermission) {
      return; // Error already set by requestMicrophonePermission
    }

    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognitionAPI();

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = "";
      let final = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          final += result[0].transcript + " ";
        } else {
          interim += result[0].transcript;
        }
      }

      if (final) {
        setTranscript((prev) => prev + final);
      }
      setInterimTranscript(interim);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error("[Voice] Speech recognition error:", event.error);

      let errorMessage = `Recognition error: ${event.error}`;

      // Provide specific, actionable error messages
      switch (event.error) {
        case 'audio-capture':
          errorMessage = 'Microphone not found or access denied. Please check your microphone settings.';
          break;
        case 'not-allowed':
          errorMessage = 'Microphone permission denied. Please allow microphone access in your browser settings.';
          break;
        case 'network':
          errorMessage = 'Network error. Arc browser may block speech recognition. Try using Chrome or check your internet connection.';
          break;
        case 'no-speech':
          errorMessage = 'No speech detected. Please try speaking closer to the microphone.';
          break;
        case 'aborted':
          errorMessage = 'Recording was aborted.';
          break;
      }

      setError(errorMessage);
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
      setInterimTranscript("");
    };

    recognitionRef.current = recognition;

    try {
      recognition.start();
      setIsRecording(true);
    } catch (err) {
      console.error("[Voice] Failed to start recognition:", err);

      // Show user-friendly error message
      const errorMessage = err instanceof Error && err.message.toLowerCase().includes("permission")
        ? "Microphone permission denied. Please allow microphone access in your browser settings."
        : `Failed to start recording: ${err instanceof Error ? err.message : String(err)}`;

      setError(errorMessage);
      setIsRecording(false);
    }
  }, [isSupported, requestMicrophonePermission]);

  const stopRecording = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
  }, []);

  const clearTranscript = useCallback(() => {
    setTranscript("");
    setInterimTranscript("");
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  return {
    isRecording,
    transcript,
    interimTranscript,
    fullTranscript: transcript + interimTranscript,
    error,
    isSupported,
    startRecording,
    stopRecording,
    clearTranscript,
  };
}

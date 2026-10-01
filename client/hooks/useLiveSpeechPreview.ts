import { useCallback, useRef } from "react";

/**
 * Browser-native live speech-to-text (Web Speech API), used purely to show
 * a running "here's what you're saying" preview in the question input WHILE
 * the user is recording - the actual question sent to the backend still
 * comes from the more accurate server-side transcription in askTutorVoice.
 * Without this, the mic button gave zero feedback that anything was being
 * heard until recording stopped entirely.
 *
 * Silently does nothing on browsers without SpeechRecognition support (e.g.
 * Firefox) - the real voice-question flow (MediaRecorder + askTutorVoice)
 * is unaffected either way.
 */
export function useLiveSpeechPreview(onInterimText: (text: string) => void) {
  const recognitionRef = useRef<any>(null);

  const start = useCallback(() => {
    const SpeechRecognitionCtor =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionCtor) return;

    try {
      const recognition = new SpeechRecognitionCtor();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onresult = (event: any) => {
        let transcript = "";
        for (let i = 0; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        onInterimText(transcript);
      };
      recognition.onerror = () => {
        // Swallow - the backend transcription still works regardless of
        // whether the live preview succeeds.
      };

      recognition.start();
      recognitionRef.current = recognition;
    } catch {
      // Unsupported/blocked - skip the live preview silently.
    }
  }, [onInterimText]);

  const stop = useCallback(() => {
    try {
      recognitionRef.current?.stop();
    } catch {
      // ignore
    }
    recognitionRef.current = null;
  }, []);

  return { start, stop };
}

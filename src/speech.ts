// Voice input through the phone's own recognizer (Apple / Google), via expo-speech-recognition. Needs a development
// or TestFlight build; in Expo Go or a browser without speech support `available` is false and the user types instead.

import { useRef, useState } from 'react';
import { ExpoSpeechRecognitionModule, useSpeechRecognitionEvent } from 'expo-speech-recognition';
import { NAMES } from './foods';

// Ingredient names help the recognizer pick 깻잎 over 깨 잎 and the like.
const HINTS = Array.from(new Set(NAMES.map((n) => n.text)));

function isAvailable() {
  try {
    return ExpoSpeechRecognitionModule.isRecognitionAvailable();
  } catch {
    return false;
  }
}

export function useSpeech(onText: (text: string, final: boolean) => void) {
  const [listening, setListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [available] = useState(isAvailable);
  const cb = useRef(onText);
  cb.current = onText;

  useSpeechRecognitionEvent('start', () => setListening(true));
  useSpeechRecognitionEvent('end', () => setListening(false));
  useSpeechRecognitionEvent('result', (e) => cb.current(e.results[0]?.transcript ?? '', e.isFinal));
  useSpeechRecognitionEvent('error', (e) => {
    setListening(false);
    if (e.error === 'no-speech' || e.error === 'aborted') return;
    setError(e.error === 'not-allowed' ? '마이크와 음성 인식을 허용해 주세요 (설정 앱).' : '잘 못 들었어요. 다시 말해 주세요.');
  });

  async function start() {
    setError(null);
    const perm = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
    if (!perm.granted) {
      setError('마이크와 음성 인식을 허용해 주세요 (설정 앱).');
      return;
    }
    ExpoSpeechRecognitionModule.start({
      lang: 'ko-KR',
      interimResults: true,
      continuous: true,
      addsPunctuation: true,
      contextualStrings: HINTS,
    });
  }
  function stop() {
    ExpoSpeechRecognitionModule.stop();
  }
  return { available, listening, error, start, stop };
}

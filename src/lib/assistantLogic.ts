// lib/assistantLogic.ts
// Drop-in replacement — same exports as before, now with real AI + robust TTS

export type VoiceStatus = 'idle' | 'listening' | 'processing' | 'speaking' | 'error';

// ─── AI Response via Anthropic API ────────────────────────────────────────────

export async function getAssistantResponse(
  userMessage: string,
  data: any
): Promise<string> {
  const systemPrompt = `You are a helpful energy assistant embedded in a home energy dashboard.
The user's current energy data is: ${JSON.stringify(data, null, 2)}

Keep responses SHORT (2-3 sentences max) and conversational — they will be spoken aloud.
Focus on: predicted bills, energy savings, usage comparisons, efficiency tips.
Use plain text only — no markdown, no bullet points, no symbols like ₹ (say "rupees" instead).
Be friendly and specific to their actual data.`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        system: systemPrompt,
        messages: [{ role: 'user', content: userMessage }],
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      console.error('Anthropic API error:', err);
      return fallbackResponse(userMessage, data);
    }

    const result = await response.json();
    const text = result?.content?.[0]?.text?.trim();
    return text || fallbackResponse(userMessage, data);
  } catch (err) {
    console.error('Network error calling Anthropic:', err);
    return fallbackResponse(userMessage, data);
  }
}

// Graceful fallback if API is unreachable
function fallbackResponse(message: string, data: any): string {
  const lower = message.toLowerCase();
  const sim = data?.simulation;

  if (lower.includes('bill') || lower.includes('cost')) {
    return sim?.predictedBill
      ? `Your predicted bill is ${sim.predictedBill} rupees based on your current usage of ${sim.predictedUsage} kilowatt hours.`
      : "I couldn't retrieve your bill data right now. Try refreshing the page.";
  }
  if (lower.includes('save') || lower.includes('saving')) {
    return sim?.savings != null
      ? sim.savings >= 0
        ? `You could save ${sim.savings} rupees compared to your baseline. Try reducing AC usage for bigger savings.`
        : `Your current settings cost ${Math.abs(sim.savings)} rupees more than baseline. Switch appliances to Eco mode to reduce costs.`
      : "Check the Savings Simulator on your dashboard to explore ways to cut your bill.";
  }
  if (lower.includes('score')) {
    return sim?.predictedScore
      ? `Your efficiency score is ${sim.predictedScore}. Scores above 70 are considered good.`
      : "Your score reflects your overall energy efficiency compared to similar households.";
  }
  if (lower.includes('average') || lower.includes('above') || lower.includes('below')) {
    return sim?.predictedUsage && data?.context?.avgUsage
      ? sim.predictedUsage > data.context.avgUsage
        ? `You're using ${sim.predictedUsage} kilowatt hours versus the average of ${data.context.avgUsage}. You're above average.`
        : `Great news — you're using less than the community average of ${data.context.avgUsage} kilowatt hours.`
      : "Your usage is compared to similar households in your community benchmark section.";
  }
  return "I'm having trouble connecting right now. Please check your internet and try again in a moment.";
}

// ─── Voice Input (Speech Recognition) ────────────────────────────────────────

type SpeechRecognitionInstance = any;

export function startListening(
  onResult: (transcript: string) => void,
  onStatusChange: (status: VoiceStatus) => void,
  onError: (message: string) => void
): (() => void) | null {
  const SpeechRecognition =
    (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

  if (!SpeechRecognition) {
    onError('Voice input is not supported in this browser. Try Chrome or Edge.');
    onStatusChange('error');
    return null;
  }

  const recognition: SpeechRecognitionInstance = new SpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = 'en-US';
  recognition.maxAlternatives = 1;

  let stopped = false;

  recognition.onstart = () => onStatusChange('listening');

  recognition.onresult = (event: any) => {
    const transcript = event.results[0]?.[0]?.transcript?.trim();
    if (transcript) {
      onStatusChange('processing');
      onResult(transcript);
    }
  };

  recognition.onerror = (event: any) => {
    if (stopped) return;
    const msg =
      event.error === 'not-allowed'
        ? 'Microphone access denied. Please allow microphone permissions.'
        : event.error === 'no-speech'
        ? 'No speech detected. Please try again.'
        : `Voice error: ${event.error}`;
    onError(msg);
    onStatusChange('error');
  };

  recognition.onend = () => {
    if (!stopped) onStatusChange('idle');
  };

  try {
    recognition.start();
  } catch (e) {
    onError('Could not start voice recognition. Please try again.');
    return null;
  }

  return () => {
    stopped = true;
    try { recognition.stop(); } catch (_) {}
  };
}

// ─── TTS (Text-to-Speech) — Edge/Chrome robust version ───────────────────────

let currentUtterance: SpeechSynthesisUtterance | null = null;
let ttsHeartbeat: ReturnType<typeof setInterval> | null = null;

export function speakResponse(
  text: string,
  _voiceName?: string,
  onDone?: () => void
): void {
  if (!window.speechSynthesis) {
    onDone?.();
    return;
  }

  cancelSpeech();

  // Strip markdown/symbols that sound bad when spoken
  const cleaned = text
    .replace(/[*_`#]/g, '')
    .replace(/₹/g, 'rupees ')
    .replace(/kWh/gi, 'kilowatt hours')
    .replace(/\s+/g, ' ')
    .trim();

  // Edge/Chrome bug: long utterances cut off silently after ~15 seconds.
  // Fix: split into sentences and chain them.
  const sentences = cleaned.match(/[^.!?]+[.!?]*/g)?.map(s => s.trim()).filter(Boolean) ?? [cleaned];

  let index = 0;

  const speakNext = () => {
    if (index >= sentences.length) {
      cleanup();
      onDone?.();
      return;
    }

    const utt = new SpeechSynthesisUtterance(sentences[index]);
    utt.rate = 1.0;
    utt.pitch = 1.0;
    utt.volume = 1.0;
    currentUtterance = utt;

    // Pick a natural-sounding voice if available
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(v =>
      v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Neural') || v.name.includes('Online'))
    ) || voices.find(v => v.lang.startsWith('en'));
    if (preferred) utt.voice = preferred;

    utt.onend = () => {
      index++;
      speakNext();
    };

    utt.onerror = (e) => {
      // 'interrupted' is normal when cancelled — don't treat as failure
      if ((e as any).error !== 'interrupted') {
        console.warn('TTS error on sentence', index, (e as any).error);
      }
      cleanup();
      onDone?.();
    };

    // Edge/Chrome heartbeat fix: the speech engine can silently pause.
    // Resuming every 10s keeps it alive.
    if (ttsHeartbeat) clearInterval(ttsHeartbeat);
    ttsHeartbeat = setInterval(() => {
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.pause();
        window.speechSynthesis.resume();
      } else {
        clearInterval(ttsHeartbeat!);
        ttsHeartbeat = null;
      }
    }, 10000);

    window.speechSynthesis.speak(utt);
  };

  // Voices may not be loaded yet on first call
  if (window.speechSynthesis.getVoices().length === 0) {
    window.speechSynthesis.onvoiceschanged = () => {
      window.speechSynthesis.onvoiceschanged = null;
      speakNext();
    };
  } else {
    speakNext();
  }
}

function cleanup() {
  if (ttsHeartbeat) {
    clearInterval(ttsHeartbeat);
    ttsHeartbeat = null;
  }
  currentUtterance = null;
}

export function cancelSpeech(): void {
  cleanup();
  try { window.speechSynthesis.cancel(); } catch (_) {}
}
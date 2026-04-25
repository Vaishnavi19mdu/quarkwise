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

// ─── Fallback responses (used when API is unreachable) ────────────────────────

function fallbackResponse(message: string, data: any): string {
  const lower = message.toLowerCase().trim();
  const sim = data?.simulation;
  const ctx = data?.context;

  // ── Greetings ──
  if (/^(hi|hello|hey|howdy|sup|what'?s up|yo)\b/.test(lower)) {
    return "Hey! I'm your energy assistant. Ask me about your bill, usage, savings, or tips to cut costs.";
  }

  // ── How are you / feelings ──
  if (/how are you|how('?re| are) (you|things)|you good|you okay/.test(lower)) {
    return "I'm doing great, thanks for asking! Ready to help you save on your energy bill.";
  }

  // ── What can you do / help ──
  if (/what can you (do|help)|what do you (do|know)|help me|what are you/.test(lower)) {
    return "I can answer questions about your predicted bill, energy score, usage vs the community average, and tips to cut your electricity costs. Just ask!";
  }

  // ── Thanks ──
  if (/^(thanks|thank you|thx|ty|cheers|great|awesome|nice|cool|perfect)\b/.test(lower)) {
    return "Happy to help! Let me know if you have any more questions about your energy usage.";
  }

  // ── Bye / goodbye ──
  if (/^(bye|goodbye|see you|later|cya|take care)\b/.test(lower)) {
    return "See you! Keep an eye on your usage and stay energy efficient!";
  }

  // ── Who are you ──
  if (/who are you|what are you|are you (a bot|ai|robot|human)/.test(lower)) {
    return "I'm Quarkwise's energy assistant, an AI built to help you understand and reduce your electricity usage.";
  }

  // ── Bill / cost ──
  if (/bill|cost|pay|rupee|amount/.test(lower)) {
    return sim?.predictedBill
      ? `Your predicted bill is ${sim.predictedBill} rupees based on your current usage of ${sim.predictedUsage} kilowatt hours.`
      : "I couldn't retrieve your bill data right now. Try refreshing the page.";
  }

  // ── Savings ──
  if (/save|saving|reduc|cut/.test(lower)) {
    return sim?.savings != null
      ? sim.savings >= 0
        ? `You could save ${sim.savings} rupees compared to your baseline. Try reducing AC usage for bigger savings.`
        : `Your current settings cost ${Math.abs(sim.savings)} rupees more than baseline. Switch appliances to Eco mode to reduce costs.`
      : "Check the Savings Simulator on your dashboard to explore ways to cut your bill.";
  }

  // ── Score ──
  if (/score|rating|efficien/.test(lower)) {
    return sim?.predictedScore
      ? `Your efficiency score is ${sim.predictedScore} out of 100. Scores above 70 are considered good — keep reducing AC hours to improve it.`
      : "Your score reflects your overall energy efficiency compared to similar households.";
  }

  // ── Usage / consumption ──
  if (/usage|using|consum|kwh|unit/.test(lower)) {
    return sim?.predictedUsage
      ? `Your predicted usage this month is ${sim.predictedUsage} kilowatt hours. Your baseline was ${sim.baseUsage} kilowatt hours.`
      : "Your usage data is shown on the dashboard. Try the simulator to see how changes affect your consumption.";
  }

  // ── Average / community ──
  if (/average|above|below|community|neighbour|compare/.test(lower)) {
    return sim?.predictedUsage && ctx?.avgUsage
      ? sim.predictedUsage > ctx.avgUsage
        ? `You're using ${sim.predictedUsage} kilowatt hours versus the community average of ${ctx.avgUsage}. You're above average — the simulator can help you close that gap.`
        : `You're doing well! Your usage of ${sim.predictedUsage} kilowatt hours is below the community average of ${ctx.avgUsage}.`
      : "Your usage is compared to similar households in the community benchmark section on the dashboard.";
  }

  // ── AC / appliances ──
  if (/ac|air con|appliance|fan|fridge|tv|washing/.test(lower)) {
    return `AC is usually the biggest energy consumer. Reducing daily AC hours even by one or two can noticeably lower your bill. Check the simulator to see the impact.`;
  }

  // ── Tips ──
  if (/tip|advice|suggest|recommend|improve|better/.test(lower)) {
    return "Top tips: reduce AC runtime during peak hours, switch to 5-star rated appliances, and unplug devices on standby. These can cut usage by up to 20 percent.";
  }

  // ── Dashboard / navigation ──
  if (/dashboard|report|insight|simulator|chart|graph/.test(lower)) {
    return "You can explore the Simulator to model savings, the Reports page for a full breakdown, and the Insights section for personalised recommendations — all in the sidebar.";
  }

  // ── Default ──
  return "I'm not sure about that one, but I can help with your bill, energy score, usage comparisons, or saving tips. What would you like to know?";
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

  const cleaned = text
    .replace(/[*_`#]/g, '')
    .replace(/₹/g, 'rupees ')
    .replace(/kWh/gi, 'kilowatt hours')
    .replace(/\s+/g, ' ')
    .trim();

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
      if ((e as any).error !== 'interrupted') {
        console.warn('TTS error on sentence', index, (e as any).error);
      }
      cleanup();
      onDone?.();
    };

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
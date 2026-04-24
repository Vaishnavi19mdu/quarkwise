import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Box, Paper, Typography, IconButton, TextField, Stack } from '@mui/material';
import { MessageCircle, X, Send, Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import {
  getAssistantResponse,
  startListening,
  speakResponse,
  cancelSpeech,
  VoiceStatus,
} from '../lib/assistantLogic';

interface Message {
  role: 'user' | 'assistant';
  text: string;
  loading?: boolean;
}

const SUGGESTIONS = [
  "What's my predicted bill?",
  "How can I save more?",
  "Why is my score low?",
  "Am I above average?",
];

export const Assistant = ({ data }: { data: any }) => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', text: "Hi! I'm your energy assistant. Ask me anything about your usage, bill, or how to save." },
  ]);
  const [input, setInput] = useState('');
  const [voiceStatus, setVoiceStatus] = useState<VoiceStatus>('idle');
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [voiceError, setVoiceError] = useState('');
  const stopListeningRef = useRef<(() => void) | null>(null);
  const voiceStatusRef = useRef<VoiceStatus>('idle');
  const bottomRef = useRef<HTMLDivElement>(null);
  const isSendingRef = useRef(false);

  const setStatus = useCallback((s: VoiceStatus) => {
    voiceStatusRef.current = s;
    setVoiceStatus(s);
  }, []);

  // Prime TTS on first open (Edge/Chrome require a user-gesture before speak())
  const primedRef = useRef(false);
  const handleOpen = useCallback(() => {
    setOpen(o => {
      const next = !o;
      if (next && !primedRef.current && window.speechSynthesis) {
        primedRef.current = true;
        const primer = new SpeechSynthesisUtterance('');
        primer.volume = 0;
        window.speechSynthesis.speak(primer);
      }
      return next;
    });
  }, []);

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  useEffect(() => () => { stopListeningRef.current?.(); cancelSpeech(); }, []);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isSendingRef.current) return;
    isSendingRef.current = true;

    const userMsg: Message = { role: 'user', text: text.trim() };
    // Add a loading placeholder for the assistant
    const loadingMsg: Message = { role: 'assistant', text: '…', loading: true };
    setMessages(prev => [...prev, userMsg, loadingMsg]);
    setInput('');
    setStatus('processing');

    try {
      const response = await getAssistantResponse(text, data);
      // Replace loading placeholder with real response
      setMessages(prev => {
        const updated = [...prev];
        let idx = -1;
        for (let i = updated.length - 1; i >= 0; i--) { if (updated[i].loading) { idx = i; break; } }
        if (idx !== -1) updated[idx] = { role: 'assistant', text: response };
        return updated;
      });

      if (ttsEnabled) {
        setStatus('speaking');
        speakResponse(response, undefined, () => setStatus('idle'));
      } else {
        setStatus('idle');
      }
    } catch (err) {
      setMessages(prev => {
        const updated = [...prev];
        let idx = -1;
        for (let i = updated.length - 1; i >= 0; i--) { if (updated[i].loading) { idx = i; break; } }
        if (idx !== -1) updated[idx] = { role: 'assistant', text: "Sorry, I couldn't reach the server. Please try again." };
        return updated;
      });
      setStatus('idle');
    } finally {
      isSendingRef.current = false;
    }
  }, [data, ttsEnabled, setStatus]);

  const handleVoice = useCallback(() => {
    if (voiceStatus === 'listening') {
      stopListeningRef.current?.();
      setStatus('idle');
      return;
    }
    if (voiceStatus === 'speaking') {
      cancelSpeech();
      setStatus('idle');
      return;
    }

    setVoiceError('');
    const stop = startListening(
      (transcript) => {
        setStatus('processing');
        sendMessage(transcript);
      },
      (s) => {
        if (s === 'idle' && (voiceStatusRef.current === 'processing' || voiceStatusRef.current === 'speaking')) return;
        setStatus(s);
      },
      (err) => { setVoiceError(err); setStatus('idle'); }
    );
    if (stop) stopListeningRef.current = stop;
  }, [voiceStatus, sendMessage, setStatus]);

  const voiceLabel =
    voiceStatus === 'listening' ? 'Listening…'
    : voiceStatus === 'processing' ? 'Thinking…'
    : voiceStatus === 'speaking' ? 'Speaking…'
    : voiceStatus === 'error' ? 'Voice unavailable'
    : '';

  const micColor =
    voiceStatus === 'listening' ? 'text-red-500'
    : voiceStatus === 'speaking' ? 'text-secondary'
    : 'text-slate-400';

  const isbusy = voiceStatus === 'processing' || voiceStatus === 'speaking' || isSendingRef.current;

  return (
    <>
      {/* FAB */}
      <motion.div className="fixed bottom-6 right-6 z-50" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <IconButton
          onClick={handleOpen}
          sx={{ backgroundColor: '#2F6F73', color: '#fff', width: 56, height: 56, '&:hover': { backgroundColor: '#245558' } }}
        >
          {open ? <X size={22} /> : <MessageCircle size={22} />}
        </IconButton>
      </motion.div>

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-6 z-50 w-[360px]"
          >
            <Paper className="flex flex-col border border-slate-100 overflow-hidden shadow-2xl rounded-3xl" style={{ height: 500 }}>

              {/* Header */}
              <Box className="p-4 flex items-center justify-between" sx={{ backgroundColor: '#2F6F73' }}>
                <div>
                  <Typography variant="subtitle1" sx={{ color: '#fff', fontWeight: 900, lineHeight: 1 }}>Energy Assistant</Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>Ask anything about your usage</Typography>
                </div>
                <IconButton
                  size="small"
                  onClick={() => { setTtsEnabled(t => !t); if (ttsEnabled) cancelSpeech(); }}
                  title={ttsEnabled ? 'Mute voice responses' : 'Unmute voice responses'}
                  sx={{ color: 'rgba(255,255,255,0.7)', '&:hover': { color: '#fff' } }}
                >
                  {ttsEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
                </IconButton>
              </Box>

              {/* Messages */}
              <Box className="flex-1 overflow-y-auto p-4 bg-slate-50" style={{ scrollbarWidth: 'thin' }}>
                <Stack spacing={2}>
                  {messages.map((msg, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <Box
                        className={`px-4 py-2.5 rounded-2xl text-sm font-medium max-w-[80%] leading-relaxed ${
                          msg.role === 'user'
                            ? 'bg-secondary text-white rounded-tr-sm'
                            : 'bg-white border border-slate-100 text-slate-700 rounded-tl-sm shadow-sm'
                        }`}
                        sx={msg.role === 'user' ? { backgroundColor: '#2F6F73' } : {}}
                      >
                        {msg.loading ? (
                          // Animated dots for loading state
                          <span className="flex gap-1 items-center h-4">
                            {[0,1,2].map(d => (
                              <motion.span
                                key={d}
                                className="inline-block w-1.5 h-1.5 rounded-full bg-slate-400"
                                animate={{ opacity: [0.3, 1, 0.3] }}
                                transition={{ duration: 1.2, repeat: Infinity, delay: d * 0.2 }}
                              />
                            ))}
                          </span>
                        ) : msg.text}
                      </Box>
                    </motion.div>
                  ))}

                  {/* Voice status */}
                  {voiceLabel && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                      <Box className="px-4 py-2 rounded-2xl text-xs font-bold flex items-center gap-2"
                        sx={{ backgroundColor: 'rgba(47,111,115,0.1)', color: '#2F6F73' }}>
                        <motion.span
                          className="inline-block w-2 h-2 rounded-full"
                          animate={{ opacity: [1, 0.3, 1] }}
                          transition={{ duration: 1, repeat: Infinity }}
                          style={{ backgroundColor: voiceStatus === 'listening' ? '#ef4444' : '#2F6F73' }}
                        />
                        {voiceLabel}
                      </Box>
                    </motion.div>
                  )}

                  {voiceError && (
                    <Typography variant="caption" className="text-red-400 text-center block">{voiceError}</Typography>
                  )}
                  <div ref={bottomRef} />
                </Stack>
              </Box>

              {/* Suggestions */}
              {messages.length <= 1 && (
                <Box className="px-4 py-2 bg-white border-t border-slate-100 flex gap-2 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
                  {SUGGESTIONS.map(s => (
                    <button
                      key={s}
                      onClick={() => sendMessage(s)}
                      className="shrink-0 px-3 py-1.5 text-xs font-bold rounded-full hover:opacity-80 transition-opacity whitespace-nowrap"
                      style={{ color: '#2F6F73', backgroundColor: 'rgba(47,111,115,0.1)' }}
                    >
                      {s}
                    </button>
                  ))}
                </Box>
              )}

              {/* Input bar */}
              <Box className="p-3 bg-white border-t border-slate-100 flex items-center gap-2">
                <IconButton
                  size="small"
                  onClick={handleVoice}
                  disabled={voiceStatus === 'processing'}
                  title={
                    voiceStatus === 'listening' ? 'Stop listening'
                    : voiceStatus === 'speaking' ? 'Stop speaking'
                    : 'Start voice input'
                  }
                  className={`transition-colors ${micColor}`}
                >
                  {voiceStatus === 'listening' ? <MicOff size={18} /> : <Mic size={18} />}
                </IconButton>

                <TextField
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey && !isbusy) {
                      e.preventDefault();
                      sendMessage(input);
                    }
                  }}
                  placeholder="Ask me anything…"
                  size="small"
                  fullWidth
                  variant="outlined"
                  disabled={isbusy}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                      fontSize: '13px',
                      '& fieldset': { borderColor: '#e2e8f0' },
                    }
                  }}
                />

                <IconButton
                  size="small"
                  onClick={() => sendMessage(input)}
                  disabled={!input.trim() || isbusy}
                  sx={{ color: '#2F6F73', '&:disabled': { color: '#cbd5e1' } }}
                >
                  <Send size={18} />
                </IconButton>
              </Box>
            </Paper>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
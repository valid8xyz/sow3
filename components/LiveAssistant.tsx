import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, Blob } from "@google/genai";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

const LiveAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');
  const [volume, setVolume] = useState(0);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isAudioOnly, setIsAudioOnly] = useState(true);

  // Audio Contexts and Nodes
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const inputNodeRef = useRef<GainNode | null>(null);
  const outputNodeRef = useRef<GainNode | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const sessionPromiseRef = useRef<Promise<any> | null>(null);
  const activeSessionRef = useRef<any>(null);

  const disconnect = async () => {
    if (activeSessionRef.current) {
      try {
        await activeSessionRef.current.close();
      } catch (e) {
        console.error("Error closing session", e);
      }
      activeSessionRef.current = null;
    }
    sessionPromiseRef.current = null;

    if (inputAudioContextRef.current) {
      await inputAudioContextRef.current.close();
      inputAudioContextRef.current = null;
    }
    if (outputAudioContextRef.current) {
      await outputAudioContextRef.current.close();
      outputAudioContextRef.current = null;
    }
    
    setStatus('disconnected');
    setVolume(0);
  };

  const connect = async () => {
    if (status === 'connected' || status === 'connecting') return;
    setStatus('connecting');

    try {
      // Initialize Audio Contexts
      inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      
      inputNodeRef.current = inputAudioContextRef.current.createGain();
      outputNodeRef.current = outputAudioContextRef.current.createGain();
      
      nextStartTimeRef.current = 0;

      // Get Microphone Stream
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Connect to Gemini Live
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
          onopen: () => {
            setStatus('connected');
            console.log("Gemini Live Connected");

            // Setup Audio Processing
            if (!inputAudioContextRef.current) return;
            
            const source = inputAudioContextRef.current.createMediaStreamSource(stream);
            const scriptProcessor = inputAudioContextRef.current.createScriptProcessor(4096, 1, 1);
            
            scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
              const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
              
              // Simple volume visualization
              let sum = 0;
              for (let i = 0; i < inputData.length; i++) {
                sum += inputData[i] * inputData[i];
              }
              const rms = Math.sqrt(sum / inputData.length);
              setVolume(Math.min(rms * 10, 1)); // Scale for visualization

              const pcmBlob = createBlob(inputData);
              
              sessionPromise.then((session) => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };

            source.connect(scriptProcessor);
            scriptProcessor.connect(inputAudioContextRef.current.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            
            if (base64Audio && outputAudioContextRef.current && outputNodeRef.current) {
              const ctx = outputAudioContextRef.current;
              
              // Sync timing
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
              
              const audioBuffer = await decodeAudioData(decode(base64Audio), ctx, 24000, 1);
              
              const source = ctx.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(outputNodeRef.current);
              outputNodeRef.current.connect(ctx.destination);
              
              source.addEventListener('ended', () => {
                sourcesRef.current.delete(source);
              });
              
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
              sourcesRef.current.add(source);
            }

            if (message.serverContent?.interrupted) {
              // Handle interruption - stop current audio
              sourcesRef.current.forEach(source => source.stop());
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onclose: () => {
            setStatus('disconnected');
            console.log("Gemini Live Closed");
          },
          onerror: (e) => {
            console.error("Gemini Live Error", e);
            setStatus('error');
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } }
          },
          systemInstruction: "You are a helpful compliance assistant for SOW Muncher. You help users understand Statements of Work, compliance rules, and fair market rates. Keep responses concise and professional."
        }
      });

      sessionPromiseRef.current = sessionPromise;
      activeSessionRef.current = await sessionPromise;

    } catch (err) {
      console.error("Failed to connect", err);
      setStatus('error');
    }
  };

  // Helper functions for audio processing
  function createBlob(data: Float32Array): Blob {
    const l = data.length;
    const int16 = new Int16Array(l);
    for (let i = 0; i < l; i++) {
      int16[i] = data[i] * 32768;
    }
    return {
      data: encode(new Uint8Array(int16.buffer)),
      mimeType: 'audio/pcm;rate=16000',
    };
  }

  function encode(bytes: Uint8Array) {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  function decode(base64: string) {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  }

  async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < frameCount; i++) {
        channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
      }
    }
    return buffer;
  }

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, []);

  // Toggle logic
  const toggleLive = () => {
    if (isOpen) {
      setIsOpen(false);
      disconnect();
    } else {
      setIsOpen(true);
      connect();
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={toggleLive}
        className={`fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-lg transition-all duration-300 flex items-center gap-2
          ${status === 'connected' ? 'bg-red-500 hover:bg-red-600 animate-pulse' : 'bg-brand-600 hover:bg-brand-700'}
          text-white
        `}
      >
        {status === 'connected' ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
        )}
        <span className="font-medium">{status === 'connected' ? 'Stop Live' : 'Ask AI'}</span>
      </button>

      {/* Visualizer Modal Overlay */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 p-6 animate-fade-in">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              Gemini Live
            </h3>
            <span className="text-xs bg-slate-100 text-slate-500 px-2 py-1 rounded uppercase tracking-wider font-medium">{status}</span>
          </div>
          
          <div className="h-32 bg-slate-900 rounded-xl flex items-center justify-center mb-4 relative overflow-hidden">
            {/* Simple Audio Visualizer */}
            <div className="flex items-center justify-center gap-1 h-full w-full">
              {[...Array(5)].map((_, i) => (
                <div 
                  key={i}
                  className="w-2 bg-brand-500 rounded-full transition-all duration-75"
                  style={{ 
                    height: status === 'connected' ? `${Math.max(10, volume * 100 * (Math.random() + 0.5))}%` : '10%',
                    opacity: status === 'connected' ? 1 : 0.3
                  }}
                ></div>
              ))}
            </div>
            {status === 'error' && <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-red-400 font-bold">Connection Error</div>}
          </div>

          <p className="text-sm text-slate-600 text-center">
            {status === 'connecting' && "Establishing secure connection..."}
            {status === 'connected' && "Listening... Ask about compliance rules or rates."}
            {status === 'disconnected' && "Disconnected."}
          </p>
        </div>
      )}
    </>
  );
};

export default LiveAssistant;

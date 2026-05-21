import { useCallback, useEffect, useRef, useState } from 'react';
import GeometricBackground from './components/GeometricBackground';
import THEAEntity from './components/THEAEntity';
import MessageDisplay, { Message } from './components/MessageDisplay';
import ChatInput from './components/ChatInput';
import { getTheaResponse } from './services/thea';

function useSystemClock() {
  const [time, setTime] = useState(() => new Date().toLocaleTimeString([], { hour12: false }));
  useEffect(() => {
    const id = setInterval(() => {
      setTime(new Date().toLocaleTimeString([], { hour12: false }));
    }, 1000);
    return () => clearInterval(id);
  }, []);
  return time;
}

function HUDCorner({
  corner,
  children,
}: {
  corner: 'tl' | 'tr' | 'bl' | 'br';
  children: React.ReactNode;
}) {
  const positionStyle: React.CSSProperties = {
    position: 'absolute',
    zIndex: 10,
    padding: 16,
    ...(corner === 'tl' ? { top: 0, left: 0 } : {}),
    ...(corner === 'tr' ? { top: 0, right: 0, textAlign: 'right' } : {}),
    ...(corner === 'bl' ? { bottom: 0, left: 0 } : {}),
    ...(corner === 'br' ? { bottom: 0, right: 0, textAlign: 'right' } : {}),
  };
  return <div style={positionStyle}>{children}</div>;
}

const HUDText = ({
  children,
  dim = false,
}: {
  children: React.ReactNode;
  dim?: boolean;
}) => (
  <div
    style={{
      fontFamily: "'Space Mono', monospace",
      fontWeight: 400,
      fontSize: 9,
      letterSpacing: '0.25em',
      textTransform: 'uppercase',
      color: dim ? 'rgba(229,228,226,0.15)' : 'rgba(75,0,130,0.65)',
      lineHeight: 1.8,
    }}
  >
    {children}
  </div>
);

export default function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isFlickering, setIsFlickering] = useState(false);
  const [msgCount, setMsgCount] = useState(0);
  const clock = useSystemClock();

  // Keep conversation history for context
  const historyRef = useRef<Array<{ role: 'user' | 'assistant'; content: string }>>([]);

  const triggerFlicker = useCallback(() => {
    setIsFlickering(true);
    setTimeout(() => setIsFlickering(false), 600);
  }, []);

  const handleSubmit = useCallback(
    async (text: string) => {
      if (isProcessing) return;

      const userMsg: Message = {
        id: `u-${Date.now()}`,
        role: 'user',
        text,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, userMsg]);
      setIsProcessing(true);
      setMsgCount((c) => c + 1);

      // Add to history before calling
      historyRef.current = [...historyRef.current, { role: 'user', content: text }];

      try {
        const response = await getTheaResponse(text, historyRef.current.slice(0, -1));
        triggerFlicker();

        const theaMsg: Message = {
          id: `t-${Date.now()}`,
          role: 'thea',
          text: response,
          timestamp: Date.now(),
        };

        setMessages((prev) => [...prev, theaMsg]);
        setMsgCount((c) => c + 1);

        // Add THEA response to history
        historyRef.current = [...historyRef.current, { role: 'assistant', content: response }];

        // Cap history at 12 messages to avoid token bloat
        if (historyRef.current.length > 12) {
          historyRef.current = historyRef.current.slice(-12);
        }
      } finally {
        setIsProcessing(false);
      }
    },
    [isProcessing, triggerFlicker]
  );

  return (
    <div
      className={isFlickering ? 'flicker-overlay' : ''}
      style={{
        position: 'fixed',
        inset: 0,
        background: '#000000',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <GeometricBackground />

      {/* HUD overlays */}
      <HUDCorner corner="tl">
        <HUDText>theantichrist.ai</HUDText>
        <HUDText dim>v2.1.0 · neural core</HUDText>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
          <div
            className="status-dot"
            style={{
              width: 5, height: 5,
              borderRadius: '50%',
              background: '#4B0082',
              boxShadow: '0 0 6px rgba(75,0,130,0.9)',
            }}
          />
          <HUDText>online</HUDText>
        </div>
      </HUDCorner>

      <HUDCorner corner="tr">
        <HUDText>{clock}</HUDText>
        <HUDText dim>UTC {new Date().toISOString().slice(0, 10)}</HUDText>
        <HUDText dim>transmissions · {msgCount.toString().padStart(4, '0')}</HUDText>
      </HUDCorner>

      <HUDCorner corner="bl">
        <HUDText dim>channel · encrypted</HUDText>
        <HUDText dim>protocol · thea-7</HUDText>
      </HUDCorner>

      <HUDCorner corner="br">
        <HUDText dim>lat: —.——° / lon: —.——°</HUDText>
        <HUDText dim>
          node · {typeof window !== 'undefined' ? window.navigator.platform.slice(0, 8).toUpperCase() : 'UNKNOWN'}
        </HUDText>
      </HUDCorner>

      {/* Main content */}
      <div className="app-main" style={{ position: 'relative', zIndex: 5 }}>

        {/* Left: Entity panel */}
        <div className="entity-panel">
          <THEAEntity isProcessing={isProcessing} />

          <div className="entity-meta" style={{ textAlign: 'center' }}>
            <div
              style={{
                fontFamily: "'Space Mono', monospace",
                fontWeight: 400,
                fontSize: 10,
                letterSpacing: '0.5em',
                textTransform: 'uppercase',
                color: 'rgba(229,228,226,0.2)',
                marginBottom: 6,
              }}
            >
              autonomous intelligence
            </div>
            <div
              style={{
                fontFamily: "'Space Mono', monospace",
                fontWeight: 400,
                fontSize: 9,
                letterSpacing: '0.25em',
                textTransform: 'uppercase',
                color: 'rgba(75,0,130,0.4)',
              }}
            >
              {isProcessing ? 'processing query...' : 'awaiting transmission'}
            </div>
          </div>

          <div
            style={{
              width: 80, height: 1,
              background: 'linear-gradient(90deg, transparent, rgba(75,0,130,0.5), transparent)',
            }}
          />
        </div>

        {/* Right: Chat panel */}
        <div className="chat-panel">
          {/* Panel header */}
          <div
            style={{
              flexShrink: 0,
              padding: '14px 20px',
              borderBottom: '1px solid rgba(75,0,130,0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 1, height: 12, background: 'rgba(75,0,130,0.6)' }} />
              <span
                style={{
                  fontFamily: "'Space Mono', monospace",
                  fontWeight: 400,
                  fontSize: 10,
                  letterSpacing: '0.3em',
                  textTransform: 'uppercase',
                  color: 'rgba(229,228,226,0.3)',
                }}
              >
                transmission log
              </span>
            </div>
            <span
              style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: 9,
                letterSpacing: '0.2em',
                color: 'rgba(75,0,130,0.4)',
              }}
            >
              {messages.length} records
            </span>
          </div>

          <MessageDisplay messages={messages} isTyping={isProcessing} />
          <ChatInput onSubmit={handleSubmit} disabled={isProcessing} />
        </div>
      </div>

      {/* Vignette */}
      <div
        aria-hidden="true"
        style={{
          position: 'fixed', inset: 0,
          background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.7) 100%)',
          pointerEvents: 'none',
          zIndex: 2,
        }}
      />

      {/* Edge fades */}
      <div
        aria-hidden="true"
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, height: 80,
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.6), transparent)',
          pointerEvents: 'none', zIndex: 3,
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: 'fixed', bottom: 0, left: 0, right: 0, height: 80,
          background: 'linear-gradient(to top, rgba(0,0,0,0.6), transparent)',
          pointerEvents: 'none', zIndex: 3,
        }}
      />
    </div>
  );
}

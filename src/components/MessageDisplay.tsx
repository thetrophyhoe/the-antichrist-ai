import { useEffect, useRef, useState } from 'react';

export interface Message {
  id: string;
  role: 'user' | 'thea';
  text: string;
  timestamp: number;
}

interface MessageDisplayProps {
  messages: Message[];
  isTyping: boolean;
}

const BINARY_CHARS = '01';

function useGlitchReveal(target: string, active: boolean) {
  const [display, setDisplay] = useState('');
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!active || !target) {
      setDisplay(target);
      return;
    }

    setDisplay('');
    const duration = Math.min(2000, Math.max(800, target.length * 22));
    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const revealedCount = Math.floor(progress * target.length);

      let result = target.slice(0, revealedCount);
      for (let i = revealedCount; i < target.length; i++) {
        if (target[i] === ' ' && i > revealedCount - 3) {
          result += ' ';
        } else {
          result += BINARY_CHARS[Math.floor(Math.random() * BINARY_CHARS.length)];
        }
      }

      setDisplay(result);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        setDisplay(target);
      }
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [target, active]);

  return display;
}

function TheaMessage({ message, isLatest }: { message: Message; isLatest: boolean }) {
  const displayText = useGlitchReveal(message.text, isLatest && message.role === 'thea');

  const time = new Date(message.timestamp).toLocaleTimeString([], {
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
  });

  if (message.role === 'user') {
    return (
      <div className="fade-slide-up" style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <div style={{ maxWidth: '70%' }}>
          <div
            style={{
              padding: '10px 16px',
              borderRadius: '12px 12px 2px 12px',
              background: 'rgba(75,0,130,0.15)',
              border: '1px solid rgba(75,0,130,0.3)',
              color: 'rgba(229,228,226,0.8)',
              fontFamily: "'Syne', sans-serif",
              fontWeight: 400,
              fontSize: 13,
              lineHeight: 1.6,
              letterSpacing: '0.01em',
            }}
          >
            {message.text}
          </div>
          <div
            style={{
              textAlign: 'right',
              marginTop: 4,
              fontSize: 9,
              letterSpacing: '0.15em',
              color: 'rgba(229,228,226,0.2)',
              fontFamily: "'Space Mono', monospace",
            }}
          >
            {time}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fade-slide-up" style={{ display: 'flex', gap: 12, marginBottom: 16, alignItems: 'flex-start' }}>
      <div style={{ flexShrink: 0, paddingTop: 4 }}>
        <div
          style={{
            width: 6, height: 6,
            borderRadius: '50%',
            background: '#4B0082',
            boxShadow: '0 0 8px rgba(75,0,130,0.8)',
            marginTop: 8,
          }}
        />
      </div>

      <div style={{ flex: 1, maxWidth: '82%' }}>
        <div
          style={{
            fontSize: 9,
            letterSpacing: '0.3em',
            color: 'rgba(75,0,130,0.8)',
            textTransform: 'uppercase',
            fontFamily: "'Space Mono', monospace",
            fontWeight: 400,
            marginBottom: 6,
          }}
        >
          THEA · {time}
        </div>
        <div
          style={{
            padding: '12px 16px',
            borderRadius: '2px 12px 12px 12px',
            background: 'rgba(10,0,20,0.6)',
            border: '1px solid rgba(75,0,130,0.2)',
            borderLeftColor: 'rgba(75,0,130,0.6)',
            borderLeftWidth: 2,
            color: 'rgba(229,228,226,0.85)',
            fontFamily: "'Syne', sans-serif",
            fontWeight: 400,
            fontSize: 13,
            lineHeight: 1.7,
            letterSpacing: '0.01em',
            minHeight: 20,
          }}
        >
          {displayText || <span style={{ opacity: 0 }}>.</span>}
        </div>
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="fade-slide-up" style={{ display: 'flex', gap: 12, marginBottom: 16, alignItems: 'center' }}>
      <div
        style={{
          width: 6, height: 6,
          borderRadius: '50%',
          background: '#4B0082',
          boxShadow: '0 0 8px rgba(75,0,130,0.8)',
        }}
      />
      <div
        style={{
          padding: '10px 16px',
          background: 'rgba(10,0,20,0.6)',
          border: '1px solid rgba(75,0,130,0.2)',
          borderLeftColor: 'rgba(75,0,130,0.6)',
          borderLeftWidth: 2,
          borderRadius: '2px 12px 12px 12px',
          display: 'flex',
          gap: 5,
          alignItems: 'center',
        }}
      >
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              width: 4, height: 4,
              borderRadius: '50%',
              background: 'rgba(75,0,130,0.8)',
              animation: `statusBlink 1.2s ease-in-out infinite`,
              animationDelay: `${i * 0.25}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

export default function MessageDisplay({ messages, isTyping }: MessageDisplayProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  return (
    <div
      className="message-scroll"
      style={{
        flex: 1,
        overflowY: 'auto',
        padding: '16px 20px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: messages.length === 0 ? 'center' : 'flex-start',
      }}
    >
      {messages.length === 0 && !isTyping && (
        <div
          style={{
            textAlign: 'center',
            color: 'rgba(229,228,226,0.15)',
            fontFamily: "'Space Mono', monospace",
            fontWeight: 400,
            fontSize: 11,
            letterSpacing: '0.4em',
            textTransform: 'uppercase',
          }}
        >
          initiate transmission
        </div>
      )}

      {messages.map((msg, idx) => (
        <TheaMessage
          key={msg.id}
          message={msg}
          isLatest={idx === messages.length - 1}
        />
      ))}

      {isTyping && <TypingIndicator />}
      <div ref={bottomRef} />
    </div>
  );
}

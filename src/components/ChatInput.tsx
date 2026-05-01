import { FormEvent, KeyboardEvent, useRef, useState } from 'react';
import { Send } from 'lucide-react';

interface ChatInputProps {
  onSubmit: (text: string) => void;
  disabled: boolean;
}

export default function ChatInput({ onSubmit, disabled }: ChatInputProps) {
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e?: FormEvent) => {
    e?.preventDefault();
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSubmit(trimmed);
    setValue('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div style={{ padding: '0 20px 20px', flexShrink: 0 }}>
      <form onSubmit={handleSubmit} style={{ position: 'relative' }}>
        <div
          className="input-idle-glow"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '12px 16px',
            background: 'rgba(10,0,20,0.55)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid rgba(75,0,130,0.4)',
            borderRadius: 8,
            transition: 'box-shadow 0.2s ease',
          }}
        >
          <span
            style={{
              flexShrink: 0,
              fontFamily: "'Space Mono', monospace",
              fontSize: 11,
              color: 'rgba(75,0,130,0.7)',
              letterSpacing: '0.1em',
              userSelect: 'none',
            }}
          >
            ›
          </span>

          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder="transmit message to THEA..."
            aria-label="Message input"
            autoComplete="off"
            spellCheck={false}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'rgba(229,228,226,0.85)',
              fontFamily: "'Syne', sans-serif",
              fontWeight: 400,
              fontSize: 13,
              letterSpacing: '0.02em',
              caretColor: '#4B0082',
            }}
          />

          <button
            type="submit"
            disabled={disabled || !value.trim()}
            aria-label="Send message"
            style={{
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 32,
              height: 32,
              borderRadius: 6,
              border: '1px solid rgba(75,0,130,0.4)',
              background: disabled || !value.trim() ? 'transparent' : 'rgba(75,0,130,0.2)',
              color: disabled || !value.trim() ? 'rgba(75,0,130,0.25)' : 'rgba(75,0,130,0.9)',
              cursor: disabled || !value.trim() ? 'default' : 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: disabled || !value.trim() ? 'none' : '0 0 10px rgba(75,0,130,0.3)',
            }}
          >
            <Send size={14} />
          </button>
        </div>

        <div
          style={{
            marginTop: 8,
            textAlign: 'center',
            fontSize: 9,
            letterSpacing: '0.3em',
            color: 'rgba(229,228,226,0.12)',
            fontFamily: "'Space Mono', monospace",
            textTransform: 'uppercase',
          }}
        >
          theantichrist.ai · secure channel
        </div>
      </form>
    </div>
  );
}

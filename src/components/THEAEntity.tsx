interface THEAEntityProps {
  isProcessing: boolean;
}

export default function THEAEntity({ isProcessing }: THEAEntityProps) {
  const SIZE = 420;

  return (
    <div
      role="img"
      aria-label="THEA — AI entity interface"
      style={{ position: 'relative', width: SIZE, height: SIZE, flexShrink: 0 }}
    >
      {/* Outer rotating dashed ring */}
      <div
        className="outer-ring"
        style={{
          position: 'absolute',
          inset: -24,
          borderRadius: '50%',
          border: '1px dashed rgba(75,0,130,0.35)',
        }}
      />

      {/* Middle rotating ring */}
      <div
        className="inner-ring"
        style={{
          position: 'absolute',
          inset: -12,
          borderRadius: '50%',
          border: '1px solid rgba(75,0,130,0.25)',
          borderTopColor: 'rgba(229,228,226,0.2)',
          borderRightColor: 'transparent',
        }}
      />

      {/* Main circular entity */}
      <div
        className="entity-core"
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          border: '2px solid rgba(75,0,130,0.6)',
          background: 'radial-gradient(circle at center, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.4) 100%)',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div className="scan-line" />

        {/* THEA face image */}
        <img
          src="/theaface.png"
          alt="THEA entity"
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center',
          }}
          onError={(e) => {
            // fallback if image not yet uploaded
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />

        {/* Purple overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(circle at center, transparent 20%, rgba(75,0,130,0.15) 100%)',
            pointerEvents: 'none',
          }}
        />

        {/* THEA label */}
        <div
          style={{
            position: 'absolute',
            bottom: 20,
            left: 0,
            right: 0,
            textAlign: 'center',
            zIndex: 2,
          }}
        >
          <span
            style={{
              fontFamily: "'Space Mono', monospace",
              fontWeight: 400,
              fontSize: 11,
              letterSpacing: '0.35em',
              color: 'rgba(229,228,226,0.7)',
              textTransform: 'uppercase',
              textShadow: '0 0 12px rgba(75,0,130,0.6)',
            }}
          >
            T H E A
          </span>
        </div>

        {/* Processing indicator */}
        {isProcessing && (
          <div
            style={{
              position: 'absolute',
              bottom: 4,
              left: 0,
              right: 0,
              textAlign: 'center',
              zIndex: 2,
            }}
          >
            <span
              style={{
                fontFamily: "'Space Mono', monospace",
                fontWeight: 400,
                fontSize: 8,
                letterSpacing: '0.25em',
                color: 'rgba(75,0,130,0.9)',
                textTransform: 'uppercase',
                textShadow: '0 0 8px rgba(75,0,130,0.8)',
              }}
            >
              processing
            </span>
          </div>
        )}
      </div>

      {/* Targeting brackets */}
      <div className="bracket bracket-tl" />
      <div className="bracket bracket-tr" />
      <div className="bracket bracket-bl" />
      <div className="bracket bracket-br" />

      {/* Tick marks */}
      {[
        { top: -12, left: '50%', width: 1, height: 6 },
        { bottom: -12, left: '50%', width: 1, height: 6 },
        { left: -12, top: '50%', width: 6, height: 1 },
        { right: -12, top: '50%', width: 6, height: 1 },
      ].map((s, i) => (
        <div
          key={i}
          style={{ position: 'absolute', background: 'rgba(75,0,130,0.5)', ...s }}
        />
      ))}
    </div>
  );
}

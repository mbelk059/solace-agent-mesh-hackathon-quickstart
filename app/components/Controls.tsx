'use client';

import { useState } from 'react';

interface ControlsProps {
  onTriggerAlert: () => void;
  onSimulateFailure: (agent: string) => void;
  onReset: () => void;
  isSimulating: boolean;
  agentNames: string[];
  samConnected?: boolean;
}

export default function Controls({
  onTriggerAlert,
  onSimulateFailure,
  onReset,
  isSimulating,
  agentNames,
  samConnected = true,
}: ControlsProps) {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <div
      style={{
        background: 'linear-gradient(145deg, #0a0e10 0%, #121619 100%)',
        border: '1px solid rgba(47, 227, 208, 0.2)',
        borderRadius: '16px',
        padding: '28px 32px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
      }}
    >
      <h2
        style={{
          marginBottom: '24px',
          fontSize: '1.1rem',
          fontWeight: 700,
          color: '#e8f4f8',
          letterSpacing: '1.2px',
          textTransform: 'uppercase',
          background: 'linear-gradient(135deg, #2fe3d0 0%, #a0d8f1 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}
      >
        Simulation Controls
      </h2>

      {/* PRIMARY ACTIONS */}
      <div
        style={{
          display: 'flex',
          gap: '16px',
          alignItems: 'center',
          flexWrap: 'wrap',
          marginBottom: '20px',
        }}
      >
        {/* TRIGGER BUTTON */}
        <button
          onClick={onTriggerAlert}
          disabled={isSimulating || !samConnected}
          onMouseEnter={() => setHovered('trigger')}
          onMouseLeave={() => setHovered(null)}
          style={{
            padding: '16px 36px',
            background: isSimulating || !samConnected
              ? 'linear-gradient(135deg, #1a2428 0%, #0f1518 100%)'
              : 'linear-gradient(135deg, #2fe3d0 0%, #18d4c4 100%)',
            color: isSimulating || !samConnected ? '#4a5a60' : '#000000',
            border: isSimulating || !samConnected ? '1px solid #2a3438' : '1px solid rgba(47, 227, 208, 0.4)',
            borderRadius: '12px',
            cursor: isSimulating || !samConnected ? 'not-allowed' : 'pointer',
            fontSize: '0.95rem',
            fontWeight: 700,
            letterSpacing: '1px',
            textTransform: 'uppercase',
            transform:
              hovered === 'trigger' && !isSimulating && samConnected
                ? 'translateY(-2px) scale(1.02)'
                : 'none',
            boxShadow: isSimulating || !samConnected
              ? 'inset 0 2px 4px rgba(0, 0, 0, 0.4)'
              : hovered === 'trigger'
              ? '0 8px 32px rgba(47, 227, 208, 0.6), 0 0 40px rgba(47, 227, 208, 0.3)'
              : '0 4px 16px rgba(47, 227, 208, 0.4)',
            transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {!samConnected ? '⚠️ SAM Not Connected' : isSimulating ? 'Simulating…' : 'Trigger AMBER Alert'}
        </button>

        {/* RESET BUTTON */}
        <button
          onClick={onReset}
          onMouseEnter={() => setHovered('reset')}
          onMouseLeave={() => setHovered(null)}
          style={{
            padding: '16px 32px',
            background: hovered === 'reset'
              ? 'rgba(160, 216, 241, 0.08)'
              : 'rgba(255, 255, 255, 0.03)',
            color: '#c8d8e0',
            border: '1px solid rgba(160, 216, 241, 0.3)',
            borderRadius: '12px',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: 600,
            letterSpacing: '0.8px',
            textTransform: 'uppercase',
            transform: hovered === 'reset' ? 'translateY(-2px)' : 'none',
            boxShadow:
              hovered === 'reset'
                ? '0 8px 24px rgba(160, 216, 241, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                : '0 2px 8px rgba(0, 0, 0, 0.3)',
            transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          Reset
        </button>
      </div>

      {/* FAILURE CONTROLS */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          flexWrap: 'wrap',
        }}
      >
        <span
          style={{
            color: '#8fa8b5',
            fontSize: '0.75rem',
            letterSpacing: '1.5px',
            textTransform: 'uppercase',
            fontWeight: 600,
            opacity: 0.8,
          }}
        >
          Failure Simulation
        </span>

        {agentNames.map((name) => (
          <button
            key={name}
            onClick={() => onSimulateFailure(name)}
            onMouseEnter={() => setHovered(name)}
            onMouseLeave={() => setHovered(null)}
            style={{
              padding: '9px 18px',
              background: hovered === name
                ? 'linear-gradient(135deg, rgba(47, 227, 208, 0.15) 0%, rgba(160, 216, 241, 0.1) 100%)'
                : 'rgba(255, 255, 255, 0.04)',
              color: hovered === name ? '#2fe3d0' : '#b8c8d0',
              border: hovered === name
                ? '1px solid rgba(47, 227, 208, 0.5)'
                : '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '10px',
              cursor: 'pointer',
              fontSize: '0.75rem',
              fontWeight: 600,
              letterSpacing: '0.5px',
              textTransform: 'uppercase',
              transform: hovered === name ? 'translateY(-2px) scale(1.05)' : 'none',
              boxShadow:
                hovered === name
                  ? '0 6px 20px rgba(47, 227, 208, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                  : '0 2px 6px rgba(0, 0, 0, 0.2)',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          >
            {name}
          </button>
        ))}
      </div>
    </div>
  );
}
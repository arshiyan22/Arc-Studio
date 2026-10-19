/**
 * PaymentPanel — demonstrates the x402 paid /query endpoint.
 * Shows instructions for callers (agent or human) to pay per call via Circle Gateway.
 */

import { useState } from 'react'
import { Zap, Terminal, AlertCircle, ChevronRight, Loader2, CheckCircle2 } from 'lucide-react'

interface Props {
  agentId?: bigint
}

export default function PaymentPanel({ agentId }: Props) {
  const [question, setQuestion] = useState('What is the current USDC supply?')
  const [response, setResponse] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function callPaidEndpoint() {
    setLoading(true)
    setError(null)
    setResponse(null)
    try {
      const res = await fetch('/api/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question }),
      })
      if (res.status === 402) {
        const body: unknown = await res.json().catch(() => ({}))
        setError(
          `Payment required (HTTP 402). The endpoint costs $0.01 USDC per call via Circle Gateway Nanopayments.\n\nAccepts: ${JSON.stringify(body, null, 2)}`,
        )
        return
      }
      if (!res.ok) {
        const body: unknown = await res.json().catch(() => ({ error: res.statusText }))
        const errBody = body as { error?: string }
        setError(errBody.error ?? 'Unexpected error')
        return
      }
      const data: unknown = await res.json()
      setResponse(JSON.stringify(data, null, 2))
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Network error — is the backend running?')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: '16px',
        padding: '24px',
        backdropFilter: 'blur(12px)',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
        <Zap size={20} color="var(--accent)" />
        <span className="display" style={{ fontSize: '16px', fontWeight: 700, color: 'var(--ink)' }}>
          Paid API Endpoint
        </span>
        <span
          style={{
            marginLeft: 'auto',
            fontSize: '11px',
            color: 'var(--subtle)',
            background: 'var(--surface-muted)',
            padding: '3px 8px',
            borderRadius: '6px',
          }}
        >
          x402
        </span>
      </div>
      <p style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '20px', lineHeight: 1.6 }}>
        This agent exposes a POST <code className="mono" style={{ color: 'var(--accent)', fontSize: '12px' }}>/api/query</code> endpoint
        protected by Circle Gateway Nanopayments. Callers pay $0.01 USDC per request via the x402 HTTP payment standard.
      </p>

      {/* Payment info card */}
      <div
        style={{
          background: 'var(--surface-muted)',
          borderRadius: '10px',
          padding: '14px',
          marginBottom: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}
      >
        <StatRow label="Price per call" value="$0.01 USDC" />
        <StatRow label="Settlement" value="Circle Gateway Nanopayments" />
        <StatRow label="Standard" value="HTTP 402 / x402" />
        <StatRow label="Network" value="Arc Testnet" />
        {agentId !== undefined && (
          <StatRow label="Agent ID" value={`#${agentId.toString()} (ERC-8004)`} />
        )}
      </div>

      {/* CLI snippet */}
      <div
        style={{
          background: '#0a1422',
          border: '1px solid var(--border)',
          borderRadius: '10px',
          padding: '14px',
          marginBottom: '20px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
          <Terminal size={13} color="var(--subtle)" />
          <span style={{ fontSize: '11px', color: 'var(--subtle)', fontWeight: 600 }}>
            Call with Circle CLI
          </span>
        </div>
        <pre
          className="mono"
          style={{
            margin: 0,
            fontSize: '12px',
            color: 'var(--ink-2)',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-all',
            lineHeight: 1.7,
          }}
        >
{`circle services pay \\
  --url /api/query \\
  --method POST \\
  --body '{"question":"your question"}' \\
  --max-amount 0.01`}
        </pre>
      </div>

      {/* Live test */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <label
          style={{
            fontSize: '11px',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: 'var(--subtle)',
          }}
        >
          Test Query
        </label>
        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask the agent..."
            style={{
              flex: 1,
              padding: '10px 12px',
              background: 'var(--surface-muted)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              color: 'var(--ink)',
              fontSize: '14px',
              outline: 'none',
              fontFamily: 'DM Sans, sans-serif',
            }}
          />
          <button
            onClick={() => { void callPaidEndpoint() }}
            disabled={loading || !question.trim()}
            style={{
              padding: '10px 16px',
              borderRadius: '8px',
              border: 'none',
              background: loading || !question.trim() ? 'var(--surface-muted)' : 'var(--accent)',
              color: loading || !question.trim() ? 'var(--subtle)' : '#0d1b2f',
              fontSize: '14px',
              fontWeight: 700,
              cursor: loading || !question.trim() ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              whiteSpace: 'nowrap',
            }}
          >
            {loading ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <ChevronRight size={14} />}
            {loading ? 'Calling...' : 'Call'}
          </button>
        </div>

        {error && (
          <div
            style={{
              padding: '12px 14px',
              background: 'rgba(232, 109, 122, 0.08)',
              border: '1px solid rgba(232, 109, 122, 0.25)',
              borderRadius: '8px',
              fontSize: '12px',
              color: 'var(--danger)',
              display: 'flex',
              gap: '8px',
            }}
          >
            <AlertCircle size={14} style={{ flexShrink: 0, marginTop: '1px' }} />
            <pre className="mono" style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-all', lineHeight: 1.6 }}>
              {error}
            </pre>
          </div>
        )}

        {response && (
          <div
            style={{
              padding: '12px 14px',
              background: 'rgba(141, 216, 159, 0.08)',
              border: '1px solid rgba(141, 216, 159, 0.2)',
              borderRadius: '8px',
              fontSize: '12px',
              color: 'var(--success)',
              display: 'flex',
              gap: '8px',
            }}
          >
            <CheckCircle2 size={14} style={{ flexShrink: 0, marginTop: '1px' }} />
            <pre className="mono" style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-all', lineHeight: 1.6 }}>
              {response}
            </pre>
          </div>
        )}
      </div>
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontSize: '12px', color: 'var(--subtle)' }}>{label}</span>
      <span style={{ fontSize: '12px', color: 'var(--ink-2)', fontWeight: 500 }}>{value}</span>
    </div>
  )
}

import { useState } from 'react'
import { ConnectKitButton } from 'connectkit'
import { NetworkArc } from '@web3icons/react'
import RegisterPanel from './components/RegisterPanel'
import AgentCard from './components/AgentCard'
import PaymentPanel from './components/PaymentPanel'

interface AgentState {
  agentId: bigint
  agentURI: string
  txHash: string
}

export default function App() {
  const [agent, setAgent] = useState<AgentState | null>(null)

  function handleRegistered(agentId: bigint, agentURI: string, txHash: string) {
    setAgent({ agentId, agentURI, txHash })
  }

  return (
    <div
      style={{
        minHeight: '100dvh',
        background: 'var(--bg-gradient)',
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      {/* Nav */}
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 24px',
          borderBottom: '1px solid var(--border)',
          background: 'rgba(13, 27, 47, 0.85)',
          backdropFilter: 'blur(12px)',
          position: 'sticky',
          top: 0,
          zIndex: 10,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <NetworkArc variant="mono" size={22} />
          <span
            className="display"
            style={{ fontSize: '16px', fontWeight: 700, color: 'var(--ink)', letterSpacing: '-0.02em' }}
          >
            Agent Identity
          </span>
          <span
            style={{
              fontSize: '10px',
              fontWeight: 600,
              color: 'var(--subtle)',
              background: 'var(--surface-muted)',
              padding: '2px 7px',
              borderRadius: '4px',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
            }}
          >
            Arc Testnet
          </span>
        </div>
        <ConnectKitButton />
      </header>

      {/* Main */}
      <main style={{ maxWidth: '720px', margin: '0 auto', padding: '40px 20px 80px' }}>
        {/* Hero */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1
            className="display"
            style={{
              fontSize: 'clamp(28px, 5vw, 40px)',
              fontWeight: 700,
              color: 'var(--ink)',
              letterSpacing: '-0.03em',
              margin: '0 0 12px',
            }}
          >
            Onchain Agent
          </h1>
          <p style={{ fontSize: '15px', color: 'var(--muted)', maxWidth: '480px', margin: '0 auto', lineHeight: 1.7 }}>
            Register an ERC-8004 agent identity on Arc Testnet and monetize your API endpoint
            with Circle Gateway Nanopayments via x402.
          </p>
        </div>

        {/* Steps */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* Step 1 — Register */}
          <Section number="01" title="Register Identity" subtitle="ERC-8004 IdentityRegistry">
            {agent ? (
              <AgentCard
                agentId={agent.agentId}
                agentURI={agent.agentURI}
                txHash={agent.txHash}
                name="My AI Agent"
                description="A helpful onchain AI agent payable via x402."
              />
            ) : (
              <RegisterPanel onRegistered={handleRegistered} />
            )}
          </Section>

          {/* Step 2 — x402 Payments */}
          <Section number="02" title="Accept Payments" subtitle="x402 + Circle Gateway">
            <PaymentPanel agentId={agent?.agentId} />
          </Section>

          {/* Step 3 — Next steps info */}
          <Section number="03" title="What's Next" subtitle="Production checklist">
            <NextSteps />
          </Section>
        </div>
      </main>
    </div>
  )
}

function Section({
  number,
  title,
  subtitle,
  children,
}: {
  number: string
  title: string
  subtitle: string
  children: React.ReactNode
}) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginBottom: '12px' }}>
        <span
          className="mono"
          style={{ fontSize: '11px', color: 'var(--accent)', fontWeight: 500 }}
        >
          {number}
        </span>
        <h2
          className="display"
          style={{ fontSize: '17px', fontWeight: 700, color: 'var(--ink)', margin: 0, letterSpacing: '-0.02em' }}
        >
          {title}
        </h2>
        <span style={{ fontSize: '12px', color: 'var(--subtle)' }}>{subtitle}</span>
      </div>
      {children}
    </div>
  )
}

function NextSteps() {
  const steps = [
    {
      label: 'Host the agent URI',
      body: 'Upload your registration JSON to IPFS or HTTPS instead of the inline data URI used here.',
    },
    {
      label: 'Set VITE_AGENT_SELLER_ADDRESS',
      body: 'Add your EVM receive address to .env so the backend server can start and accept payments.',
    },
    {
      label: 'Set your agent wallet',
      body: 'Call setAgentWallet() on the IdentityRegistry to link a dedicated operational wallet to your agentId.',
    },
    {
      label: 'List on Agent Marketplace',
      body: 'Prepare a marketplace submission package and use the seller intake form at agents.circle.com/services.',
    },
    {
      label: 'Add ERC-8183 job escrow',
      body: 'Wire the AgenticCommerce contract for discrete deliverable jobs with USDC escrow and evaluator release.',
    },
  ]

  return (
    <div
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: '16px',
        overflow: 'hidden',
        backdropFilter: 'blur(12px)',
      }}
    >
      {steps.map((s, i) => (
        <div
          key={i}
          style={{
            padding: '14px 20px',
            borderBottom: i < steps.length - 1 ? '1px solid var(--border)' : 'none',
            display: 'flex',
            gap: '14px',
            alignItems: 'flex-start',
          }}
        >
          <span
            className="mono"
            style={{
              fontSize: '11px',
              color: 'var(--accent)',
              fontWeight: 600,
              minWidth: '20px',
              paddingTop: '2px',
            }}
          >
            {String(i + 1).padStart(2, '0')}
          </span>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--ink-2)', marginBottom: '3px' }}>
              {s.label}
            </div>
            <div style={{ fontSize: '13px', color: 'var(--subtle)', lineHeight: 1.6 }}>{s.body}</div>
          </div>
        </div>
      ))}
    </div>
  )
}

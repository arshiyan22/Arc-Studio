/**
 * Shows the registered agent's onchain identity card.
 * Reads live data from the Arc Testnet ERC-8004 IdentityRegistry.
 */

import { useReadContract } from 'wagmi'
import { ExternalLink, Bot, ShieldCheck } from 'lucide-react'
import { buildAddressExplorerUrl, buildTxExplorerUrl } from '@/onchain-facts'

const ARC_TESTNET_ID = 5042002
const IDENTITY_REGISTRY = '0x8004A818BFB912233c491871b3d84c89A494BD9e' as const

const identityAbi = [
  {
    type: 'function',
    name: 'ownerOf',
    stateMutability: 'view',
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    outputs: [{ name: '', type: 'address' }],
  },
  {
    type: 'function',
    name: 'getAgentWallet',
    stateMutability: 'view',
    inputs: [{ name: 'agentId', type: 'uint256' }],
    outputs: [{ name: '', type: 'address' }],
  },
] as const

interface Props {
  agentId: bigint
  agentURI: string
  txHash: string
  name: string
  description: string
}

function formatAddr(addr: string) {
  return addr.slice(0, 6) + '...' + addr.slice(-4)
}

export default function AgentCard({ agentId, agentURI, txHash, name, description }: Props) {
  const { data: owner } = useReadContract({
    address: IDENTITY_REGISTRY,
    abi: identityAbi,
    functionName: 'ownerOf',
    args: [agentId],
    chainId: ARC_TESTNET_ID,
  })

  const { data: agentWallet } = useReadContract({
    address: IDENTITY_REGISTRY,
    abi: identityAbi,
    functionName: 'getAgentWallet',
    args: [agentId],
    chainId: ARC_TESTNET_ID,
  })

  const explorerTx = buildTxExplorerUrl(ARC_TESTNET_ID, txHash)
  const explorerRegistry = buildAddressExplorerUrl(ARC_TESTNET_ID, IDENTITY_REGISTRY)

  return (
    <div
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border-strong)',
        borderRadius: '16px',
        padding: '24px',
        backdropFilter: 'blur(12px)',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: '12px',
            background: 'rgba(172, 198, 233, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Bot size={24} color="var(--accent)" />
        </div>
        <div>
          <div
            className="display"
            style={{ fontSize: '18px', fontWeight: 700, color: 'var(--ink)', letterSpacing: '-0.02em' }}
          >
            {name}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
            <ShieldCheck size={13} color="var(--success)" />
            <span style={{ fontSize: '12px', color: 'var(--success)', fontWeight: 600 }}>
              ERC-8004 Registered
            </span>
          </div>
        </div>
        <div style={{ marginLeft: 'auto' }}>
          <span
            style={{
              background: 'rgba(172, 198, 233, 0.15)',
              border: '1px solid var(--border)',
              borderRadius: '20px',
              padding: '4px 12px',
              fontSize: '12px',
              color: 'var(--accent)',
              fontWeight: 600,
            }}
          >
            Agent #{agentId.toString()}
          </span>
        </div>
      </div>

      <p style={{ fontSize: '14px', color: 'var(--muted)', marginBottom: '20px', lineHeight: 1.6 }}>
        {description}
      </p>

      {/* Info rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <InfoRow label="Owner">
          {owner ? (
            <a
              href={buildAddressExplorerUrl(ARC_TESTNET_ID, owner)}
              target="_blank"
              rel="noopener noreferrer"
              className="mono"
              style={{ color: 'var(--accent)', textDecoration: 'none', fontSize: '13px' }}
            >
              {formatAddr(owner)}
            </a>
          ) : (
            <Skeleton />
          )}
        </InfoRow>

        {agentWallet && agentWallet !== '0x0000000000000000000000000000000000000000' && (
          <InfoRow label="Agent Wallet">
            <a
              href={buildAddressExplorerUrl(ARC_TESTNET_ID, agentWallet)}
              target="_blank"
              rel="noopener noreferrer"
              className="mono"
              style={{ color: 'var(--accent)', textDecoration: 'none', fontSize: '13px' }}
            >
              {formatAddr(agentWallet)}
            </a>
          </InfoRow>
        )}

        <InfoRow label="Agent URI">
          <span className="mono" style={{ fontSize: '12px', color: 'var(--subtle)', wordBreak: 'break-all' }}>
            {agentURI}
          </span>
        </InfoRow>

        <InfoRow label="Registry">
          <a
            href={explorerRegistry}
            target="_blank"
            rel="noopener noreferrer"
            className="mono"
            style={{ color: 'var(--accent)', textDecoration: 'none', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            {formatAddr(IDENTITY_REGISTRY)} <ExternalLink size={11} />
          </a>
        </InfoRow>
      </div>

      {/* Footer */}
      <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
        <a
          href={explorerTx}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '13px',
            color: 'var(--muted)',
            textDecoration: 'none',
          }}
        >
          View registration transaction <ExternalLink size={12} />
        </a>
      </div>
    </div>
  )
}

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
        padding: '10px 12px',
        background: 'var(--surface-muted)',
        borderRadius: '8px',
      }}
    >
      <span
        style={{
          fontSize: '11px',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          color: 'var(--subtle)',
          minWidth: '80px',
          paddingTop: '1px',
        }}
      >
        {label}
      </span>
      {children}
    </div>
  )
}

function Skeleton() {
  return (
    <div
      style={{
        width: '120px',
        height: '14px',
        borderRadius: '4px',
        background: 'var(--border)',
        animation: 'pulse 1.5s ease-in-out infinite',
      }}
    />
  )
}

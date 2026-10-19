/**
 * RegisterPanel — lets the connected wallet register an ERC-8004 agent identity
 * on Arc Testnet's IdentityRegistry. Parses the Registered event to extract agentId.
 */

import { useState } from 'react'
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useSwitchChain } from 'wagmi'
import { parseEventLogs } from 'viem'
import { ConnectKitButton } from 'connectkit'
import { Bot, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import { buildTxExplorerUrl } from '@/onchain-facts'

const ARC_TESTNET_ID = 5042002
const IDENTITY_REGISTRY = '0x8004A818BFB912233c491871b3d84c89A494BD9e' as const

const identityAbi = [
  {
    type: 'function',
    name: 'register',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'agentURI', type: 'string' }],
    outputs: [{ name: 'agentId', type: 'uint256' }],
  },
  {
    type: 'event',
    name: 'Registered',
    inputs: [
      { name: 'agentId', type: 'uint256', indexed: true },
      { name: 'agentURI', type: 'string', indexed: false },
      { name: 'owner', type: 'address', indexed: true },
    ],
  },
] as const

interface Props {
  onRegistered: (agentId: bigint, agentURI: string, txHash: string) => void
}

export default function RegisterPanel({ onRegistered }: Props) {
  const { chainId, isConnected } = useAccount()
  const { switchChain, isPending: isSwitching } = useSwitchChain()

  const [agentName, setAgentName] = useState('My AI Agent')
  const [agentDesc, setAgentDesc] = useState('A helpful onchain AI agent payable via x402.')
  const [endpoint, setEndpoint] = useState(`${window.location.origin}/api/query`)

  const { writeContract, data: txHash, isPending, error: writeError } = useWriteContract()
  const { data: receipt, isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash: txHash })

  const isWrongChain = isConnected && chainId !== ARC_TESTNET_ID

  // Build agent registration JSON URI (inline data URI for demo; use IPFS in production)
  function buildAgentURI() {
    const json = JSON.stringify({
      type: 'https://eips.ethereum.org/EIPS/eip-8004#registration-v1',
      name: agentName,
      description: agentDesc,
      services: [{ name: 'A2A', endpoint, version: '0.3.0' }],
      x402Support: true,
      active: true,
      registrations: [],
      supportedTrust: ['reputation'],
    })
    return 'data:application/json;base64,' + btoa(json)
  }

  // After confirmation, parse the Registered event to get agentId
  if (isSuccess && receipt && txHash) {
    const logs = parseEventLogs({ abi: identityAbi, eventName: 'Registered', logs: receipt.logs })
    if (logs.length > 0) {
      const { agentId, agentURI } = logs[0].args
      onRegistered(agentId, agentURI, txHash)
    }
  }

  function handleRegister() {
    if (isWrongChain) {
      switchChain({ chainId: ARC_TESTNET_ID })
      return
    }
    const uri = buildAgentURI()
    writeContract({
      address: IDENTITY_REGISTRY,
      abi: identityAbi,
      functionName: 'register',
      args: [uri],
      chainId: ARC_TESTNET_ID,
    })
  }

  function parseError(err: Error | null): string | null {
    if (!err) return null
    const msg = err.message.toLowerCase()
    if (msg.includes('user rejected') || msg.includes('denied')) return null // silent
    if (msg.includes('insufficient funds')) return 'Insufficient USDC for gas. Use the faucet to get testnet USDC.'
    if (msg.includes('reverted')) return 'Transaction reverted. Check you are on Arc Testnet.'
    return 'Transaction failed. Please try again.'
  }

  const errMsg = parseError(writeError)

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
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
        <Bot size={20} color="var(--accent)" />
        <span className="display" style={{ fontSize: '16px', fontWeight: 700, color: 'var(--ink)' }}>
          Register Agent Identity
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
          ERC-8004
        </span>
      </div>

      {!isConnected ? (
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <p style={{ color: 'var(--muted)', fontSize: '14px', marginBottom: '16px' }}>
            Connect your wallet to register an agent on Arc Testnet.
          </p>
          <ConnectKitButton />
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <Field
            label="Agent Name"
            value={agentName}
            onChange={setAgentName}
            placeholder="My AI Agent"
          />
          <Field
            label="Description"
            value={agentDesc}
            onChange={setAgentDesc}
            placeholder="What does this agent do?"
          />
          <Field
            label="Service Endpoint"
            value={endpoint}
            onChange={setEndpoint}
            placeholder="https://..."
          />

          {isWrongChain && (
            <div
              style={{
                padding: '10px 14px',
                background: 'rgba(232, 109, 122, 0.12)',
                border: '1px solid rgba(232, 109, 122, 0.3)',
                borderRadius: '8px',
                fontSize: '13px',
                color: 'var(--danger)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <AlertCircle size={14} />
              Switch to Arc Testnet to continue
            </div>
          )}

          {errMsg && (
            <div
              style={{
                padding: '10px 14px',
                background: 'rgba(232, 109, 122, 0.12)',
                border: '1px solid rgba(232, 109, 122, 0.3)',
                borderRadius: '8px',
                fontSize: '13px',
                color: 'var(--danger)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <AlertCircle size={14} />
              {errMsg}
            </div>
          )}

          {isConfirming && (
            <div
              style={{
                padding: '10px 14px',
                background: 'rgba(172, 198, 233, 0.08)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                fontSize: '13px',
                color: 'var(--accent)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
              Confirming on Arc Testnet...
              {txHash && (
                <a
                  href={buildTxExplorerUrl(ARC_TESTNET_ID, txHash)}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: 'var(--accent)', marginLeft: 'auto', fontSize: '12px' }}
                >
                  View tx
                </a>
              )}
            </div>
          )}

          <button
            onClick={handleRegister}
            disabled={isPending || isConfirming || isSwitching}
            style={{
              width: '100%',
              padding: '13px',
              borderRadius: '10px',
              border: 'none',
              background: isPending || isConfirming || isSwitching ? 'var(--surface-muted)' : 'var(--accent)',
              color: isPending || isConfirming || isSwitching ? 'var(--subtle)' : '#0d1b2f',
              fontSize: '15px',
              fontWeight: 700,
              cursor: isPending || isConfirming || isSwitching ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'background 0.15s',
            }}
          >
            {isSwitching ? (
              <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Switching network...</>
            ) : isPending ? (
              <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Confirm in wallet...</>
            ) : isConfirming ? (
              <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Confirming...</>
            ) : isWrongChain ? (
              'Switch to Arc Testnet'
            ) : (
              <><CheckCircle2 size={16} /> Register on Arc</>
            )}
          </button>

          <p style={{ fontSize: '12px', color: 'var(--subtle)', textAlign: 'center', margin: 0 }}>
            Costs ~0.006 testnet USDC in gas. Get test USDC from the sidebar faucet.
          </p>
        </div>
      )}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder: string
}) {
  return (
    <div>
      <label
        style={{
          display: 'block',
          fontSize: '11px',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          color: 'var(--subtle)',
          marginBottom: '6px',
        }}
      >
        {label}
      </label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: '100%',
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
    </div>
  )
}

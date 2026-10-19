/**
 * Paid agent API server — Circle Gateway Nanopayments (x402)
 * Exposes a single POST /query endpoint protected by $0.01 USDC per call.
 * All seller receipts go to VITE_AGENT_SELLER_ADDRESS from .env.
 *
 * Run with: bun run server
 */

import express from 'express'
import { createGatewayMiddleware } from '@circle-fin/x402-batching/server'

const app = express()
app.use(express.json())

const sellerAddress = process.env.VITE_AGENT_SELLER_ADDRESS
if (!sellerAddress) {
  console.error(
    '[agent-server] VITE_AGENT_SELLER_ADDRESS is not set — set it in .env to the EVM address that receives payments.',
  )
  process.exit(1)
}

// Circle Gateway middleware — handles the 402 negotiation and settlement
const gateway = createGatewayMiddleware({
  sellerAddress: sellerAddress as `0x${string}`,
})

// Health check (unpaid)
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', sellerAddress })
})

// Paid endpoint: $0.01 USDC per call via Circle Gateway Nanopayments
app.post('/query', gateway.require('$0.01'), (req, res) => {
  const { question } = req.body as { question?: string }
  if (!question) {
    res.status(400).json({ error: 'Missing "question" in request body' })
    return
  }
  // Echo-style agent response — swap in real LLM / tool logic here
  res.json({
    answer: `[Agent response to: "${question}"] — payment verified via x402 Circle Gateway.`,
    paidAt: new Date().toISOString(),
  })
})

const PORT = 3001
app.listen(PORT, () => {
  console.log(`[agent-server] Listening on http://localhost:${PORT}`)
  console.log(`[agent-server] Seller address: ${sellerAddress}`)
})

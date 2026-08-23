import React, { useState } from 'react'
import { api } from '@/api/axiosClient'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { CreditCard, Repeat, RefreshCcw, AlertTriangle } from 'lucide-react'

export const IdempotencySection: React.FC = () => {
  const [amount, setAmount] = useState('99.99')
  const [orderRef, setOrderRef] = useState('ORD-2026-9876')
  const [idempotencyKey, setIdempotencyKey] = useState(`pay-key-${Date.now().toString().slice(-6)}`)
  const [loading, setLoading] = useState(false)
  const [responseLog, setResponseLog] = useState<{
    status: number
    cacheHeader?: string
    data: unknown
  } | null>(null)

  const handleCharge = async (overrideAmount?: string) => {
    setLoading(true)
    try {
      const response = await api.post(
        '/api/payments/charge',
        {
          amount: parseFloat(overrideAmount || amount),
          currency: 'USD',
          orderReference: orderRef,
          description: 'Premium Enterprise Plan',
        },
        {
          headers: {
            'Idempotency-Key': idempotencyKey,
          },
        }
      )

      setResponseLog({
        status: response.status,
        cacheHeader: response.headers['x-cache'] || 'None',
        data: response.data,
      })
    } catch (err: unknown) {
      const error = err as { response?: { status: number; data: unknown } }
      setResponseLog({
        status: error.response?.status || 500,
        cacheHeader: 'None',
        data: error.response?.data,
      })
    } finally {
      setLoading(false)
    }
  }

  const generateNewKey = () => {
    setIdempotencyKey(`pay-key-${Date.now().toString().slice(-6)}`)
    setResponseLog(null)
  }

  return (
    <Card className="w-full shadow-md border-slate-200">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <CreditCard className="h-6 w-6 text-purple-600" />
          <CardTitle>API Idempotency & Replay Protection</CardTitle>
        </div>
        <CardDescription>
          Prevents double-billing and network duplicate errors using the Stripe-standard Idempotency-Key header.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-lg border border-slate-200">
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">
              Idempotency-Key Header
            </label>
            <div className="flex gap-1">
              <Input
                value={idempotencyKey}
                onChange={(e) => setIdempotencyKey(e.target.value)}
                className="font-mono text-xs"
              />
              <Button variant="outline" size="icon" onClick={generateNewKey} title="Generate new key">
                <RefreshCcw className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">Order Reference</label>
            <Input value={orderRef} onChange={(e) => setOrderRef(e.target.value)} />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">Amount ($ USD)</label>
            <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button onClick={() => handleCharge()} disabled={loading}>
            1. Send Payment (First Attempt)
          </Button>
          <Button variant="secondary" onClick={() => handleCharge()} disabled={loading}>
            <Repeat className="h-4 w-4 mr-1" /> 2. Retry Exact Same Request (Expect IDEMPOTENT-HIT)
          </Button>
          <Button
            variant="destructive"
            onClick={() => handleCharge('299.99')}
            disabled={loading}
          >
            <AlertTriangle className="h-4 w-4 mr-1" /> 3. Tamper Payload ($299) (Expect 422 Conflict)
          </Button>
        </div>

        {responseLog && (
          <div className="bg-slate-950 text-slate-100 p-4 rounded-lg font-mono text-xs space-y-2 overflow-x-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span>
                HTTP Status:{' '}
                <strong
                  className={responseLog.status === 200 ? 'text-emerald-400' : 'text-rose-400'}
                >
                  {responseLog.status}
                </strong>
              </span>
              <span>
                X-Cache Header:{' '}
                <Badge
                  variant={
                    responseLog.cacheHeader?.includes('HIT')
                      ? 'success'
                      : responseLog.cacheHeader?.includes('MISS')
                      ? 'warning'
                      : 'outline'
                  }
                >
                  {responseLog.cacheHeader}
                </Badge>
              </span>
            </div>
            <pre className="text-slate-300">{JSON.stringify(responseLog.data, null, 2)}</pre>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

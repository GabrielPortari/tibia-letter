import { useEffect } from 'react'

declare global {
  interface Window {
    MercadoPago: new (publicKey: string) => {
      bricks: () => {
        create: (type: string, containerId: string, config: object) => Promise<{ unmount: () => void }>
      }
    }
  }
}

interface Props {
  preferenceId: string
}

function WalletBrickInner({ preferenceId }: Props) {
  useEffect(() => {
    const publicKey = import.meta.env.VITE_MP_PUBLIC_KEY as string
    if (!publicKey || !window.MercadoPago) return

    let cancelled = false
    let brick: { unmount: () => void } | null = null

    // setTimeout(0) ensures StrictMode's first cleanup cancels the timer
    // before any brick creation starts, preventing double SDK initialization
    const timer = setTimeout(() => {
      if (cancelled) return

      const mp = new window.MercadoPago(publicKey)
      mp.bricks()
        .create('wallet', 'mp-wallet-container', {
          initialization: { preferenceId },
        })
        .then((b) => {
          if (cancelled) {
            try { b.unmount() } catch { /* ignore SDK cleanup errors */ }
            return
          }
          brick = b
        })
        .catch((err: unknown) => {
          if (!cancelled) console.error('[MercadoPagoWallet] brick error:', err)
        })
    }, 0)

    return () => {
      cancelled = true
      clearTimeout(timer)
      if (brick) {
        try { brick.unmount() } catch { /* ignore SDK cleanup errors */ }
        brick = null
      }
    }
  }, [preferenceId])

  return <div id="mp-wallet-container" />
}

export function MercadoPagoWallet({ preferenceId }: Props) {
  return <WalletBrickInner key={preferenceId} preferenceId={preferenceId} />
}

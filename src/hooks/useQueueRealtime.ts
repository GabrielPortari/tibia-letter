import { useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { useQueueStore } from '../stores/queueStore'
import type { QueueEntry } from '../types'
import type { RealtimeChannel } from '@supabase/supabase-js'

export function useQueueRealtime(worldId: string) {
  const { upsertEntry, removeEntry } = useQueueStore()
  const channelRef = useRef<RealtimeChannel | null>(null)
  const retryRef = useRef(0)
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    let mounted = true

    function subscribe() {
      if (!mounted) return
      const channel = supabase
        .channel(`queue:${worldId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'queue_entries',
            filter: `world_id=eq.${worldId}`,
          },
          (payload) => {
            if (payload.eventType === 'DELETE') {
              removeEntry((payload.old as { id: string }).id)
            } else {
              upsertEntry(payload.new as QueueEntry)
            }
          },
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            retryRef.current = 0
          } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
            if (!mounted) return
            const delay = Math.min(1000 * 2 ** retryRef.current, 30000)
            retryRef.current += 1
            retryTimerRef.current = setTimeout(() => {
              if (mounted) {
                channel.unsubscribe()
                subscribe()
              }
            }, delay)
          }
        })
      channelRef.current = channel
    }

    subscribe()

    return () => {
      mounted = false
      if (retryTimerRef.current) clearTimeout(retryTimerRef.current)
      channelRef.current?.unsubscribe()
    }
  }, [worldId, upsertEntry, removeEntry])
}

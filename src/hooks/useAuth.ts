import { useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../stores/authStore'
import type { Player, Character } from '../types'

export function useAuth() {
  const { player, activeChar, isLoading, setPlayer, setActiveChar, setLoading } = useAuthStore()

  useEffect(() => {
    let mounted = true

    async function loadSession() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!mounted) return

      if (session?.user) {
        await loadPlayer(session.user.id)
      } else {
        setLoading(false)
      }
    }

    async function loadPlayer(userId: string) {
      const { data: playerData } = await supabase
        .from('players')
        .select('*')
        .eq('id', userId)
        .single()

      if (!mounted) return

      if (playerData) {
        setPlayer(playerData as Player)
        const { data: charData } = await supabase
          .from('characters')
          .select('*')
          .eq('player_id', userId)
          .eq('is_active', true)
          .single()
        if (mounted && charData) setActiveChar(charData as Character)
      }
      if (mounted) setLoading(false)
    }

    loadSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return
      if (event === 'SIGNED_OUT') {
        setPlayer(null)
        setActiveChar(null)
        setLoading(false)
      } else if (session?.user) {
        await loadPlayer(session.user.id)
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [setPlayer, setActiveChar, setLoading])

  return { player, activeChar, isLoading }
}

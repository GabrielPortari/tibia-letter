import { useTranslation } from 'react-i18next'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../stores/authStore'
import { Button } from '../components/ui/Button'
import { Spinner } from '../components/ui/Spinner'
import { DemoSection } from '../components/landing/DemoSection'
import { useLangNavigate } from '../hooks/useLangNavigate'
import letterIcon from '../assets/letter.png'

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
}

export default function Landing() {
  const { user, isLoading, activeChar } = useAuthStore()
  const { t } = useTranslation()
  const langNavigate = useLangNavigate()
  const char = activeChar()

  async function handleLogin() {
    await supabase.auth.signInWithOAuth({
      provider: 'discord',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        scopes: 'identify',
      },
    })
  }

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* ── Hero ── */}
      <section
        className="flex flex-col items-center justify-center text-center px-4 py-16 sm:py-24"
        style={{
          backgroundImage:
            'radial-gradient(ellipse 60% 40% at 50% 0%, var(--gold-glow) 0%, transparent 70%)',
        }}
      >
        <img
          src={letterIcon}
          alt="Tibia Letter"
          className="w-16 h-16 object-contain mb-4"
        />
        <div className="inline-flex items-center px-3 py-1 border border-[var(--gold-dim)] rounded-full text-xs text-gold tracking-widest mb-6">
          {t('landing.badge')}
        </div>

        <h1
          className="font-display font-bold leading-tight mb-5 max-w-3xl"
          style={{ fontSize: 'clamp(28px, 6vw, 64px)' }}
        >
          {t('landing.hero_title')}
          <br />
          <span
            className="text-gold"
            style={{ textShadow: '0 0 40px var(--gold-glow)' }}
          >
            {t('landing.hero_highlight')}
          </span>
        </h1>

        <p className="text-text-muted text-base sm:text-lg max-w-lg leading-relaxed mb-9">
          {t('landing.hero_desc')}
        </p>

        <div className="flex gap-3 flex-wrap justify-center">
          {user ? (
            <>
              <Button
                size="lg"
                onClick={() => langNavigate(char ? '/app/queue' : '/app/characters')}
              >
                {char ? t('landing.cta_go_queue') : t('landing.cta_setup_char')}
              </Button>
              <Button
                size="lg"
                variant="secondary"
                onClick={() => langNavigate('/app/characters')}
              >
                {t('landing.cta_my_chars')}
              </Button>
            </>
          ) : (
            <>
              <Button size="lg" onClick={handleLogin}>
                {t('common.login_free')}
              </Button>
              <Button
                size="lg"
                variant="secondary"
                onClick={() => scrollTo('hw')}
              >
                {t('landing.cta_how')}
              </Button>
            </>
          )}
        </div>

        {/* Stats row */}
        <div className="flex gap-8 sm:gap-12 mt-14 pt-9 border-t border-border flex-wrap justify-center">
          {[
            [t('landing.stat_realtime'), t('landing.stat_realtime_sub')],
            [t('landing.stat_per_world'), t('landing.stat_per_world_sub')],
            [t('landing.stat_anti_fake'), t('landing.stat_anti_fake_sub')],
            [t('landing.stat_fair'), t('landing.stat_fair_sub')],
          ].map(([n, l]) => (
            <div key={n} className="text-center">
              <p className="font-display text-lg font-bold text-gold">{n}</p>
              <p className="text-xs text-text-muted mt-1">{l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Como funciona ── */}
      <section id="hw" className="py-16 sm:py-20 px-4 max-w-4xl mx-auto w-full">
        <div className="text-center mb-12">
          <p className="text-xs text-[var(--gold-dim)] tracking-widest font-semibold mb-3">
            {t('landing.how_badge')}
          </p>
          <h2 className="font-display text-2xl sm:text-3xl font-semibold">
            {t('landing.how_title')}
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { ic: '🔐', n: '01', t: t('landing.step1_title'), d: t('landing.step1_desc') },
            { ic: '🎮', n: '02', t: t('landing.step2_title'), d: t('landing.step2_desc') },
            { ic: '🌍', n: '03', t: t('landing.step3_title'), d: t('landing.step3_desc') },
            { ic: '⚔️', n: '04', t: t('landing.step4_title'), d: t('landing.step4_desc') },
          ].map((s) => (
            <div
              key={s.n}
              className="bg-bg2 border border-border rounded-xl p-5 sm:p-6"
            >
              <div className="text-3xl mb-3">{s.ic}</div>
              <p className="text-xs text-[var(--gold-dim)] font-semibold tracking-widest mb-1">
                {s.n}
              </p>
              <p className="text-sm font-semibold text-text mb-2">{s.t}</p>
              <p className="text-xs text-text-muted leading-relaxed">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Funcionalidades ── */}
      <section className="py-16 px-4" style={{ background: 'var(--bg-1)' }}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-xs text-[var(--gold-dim)] tracking-widest font-semibold mb-3">
              {t('landing.feat_badge')}
            </p>
            <h2 className="font-display text-2xl sm:text-3xl font-semibold">
              {t('landing.feat_title')}
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { ic: '🔒', t: t('landing.feat1_title'), d: t('landing.feat1_desc') },
              { ic: '⏱', t: t('landing.feat2_title'), d: t('landing.feat2_desc') },
              { ic: '📅', t: t('landing.feat3_title'), d: t('landing.feat3_desc') },
            ].map((f) => (
              <div
                key={f.t}
                className="flex gap-4 p-4 border border-border rounded-xl bg-bg2"
              >
                <div className="text-2xl flex-shrink-0 mt-0.5">{f.ic}</div>
                <div>
                  <p className="text-sm font-semibold text-text mb-1">{f.t}</p>
                  <p className="text-xs text-text-muted leading-relaxed">{f.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Segurança ── */}
      <section className="py-16 px-4 max-w-3xl mx-auto w-full">
        <div
          className="rounded-2xl p-7 sm:p-9"
          style={{ background: 'var(--bg-2)', border: '1px solid var(--border)' }}
        >
          <div className="flex items-center gap-3 mb-6">
            <span className="text-2xl">🔐</span>
            <h2 className="font-display text-xl sm:text-2xl font-semibold">
              {t('landing.sec_title')}
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { title: t('landing.sec1_title'), desc: t('landing.sec1_desc') },
              { title: t('landing.sec2_title'), desc: t('landing.sec2_desc') },
              { title: t('landing.sec3_title'), desc: t('landing.sec3_desc') },
              { title: t('landing.sec4_title'), desc: t('landing.sec4_desc') },
            ].map((item) => (
              <div
                key={item.title}
                className="flex gap-3 p-4 rounded-xl"
                style={{ background: 'var(--bg-3)', border: '1px solid var(--border)' }}
              >
                <span className="text-green text-lg flex-shrink-0 mt-0.5">✓</span>
                <div>
                  <p className="text-sm font-semibold text-text mb-1">{item.title}</p>
                  <p className="text-xs text-text-muted leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Demo ── */}
      <DemoSection />

      {/* ── Footer ── */}
      <footer className="border-t border-border px-5 sm:px-10 py-5 flex items-center justify-between flex-wrap gap-3">
        <span className="font-display text-sm text-[var(--gold-dim)] flex items-center gap-2">
          <img src={letterIcon} alt="" className="w-4 h-4 object-contain opacity-70" />
          Tibia Letter
        </span>
        <span className="text-xs text-text-dim">{t('landing.footer_tagline')}</span>
        <div className="flex items-center gap-4">
          <button
            onClick={() => langNavigate('/contact')}
            className="text-xs text-text-dim hover:text-text transition-colors"
          >
            {t('contact.footer_link')}
          </button>
          <a
            href="https://github.com/GabrielPortari/tibia-letter"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-text-dim hover:text-text transition-colors flex items-center gap-1.5"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.868-.013-1.703-2.782.604-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.031 1.531 1.031.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0 1 12 6.836a9.59 9.59 0 0 1 2.504.337c1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.741 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
            </svg>
            GitHub
          </a>
        </div>
      </footer>
    </div>
  )
}

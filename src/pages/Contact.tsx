import { useTranslation } from 'react-i18next'
import { Button } from '../components/ui/Button'
import { useLangNavigate } from '../hooks/useLangNavigate'

const GITHUB_ISSUES = 'https://github.com/GabrielPortari/tibia-letter/issues/new'
const EMAIL = 'dev.gabrielportari@gmail.com'
const CREATOR_NAME = 'Gabriel'
const CREATOR_CHAR = 'Avria Elou'

export default function Contact() {
  const { t } = useTranslation()
  const langNavigate = useLangNavigate()

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-xl">
        <button
          onClick={() => langNavigate('')}
          className="text-xs text-text-muted hover:text-text transition-colors mb-8 flex items-center gap-1.5"
        >
          ← {t('common.back_home')}
        </button>

        <h1 className="font-display text-3xl font-semibold text-text mb-2">{t('contact.title')}</h1>
        <p className="text-text-muted text-sm mb-10">{t('contact.subtitle')}</p>

        <div className="flex flex-col gap-4">
          <div className="bg-bg2 border border-border rounded-2xl p-6 flex flex-col gap-4">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-bg3 border border-border flex items-center justify-center flex-shrink-0 text-lg">
                🐛
              </div>
              <div className="flex-1">
                <p className="font-semibold text-text mb-1">{t('contact.bug_title')}</p>
                <p className="text-sm text-text-muted leading-relaxed">{t('contact.bug_desc')}</p>
              </div>
            </div>
            <Button variant="secondary" className="w-full justify-center gap-2" onClick={() => window.open(GITHUB_ISSUES, '_blank', 'noopener,noreferrer')}>
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.868-.013-1.703-2.782.604-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.031 1.531 1.031.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0 1 12 6.836a9.59 9.59 0 0 1 2.504.337c1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.741 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
              </svg>
              {t('contact.bug_btn')}
            </Button>
          </div>

          <div className="bg-bg2 border border-border rounded-2xl p-6 flex flex-col gap-4">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-bg3 border border-border flex items-center justify-center flex-shrink-0 text-lg">
                ✉️
              </div>
              <div className="flex-1">
                <p className="font-semibold text-text mb-1">{t('contact.email_title')}</p>
                <p className="text-sm text-text-muted leading-relaxed">{t('contact.email_desc')}</p>
              </div>
            </div>
            <Button variant="secondary" className="w-full justify-center gap-2" onClick={() => window.open(`mailto:${EMAIL}`, '_self')}>
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="m2 7 10 7 10-7" strokeLinecap="round" />
              </svg>
              {t('contact.email_btn')}
            </Button>
          </div>
        </div>

        {/* Creator info — required for CipSoft fansite compliance */}
        <div className="mt-8 bg-bg2 border border-border rounded-2xl p-6">
          <p className="text-xs text-[var(--gold-dim)] tracking-widest font-semibold mb-4 uppercase">{t('contact.creator_title')}</p>
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center justify-between text-sm">
              <span className="text-text-muted">{t('contact.creator_name_label')}</span>
              <span className="text-text font-medium">{CREATOR_NAME}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-text-muted">{t('contact.creator_char_label')}</span>
              <span className="text-text font-medium">{CREATOR_CHAR}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-text-muted">{t('contact.creator_email_label')}</span>
              <a href={`mailto:${EMAIL}`} className="text-gold hover:underline font-medium">{EMAIL}</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

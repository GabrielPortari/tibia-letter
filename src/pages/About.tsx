import { useTranslation } from "react-i18next";
import { useLangNavigate } from "../hooks/useLangNavigate";

const GITHUB_URL = "https://github.com/GabrielPortari";
const LINKEDIN_URL = "https://www.linkedin.com/in/gabriel-portari-3aa73623b/";
const EMAIL = "dev.gabrielportari@gmail.com";
const CREATOR_CHAR = "Avria Elou";

export default function About() {
  const { t } = useTranslation();
  const langNavigate = useLangNavigate();

  return (
    <div className="flex-1 flex flex-col items-center px-4 py-16">
      <div className="w-full max-w-xl flex flex-col gap-6">
        <button
          onClick={() => langNavigate("")}
          className="text-xs text-text-muted hover:text-text transition-colors flex items-center gap-1.5 self-start"
        >
          ← {t("common.back_home")}
        </button>

        <div>
          <h1 className="font-display text-3xl font-semibold text-text mb-2">
            {t("about.title")}
          </h1>
        </div>

        {/* ── O que é o Tibia Letter ── */}
        <section className="bg-bg2 border border-border rounded-2xl p-6 flex flex-col gap-4">
          <p className="text-xs text-[var(--gold-dim)] tracking-widest font-semibold uppercase">
            {t("about.what_badge")}
          </p>
          <h2 className="font-display text-xl font-semibold text-text leading-snug">
            {t("about.what_title")}
          </h2>
          <p className="text-sm text-text-muted leading-relaxed">
            {t("about.what_desc1")}
          </p>
          <p className="text-sm text-text-muted leading-relaxed">
            {t("about.what_desc2")}
          </p>
        </section>

        {/* ── Sobre Mim ── */}
        <section className="bg-bg2 border border-border rounded-2xl p-6 flex flex-col gap-4">
          <p className="text-xs text-[var(--gold-dim)] tracking-widest font-semibold uppercase">
            {t("about.me_badge")}
          </p>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-bg3 border border-border flex items-center justify-center flex-shrink-0 text-lg">
              👨‍💻
            </div>
            <div>
              <p className="font-semibold text-text">{t("about.me_name")}</p>
              <p className="text-xs text-text-muted">{t("about.me_role")}</p>
            </div>
          </div>
          <p className="text-sm text-text-muted leading-relaxed">
            {t("about.me_desc")}
          </p>
        </section>

        {/* ── Declaração ── */}
        <section className="bg-bg2 border border-border rounded-2xl p-6 flex flex-col gap-4">
          <p className="text-xs text-[var(--gold-dim)] tracking-widest font-semibold uppercase">
            {t("about.disclaimer_badge")}
          </p>
          <p className="text-sm text-text-muted leading-relaxed">
            {t("about.disclaimer_text")}
          </p>
        </section>

        {/* ── Contato ── */}
        <section className="bg-bg2 border border-border rounded-2xl p-6 flex flex-col gap-4">
          <p className="text-xs text-[var(--gold-dim)] tracking-widest font-semibold uppercase">
            {t("about.contact_badge")}
          </p>
          <div className="flex flex-col gap-3">
            <a
              href={`mailto:${EMAIL}`}
              className="flex items-center gap-3 text-sm text-text-muted hover:text-text transition-colors group"
            >
              <div className="w-8 h-8 rounded-lg bg-bg3 border border-border flex items-center justify-center flex-shrink-0 group-hover:border-gold/40 transition-colors">
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.8}
                >
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <path d="m2 7 10 7 10-7" strokeLinecap="round" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-text-dim mb-0.5">
                  {t("about.contact_email")}
                </p>
                <p className="font-medium text-gold">{EMAIL}</p>
              </div>
            </a>

            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 text-sm text-text-muted hover:text-text transition-colors group"
            >
              <div className="w-8 h-8 rounded-lg bg-bg3 border border-border flex items-center justify-center flex-shrink-0 group-hover:border-gold/40 transition-colors">
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.868-.013-1.703-2.782.604-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.031 1.531 1.031.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0 1 12 6.836a9.59 9.59 0 0 1 2.504.337c1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.741 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-text-dim mb-0.5">
                  {t("about.contact_github")}
                </p>
                <p className="font-medium">GabrielPortari</p>
              </div>
            </a>

            <a
              href={LINKEDIN_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 text-sm text-text-muted hover:text-text transition-colors group"
            >
              <div className="w-8 h-8 rounded-lg bg-bg3 border border-border flex items-center justify-center flex-shrink-0 group-hover:border-gold/40 transition-colors">
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z" />
                  <circle cx="4" cy="4" r="2" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-text-dim mb-0.5">
                  {t("about.contact_linkedin")}
                </p>
                <p className="font-medium">Gabriel Portari</p>
              </div>
            </a>
          </div>
        </section>

        {/* ── Apoie o projeto ── */}
        <section
          className="rounded-2xl border overflow-hidden"
          style={{ borderColor: "var(--gold-dim)", background: "var(--bg-2)" }}
        >
          <div
            className="px-6 py-4 flex items-center gap-3"
            style={{
              background: "var(--gold-glow)",
              borderBottom: "1px solid var(--gold-dim)",
            }}
          >
            <span className="text-gold text-xl">★</span>
            <p className="text-sm font-bold text-gold">
              {t("about.support_badge")}
            </p>
          </div>
          <div className="px-6 py-5 flex flex-col gap-4">
            <p className="text-sm text-text-muted leading-relaxed">
              {t("about.support_desc")}
            </p>
            <ul className="flex flex-col gap-2.5">
              <li className="flex items-start gap-2 text-sm text-text-muted">
                <span className="text-gold mt-0.5 flex-shrink-0">★</span>
                <span>{t("about.support_pack")}</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-text-muted">
                <span className="text-gold mt-0.5 flex-shrink-0">◈</span>
                <span>
                  {t("about.support_coins")}{" "}
                  <span className="text-text font-semibold">
                    {CREATOR_CHAR}
                  </span>
                  .
                </span>
              </li>
            </ul>
            <button
              onClick={() => langNavigate("/supporter")}
              className="w-full py-2.5 rounded-xl text-sm font-semibold transition-opacity hover:opacity-80 mt-1"
              style={{ background: "var(--gold)", color: "var(--bg-0)" }}
            >
              {t("about.support_pack_btn")}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

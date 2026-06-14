import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuthStore } from "../stores/authStore";
import { Button } from "../components/ui/Button";
import { Spinner } from "../components/ui/Spinner";
import { DemoSection } from "../components/landing/DemoSection";

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
}

export default function Landing() {
  const { player, isLoading } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && player) navigate("/worlds", { replace: true });
  }, [player, isLoading, navigate]);

  async function handleLogin() {
    await supabase.auth.signInWithOAuth({
      provider: "discord",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        scopes: "identify",
      },
    });
  }

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* ── Nav ── */}
      <nav className="sticky top-0 z-40 bg-bg0/95 backdrop-blur border-b border-border flex items-center justify-between px-5 sm:px-10 h-14">
        <span className="font-display text-gold text-base font-bold tracking-widest">
          ⚔ Tibia Letter
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => scrollTo("pr")}
            className="hidden sm:inline-flex px-3 py-1.5 text-sm text-text-muted hover:text-gold border border-border hover:border-gold rounded-lg transition-colors"
          >
            Planos
          </button>
          <Button size="sm" onClick={handleLogin}>
            Entrar com Discord
          </Button>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section
        className="flex flex-col items-center justify-center text-center px-4 py-16 sm:py-24"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 60% 40% at 50% 0%, var(--gold-glow) 0%, transparent 70%)",
        }}
      >
        <div className="inline-flex items-center px-3 py-1 border border-[var(--gold-dim)] rounded-full text-xs text-gold tracking-widest mb-6">
          SISTEMA DE FILAS PARA TIBIA
        </div>

        <h1
          className="font-display font-bold leading-tight mb-5 max-w-3xl"
          style={{ fontSize: "clamp(28px, 6vw, 64px)" }}
        >
          Organização e fairness
          <br />
          <span
            className="text-gold"
            style={{ textShadow: "0 0 40px var(--gold-glow)" }}
          >
            para toda a comunidade.
          </span>
        </h1>

        <p className="text-text-muted text-base sm:text-lg max-w-lg leading-relaxed mb-9">
          Tibia Letter substitui o sistema de cartas com uma fila digital
          transparente, em tempo real. Primeiro a chegar, primeiro a caçar —
          para todos.
        </p>

        <div className="flex gap-3 flex-wrap justify-center">
          <Button size="lg" onClick={handleLogin}>
            ⚔ Entrar com Discord — é grátis
          </Button>
          <Button size="lg" variant="secondary" onClick={() => scrollTo("hw")}>
            Como funciona →
          </Button>
        </div>

        {/* Stats row */}
        <div className="flex gap-8 sm:gap-12 mt-14 pt-9 border-t border-border flex-wrap justify-center">
          {[
            ["Globais", "spawns compartilhados"],
            ["Por world", "filas independentes"],
            ["Anti-fake", "verificação de personagem"],
            ["100% justo", "ordem de chegada"],
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
            COMO FUNCIONA
          </p>
          <h2 className="font-display text-2xl sm:text-3xl font-semibold">
            Simples, transparente, justo.
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              ic: "🔐",
              n: "01",
              t: "Entre com Discord",
              d: "Login via Discord OAuth. Rápido, sem formulário.",
            },
            {
              ic: "🎮",
              n: "02",
              t: "Vincule seu char",
              d: "Cole um código no Comment do personagem em tibia.com para verificar.",
            },
            {
              ic: "🌍",
              n: "03",
              t: "Escolha o world",
              d: "Selecione seu servidor. Spawns são globais, filas são por world.",
            },
            {
              ic: "⚔️",
              n: "04",
              t: "Entre na fila",
              d: "Nível validado automaticamente. Timer, notificações e fluxo automático.",
            },
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
      <section className="py-16 px-4" style={{ background: "var(--bg-1)" }}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-xs text-[var(--gold-dim)] tracking-widest font-semibold mb-3">
              FUNCIONALIDADES
            </p>
            <h2 className="font-display text-2xl sm:text-3xl font-semibold">
              Feito para toda a comunidade.
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                ic: "🔒",
                t: "Anti-fake garantido",
                d: "Cada personagem é verificado direto no tibia.com. Ninguém entra na fila com char falso.",
              },
              {
                ic: "⏱",
                t: "Tudo automático",
                d: "O timer corre sozinho. Quando a hunt acaba, o próximo já recebe o aviso — sem depender de ninguém.",
              },
              {
                ic: "📅",
                t: "Mais filas, mais hunts",
                d: "Com Premium, entre em até 3 filas ao mesmo tempo. Aproveite cada respawn disponível no seu world.",
              },
              {
                ic: "🎯",
                t: "Fila só pra quem pode",
                d: "O level do seu personagem é validado na hora. Sem surpresa — só entra quem está no level mínimo do spawn.",
              },
              {
                ic: "👑",
                t: "Painel admin",
                d: "Controle total para moderadores: spawns, jogadores, warnings, bans e histórico completo.",
              },
            ].map((f) => (
              <div
                key={f.t}
                className="flex gap-4 p-4 border border-border rounded-xl bg-bg2"
              >
                <div className="text-2xl flex-shrink-0 mt-0.5">{f.ic}</div>
                <div>
                  <p className="text-sm font-semibold text-text mb-1">{f.t}</p>
                  <p className="text-xs text-text-muted leading-relaxed">
                    {f.d}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Demo ── */}
      <DemoSection />

      {/* ── Planos ── */}
      <section id="pr" className="py-16 sm:py-20 px-4 max-w-3xl mx-auto w-full">
        <div className="text-center mb-11">
          <p className="text-xs text-[var(--gold-dim)] tracking-widest font-semibold mb-3">
            PLANOS
          </p>
          <h2 className="font-display text-2xl sm:text-3xl font-semibold">
            Grátis para começar.
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Free */}
          <div className="bg-bg2 border border-border rounded-2xl p-7">
            <p className="text-xs text-text-muted mb-1">Free</p>
            <p className="font-display text-4xl font-bold text-text mb-0.5">
              R$ 0
            </p>
            <p className="text-xs text-text-muted mb-6">para sempre</p>
            <hr className="border-border mb-5" />
            <ul className="flex flex-col gap-2 mb-7">
              {[
                "Entre na fila de 1 respawn por vez",
                "1 personagem verificado",
                "Acesso a todos os worlds",
                "Tudo em tempo real",
              ].map((f) => (
                <li key={f} className="flex gap-2 text-xs text-text-muted">
                  <span className="text-green">✓</span> {f}
                </li>
              ))}
              {[
                "Até 3 filas ao mesmo tempo",
                "Personagens ilimitados",
              ].map((f) => (
                <li key={f} className="flex gap-2 text-xs text-text-dim">
                  <span>✕</span> {f}
                </li>
              ))}
            </ul>
            <Button
              variant="secondary"
              className="w-full"
              onClick={handleLogin}
            >
              Começar grátis
            </Button>
          </div>

          {/* Premium */}
          <div
            className="bg-bg2 rounded-2xl p-7"
            style={{
              border: "1.5px solid var(--gold)",
              boxShadow: "0 0 28px var(--gold-glow)",
            }}
          >
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs text-gold">Premium</p>
              <span
                className="text-xs font-medium px-2 py-0.5 rounded"
                style={{
                  background: "var(--gold-glow)",
                  border: "0.5px solid var(--gold-dim)",
                  color: "var(--gold)",
                }}
              >
                Recomendado
              </span>
            </div>
            <p className="font-display text-4xl font-bold text-gold mb-0.5">
              R$ 19
            </p>
            <p className="text-xs text-text-muted mb-6">por mês</p>
            <hr className="border-border mb-5" />
            <ul className="flex flex-col gap-2 mb-7">
              {[
                "Até 3 filas ao mesmo tempo",
                "Personagens ilimitados",
                "Acesso a todos os worlds",
                "Suporte prioritário",
              ].map((f) => (
                <li key={f} className="flex gap-2 text-xs text-text">
                  <span className="text-gold">✓</span> {f}
                </li>
              ))}
            </ul>
            <Button className="w-full" onClick={handleLogin}>
              Assinar Premium
            </Button>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-border px-5 sm:px-10 py-5 flex items-center justify-between flex-wrap gap-3">
        <span className="font-display text-sm text-[var(--gold-dim)]">
          ⚔ Tibia Letter
        </span>
        <span className="text-xs text-text-dim">
          Não afiliado à CipSoft. Projeto independente da comunidade.
        </span>
      </footer>
    </div>
  );
}

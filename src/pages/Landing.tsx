import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuthStore } from "../stores/authStore";
import { Button } from "../components/ui/Button";
import { Spinner } from "../components/ui/Spinner";
import { DemoSection } from "../components/landing/DemoSection";
import letterIcon from "../assets/letter.png";

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
}

export default function Landing() {
  const { user, isLoading, activeChar } = useAuthStore();
  const navigate = useNavigate();
  const char = activeChar();

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
        <span className="font-display text-gold text-base font-bold tracking-widest flex items-center gap-2">
          <img src={letterIcon} alt="" className="w-6 h-6 object-contain" />
          Tibia Letter
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => scrollTo("pr")}
            className="hidden sm:inline-flex px-3 py-1.5 text-sm text-text-muted hover:text-gold border border-border hover:border-gold rounded-lg transition-colors"
          >
            Planos
          </button>
          {user ? (
            <Button size="sm" onClick={() => navigate(char ? "/app/queue" : "/app/characters")}>
              {char ? `Ir para as filas →` : "Configurar personagem →"}
            </Button>
          ) : (
            <Button size="sm" onClick={handleLogin}>
              Entrar com Discord
            </Button>
          )}
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
        <img src={letterIcon} alt="Tibia Letter" className="w-16 h-16 object-contain mb-4" />
        <div className="inline-flex items-center px-3 py-1 border border-[var(--gold-dim)] rounded-full text-xs text-gold tracking-widest mb-6">
          SISTEMA DE FILAS PARA TIBIA
        </div>

        <h1
          className="font-display font-bold leading-tight mb-5 max-w-3xl"
          style={{ fontSize: "clamp(28px, 6vw, 64px)" }}
        >
          Chega de discussão por spawn.
          <br />
          <span
            className="text-gold"
            style={{ textShadow: "0 0 40px var(--gold-glow)" }}
          >
            A fila resolve por você.
          </span>
        </h1>

        <p className="text-text-muted text-base sm:text-lg max-w-lg leading-relaxed mb-9">
          Tibia Letter organiza os respawns do seu world em filas digitais,
          transparentes e em tempo real. Quem chega primeiro, caça primeiro —
          sem discussão, sem carta, sem favoritismo.
        </p>

        <div className="flex gap-3 flex-wrap justify-center">
          {user ? (
            <>
              <Button size="lg" onClick={() => navigate(char ? "/app/queue" : "/app/characters")}>
                {char ? `⚔ Ir para as filas` : "⚔ Configurar personagem"}
              </Button>
              <Button size="lg" variant="secondary" onClick={() => navigate("/app/characters")}>
                Meus personagens →
              </Button>
            </>
          ) : (
            <>
              <Button size="lg" onClick={handleLogin}>
                ⚔ Entrar com Discord — é grátis
              </Button>
              <Button size="lg" variant="secondary" onClick={() => scrollTo("hw")}>
                Como funciona →
              </Button>
            </>
          )}
        </div>

        {/* Stats row */}
        <div className="flex gap-8 sm:gap-12 mt-14 pt-9 border-t border-border flex-wrap justify-center">
          {[
            ["Tempo real", "atualização instantânea"],
            ["Por world", "filas independentes"],
            ["Anti-fake", "char verificado no tibia.com"],
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
            Em 4 passos, você já está na fila.
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              ic: "🔐",
              n: "01",
              t: "Entre com Discord",
              d: "Login em segundos via Discord OAuth. Sem formulário, sem cadastro.",
            },
            {
              ic: "🎮",
              n: "02",
              t: "Prove que é seu char",
              d: "Cole um código único no Comment do seu personagem em tibia.com. Simples e seguro.",
            },
            {
              ic: "🌍",
              n: "03",
              t: "Escolha seu world",
              d: "Cada world tem suas próprias filas. Só você e os players do seu servidor.",
            },
            {
              ic: "⚔️",
              n: "04",
              t: "Caça com prioridade",
              d: "Seu level é validado na hora. Quando chegar sua vez, você recebe o aviso.",
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
              Tudo que faltava no Tibia.
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                ic: "🔒",
                t: "Zero fake, zero discussão",
                d: "Personagem verificado direto no tibia.com. Se não é seu char, não entra na fila. Simples assim.",
              },
              {
                ic: "⏱",
                t: "Automático do início ao fim",
                d: "Quando sua hunt termina, o próximo já recebe o aviso. Ninguém precisa ficar babando o spawn.",
              },
              {
                ic: "📅",
                t: "3 filas ao mesmo tempo",
                d: "Com Premium, entre em até 3 respawns simultâneos. Maximize cada minuto de jogo.",
              },
              {
                ic: "🎯",
                t: "Level mínimo respeitado",
                d: "O sistema valida seu level antes de entrar. Sem jogador low tentando pegar spawn de high.",
              },
              {
                ic: "👑",
                t: "Moderação completa",
                d: "Admins têm painel com controle total: jogadores, warnings, bans e histórico de remoções.",
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
            Grátis para começar. Premium para dominar.
          </h2>
          <p className="text-sm text-text-muted mt-3 max-w-md mx-auto">
            Comece sem pagar nada. Quando quiser mais respawns e chars, o upgrade é simples.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 items-stretch">
          {/* Free */}
          <div className="bg-bg2 border border-border rounded-2xl p-7 flex flex-col">
            <p className="text-xs text-text-muted tracking-widest font-semibold mb-1">FREE</p>
            <p className="font-display text-4xl font-bold text-text mb-0.5">
              R$ 0
            </p>
            <p className="text-xs text-text-muted mb-6">para sempre, sem cartão</p>
            <hr className="border-border mb-5" />
            <ul className="flex flex-col gap-3 flex-1">
              {[
                "1 fila simultânea",
                "2 personagens verificados",
                "2h de hunt por vez",
                "Acesso a todos os worlds",
                "Filas em tempo real",
              ].map((f) => (
                <li key={f} className="flex gap-2.5 text-xs text-text-muted items-start">
                  <span className="text-green mt-px">✓</span> {f}
                </li>
              ))}
              {[
                "3 filas simultâneas",
                "Personagens ilimitados",
              ].map((f) => (
                <li key={f} className="flex gap-2.5 text-xs text-text-dim items-start">
                  <span className="mt-px opacity-40">✕</span> {f}
                </li>
              ))}
            </ul>
            <Button variant="secondary" className="w-full mt-7" onClick={handleLogin}>
              Começar grátis
            </Button>
          </div>

          {/* Premium */}
          <div
            className="rounded-2xl p-7 flex flex-col relative overflow-hidden"
            style={{
              background: "linear-gradient(145deg, var(--bg-2) 0%, color-mix(in srgb, var(--gold) 6%, var(--bg-2)) 100%)",
              border: "1.5px solid var(--gold)",
              boxShadow: "0 0 40px var(--gold-glow), inset 0 1px 0 rgba(212,175,55,0.15)",
            }}
          >
            {/* Glow strip top */}
            <div
              className="absolute top-0 left-0 right-0 h-px"
              style={{ background: "linear-gradient(90deg, transparent, var(--gold), transparent)" }}
            />

            <div className="flex items-center justify-between mb-1">
              <p className="text-xs text-gold tracking-widest font-semibold">PREMIUM</p>
              <span
                className="text-xs font-semibold px-2.5 py-1 rounded-full"
                style={{
                  background: "var(--gold-glow)",
                  border: "1px solid var(--gold-dim)",
                  color: "var(--gold)",
                }}
              >
                Mais popular
              </span>
            </div>
            <p className="font-display text-4xl font-bold text-gold mb-0.5 mt-1">
              R$ 19
            </p>
            <p className="text-xs text-text-muted mb-1">por mês</p>
            <p className="text-xs text-gold/60 mb-6">Cancele quando quiser</p>
            <hr className="mb-5" style={{ borderColor: "var(--gold-dim)" }} />

            <p className="text-xs text-text-muted mb-3 italic">
              Tudo do Free, mais:
            </p>
            <ul className="flex flex-col gap-3 flex-1">
              {[
                ["3 filas simultâneas", "triple sua eficiência de hunt"],
                ["Personagens ilimitados", "gerencie toda sua conta"],
                ["2h de hunt por vez", "mesmo que o Free"],
                ["Acesso a todos os worlds", ""],
                ["Suporte prioritário", ""],
              ].map(([f, sub]) => (
                <li key={f} className="flex gap-2.5 items-start">
                  <span className="text-gold mt-px text-sm">✓</span>
                  <span>
                    <span className="text-xs text-text font-medium">{f}</span>
                    {sub && <span className="text-xs text-text-muted block">{sub}</span>}
                  </span>
                </li>
              ))}
            </ul>

            <Button className="w-full mt-7" onClick={handleLogin}
              style={{
                background: "linear-gradient(135deg, var(--gold) 0%, color-mix(in srgb, var(--gold) 70%, #fff) 100%)",
                color: "#1a1200",
                fontWeight: 700,
                boxShadow: "0 0 20px var(--gold-glow)",
              }}
            >
              Assinar Premium — R$ 19/mês
            </Button>
            <p className="text-xs text-center text-text-dim mt-2">
              Sem contrato. Cancele a qualquer momento.
            </p>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-border px-5 sm:px-10 py-5 flex items-center justify-between flex-wrap gap-3">
        <span className="font-display text-sm text-[var(--gold-dim)] flex items-center gap-2">
          <img src={letterIcon} alt="" className="w-4 h-4 object-contain opacity-70" />
          Tibia Letter
        </span>
        <span className="text-xs text-text-dim">
          Não afiliado à CipSoft. Projeto independente da comunidade.
        </span>
      </footer>
    </div>
  );
}

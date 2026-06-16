import { useState, useEffect } from "react";
import { fmt } from "../../utils/time";
import { Badge } from "../ui/Badge";

// ── Mock data ──────────────────────────────────────────────────────────────────

interface MockEntry {
  name: string;
  level: number;
  isYou?: boolean;
  huntStartedAt?: number;
  huntEndsAt?: number;
  acceptDeadline?: number;
}

interface MockSpawn {
  id: string;
  name: string;
  label: string;
  description: string;
  emptiedAt?: number;
  queue: MockEntry[];
}

const GRACE_PERIOD_MS = 5 * 60 * 1000;

function makeSpawns() {
  const now = Date.now();
  return [
    // 1. Eu caçando — borda verde, banner ativo
    {
      id: "s1",
      name: "Cyclops Camp",
      label: "Você está caçando",
      description: "Card com borda verde. O banner acima mostra o tempo restante da sua caça.",
      queue: [
        {
          name: "Seraphion",
          level: 87,
          isYou: true,
          huntStartedAt: now - 23 * 60 * 1000,
          huntEndsAt: now + (2 * 3600 - 23 * 60) * 1000,
        },
      ] as MockEntry[],
    },
    // 2. Respawn ocupado — não estou lá
    {
      id: "s2",
      name: "Dragon Lair",
      label: "Respawn ocupado",
      description: "Outro jogador caçando com fila formada. Entre para garantir seu lugar.",
      queue: [
        {
          name: "Drakenheim",
          level: 312,
          huntStartedAt: now - 41 * 60 * 1000,
          huntEndsAt: now + (2 * 3600 - 41 * 60) * 1000,
        },
        { name: "Mirella", level: 95 },
        { name: "Orindel Jr", level: 210 },
      ] as MockEntry[],
    },
    // 3. Respawn ocupado — eu na fila aguardando
    {
      id: "s3",
      name: "Ancient Temple",
      label: "Você na fila",
      description: "Você é o 2° da fila. Quando o caçador atual finalizar, você recebe a notificação.",
      queue: [
        {
          name: "Thalindra",
          level: 445,
          huntStartedAt: now - 20 * 60 * 1000,
          huntEndsAt: now + (2 * 3600 - 20 * 60) * 1000,
        },
        { name: "Seraphion", level: 87, isYou: true },
        { name: "Orindel", level: 210 },
      ] as MockEntry[],
    },
    // 4. Aguardando meu aceite
    {
      id: "s4",
      name: "Demon Oak",
      label: "Sua vez de aceitar",
      description: "Card pulsa em dourado. Aceite antes do tempo acabar ou perde sua posição.",
      queue: [
        {
          name: "Seraphion",
          level: 87,
          isYou: true,
          acceptDeadline: now + 4 * 60 * 1000 + 33 * 1000,
        },
        { name: "Thal Maker", level: 72 },
      ] as MockEntry[],
    },
    // 5. Respawn encerrando — grace period
    {
      id: "s5",
      name: "Orc Fortress",
      label: "Grace period",
      description: "Caçador saiu há pouco. O respawn fica reservado por 5 min antes de liberar.",
      emptiedAt: now - 2 * 60 * 1000,
      queue: [] as MockEntry[],
    },
  ] satisfies MockSpawn[];
}

// ── Timers ─────────────────────────────────────────────────────────────────────

function useTick(targetMs: number) {
  const [val, setVal] = useState(() =>
    Math.max(0, Math.floor((targetMs - Date.now()) / 1000)),
  );
  useEffect(() => {
    const id = setInterval(
      () => setVal(Math.max(0, Math.floor((targetMs - Date.now()) / 1000))),
      1000,
    );
    return () => clearInterval(id);
  }, [targetMs]);
  return val;
}

function useElapsed(startMs: number) {
  const [val, setVal] = useState(() =>
    Math.floor((Date.now() - startMs) / 1000),
  );
  useEffect(() => {
    const id = setInterval(
      () => setVal(Math.floor((Date.now() - startMs) / 1000)),
      1000,
    );
    return () => clearInterval(id);
  }, [startMs]);
  return val;
}

function GraceCountdown({ emptiedAt }: { emptiedAt: number }) {
  const secs = useTick(emptiedAt + GRACE_PERIOD_MS);
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return (
    <Badge variant="muted">
      Encerrando {m}:{String(s).padStart(2, "0")}
    </Badge>
  );
}

function HuntEndTimer({ endsAt }: { endsAt: number }) {
  const secs = useTick(endsAt);
  return (
    <span
      className={`font-mono text-xs ${secs <= 300 ? "text-amber" : "text-text-muted"}`}
    >
      {fmt(secs)}
    </span>
  );
}

function ElapsedTimer({ startedAt }: { startedAt: number }) {
  const elapsed = useElapsed(startedAt);
  return (
    <span className="font-mono text-sm text-text-muted">+{fmt(elapsed)}</span>
  );
}

function AcceptCountdown({ deadline }: { deadline: number }) {
  const secs = useTick(deadline);
  return (
    <span
      className={`font-mono text-base font-bold ${secs <= 60 ? "text-red" : "text-amber"}`}
    >
      {fmt(secs)}
    </span>
  );
}

// ── Accept chip (banner) ───────────────────────────────────────────────────────

function MockAcceptChip({
  spawnName,
  deadline,
}: {
  spawnName: string;
  deadline: number;
}) {
  const secs = useTick(deadline);
  return (
    <div
      className="flex-shrink-0 rounded-xl px-4 py-3 space-y-2 min-w-[200px]"
      style={{
        background: "var(--gold-glow)",
        border: "1px solid var(--gold)",
        animation: "glow 2s ease-in-out infinite",
      }}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-semibold text-gold truncate">
          {spawnName}
        </span>
        <span
          className={`font-mono font-bold text-sm flex-shrink-0 ${secs <= 60 ? "text-red" : "text-gold"}`}
        >
          {fmt(secs)}
        </span>
      </div>
      <div className="flex gap-2">
        <button
          className="flex-1 py-1.5 rounded-lg text-xs font-semibold text-bg0 transition-opacity hover:opacity-90"
          style={{ background: "var(--gold)" }}
        >
          ⚔ Aceitar
        </button>
        <button
          className="py-1.5 px-3 rounded-lg text-xs transition-opacity hover:opacity-80"
          style={{
            background: "var(--red-bg)",
            border: "0.5px solid var(--red)",
            color: "var(--red)",
          }}
        >
          Pular
        </button>
      </div>
    </div>
  );
}

// ── Banner ─────────────────────────────────────────────────────────────────────

function MockBanner({ spawns }: { spawns: MockSpawn[] }) {
  const allMyEntries = spawns.flatMap((s) =>
    s.queue
      .filter((e) => e.isYou)
      .map((e) => ({
        ...e,
        spawnId: s.id,
        spawnName: s.name,
        position: s.queue.findIndex((q) => q.isYou) + 1,
      })),
  );

  const pendingAccepts = allMyEntries.filter((e) => e.acceptDeadline);
  const activeHunts = allMyEntries.filter(
    (e) => e.huntStartedAt && !e.acceptDeadline,
  );
  const waiting = allMyEntries.filter(
    (e) => !e.huntStartedAt && !e.acceptDeadline,
  );

  if (allMyEntries.length === 0) return null;

  return (
    <div className="mb-4 space-y-3" role="status">
      {pendingAccepts.length > 0 && (
        <div>
          <p
            className="text-xs font-semibold tracking-widest mb-2"
            style={{ color: "var(--gold-dim)" }}
          >
            SUA VEZ DE ACEITAR
          </p>
          <div className="flex gap-3 overflow-x-auto pb-1">
            {pendingAccepts.map((e) => (
              <MockAcceptChip
                key={e.spawnId}
                spawnName={e.spawnName}
                deadline={e.acceptDeadline!}
              />
            ))}
          </div>
        </div>
      )}

      {activeHunts.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {activeHunts.map((e) => (
            <span
              key={e.spawnId}
              className="flex-shrink-0 rounded-lg px-3 py-1.5 text-xs whitespace-nowrap"
              style={{
                background: "var(--green-bg)",
                border: "0.5px solid var(--green)",
                color: "var(--green)",
              }}
            >
              ⚔ <span className="font-medium">Seraphion</span> caçando em{" "}
              <span className="font-medium">{e.spawnName}</span>
              {e.huntEndsAt && (
                <span className="text-text-muted ml-1">
                  · <HuntEndTimer endsAt={e.huntEndsAt} />
                </span>
              )}
            </span>
          ))}
        </div>
      )}

      {waiting.length > 0 && (
        <div>
          <p
            className="text-xs font-semibold tracking-widest mb-2"
            style={{ color: "var(--text-dim)" }}
          >
            AGUARDANDO NA FILA
          </p>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {waiting.map((e) => (
              <span
                key={e.spawnId}
                className="flex-shrink-0 rounded-lg px-3 py-1.5 text-xs whitespace-nowrap"
                style={{
                  background: "var(--bg-2)",
                  border: "0.5px solid var(--border)",
                  color: "var(--text-muted)",
                }}
              >
                <span className="text-text font-medium">{e.spawnName}</span> — #
                {e.position} na fila
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Spawn card mock ────────────────────────────────────────────────────────────

function SpawnCardMock({
  spawn,
  defaultOpen,
}: {
  spawn: MockSpawn;
  defaultOpen?: boolean;
}) {
  const [expanded, setExpanded] = useState(defaultOpen ?? false);

  const myEntry = spawn.queue.find((e) => e.isYou);
  const myStatus = myEntry?.acceptDeadline
    ? "pending_accept"
    : myEntry?.huntStartedAt
      ? "active"
      : myEntry
        ? "waiting"
        : null;

  const isMyTurnToAccept = myStatus === "pending_accept";
  const isHunting = myStatus === "active";

  const spawnStatus = (() => {
    if (spawn.queue.length === 0) return "free";
    if (spawn.queue[0].acceptDeadline) return "pending";
    if (spawn.queue[0].huntStartedAt) return "occupied";
    return "free";
  })();

  const statusDot = {
    free: "bg-green",
    occupied: "bg-amber",
    pending: "bg-gold animate-pulse",
  }[spawnStatus];
  const statusLabel = {
    free: "Livre",
    occupied: "Ocupado",
    pending: "Aguard. aceite",
  }[spawnStatus];
  const statusBadge = {
    free: "green",
    occupied: "amber",
    pending: "gold",
  } as const;

  const firstIsActive =
    !!spawn.queue[0]?.huntStartedAt || !!spawn.queue[0]?.acceptDeadline;

  return (
    <div
      className={`bg-bg2 border rounded-xl transition-all duration-200 ${
        isMyTurnToAccept
          ? "border-gold animate-glow"
          : isHunting
            ? "border-green"
            : "border-border hover:border-border-hover"
      }`}
    >
      <button
        className="w-full flex items-center gap-3 px-4 py-4 min-h-[64px] text-left"
        onClick={() => setExpanded((o) => !o)}
        aria-expanded={expanded}
      >
        <span
          className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${statusDot}`}
        />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-text leading-snug">{spawn.name}</p>
          {spawn.emptiedAt && <GraceCountdown emptiedAt={spawn.emptiedAt} />}
        </div>
        <Badge variant={statusBadge[spawnStatus]}>{statusLabel}</Badge>
        {spawn.queue.length > 0 && (
          <span className="text-xs text-text-dim">
            {spawn.queue.length} na fila
          </span>
        )}
        <svg
          className={`w-4 h-4 text-text-muted transition-transform ${expanded ? "rotate-180" : ""}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {expanded && (
        <div className="px-4 pb-4 border-t border-border pt-3 space-y-3 animate-fadeIn">
          {/* Accept prompt */}
          {isMyTurnToAccept && myEntry?.acceptDeadline && (
            <div className="bg-[var(--gold-glow)] border border-[var(--gold-dim)] rounded-lg p-3 text-center">
              <p className="text-xs text-text-muted mb-1">
                Sua vez! Tempo para aceitar:
              </p>
              <AcceptCountdown deadline={myEntry.acceptDeadline} />
              <button
                className="mt-2 w-full py-2 rounded-lg text-xs font-semibold text-bg0 transition-opacity hover:opacity-90"
                style={{ background: "var(--gold)" }}
              >
                Aceitar Respawn
              </button>
            </div>
          )}

          {/* Hunting status */}
          {isHunting && myEntry?.huntEndsAt && (
            <div
              className="rounded-lg p-3 text-center"
              style={{
                background: "var(--green-bg)",
                border: "1px solid var(--green)",
              }}
            >
              <p className="text-xs mb-1" style={{ color: "var(--green)" }}>
                Você está caçando aqui!
              </p>
              <p className="text-xs text-text-muted">
                Tempo restante: <HuntEndTimer endsAt={myEntry.huntEndsAt} />
              </p>
            </div>
          )}

          {/* Queue list */}
          {spawn.queue.length > 0 && (
            <div className="space-y-1">
              {spawn.queue.map((entry, i) => {
                const entryStatus = entry.acceptDeadline
                  ? "pending_accept"
                  : entry.huntStartedAt
                    ? "active"
                    : "waiting";
                const isNext = i === 1 && firstIsActive;
                return (
                  <div
                    key={entry.name}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                      entry.isYou
                        ? "bg-[var(--gold-glow)] border border-[var(--gold-dim)]"
                        : entryStatus === "active"
                          ? "border"
                          : "hover:bg-bg3"
                    }`}
                    style={
                      !entry.isYou && entryStatus === "active"
                        ? { background: "var(--green-bg)", borderColor: "color-mix(in srgb, var(--green) 35%, transparent)" }
                        : undefined
                    }
                  >
                    <span className="w-5 text-center text-text-dim font-mono text-xs">
                      {i + 1}
                    </span>
                    <span
                      className={`flex-1 font-medium truncate ${entry.isYou ? "text-gold" : entryStatus === "active" ? "text-text" : "text-text"}`}
                    >
                      {entry.name}
                    </span>
                    <span className="text-text-muted text-xs">
                      Lv.{entry.level}
                    </span>
                    {isNext && <Badge variant="amber">próximo</Badge>}
                    {entryStatus === "active" && entry.huntStartedAt && (
                      <ElapsedTimer startedAt={entry.huntStartedAt} />
                    )}
                    {entryStatus === "active" && (
                      <span
                        className="text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0"
                        style={{
                          color: "var(--green)",
                          background: "var(--green-bg)",
                          border: "0.5px solid var(--green)",
                        }}
                      >
                        Caçando
                      </span>
                    )}
                    {entryStatus === "pending_accept" && (
                      <Badge variant="gold">Aguardando aceite</Badge>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {spawn.queue.length === 0 && (
            <p
              className="text-center text-sm py-2"
              style={{ color: "var(--green)" }}
            >
              Respawn livre — comece a caçar!
            </p>
          )}

          {/* Action buttons */}
          <div className="flex gap-2 flex-wrap">
            {!myEntry && (
              <button
                className="flex-1 py-2 rounded-lg text-xs font-semibold transition-opacity hover:opacity-90"
                style={
                  spawn.queue.length === 0
                    ? { background: "var(--gold)", color: "var(--bg-0)" }
                    : { border: "1px solid var(--gold)", color: "var(--gold)" }
                }
              >
                {spawn.queue.length === 0 ? "Caçar agora" : "Entrar na Fila"}
              </button>
            )}
            {isHunting && (
              <button className="flex-1 py-2 rounded-lg text-xs font-semibold border border-border text-text-muted hover:bg-bg3 transition-colors">
                Finalizar Caça
              </button>
            )}
            {myStatus === "waiting" && (
              <button className="flex-1 py-2 rounded-lg text-xs text-text-dim hover:bg-bg3 transition-colors">
                Sair da Fila
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main demo section ──────────────────────────────────────────────────────────

export function DemoSection() {
  const [spawns] = useState<MockSpawn[]>(() => makeSpawns());

  return (
    <section
      className="py-16 sm:py-20 px-4"
      style={{ background: "var(--bg-1)" }}
    >
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <p
            className="text-xs font-semibold tracking-widest mb-3"
            style={{ color: "var(--gold-dim)" }}
          >
            DEMO INTERATIVA
          </p>
          <h2 className="font-display text-2xl sm:text-3xl font-semibold mb-3">
            Veja como funciona na prática.
          </h2>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            Clique nos cards para expandir. Dados simulados — em produção tudo é
            em tempo real.
          </p>
        </div>

        {/* Simulated app chrome */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            border: "1px solid var(--border)",
            background: "var(--bg-0)",
          }}
        >
          {/* Mock topbar */}
          <div
            className="flex items-center justify-between px-4 py-3"
            style={{
              borderBottom: "0.5px solid var(--border)",
              background: "var(--bg-1)",
            }}
          >
            <span
              className="font-display text-sm font-bold"
              style={{ color: "var(--gold)" }}
            >
              ⚔ Tibia Letter
            </span>
            <div className="flex items-center gap-3">
              <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                <span className="font-medium" style={{ color: "var(--text)" }}>
                  Seraphion
                </span>{" "}
                Lv.87
              </span>
              <span
                className="w-7 h-7 rounded-full flex items-center justify-center text-sm"
                style={{
                  background: "var(--bg-3)",
                  border: "1.5px solid var(--border)",
                }}
              >
                ⚔️
              </span>
            </div>
          </div>

          <div className="p-4 space-y-4">
            <MockBanner spawns={spawns} />

            {/* World label */}
            <div className="flex items-center gap-3">
              <span className="text-xs" style={{ color: "var(--text-dim)" }}>
                {spawns.length} spawns · Antica
              </span>
              <div
                className="h-px flex-1"
                style={{ background: "var(--border)" }}
              />
            </div>

            {/* Spawn cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {spawns.map((spawn) => (
                <div key={spawn.id} className="flex flex-col gap-1.5">
                  <div className="flex items-baseline gap-2 px-0.5">
                    <span
                      className="text-xs font-semibold"
                      style={{ color: "var(--text)" }}
                    >
                      {spawn.label}
                    </span>
                    <span
                      className="text-xs leading-snug"
                      style={{ color: "var(--text-dim)" }}
                    >
                      {spawn.description}
                    </span>
                  </div>
                  <SpawnCardMock spawn={spawn} defaultOpen />
                </div>
              ))}
            </div>

            {/* Disclaimer */}
            <p
              className="text-center text-xs pt-1"
              style={{ color: "var(--text-dim)" }}
            >
              🔒 Demo somente-leitura · Entre com Discord para usar de verdade
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

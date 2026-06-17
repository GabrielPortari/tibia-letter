import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
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
  labelKey: string;
  descKey: string;
  emptiedAt?: number;
  queue: MockEntry[];
}

const GRACE_PERIOD_MS = 5 * 60 * 1000;

function makeSpawns(): MockSpawn[] {
  const now = Date.now();
  return [
    {
      id: "s1",
      name: "Falcon Bastion",
      labelKey: "demo.s1_label",
      descKey: "demo.s1_desc",
      queue: [
        {
          name: "Seraphion",
          level: 487,
          isYou: true,
          huntStartedAt: now - 23 * 60 * 1000,
          huntEndsAt: now + (2 * 3600 - 23 * 60) * 1000,
        },
      ],
    },
    {
      id: "s2",
      name: "Plague Seal",
      labelKey: "demo.s2_label",
      descKey: "demo.s2_desc",
      queue: [
        {
          name: "Drakenheim",
          level: 882,
          huntStartedAt: now - 41 * 60 * 1000,
          huntEndsAt: now + (2 * 3600 - 41 * 60) * 1000,
        },
        { name: "Mirella", level: 695 },
        { name: "Orindel Jr", level: 510 },
      ],
    },
    {
      id: "s3",
      name: "Catacombs",
      labelKey: "demo.s3_label",
      descKey: "demo.s3_desc",
      queue: [
        {
          name: "Thalindra",
          level: 445,
          huntStartedAt: now - 20 * 60 * 1000,
          huntEndsAt: now + (2 * 3600 - 20 * 60) * 1000,
        },
        { name: "Seraphion", level: 487, isYou: true },
        { name: "Orindel", level: 625 },
      ],
    },
    {
      id: "s4",
      name: "Roshamuul West",
      labelKey: "demo.s4_label",
      descKey: "demo.s4_desc",
      queue: [
        {
          name: "Seraphion",
          level: 487,
          isYou: true,
          acceptDeadline: now + 4 * 60 * 1000 + 33 * 1000,
        },
        { name: "Thal Maker", level: 695 },
      ],
    },
    {
      id: "s5",
      name: "Asura Mirror",
      labelKey: "demo.s5_label",
      descKey: "demo.s5_desc",
      emptiedAt: now - 2 * 60 * 1000,
      queue: [],
    },
  ];
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
  const { t } = useTranslation();
  const secs = useTick(emptiedAt + GRACE_PERIOD_MS);
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return (
    <Badge variant="muted">
      {t("spawn.grace_ending")} {m}:{String(s).padStart(2, "0")}
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
  const { t } = useTranslation();
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
          {t("banner.accept")}
        </button>
        <button
          className="py-1.5 px-3 rounded-lg text-xs transition-opacity hover:opacity-80"
          style={{
            background: "var(--red-bg)",
            border: "0.5px solid var(--red)",
            color: "var(--red)",
          }}
        >
          {t("banner.skip")}
        </button>
      </div>
    </div>
  );
}

// ── Banner ─────────────────────────────────────────────────────────────────────

function MockBanner({ spawns }: { spawns: MockSpawn[] }) {
  const { t } = useTranslation();
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
            {t("banner.your_turn")}
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
              ⚔ <span className="font-medium">Seraphion</span>{" "}
              {t("banner.hunting_at")}{" "}
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
            {t("banner.waiting_queue")}
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
                <span className="text-text font-medium">{e.spawnName}</span> —{" "}
                {t("banner.position", { pos: e.position })}
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
  const { t } = useTranslation();
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
    free: t("spawn.status_free"),
    occupied: t("spawn.status_occupied"),
    pending: t("spawn.status_pending"),
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
            {t("spawn.in_queue", { count: spawn.queue.length })}
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
          {isMyTurnToAccept && myEntry?.acceptDeadline && (
            <div className="bg-[var(--gold-glow)] border border-[var(--gold-dim)] rounded-lg p-3 text-center">
              <p className="text-xs text-text-muted mb-1">
                {t("spawn.your_turn_title")}
              </p>
              <AcceptCountdown deadline={myEntry.acceptDeadline} />
              <button
                className="mt-2 w-full py-2 rounded-lg text-xs font-semibold text-bg0 transition-opacity hover:opacity-90"
                style={{ background: "var(--gold)" }}
              >
                {t("spawn.accept_spawn")}
              </button>
            </div>
          )}

          {isHunting && myEntry?.huntEndsAt && (
            <div
              className="rounded-lg p-3 text-center"
              style={{
                background: "var(--green-bg)",
                border: "1px solid var(--green)",
              }}
            >
              <p className="text-xs mb-1" style={{ color: "var(--green)" }}>
                {t("spawn.you_hunting")}
              </p>
              <p className="text-xs text-text-muted">
                {t("spawn.time_remaining")}{" "}
                <HuntEndTimer endsAt={myEntry.huntEndsAt} />
              </p>
            </div>
          )}

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
                        ? {
                            background: "var(--green-bg)",
                            borderColor:
                              "color-mix(in srgb, var(--green) 35%, transparent)",
                          }
                        : undefined
                    }
                  >
                    <span className="w-5 text-center text-text-dim font-mono text-xs">
                      {i + 1}
                    </span>
                    <span
                      className={`flex-1 font-medium truncate ${entry.isYou ? "text-gold" : "text-text"}`}
                    >
                      {entry.name}
                    </span>
                    <span className="text-text-muted text-xs">
                      Lv.{entry.level}
                    </span>
                    {isNext && <Badge variant="amber">{t("slot.next")}</Badge>}
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
                        {/* hunting badge - context from queue slot */}
                        {t("spawn.status_occupied")}
                      </span>
                    )}
                    {entryStatus === "pending_accept" && (
                      <Badge variant="gold">{t("slot.awaiting_accept")}</Badge>
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
              {t("spawn.spawn_free")}
            </p>
          )}

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
                {spawn.queue.length === 0
                  ? t("spawn.hunt_now")
                  : t("spawn.join_queue")}
              </button>
            )}
            {isHunting && (
              <button className="flex-1 py-2 rounded-lg text-xs font-semibold border border-border text-text-muted hover:bg-bg3 transition-colors">
                {t("spawn.finish_hunt")}
              </button>
            )}
            {myStatus === "waiting" && (
              <button className="flex-1 py-2 rounded-lg text-xs text-text-dim hover:bg-bg3 transition-colors">
                {t("spawn.leave_queue")}
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
  const { t } = useTranslation();
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
            {t("demo.badge")}
          </p>
          <h2 className="font-display text-2xl sm:text-3xl font-semibold mb-3">
            {t("demo.title")}
          </h2>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            {t("demo.subtitle")}
          </p>
        </div>

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

            <div className="flex items-center gap-3">
              <span className="text-xs" style={{ color: "var(--text-dim)" }}>
                {t("demo.spawns_count", { count: spawns.length })}
              </span>
              <div
                className="h-px flex-1"
                style={{ background: "var(--border)" }}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {spawns.map((spawn) => (
                <div key={spawn.id} className="flex flex-col gap-1.5">
                  <div className="flex items-baseline gap-2 px-0.5">
                    <span
                      className="text-xs font-semibold"
                      style={{ color: "var(--text)" }}
                    >
                      {t(spawn.labelKey)}
                    </span>
                    <span
                      className="text-xs leading-snug"
                      style={{ color: "var(--text-dim)" }}
                    >
                      {t(spawn.descKey)}
                    </span>
                  </div>
                  <SpawnCardMock spawn={spawn} defaultOpen />
                </div>
              ))}
            </div>

            <p
              className="text-center text-xs pt-1"
              style={{ color: "var(--text-dim)" }}
            >
              {t("demo.disclaimer")}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

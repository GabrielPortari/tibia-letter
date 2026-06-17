import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { api } from "../lib/api";
import { useAuthStore } from "../stores/authStore";
import { PageWrapper } from "../components/layout/PageWrapper";
import { Button } from "../components/ui/Button";
import { Spinner } from "../components/ui/Spinner";
import { MercadoPagoWallet } from "../components/ui/MercadoPagoWallet";
import { useToasts } from "../hooks/useToasts";

interface SupporterStatus {
  active: boolean;
}

const MOCK_QUEUE = [
  { name: "Drakenheim",  level: 882, supporter: false, active: true  },
  { name: "Seraphion",   level: 487, supporter: true,  active: false },
  { name: "Mirella",     level: 695, supporter: false, active: false },
  { name: "Orindel Jr",  level: 510, supporter: false, active: false },
];

function SupporterQueuePreview() {
  const { t } = useTranslation();
  return (
    <div
      className="rounded-2xl overflow-hidden h-full flex flex-col"
      style={{ border: "1px solid var(--border)", background: "var(--bg-0)" }}
    >
      <div
        className="flex items-center justify-between px-4 py-2.5 flex-shrink-0"
        style={{ borderBottom: "0.5px solid var(--border)", background: "var(--bg-1)" }}
      >
        <span className="text-xs font-semibold text-gold">⚔ Tibia Letter</span>
        <span className="text-xs text-text-muted">Antica</span>
      </div>

      <div className="px-4 pt-3 pb-2 flex-shrink-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full bg-amber flex-shrink-0" />
          <span className="font-semibold text-sm text-text">Asura Palace</span>
          <span
            className="ml-auto text-xs font-semibold px-2 py-0.5 rounded-full"
            style={{ background: "color-mix(in srgb, var(--amber) 15%, transparent)", color: "var(--amber)" }}
          >
            {t("spawn.status_occupied")}
          </span>
        </div>
        <p className="text-xs text-text-dim pl-4">4 {t("supporter.preview_in_queue")}</p>
      </div>

      <div className="px-4 pb-3 space-y-1 flex-1">
        {MOCK_QUEUE.map((entry, i) => (
          <div
            key={entry.name}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm"
            style={
              entry.active
                ? {
                    background: "var(--green-bg)",
                    border: "1px solid color-mix(in srgb, var(--green) 35%, transparent)",
                  }
                : { background: "var(--bg-2)" }
            }
          >
            <span className="w-5 text-center font-mono text-xs text-text-dim">{i + 1}</span>
            <span className={`flex-1 font-medium truncate ${entry.supporter ? "text-gold" : "text-text"}`}>
              {entry.name}
            </span>
            <span className="text-text-muted text-xs">Lv.{entry.level}</span>
            {entry.supporter && <span className="text-xs text-[var(--gold-dim)]">★</span>}
            {entry.active && (
              <span
                className="text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0"
                style={{ color: "var(--green)", background: "var(--green-bg)", border: "0.5px solid var(--green)" }}
              >
                {t("supporter.preview_hunting")}
              </span>
            )}
          </div>
        ))}
      </div>

      <p className="text-center text-xs text-text-dim pb-3 flex-shrink-0">
        {t("supporter.preview_caption")}
      </p>
    </div>
  );
}

export default function Supporter() {
  const { user } = useAuthStore();
  const { addToast } = useToasts();
  const { t } = useTranslation();
  const [preferenceId, setPreferenceId] = useState<string | null>(null);

  const { data: status, isLoading } = useQuery<SupporterStatus>({
    queryKey: ["premium-status"],
    queryFn: () => api.get<SupporterStatus>("/payments/status"),
    enabled: !!user,
  });

  const subscribeMutation = useMutation({
    mutationFn: () =>
      api.post<{ preferenceId: string }>("/payments/subscribe", {}),
    onSuccess: (data) => setPreferenceId(data.preferenceId),
    onError: (e: Error) => addToast("error", e.message),
  });

  const perks = [
    t("supporter.perk1"),
    t("supporter.perk2"),
    t("supporter.perk3"),
  ];

  return (
    <PageWrapper>
      <div className="max-w-2xl mx-auto py-8 px-4">
        <h1 className="font-display text-2xl font-bold text-gold mb-1">
          {t("supporter.title")}
        </h1>
        <p className="text-text-muted text-sm mb-8">
          {t("supporter.subtitle")}
        </p>

        {isLoading ? (
          <div className="flex justify-center py-6">
            <Spinner />
          </div>
        ) : preferenceId ? (
          <div className="space-y-4 max-w-md">
            <MercadoPagoWallet preferenceId={preferenceId} />
            <button
              onClick={() => setPreferenceId(null)}
              className="w-full text-sm text-text-muted hover:text-text transition-colors py-2"
            >
              {t("supporter.back")}
            </button>
          </div>
        ) : (
          <>
            {status?.active && (
              <div
                className="rounded-xl px-4 py-3 text-sm mb-6"
                style={{ background: "var(--green-bg)", border: "1px solid var(--green)", color: "var(--green)" }}
              >
                {t("supporter.already_active")}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
              <SupporterQueuePreview />

              <div className="bg-bg2 border border-border rounded-2xl overflow-hidden">
                <div className="px-6 py-5 border-b border-border">
                  <p className="text-xs text-text-muted mb-2 font-medium uppercase tracking-wide">
                    {t("supporter.pack_label")}
                  </p>
                  <span className="font-display text-3xl font-bold text-gold">{t("supporter.price")}</span>
                  <p className="text-text-dim text-xs mt-1">{t("supporter.pack_permanent")}</p>
                </div>

                <ul className="px-6 py-5 space-y-3">
                  {perks.map((p) => (
                    <li key={p} className="flex items-start gap-3 text-sm text-text">
                      <span className="text-gold mt-0.5">★</span>
                      {p}
                    </li>
                  ))}
                </ul>

                <div className="px-6 pb-6">
                  <Button
                    className="w-full"
                    size="lg"
                    variant="secondary"
                    isLoading={subscribeMutation.isPending}
                    disabled={subscribeMutation.isPending || !!status?.active}
                    onClick={() => subscribeMutation.mutate()}
                  >
                    {status?.active ? t("supporter.btn_active") : t("supporter.btn_buy")}
                  </Button>
                </div>
              </div>
            </div>

            <p className="text-center text-xs text-text-dim mt-6">
              {t("supporter.payment_note")}
            </p>
          </>
        )}
      </div>
    </PageWrapper>
  );
}

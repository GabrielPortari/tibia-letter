import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "../lib/api";
import { useAuthStore } from "../stores/authStore";
import { PageWrapper } from "../components/layout/PageWrapper";
import { Button } from "../components/ui/Button";
import { Spinner } from "../components/ui/Spinner";
import { MercadoPagoWallet } from "../components/ui/MercadoPagoWallet";
import { useToasts } from "../hooks/useToasts";

interface PremiumStatus {
  active: boolean;
  until: string | null;
}

type PlanKey = "monthly" | "quarterly";

const PLANS = [
  {
    key: "monthly" as PlanKey,
    label: "1 mês",
    price: "R$ 19,90",
    priceOriginal: "R$ 29,90",
    priceNote: "Oferta de lançamento",
    duration: "30 dias de acesso",
    featured: false,
  },
  {
    key: "quarterly" as PlanKey,
    label: "3 meses",
    price: "R$ 44,90",
    priceOriginal: "R$ 79,90",
    priceNote: "Melhor oferta",
    duration: "90 dias de acesso",
    featured: true,
  },
];

const BENEFITS = [
  "Entre em até 3 filas simultâneas",
  "Cadastre quantos personagens quiser",
];

export default function Premium() {
  const { user } = useAuthStore();
  const { addToast } = useToasts();
  const location = useLocation();
  const [preferenceId, setPreferenceId] = useState<string | null>(null);

  const { data: status, isLoading } = useQuery<PremiumStatus>({
    queryKey: ["premium-status"],
    queryFn: () => api.get<PremiumStatus>("/payments/status"),
    enabled: !!user,
  });

  const subscribeMutation = useMutation({
    mutationFn: (plan: PlanKey) =>
      api.post<{ preferenceId: string }>("/payments/subscribe", { plan }),
    onSuccess: (data) => {
      setPreferenceId(data.preferenceId);
    },
    onError: (e: Error) => addToast("error", e.message),
  });

  useEffect(() => {
    const plan = (location.state as { plan?: string } | null)?.plan;
    if (plan === "monthly" || plan === "quarterly") {
      subscribeMutation.mutate(plan);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

  const daysRemaining = (iso: string) => {
    const diff = new Date(iso).getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  return (
    <PageWrapper>
      <div className="max-w-2xl mx-auto py-8 px-4">
        <h1 className="font-display text-2xl font-bold text-gold mb-1">
          Premium
        </h1>
        <p className="text-text-muted text-sm mb-8">
          Desbloqueie o máximo da sua experiência no Tibia Letter.
        </p>

        {isLoading ? (
          <div className="flex justify-center py-6">
            <Spinner />
          </div>
        ) : preferenceId ? (
          <div className="space-y-4">
            <MercadoPagoWallet preferenceId={preferenceId} />
            <button
              onClick={() => setPreferenceId(null)}
              className="w-full text-sm text-text-muted hover:text-text transition-colors py-2"
            >
              ← Voltar aos planos
            </button>
          </div>
        ) : (
          <>
            {status?.active && (
              <div
                className="rounded-xl px-4 py-3 text-sm mb-6"
                style={{
                  background: "var(--green-bg)",
                  border: "1px solid var(--green)",
                  color: "var(--green)",
                }}
              >
                ✓ Premium ativo
                {status.until && (
                  <span className="text-text-muted ml-2 text-xs">
                    — {daysRemaining(status.until)} dias restantes · expira em{" "}
                    {formatDate(status.until)}
                  </span>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              {PLANS.map((plan) => (
                <div
                  key={plan.key}
                  className={`relative bg-bg2 border rounded-2xl overflow-hidden flex flex-col ${
                    plan.featured
                      ? "border-gold shadow-[0_0_24px_var(--gold-glow)]"
                      : "border-border"
                  }`}
                >
                  {plan.featured && (
                    <div className="bg-gold text-bg0 text-xs font-bold text-center py-1.5 tracking-wide">
                      MELHOR OFERTA
                    </div>
                  )}

                  <div
                    className={`px-6 py-5 border-b ${
                      plan.featured
                        ? "bg-[var(--gold-glow)] border-[var(--gold-dim)]"
                        : "border-border"
                    }`}
                  >
                    <p className="text-xs text-text-muted mb-2 font-medium uppercase tracking-wide">
                      {plan.label}
                    </p>
                    <div className="flex items-end gap-2">
                      <span className="font-display text-3xl font-bold text-gold">
                        {plan.price}
                      </span>
                      <span className="text-text-dim text-sm line-through mb-1">
                        {plan.priceOriginal}
                      </span>
                    </div>
                    <p
                      className={`text-xs mt-1 font-medium ${
                        plan.featured ? "text-gold" : "text-gold/70"
                      }`}
                    >
                      {plan.priceNote}
                    </p>
                    <p className="text-text-dim text-xs mt-0.5">
                      {plan.duration} · sem renovação automática
                    </p>
                  </div>

                  <ul className="px-6 py-5 space-y-3 flex-1">
                    {BENEFITS.map((b) => (
                      <li
                        key={b}
                        className="flex items-center gap-3 text-sm text-text"
                      >
                        <span className="text-green">✓</span>
                        {b}
                      </li>
                    ))}
                  </ul>

                  <div className="px-6 pb-6">
                    <Button
                      className="w-full"
                      size="lg"
                      variant={plan.featured ? "primary" : "secondary"}
                      isLoading={
                        subscribeMutation.isPending &&
                        subscribeMutation.variables === plan.key
                      }
                      disabled={subscribeMutation.isPending}
                      onClick={() => subscribeMutation.mutate(plan.key)}
                    >
                      {status?.active
                        ? `Renovar — ${plan.price}`
                        : `Ativar — ${plan.price}`}
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <p className="text-center text-xs text-text-dim">
              Pagamento seguro via Mercado Pago · PIX e cartão · acesso liberado
              a partir da confirmação do pagamento
            </p>
          </>
        )}
      </div>
    </PageWrapper>
  );
}

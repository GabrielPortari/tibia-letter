import { useState } from "react";
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

const PRICE = "R$ 19,90";
const PRICE_ORIGINAL = "R$ 29,90";
const BENEFITS = [
  "Entre em até 3 filas simultâneas",
  "Cadastre quantos personagens quiser",
];

export default function Premium() {
  const { user } = useAuthStore();
  const { addToast } = useToasts();
  const [preferenceId, setPreferenceId] = useState<string | null>(null);

  const { data: status, isLoading } = useQuery<PremiumStatus>({
    queryKey: ["premium-status"],
    queryFn: () => api.get<PremiumStatus>("/payments/status"),
    enabled: !!user,
  });

  const subscribeMutation = useMutation({
    mutationFn: () => api.post<{ preferenceId: string }>("/payments/subscribe"),
    onSuccess: (data) => {
      console.log("[subscribe] resposta:", data);
      setPreferenceId(data.preferenceId);
    },
    onError: (e: Error) => addToast("error", e.message),
  });

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

  return (
    <PageWrapper>
      <div className="max-w-md mx-auto py-8">
        <h1 className="font-display text-2xl font-bold text-gold mb-1">
          Premium
        </h1>
        <p className="text-text-muted text-sm mb-8">
          Desbloqueie o máximo da sua experiência no Tibia Letter.
        </p>

        <div className="bg-bg2 border border-border rounded-2xl overflow-hidden mb-6">
          <div className="bg-[var(--gold-glow)] border-b border-[var(--gold-dim)] px-6 py-5">
            <div className="flex items-end gap-3">
              <span className="font-display text-3xl font-bold text-gold">
                {PRICE}
              </span>
              <span className="text-text-muted text-sm mb-1">/mês</span>
              <span className="text-text-dim text-sm line-through mb-1">
                {PRICE_ORIGINAL}
              </span>
            </div>
            <p className="text-gold/70 text-xs mt-1 font-medium">
              Oferta de lançamento
            </p>
            <p className="text-text-dim text-xs mt-0.5">
              30 dias de acesso · sem renovação automática
            </p>
          </div>

          <ul className="px-6 py-5 space-y-3">
            {BENEFITS.map((b) => (
              <li key={b} className="flex items-center gap-3 text-sm text-text">
                <span className="text-green">✓</span>
                {b}
              </li>
            ))}
          </ul>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-6">
            <Spinner />
          </div>
        ) : preferenceId ? (
          <MercadoPagoWallet preferenceId={preferenceId} />
        ) : status?.active ? (
          <div className="space-y-4">
            <div
              className="rounded-xl px-4 py-3 text-sm"
              style={{
                background: "var(--green-bg)",
                border: "1px solid var(--green)",
                color: "var(--green)",
              }}
            >
              ✓ Premium ativo
              {status.until && (
                <span className="text-text-muted ml-2 text-xs">
                  — expira em {formatDate(status.until)}
                </span>
              )}
            </div>
            <Button
              className="w-full"
              size="lg"
              isLoading={subscribeMutation.isPending}
              onClick={() => subscribeMutation.mutate()}
            >
              Renovar por mais 30 dias
            </Button>
          </div>
        ) : (
          <Button
            className="w-full"
            size="lg"
            isLoading={subscribeMutation.isPending}
            onClick={() => subscribeMutation.mutate()}
          >
            Ativar Premium — {PRICE}
          </Button>
        )}

        <p className="text-center text-xs text-text-dim mt-4">
          Pagamento seguro via Mercado Pago · PIX e cartão · 30 dias de uso a
          partir da confirmação do pagamento
        </p>
      </div>
    </PageWrapper>
  );
}

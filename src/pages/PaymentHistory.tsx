import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import { PageWrapper } from "../components/layout/PageWrapper";
import { Spinner } from "../components/ui/Spinner";

interface PaymentRecord {
  id: string;
  plan: string;
  durationDays: number;
  amountPaid: number | null;
  status: string;
  createdAt: string;
}

const PLAN_LABEL: Record<string, string> = {
  monthly: "1 mês",
  quarterly: "3 meses",
};

const STATUS_LABEL: Record<string, string> = {
  approved: "Aprovado",
  pending: "Pendente",
  rejected: "Recusado",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function PaymentHistory() {
  const { data, isLoading, isError } = useQuery<PaymentRecord[]>({
    queryKey: ["payment-history"],
    queryFn: () => api.get<PaymentRecord[]>("/payments/history"),
  });

  return (
    <PageWrapper>
      <div className="max-w-2xl mx-auto py-8 px-4">
        <h1 className="font-display text-2xl font-bold text-gold mb-1">
          Histórico de pagamentos
        </h1>
        <p className="text-text-muted text-sm mb-8">
          Todos os planos Premium adquiridos na sua conta.
        </p>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Spinner />
          </div>
        ) : isError ? (
          <div className="bg-bg2 border border-border rounded-2xl px-6 py-12 text-center">
            <p className="text-text-muted text-sm">Erro ao carregar pagamentos.</p>
            <p className="text-text-dim text-xs mt-1">
              Tente novamente em alguns instantes.
            </p>
          </div>
        ) : !data?.length ? (
          <div className="bg-bg2 border border-border rounded-2xl px-6 py-12 text-center">
            <p className="text-text-muted text-sm">Nenhum pagamento encontrado.</p>
            <p className="text-text-dim text-xs mt-1">
              Seus planos Premium aparecerão aqui após a confirmação do pagamento.
            </p>
          </div>
        ) : (
          <div className="bg-bg2 border border-border rounded-2xl overflow-hidden">
            <div className="grid grid-cols-[1fr_auto] sm:grid-cols-[1fr_auto_auto] text-xs text-text-muted font-medium uppercase tracking-wide px-5 py-3 border-b border-border bg-bg1">
              <span>Plano</span>
              <span className="hidden sm:block pr-8">Data</span>
              <span>Status</span>
            </div>
            <ul className="divide-y divide-border">
              {data.map((record) => (
                <li
                  key={record.id}
                  className="grid grid-cols-[1fr_auto] sm:grid-cols-[1fr_auto_auto] items-center px-5 py-4"
                >
                  <div>
                    <p className="text-sm font-semibold text-text">
                      Premium {PLAN_LABEL[record.plan] ?? record.plan}
                    </p>
                    <p className="text-xs text-text-muted mt-0.5">
                      {record.durationDays} dias · {record.amountPaid != null ? `R$ ${record.amountPaid.toFixed(2).replace(".", ",")}` : "—"}
                    </p>
                    <p className="text-xs text-text-dim mt-0.5 sm:hidden tabular-nums">
                      {formatDate(record.createdAt)}
                    </p>
                  </div>
                  <span className="hidden sm:block text-xs text-text-muted pr-8 tabular-nums">
                    {formatDate(record.createdAt)}
                  </span>
                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full self-start sm:self-auto ${
                      record.status === "approved"
                        ? "text-green bg-[var(--green-bg)]"
                        : record.status === "rejected"
                        ? "text-[var(--red)] bg-[var(--red-bg)]"
                        : "text-text-muted bg-bg3"
                    }`}
                  >
                    {STATUS_LABEL[record.status] ?? record.status}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </PageWrapper>
  );
}

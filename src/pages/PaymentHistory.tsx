import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { api } from "../lib/api";
import { PageWrapper } from "../components/layout/PageWrapper";
import { Spinner } from "../components/ui/Spinner";

interface PaymentRecord {
  id: string;
  amountPaid: number | null;
  createdAt: string;
}

export default function PaymentHistory() {
  const { t, i18n } = useTranslation();
  const { data, isLoading, isError } = useQuery<PaymentRecord[]>({
    queryKey: ["payment-history"],
    queryFn: () => api.get<PaymentRecord[]>("/payments/history"),
  });

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString(i18n.language, {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <PageWrapper>
      <div className="max-w-2xl mx-auto py-8 px-4">
        <h1 className="font-display text-2xl font-bold text-gold mb-1">
          {t("paymentHistory.title")}
        </h1>
        <p className="text-text-muted text-sm mb-8">
          {t("paymentHistory.subtitle")}
        </p>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Spinner />
          </div>
        ) : isError ? (
          <div className="bg-bg2 border border-border rounded-2xl px-6 py-12 text-center">
            <p className="text-text-muted text-sm">{t("paymentHistory.error")}</p>
            <p className="text-text-dim text-xs mt-1">{t("paymentHistory.error_retry")}</p>
          </div>
        ) : !data?.length ? (
          <div className="bg-bg2 border border-border rounded-2xl px-6 py-12 text-center">
            <p className="text-text-muted text-sm">{t("paymentHistory.empty")}</p>
            <p className="text-text-dim text-xs mt-1">{t("paymentHistory.empty_desc")}</p>
          </div>
        ) : (
          <div className="bg-bg2 border border-border rounded-2xl overflow-hidden">
            <div className="grid grid-cols-[1fr_auto] text-xs text-text-muted font-medium uppercase tracking-wide px-5 py-3 border-b border-border bg-bg1">
              <span>{t("paymentHistory.col_plan")}</span>
              <span>{t("paymentHistory.col_date")}</span>
            </div>
            <ul className="divide-y divide-border">
              {data.map((record) => (
                <li key={record.id} className="grid grid-cols-[1fr_auto] items-center px-5 py-4">
                  <div>
                    <p className="text-sm font-semibold text-text">
                      {t("paymentHistory.record_name")}
                    </p>
                    <p className="text-xs text-text-muted mt-0.5">
                      {record.amountPaid != null
                        ? `R$ ${record.amountPaid.toFixed(2).replace(".", ",")}`
                        : "—"}
                    </p>
                  </div>
                  <span className="text-xs text-text-muted tabular-nums">
                    {formatDate(record.createdAt)}
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

"use client";

import { BarChart3, Copy, ExternalLink, Link2 } from "lucide-react";
import { toast } from "sonner";
import type { CreateShortUrlResponse } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import styles from "./ResultCard.module.scss";

interface ResultCardProps {
  isLoadingStats: boolean;
  result: CreateShortUrlResponse | null;
  onRefreshStats: (code: string) => void;
}

export function ResultCard({
  isLoadingStats,
  onRefreshStats,
  result,
}: ResultCardProps) {
  async function copyShortUrl() {
    if (!result) {
      return;
    }

    try {
      await navigator.clipboard.writeText(result.shortUrl);
      toast.success("Tiny URL copiada");
    } catch {
      toast.error("No se pudo copiar el enlace");
    }
  }

  function openShortUrl() {
    if (!result) {
      return;
    }

    window.open(result.shortUrl, "_blank", "noopener,noreferrer");
  }

  if (!result) {
    return (
      <section className={styles.card} aria-labelledby="result-title">
        <div className={styles.empty}>
          <span className={styles.emptyIcon}>
            <Link2 aria-hidden="true" />
          </span>
          <div>
            <p className={styles.eyebrow}>Resultado</p>
            <h2 id="result-title">Sin Tiny URL creada</h2>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.card} aria-labelledby="result-title">
      <div className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Resultado</p>
          <h2 id="result-title">{result.code}</h2>
        </div>
        <span className={styles.badge}>302 redirect</span>
      </div>

      <div className={styles.urlBox}>
        <span>Tiny URL</span>
        <a href={result.shortUrl} rel="noreferrer" target="_blank">
          {result.shortUrl}
        </a>
      </div>

      <div className={styles.detail}>
        <span>URL original</span>
        <p>{result.originalUrl}</p>
      </div>

      <div className={styles.actions}>
        <Button
          leftIcon={<Copy aria-hidden="true" />}
          onClick={copyShortUrl}
          variant="secondary"
        >
          Copiar
        </Button>
        <Button
          leftIcon={<ExternalLink aria-hidden="true" />}
          onClick={openShortUrl}
          variant="secondary"
        >
          Abrir
        </Button>
        <Button
          isLoading={isLoadingStats}
          leftIcon={<BarChart3 aria-hidden="true" />}
          onClick={() => onRefreshStats(result.code)}
        >
          Ver stats
        </Button>
      </div>
    </section>
  );
}

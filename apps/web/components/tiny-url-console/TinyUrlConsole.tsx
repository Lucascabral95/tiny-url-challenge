"use client";

import { useState } from "react";
import { Database, ListChecks, Workflow } from "lucide-react";
import { Toaster, toast } from "sonner";
import { getErrorMessage, getStats } from "@/lib/api";
import type { CreateShortUrlResponse, StatsResponse } from "@/lib/types";
import { ApiStatus } from "@/components/api-status/ApiStatus";
import { ResultCard } from "@/components/result-card/ResultCard";
import { StatsPanel } from "@/components/stats-panel/StatsPanel";
import { UrlForm } from "@/components/url-form/UrlForm";
import styles from "./TinyUrlConsole.module.scss";

export function TinyUrlConsole() {
  const [createdUrl, setCreatedUrl] = useState<CreateShortUrlResponse | null>(
    null,
  );
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [statsError, setStatsError] = useState("");
  const [isStatsLoading, setIsStatsLoading] = useState(false);

  function handleCreated(shortUrl: CreateShortUrlResponse) {
    setCreatedUrl(shortUrl);
    setStats(null);
    setStatsError("");
  }

  async function loadStats(code: string) {
    const normalizedCode = code.trim();

    if (!normalizedCode) {
      return;
    }

    setIsStatsLoading(true);
    setStatsError("");

    try {
      const response = await getStats(normalizedCode);
      setStats(response);
      toast.success("Estadisticas actualizadas");
    } catch (error) {
      const message = getErrorMessage(error);
      setStats(null);
      setStatsError(message);
      toast.error(message);
    } finally {
      setIsStatsLoading(false);
    }
  }

  return (
    <>
      <Toaster richColors position="top-right" />
      <main className={styles.shell}>
        <header className={styles.topbar}>
          <div className={styles.brand}>
            <span className={styles.logo}>
              <Workflow aria-hidden="true" />
            </span>
            <div>
              <p>Tiny URL Challenge</p>
              <h1>Consola de prueba</h1>
            </div>
          </div>
          <ApiStatus />
        </header>

        <section className={styles.summary} aria-label="Resumen tecnico">
          <article>
            <ListChecks aria-hidden="true" />
            <span>Crear</span>
            <strong>short_urls</strong>
          </article>
          <article>
            <Workflow aria-hidden="true" />
            <span>Resolver</span>
            <strong>Redis + BullMQ</strong>
          </article>
          <article>
            <Database aria-hidden="true" />
            <span>Medir</span>
            <strong>url_stats</strong>
          </article>
        </section>

        <section className={styles.workspace}>
          <div className={styles.mainColumn}>
            <UrlForm onCreated={handleCreated} />
            <ResultCard
              isLoadingStats={isStatsLoading}
              onRefreshStats={loadStats}
              result={createdUrl}
            />
          </div>
          <aside className={styles.sideColumn}>
            <StatsPanel
              activeCode={createdUrl?.code}
              error={statsError}
              isLoading={isStatsLoading}
              onLookup={loadStats}
              stats={stats}
            />
          </aside>
        </section>
      </main>
    </>
  );
}

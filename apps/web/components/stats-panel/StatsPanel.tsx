"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { BarChart3, Clock3, Search } from "lucide-react";
import { useForm } from "react-hook-form";
import type { StatsResponse } from "@/lib/types";
import {
  statsLookupSchema,
  type StatsLookupFormValues,
} from "@/lib/validations";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import styles from "./StatsPanel.module.scss";

interface StatsPanelProps {
  activeCode?: string;
  error: string;
  isLoading: boolean;
  onLookup: (code: string) => void;
  stats: StatsResponse | null;
}

export function StatsPanel({
  activeCode,
  error,
  isLoading,
  onLookup,
  stats,
}: StatsPanelProps) {
  const {
    formState: { errors },
    handleSubmit,
    register,
    setValue,
  } = useForm<StatsLookupFormValues>({
    defaultValues: {
      code: activeCode ?? "",
    },
    mode: "onTouched",
    resolver: zodResolver(statsLookupSchema),
  });

  useEffect(() => {
    if (activeCode) {
      setValue("code", activeCode);
    }
  }, [activeCode, setValue]);

  function submit(values: StatsLookupFormValues) {
    onLookup(values.code);
  }

  return (
    <section className={styles.card} aria-labelledby="stats-title">
      <div className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Estadisticas</p>
          <h2 id="stats-title">Clicks</h2>
        </div>
        <span className={styles.badge}>GET /api/v1/stats/:code</span>
      </div>

      <form className={styles.form} onSubmit={handleSubmit(submit)}>
        <Input
          error={errors.code?.message}
          icon={<Search aria-hidden="true" />}
          id="stats-code"
          label="Codigo"
          placeholder="mi-alias"
          type="text"
          {...register("code")}
        />
        <Button
          isLoading={isLoading}
          leftIcon={<BarChart3 aria-hidden="true" />}
          type="submit"
        >
          Consultar stats
        </Button>
      </form>

      {error ? (
        <p className={styles.error} role="alert">
          {error}
        </p>
      ) : null}

      {stats ? (
        <div className={styles.statsGrid}>
          <div className={styles.metric}>
            <span>Total clicks</span>
            <strong>{stats.totalClicks}</strong>
          </div>
          <div className={styles.metric}>
            <span>Ultimo click</span>
            <strong className={styles.lastClick}>
              <Clock3 aria-hidden="true" />
              {formatLastClick(stats.lastClick)}
            </strong>
          </div>
        </div>
      ) : (
        <p className={styles.empty}>Sin datos cargados.</p>
      )}
    </section>
  );
}

function formatLastClick(lastClick: string | null): string {
  if (!lastClick) {
    return "Sin accesos";
  }

  return new Intl.DateTimeFormat("es-AR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(lastClick));
}

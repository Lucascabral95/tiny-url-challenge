"use client";

import { useCallback, useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, RefreshCw } from "lucide-react";
import clsx from "clsx";
import { getErrorMessage, getHealth } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import styles from "./ApiStatus.module.scss";

type ApiStatusState = "checking" | "online" | "offline";

export function ApiStatus() {
  const [status, setStatus] = useState<ApiStatusState>("checking");
  const [message, setMessage] = useState("Verificando API");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshStatus = useCallback(async () => {
    setIsRefreshing(true);

    try {
      const nextStatus = await resolveHealth();
      setStatus(nextStatus.status);
      setMessage(nextStatus.message);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    let shouldIgnore = false;

    void resolveHealth().then((nextStatus) => {
      if (!shouldIgnore) {
        setStatus(nextStatus.status);
        setMessage(nextStatus.message);
      }
    });

    return () => {
      shouldIgnore = true;
    };
  }, []);

  const isOnline = status === "online";
  const isChecking = status === "checking";

  return (
    <div className={clsx(styles.status, styles[status])}>
      <span className={styles.icon}>
        {isOnline ? (
          <CheckCircle2 aria-hidden="true" />
        ) : (
          <AlertCircle aria-hidden="true" />
        )}
      </span>
      <div className={styles.copy}>
        <span>{isOnline ? "API disponible" : "API no disponible"}</span>
        <p>{isChecking ? "Verificando..." : message}</p>
      </div>
      <Button
        aria-label="Revisar API"
        isLoading={isRefreshing}
        onClick={refreshStatus}
        variant="ghost"
      >
        <RefreshCw aria-hidden="true" />
      </Button>
    </div>
  );
}

async function resolveHealth(): Promise<{
  status: Exclude<ApiStatusState, "checking">;
  message: string;
}> {
  try {
    const health = await getHealth();

    return {
      status: "online",
      message: health.message,
    };
  } catch (error) {
    return {
      status: "offline",
      message: getErrorMessage(error),
    };
  }
}

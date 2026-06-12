"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link2, Wand2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { createShortUrl, ApiClientError, getErrorMessage } from "@/lib/api";
import type { CreateShortUrlResponse } from "@/lib/types";
import {
  createShortUrlSchema,
  type CreateShortUrlFormValues,
  toCreateShortUrlPayload,
} from "@/lib/validations";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import styles from "./UrlForm.module.scss";

interface UrlFormProps {
  onCreated: (shortUrl: CreateShortUrlResponse) => void;
}

export function UrlForm({ onCreated }: UrlFormProps) {
  const [serverError, setServerError] = useState("");
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    reset,
    setError,
  } = useForm<CreateShortUrlFormValues>({
    defaultValues: {
      alias: "",
      originalUrl: "",
    },
    mode: "onTouched",
    resolver: zodResolver(createShortUrlSchema),
  });

  async function onSubmit(values: CreateShortUrlFormValues) {
    setServerError("");

    try {
      const result = await createShortUrl(toCreateShortUrlPayload(values));
      onCreated(result);
      reset();
      toast.success("Tiny URL creada");
    } catch (error) {
      const message = getErrorMessage(error);

      if (error instanceof ApiClientError && error.status === 409) {
        setError("alias", { message });
      }

      setServerError(message);
      toast.error(message);
    }
  }

  return (
    <section className={styles.card} aria-labelledby="create-url-title">
      <div className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Crear</p>
          <h2 id="create-url-title">Tiny URL</h2>
        </div>
        <span className={styles.badge}>POST /api/v1/urls</span>
      </div>

      <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
        <Input
          error={errors.originalUrl?.message}
          icon={<Link2 aria-hidden="true" />}
          id="originalUrl"
          label="URL original"
          placeholder="https://www.google.com/search?q=nodejs"
          type="url"
          {...register("originalUrl")}
        />

        <Input
          error={errors.alias?.message}
          hint="Opcional. 3 a 32 caracteres."
          icon={<Wand2 aria-hidden="true" />}
          id="alias"
          label="Alias"
          placeholder="mi-alias"
          type="text"
          {...register("alias")}
        />

        {serverError ? (
          <p className={styles.serverError} role="alert">
            {serverError}
          </p>
        ) : null}

        <Button isLoading={isSubmitting} type="submit">
          Crear Tiny URL
        </Button>
      </form>
    </section>
  );
}

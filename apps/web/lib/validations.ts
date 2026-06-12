import { z } from "zod";
import type { CreateShortUrlRequest } from "./types";

const aliasPattern = /^[A-Za-z0-9_-]+$/;

export const createShortUrlSchema = z.object({
  originalUrl: z
    .string()
    .trim()
    .min(1, "Ingresa la URL original.")
    .url("Usa una URL valida con protocolo, por ejemplo https://example.com."),
  alias: z
    .string()
    .trim()
    .refine((value) => value.length === 0 || value.length >= 3, {
      message: "El alias debe tener al menos 3 caracteres.",
    })
    .refine((value) => value.length <= 32, {
      message: "El alias no puede superar los 32 caracteres.",
    })
    .refine((value) => value.length === 0 || aliasPattern.test(value), {
      message: "Usa solo letras, numeros, guiones o guiones bajos.",
    }),
});

export const statsLookupSchema = z.object({
  code: z
    .string()
    .trim()
    .min(3, "Ingresa un codigo de al menos 3 caracteres.")
    .max(32, "El codigo no puede superar los 32 caracteres.")
    .regex(aliasPattern, "Usa solo letras, numeros, guiones o guiones bajos."),
});

export type CreateShortUrlFormValues = z.infer<typeof createShortUrlSchema>;
export type StatsLookupFormValues = z.infer<typeof statsLookupSchema>;

export function toCreateShortUrlPayload(
  values: CreateShortUrlFormValues,
): CreateShortUrlRequest {
  const originalUrl = values.originalUrl.trim();
  const alias = values.alias.trim();

  return {
    originalUrl,
    ...(alias ? { alias } : {}),
  };
}

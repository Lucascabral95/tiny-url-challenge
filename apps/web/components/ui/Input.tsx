import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";
import clsx from "clsx";
import { FieldError } from "./FieldError";
import styles from "./Input.module.scss";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  hint?: string;
  icon?: ReactNode;
  label: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, hint, icon, id, label, ...props }, ref) => {
    const errorId = id ? `${id}-error` : undefined;
    const hintId = id ? `${id}-hint` : undefined;
    const describedBy = [error ? errorId : undefined, hint ? hintId : undefined]
      .filter(Boolean)
      .join(" ");

    return (
      <label className={clsx(styles.field, className)} htmlFor={id}>
        <span className={styles.label}>{label}</span>
        <span className={clsx(styles.control, error && styles.invalid)}>
          {icon ? <span className={styles.icon}>{icon}</span> : null}
          <input
            aria-describedby={describedBy || undefined}
            aria-invalid={Boolean(error)}
            id={id}
            ref={ref}
            {...props}
          />
        </span>
        {hint ? (
          <span className={styles.hint} id={hintId}>
            {hint}
          </span>
        ) : null}
        <FieldError id={errorId} message={error} />
      </label>
    );
  },
);

Input.displayName = "Input";

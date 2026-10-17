import { useCallback, useState } from "react";
import { hasErrors, type Errors } from "../lib/validation";

// Estado de formulário genérico com validação por função pura.
export const useForm = <T extends Record<string, unknown>>(
  initial: T,
  validate: (values: T) => Errors<T>,
) => {
  const [values, setValues] = useState<T>(initial);
  const [submitted, setSubmitted] = useState(false);

  const errors: Errors<T> = submitted ? validate(values) : {};

  const setField = useCallback(
    <K extends keyof T>(key: K, value: T[K]) => setValues((v) => ({ ...v, [key]: value })),
    [],
  );

  const reset = useCallback((next: T) => {
    setValues(next);
    setSubmitted(false);
  }, []);

  // Retorna os valores se válidos; caso contrário marca o form como submetido para exibir erros.
  const validated = (): T | null => {
    setSubmitted(true);
    return hasErrors(validate(values)) ? null : values;
  };

  return { values, errors, setField, reset, validated };
};

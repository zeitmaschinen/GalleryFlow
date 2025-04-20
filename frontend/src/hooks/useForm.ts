import { useState, useCallback, useMemo } from 'react';

type ValidationRule<T> = (value: T) => string | undefined;
type FieldRules<T> = Record<keyof T, ValidationRule<T[keyof T]>[]>;

interface UseFormOptions<T> {
  initialValues: T;
  validationRules?: Partial<FieldRules<T>>;
  onSubmit?: (values: T) => void | Promise<void>;
}

export const useForm = <T extends Record<string, unknown>>({
  initialValues,
  validationRules = {},
  onSubmit
}: UseFormOptions<T>) => {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateField = useCallback((name: keyof T, value: T[keyof T]) => {
    const fieldRules = validationRules[name] || [];
    for (const rule of fieldRules) {
      const error = rule(value);
      if (error) return error;
    }
    return undefined;
  }, [validationRules]);

  const handleChange = useCallback((name: keyof T, value: T[keyof T]) => {
    setValues(prev => ({ ...prev, [name]: value }));
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  }, [validateField]);

  const handleBlur = useCallback((name: keyof T) => {
    setTouched(prev => ({ ...prev, [name]: true }));
  }, []);

  const validateForm = useCallback(() => {
    const newErrors: Partial<Record<keyof T, string>> = {};
    let isValid = true;

    Object.keys(values).forEach(key => {
      const error = validateField(key as keyof T, values[key as keyof T]);
      if (error) {
        newErrors[key as keyof T] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  }, [values, validateField]);

  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    e?.preventDefault();
    setIsSubmitting(true);

    if (validateForm()) {
      try {
        await onSubmit?.(values);
      } catch {
        // Intentionally ignore submit errors
      }
    }

    setIsSubmitting(false);
  }, [values, validateForm, onSubmit]);

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  const isValid = useMemo(() => Object.keys(errors).length === 0, [errors]);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    isValid,
    handleChange,
    handleBlur,
    handleSubmit,
    reset
  };
};
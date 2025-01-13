import { useState } from 'react';

// Definir tipos para la acción y el estado
type ActionFunction = (state: unknown, formData: FormData) => Promise<unknown>;

interface FormState {
  // Ajusta esto según la estructura real de tu estado
  [key: string]: unknown;
}

export function useCustomFormState(
  action: ActionFunction,
  initialState: FormState
) {
  const [state, setState] = useState<FormState>(initialState);
  const [isPending, setIsPending] = useState(false);

  const dispatch = async (formData: FormData) => {
    setIsPending(true);
    try {
      const result = await action(null, formData);
      setState(result as FormState);
    } finally {
      setIsPending(false);
    }
  };

  return [state, dispatch, isPending] as const;
}

interface FormStatus {
  pending: boolean;
}

export function useCustomFormStatus(): FormStatus {
  return { pending: false };
}